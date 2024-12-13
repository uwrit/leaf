// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Model.Extensions;
using Model.Schema;

namespace Model.Anonymization
{
    using Actor = Action<object, PropertyInfo, Guid, Guid, FuzzParameters>;

    public class Anonymizer<T>
        where T : class, ISalt
    {
        protected Guid Pepper { get; set; }
        AnonymizationPlanner Impl { get; set; }
        FuzzParameters FuzzParameters { get; set; }

        public Anonymizer(Guid pepper)
        {
            Pepper = pepper;
            Impl = new AnonymizationPlanner(typeof(T));
            FuzzParameters = new FuzzParameters("HOUR", -1000, 1000);
        }
        
        public Anonymizer(Guid pepper, string increment, int lowerBound, int upperBound)
        {
            Pepper = pepper;
            Impl = new AnonymizationPlanner(typeof(T));
            FuzzParameters = new FuzzParameters(increment, lowerBound, upperBound);
        }

        public void Anonymize(T record)
        {
            Anonymize(record, Impl.Plan);
        }

        public void Anonymize(IEnumerable<T> records)
        {
            foreach (var record in records)
            {
                Anonymize(record, Impl.Plan);
            }
        }

        void Anonymize(T record, IEnumerable<FieldProp> fieldProps)
        {
            foreach (var pair in fieldProps)
            {
                var prop = pair.Prop;
                if (prop.GetValue(record) == null)
                {
                    continue;
                }

                var attr = pair.Attr;

                if (!attr.Mask)
                {
                    pair.Prop.SetValue(record, GetDefault(prop));
                    continue;
                }

                Fuzz(record, prop);
            }
        }

        void Fuzz(T record, PropertyInfo prop)
        {
            if (!TypeMap.TryGetValue(prop.PropertyType, out var actor))
            {
                throw new ArgumentException($"No anonymization actor implemented for type {prop.PropertyType.ToString()}");
            }
            actor(record, prop, record.Salt, Pepper, FuzzParameters);
        }

        object GetDefault(PropertyInfo info)
        {
            var type = info.PropertyType;
            return type.IsValueType ? Activator.CreateInstance(type) : null;
        }

        protected virtual Dictionary<Type, Actor> TypeMap => new Dictionary<Type, Actor>
        {
            { typeof(string), Fuzzer.String },
            { typeof(System.DateTime), Fuzzer.DateTimeActor },
            { typeof(System.DateTime?), Fuzzer.NullableDateTimeActor },
        };
    }

    public class FuzzParameters
    {
        public Func<DateTime, int, DateTime> DateShifter { get; protected set; }
        public int LowerBound { get; protected set; }
        public int UpperBound { get; protected set; }

        public FuzzParameters(string incrType, int lowerBound, int upperBound)
        {
            SetDateShifter(incrType);
            LowerBound = lowerBound;
            UpperBound = upperBound;
        }

        void SetDateShifter(string incrType)
        {
            var tmp = incrType.ToUpper();
            switch (tmp)
            {
                case "MINUTE":
                    DateShifter = (val, shift) => val.AddMinutes(shift);
                    break;
                case "HOUR":
                    DateShifter = (val, shift) => val.AddHours(shift);
                    break;
                case "DAY":
                    DateShifter = (val, shift) => val.AddDays(shift);
                    break;
                default:
                    DateShifter = (val, shift) => val.AddHours(shift);
                    break;
            }
        }
    }

    static class Fuzzer
    {
        public static readonly Actor String = (record, prop, salt, pepper, parameters) =>
        {
            var p = pepper.ToString();
            var s = salt.ToString();
            var value = (string)prop.GetValue(record);

            var composite = p + s + value;

            prop.SetValue(record, composite.GetConsistentHashCode().ToString());
        };

        public static readonly Actor DateTimeActor = (record, prop, salt, pepper, parameters) =>
        {
            var rand = new Random(salt.GetHashCode());
            var value = (System.DateTime)prop.GetValue(record);
            var shift = rand.Next(parameters.LowerBound, parameters.UpperBound);

            // Clamp shift if needed
            if (shift > 0 && value > System.DateTime.MaxValue.AddDays(-shift))
            {
                shift = (int)(System.DateTime.MaxValue - value).TotalDays;
            }
            else if (shift < 0 && value < System.DateTime.MinValue.AddDays(-shift))
            {
                shift = -(int)(value - System.DateTime.MinValue).TotalDays;
            }

            System.DateTime shiftedDate;
            try
            {
                shiftedDate = parameters.DateShifter(value, shift);
            }
            catch (ArgumentOutOfRangeException)
            {
                shiftedDate = (shift < 0) ? System.DateTime.MinValue : System.DateTime.MaxValue;
            }

            prop.SetValue(record, shiftedDate);
        };

        public static readonly Actor NullableDateTimeActor = (record, prop, salt, pepper, parameters) =>
        {
            var rand = new Random(salt.GetHashCode());
            var value = (System.DateTime?)prop.GetValue(record);

            if (value.HasValue)
            {
                var shift = rand.Next(parameters.LowerBound, parameters.UpperBound);
                System.DateTime shiftedDate;
                try
                {
                    shiftedDate = parameters.DateShifter(value.Value, shift);
                }
                catch (ArgumentOutOfRangeException)
                {
                    shiftedDate = (shift < 0) ? System.DateTime.MinValue : System.DateTime.MaxValue;
                }

                prop.SetValue(record, shiftedDate);
            }
        };
    }

    class AnonymizationPlanner : IDisposable
    {
        protected static readonly ConcurrentDictionary<Type, ICollection<FieldProp>> InfoMap = new ConcurrentDictionary<Type, ICollection<FieldProp>>();

        public ICollection<FieldProp> Plan { get; protected set; }

        internal AnonymizationPlanner(Type type)
        {
            Plan = InfoMap.GetOrAdd(type, MakeInfo);
        }

        ICollection<FieldProp> MakeInfo(Type t)
        {
            var infos = new List<FieldProp>();

            var props = t.GetProperties()
                         .Select(p => new FieldProp { Prop = p, Attr = p.GetCustomAttribute<FieldAttribute>() })
                         .Where(fp => fp.Attr != null && fp.Attr.Phi);

            foreach (var pair in props)
            {
                var attr = pair.Attr;
                var prop = pair.Prop;

                if (!prop.CanRead || !prop.CanWrite)
                {
                    throw new LeafAnonymizerException(prop, $"Property must have a public getter and setter.");
                }

                if (!attr.Mask && !IsNullable(prop))
                {
                    throw new LeafAnonymizerException(prop, $"Unmaskable Phi must be nullable.");
                }

                infos.Add(pair);
            }

            return infos;
        }

        bool IsNullable(PropertyInfo prop)
        {
            return !prop.PropertyType.IsValueType || Nullable.GetUnderlyingType(prop.PropertyType) != null;
        }

        public void Dispose()
        {

        }
    }

    class FieldProp
    {
        public PropertyInfo Prop { get; set; }
        public FieldAttribute Attr { get; set; }
    }

    public class LeafAnonymizerException : Exception
    {
        public PropertyInfo Property { get; set; }

        readonly string _message;
        public override string Message => $"{_message ?? ""} Property: {Property.DeclaringType.ToString()}.{Property.Name}";
        public LeafAnonymizerException(PropertyInfo prop)
        {
            Property = prop;
        }

        public LeafAnonymizerException(PropertyInfo prop, string message)
        {
            Property = prop;
            _message = message;
        }
    }
}

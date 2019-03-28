// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using Model.Compiler;
using System.Reflection;
using Model.Extensions;
using System.Collections.Generic;
using System.Collections.Concurrent;

namespace Model.Anonymization
{
    using Actor = Action<object, PropertyInfo, Guid, Guid>;

    public class Anonymizer<T>
        where T : class, ISalt
    {
        protected Guid Pepper { get; set; }
        AnonymizationPlanner Impl { get; set; }

        public Anonymizer(Guid pepper)
        {
            Pepper = pepper;
            Impl = new AnonymizationPlanner(typeof(T));
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
                throw new ArgumentException($"No actor implemented for type {prop.PropertyType.ToString()}");
            }
            actor(record, prop, record.Salt, Pepper);
        }

        object GetDefault(PropertyInfo info)
        {
            var type = info.PropertyType;
            return type.IsValueType ? Activator.CreateInstance(type) : null;
        }

        static void FuzzString(object record, PropertyInfo prop, Guid salt, Guid pepper)
        {
            var p = pepper.ToString();
            var s = salt.ToString();
            var value = (string)prop.GetValue(record);

            var composite = p + s + value;

            prop.SetValue(record, composite.GetConsistentHashCode().ToString());
        }

        static void FuzzDateTime(object record, PropertyInfo prop, Guid salt, Guid pepper)
        {
            var rand = new Random(salt.GetHashCode());
            var value = (DateTime)prop.GetValue(record);
            var shift = rand.Next(-1000, 1000);

            prop.SetValue(record, value.AddHours(shift));
        }

        static void FuzzNullableDateTime(object record, PropertyInfo prop, Guid salt, Guid pepper)
        {
            var rand = new Random(salt.GetHashCode());
            var value = (DateTime?)prop.GetValue(record);

            if (value.HasValue)
            {
                var shift = rand.Next(-1000, 1000);
                prop.SetValue(record, value.Value.AddHours(shift));
            }
        }

        protected virtual Dictionary<Type, Actor> TypeMap => new Dictionary<Type, Actor>
        {
            { typeof(string), FuzzString },
            { typeof(DateTime), FuzzDateTime },
            { typeof(DateTime?), FuzzNullableDateTime },
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
                    throw new InvalidOperationException($"{prop.DeclaringType.ToString()}.{prop.Name} property must have a public getter and setter.");
                }

                if (!attr.Mask && !IsNullable(prop))
                {
                    throw new InvalidOperationException($"Unmaskable Phi must be nullable. Property: {prop.DeclaringType.ToString()}.{prop.Name}.");
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
}

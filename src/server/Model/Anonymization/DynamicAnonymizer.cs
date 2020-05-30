// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Cohort;
using Model.Compiler;
using Model.Extensions;

namespace Model.Anonymization
{
    using Actor = Action<DynamicDatasetRecord, KeyValuePair<string, object>, Guid, Guid, FuzzParameters>;

    public class DynamicAnonymizer
    {
        protected Guid Pepper { get; set; }
        FuzzParameters FuzzParameters { get; set; }

        public DynamicAnonymizer(Guid pepper)
        {
            Pepper = pepper;
            FuzzParameters = new FuzzParameters("HOUR", -1000, 1000);
        }

        public DynamicAnonymizer(Guid pepper, string increment, int lowerBound, int upperBound)
        {
            Pepper = pepper;
            FuzzParameters = new FuzzParameters(increment, lowerBound, upperBound);
        }

        public void Anonymize(DynamicDatasetRecord record, IEnumerable<SchemaFieldSelector> fields)
        {
            foreach (var field in fields)
            {
                var pair = record.GetKeyValuePair(field.Name);

                if (field.Phi && !field.Mask)
                {
                    throw new LeafDynamicAnonymizerException(field.Name, $"Phi fields must be maskable.");
                }

                if (pair.Value == null || pair.Value == DBNull.Value || !field.Mask)
                {
                    continue;
                }

                Fuzz(record, pair);
            }
        }

        void Fuzz(DynamicDatasetRecord record, KeyValuePair<string, object> pair)
        {
            var type = pair.Value.GetType();

            if (!TypeMap.TryGetValue(type, out var actor))
            {
                throw new ArgumentException($"No anonymization actor implemented for type {type.ToString()}");
            }
            actor(record, pair, record.Salt, Pepper, FuzzParameters);
        }

        protected virtual Dictionary<Type, Actor> TypeMap => new Dictionary<Type, Actor>
        {
            { typeof(string), DynamicFuzzer.String },
            { typeof(DateTime), DynamicFuzzer.DateTime },
            { typeof(DateTime?), DynamicFuzzer.NullableDateTime },
        };
    }

    static class DynamicFuzzer
    {
        public static readonly Actor String = (record, pair, salt, pepper, parameters) =>
        {
            var p = pepper.ToString();
            var s = salt.ToString();

            var composite = p + s + (string)pair.Value;

            record.SetValue(pair.Key, composite.GetConsistentHashCode().ToString());
        };

        public static readonly Actor DateTime = (record, pair, salt, pepper, parameters) =>
        {
            var rand = new Random(salt.GetHashCode());
            var shift = rand.Next(parameters.LowerBound, parameters.UpperBound);
            var val = (DateTime)pair.Value;

            record.SetValue(pair.Key, parameters.DateShifter(val, shift));
        };

        public static readonly Actor NullableDateTime = (record, pair, salt, pepper, parameters) =>
        {
            var rand = new Random(salt.GetHashCode());
            var val = (DateTime?)pair.Value;

            if (val.HasValue)
            {
                var shift = rand.Next(parameters.LowerBound, parameters.UpperBound);
                record.SetValue(pair.Key, parameters.DateShifter(val.Value, shift));
            }
        };
    }

    public class LeafDynamicAnonymizerException : Exception
    {
        readonly string _propertyName;
        readonly string _message;
        public override string Message => $"{_message ?? ""} Property: {_propertyName}";
        public LeafDynamicAnonymizerException(string propertyName, string message)
        {
            _propertyName = propertyName;
            _message = message;
        }
    }
}

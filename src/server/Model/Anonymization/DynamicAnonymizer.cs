// Copyright (c) 2019, UW Medicine Research IT, University of Washington
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
    using Actor = Action<DynamicDatasetRecord, KeyValuePair<string, object>, Guid, Guid>;

    public class DynamicAnonymizer
    {
        protected Guid Pepper { get; set; }

        public DynamicAnonymizer(Guid pepper)
        {
            Pepper = pepper;
        }

        public void Anonymize(DynamicDatasetRecord record, IEnumerable<SchemaFieldSelector> fields)
        {
            foreach (var field in fields)
            {
                var pair = record.GetKeyValuePair(field.Name);

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
                throw new ArgumentException($"No actor implemented for type {type.ToString()}");
            }
            actor(record, pair, record.Salt, Pepper);
        }

        object GetDefault(Type type)
        {
            return type.IsValueType ? Activator.CreateInstance(type) : null;
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
        public static readonly Actor String = (record, pair, salt, pepper) =>
        {
            var p = pepper.ToString();
            var s = salt.ToString();

            var composite = p + s + (string)pair.Value;

            record.SetValue(pair.Key, composite.GetConsistentHashCode().ToString());
        };

        public static readonly Actor DateTime = (record, pair, salt, pepper) =>
        {
            var rand = new Random(salt.GetHashCode());
            var shift = rand.Next(-1000, 1000);
            var val = (DateTime)pair.Value;

            record.SetValue(pair.Key, val.AddHours(shift));
        };

        public static readonly Actor NullableDateTime = (record, pair, salt, pepper) =>
        {
            var rand = new Random(salt.GetHashCode());
            var val = (DateTime?)pair.Value;

            if (val.HasValue)
            {
                var shift = rand.Next(-1000, 1000);
                record.SetValue(pair.Key, val.Value.AddHours(shift));
            }
        };
    }
}

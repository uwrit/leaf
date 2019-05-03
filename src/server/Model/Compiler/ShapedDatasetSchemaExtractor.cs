// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.Linq;
using System.Reflection;
using System.Data.Common;
using Model.Cohort;
using Model.Schema;

namespace Model.Compiler
{
    public static class ShapedDatasetSchemaExtractor
    {
        public static ICollection<SchemaFieldSelector> Extract<T>() where T : ShapedDataset
        {
            using (var impl = new ShapedDatasetSchemaExtractorImpl(typeof(T)))
            {
                return impl.FieldSelectors;
            }
        }

        public static ICollection<SchemaField> Extract(IEnumerable<DbColumn> columns)
        {
            var results = new List<SchemaField>();
            foreach (var column in columns)
            {
                var index = column.ColumnOrdinal;
                if (!index.HasValue)
                {
                    continue;
                }
                var name = column.ColumnName;
                var type = column.LeafDataType();

                results.Add(new SchemaField { Name = name, Type = type, Index = index.Value });
            }
            return results;
        }
    }

    class ShapedDatasetSchemaExtractorImpl : IDisposable
    {
        private static readonly ConcurrentDictionary<Type, ICollection<SchemaFieldSelector>> SchemaMap = new ConcurrentDictionary<Type, ICollection<SchemaFieldSelector>>();

        internal ICollection<SchemaFieldSelector> FieldSelectors { get; set; }

        internal ShapedDatasetSchemaExtractorImpl(Type t)
        {
            var schemaAttr = t.GetCustomAttribute<SchemaAttribute>(true);
            if (schemaAttr == null)
            {
                throw new SchemaValidationException($"{t.Name} is not marked with {typeof(SchemaAttribute).Name}");
            }
            FieldSelectors = SchemaMap.GetOrAdd(t, MakeSchemaFields);
        }

        ICollection<SchemaFieldSelector> MakeSchemaFields(Type t)
        {
            var props = t.GetProperties()
                           .Select(p => (prop: p, attr: p.GetCustomAttribute<FieldAttribute>()))
                           .Where(tuple => tuple.attr != null);

            var fields = props.Select(tuple => new SchemaFieldSelector(tuple.attr))
                              .ToList();

            return fields;
        }

        public void Dispose() { }
    }
}

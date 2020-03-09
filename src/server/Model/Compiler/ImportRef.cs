// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using Model.Tagging;
using Model.Extensions;
using Model.Options;
using System;
using System.Collections.Generic;
using Composure;

namespace Model.Compiler
{
    public class ImportRef
    {
        public Guid? Id { get; set; }
        public Guid? MetadataId { get; set; }
        public ImportUrn UniversalId { get; set; }

        public ImportRef()
        {

        }

        public ImportRef(ImportUrn urn)
        {
            UniversalId = urn;
        }

        public ImportRef(Guid? id, ImportUrn urn)
        {
            Id = id;
            UniversalId = urn;
        }

        public ImportRef(string identifier)
        {
            if (Guid.TryParse(identifier, out var guid))
            {
                Id = guid;
            }
            else if (ImportUrn.TryParse(identifier, out var urn))
            {
                UniversalId = urn;
            }
            else
            {
                throw new FormatException($"Import identifier {identifier} is not a valid Guid or Urn");
            }
        }

        public bool UseUniversalId()
        {
            return UniversalId != null;
        }

        public ImportRef Map()
        {
            return new ImportRef
            {
                MetadataId = Id,
                Id = Guid.NewGuid(),
                UniversalId = UniversalId
            };
        }

        public string ToQuery(CompilerOptions opts)
        {
            var alias = $"{opts.Alias}I";
            var valueNum  = new Column("ValueNumber");
            var valueDate = new Column("ValueDate");
            var sourceMod = new Column("SourceModifier");
            var importId  = new Column("ImportMetadataId");
            var rowId     = new Column("Id");
            var personId  = new ExpressedColumn(new Expression($"{alias}.PersonId"), opts.FieldPersonId);
            var encId     = new ExpressedColumn(new Expression("CONVERT(NVARCHAR(10),NULL)"), opts.FieldEncounterId);

            var where = new List<IEvaluatable>();
            where.Add(importId == MetadataId.ToString());
            where.Add(new RawEval($"{alias}.{rowId} LIKE '{UniversalId.BaseSegment}%'"));

            if (UniversalId.Value.HasValue)
            {
                where.Add(valueNum == (int)UniversalId.Value);
            }
            if (UniversalId.UseModifier)
            {
                where.Add(sourceMod == UniversalId.Modifier);
            }

            var query = new NamedSet
            {
                Select = new ISelectable[] { personId, encId, valueNum, valueDate },
                From = $"{opts.AppDb}.app.Import",
                Alias = alias,
                Where = where
            };

            return query.ToString();
        }
    }

    public class ImportRefEqualityComparer : IEqualityComparer<ImportRef>
    {
        public bool Equals(ImportRef x, ImportRef y)
        {
            if (x == null && y == null) return true;
            if (x == null || y == null) return false;
            return GetHashCode(x) == GetHashCode(y);
        }

        public int GetHashCode(ImportRef @ref)
        {
            if (@ref.UseUniversalId())
            {
                return @ref.UniversalId.ToString().GetConsistentHashCode();
            }
            return @ref.Id.Value.GetHashCode();
        }
    }
}

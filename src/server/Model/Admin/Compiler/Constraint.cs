// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
namespace Model.Admin.Compiler
{
    public enum ConstraintType
    {
        User = 1,
        Group = 2
    }

    public class Constraint
    {
        public Guid ResourceId { get; set; }
        public ConstraintType ConstraintId { get; set; }
        public string ConstraintValue { get; set; }

        public static ConstraintType TypeFrom(int code)
        {
            switch (code)
            {
                case 1:
                    return ConstraintType.User;
                case 2:
                    return ConstraintType.Group;
                default:
                    throw new InvalidOperationException($"{code} is not a valid ConstraintType.");
            }
        }
    }
}

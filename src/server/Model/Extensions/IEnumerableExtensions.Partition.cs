// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;

namespace Model.Extensions
{
    public static partial class IEnumerableExtensions
    {
        public static (IEnumerable<T>, IEnumerable<T>) PartitionBy<T>(this IEnumerable<T> iter, Predicate<T> pred)
        {
            var pTrue = new List<T>();
            var pFalse = new List<T>();

            foreach (var thing in iter)
            {
                if (pred(thing))
                {
                    pTrue.Add(thing);
                }
                else
                {
                    pFalse.Add(thing);
                }
            }

            return (pTrue, pFalse);
        }

        public static (IOrderedEnumerable<T>, IOrderedEnumerable<T>) OrderBy<T, TKey>(this (IEnumerable<T>, IEnumerable<T>) sets, Func<T, TKey> keySelector)
        {
            return (sets.Item1.OrderBy(keySelector), sets.Item2.OrderBy(keySelector));
        }

        public static (IOrderedEnumerable<T>, IOrderedEnumerable<T>) OrderByDescending<T, TKey>(this (IEnumerable<T>, IEnumerable<T>) sets, Func<T, TKey> keySelector)
        {
            return (sets.Item1.OrderByDescending(keySelector), sets.Item2.OrderByDescending(keySelector));
        }
    }
}

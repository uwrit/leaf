// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using Xunit;
using Model.Extensions;

namespace Tests
{
    public class IEnumerableExtensionsTests
    {
        [Fact]
        public void PartitionBy_FullSides_Ok()
        {
            var whole = new int[] { 1, 2, 3, 4, 5, 6 };
            var (lt3, ge3) = whole.PartitionBy(i => i < 3);

            Assert.True(lt3.All(i => i < 3));
            Assert.True(ge3.All(i => i >= 3));
        }

        [Fact]
        public void PartitionBy_EmptySide_Ok()
        {
            var whole = new int[] { 3, 4, 5, 6 };
            var (lt3, ge3) = whole.PartitionBy(i => i < 3);

            Assert.Empty(lt3);
            Assert.True(ge3.All(i => i >= 3));
        }

        [Fact]
        public void OrderBy_Ok()
        {
            var whole = new int[] { 3, 2, 1, 4, 5, 6 };
            var (lt3, ge3) = whole.PartitionBy(i => i < 3)
                .OrderBy(i => i);

            Assert.True(lt3.SequenceEqual(new int[] { 1, 2 }));
            Assert.True(ge3.SequenceEqual(new int[] { 3, 4, 5, 6 }));
        }

        [Fact]
        public void Except_ByFunc_Ok()
        {
            var left = new int[] { 1, 2, 3 };
            var right = new int[] { 3, 4, 5 };

            var diff = left.Except(right, (a, b) => a == b).ToArray();

            Assert.True(diff.SequenceEqual(new int[] { 4, 5 }));
        }
    }
}

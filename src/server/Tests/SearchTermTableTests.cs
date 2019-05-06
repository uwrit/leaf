// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Services.Tables;
using Xunit;

namespace Tests
{
    public class SearchTermTableTests
    {
        static string RandomString()
        {
            var guid = Guid.NewGuid().ToString();
            return guid.Split("-")[0];
        }

        static string[] RandomStrings(int num)
        {
            var ss = new string[num];
            for (var i = 0; i < num; i++)
            {
                ss[i] = RandomString();
            }
            return ss;
        }

        [Fact]
        public void Value_Table_Row_Count_Should_Equal_Search_Term_Count()
        {
            var iter = new Random().Next(1, 10);
            var terms = RandomStrings(iter);

            var search = SearchTermTable.From(terms);

            Assert.Equal(iter, search.Rows.Count);
        }
    }
}

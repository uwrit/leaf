// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Reflection;
using System.Collections.Generic;
using System.Linq;
using Xunit;
using Model.Cohort;
using Model.Options;
using Model.Compiler;
using Services.Obfuscation;
using Tests.Mock.Models.Obfuscation;

namespace Tests
{
    public class ObfuscatorTests
    {
        [Fact]
        public void Original_Value_Changed()
        {
            var orig = 50;
            var obfuscator = new ObfuscationService();
            var opts = new ObfuscationOptions { Enabled = true, ShiftValue = 10 };
            var count = new PatientCount { Value = orig };
            var ctx = MockPanel.Context(); 

            obfuscator.Obfuscate(ref count, ctx, opts);

            Assert.NotEqual(orig, count.Value);
            Assert.Equal(count.PlusMinus, opts.ShiftValue);
            Assert.False(count.UnderThreshold);
        }

        [Fact]
        public void Under_Threshold_Not_Shifted()
        {
            var orig = 5;
            var obfuscator = new ObfuscationService();
            var opts = new ObfuscationOptions { Enabled = true, ShiftValue = 10 };
            var count = new PatientCount { Value = orig };
            var ctx = MockPanel.Context();

            obfuscator.Obfuscate(ref count, ctx, opts);

            Assert.NotEqual(orig, count.Value);
            Assert.Equal(count.Value, opts.ShiftValue);
            Assert.True(count.UnderThreshold);
        }

        [Fact]
        public void Same_Logic_Different_Structure_Produces_Same_Shift()
        {
            var g1 = Guid.NewGuid();
            var g2 = Guid.NewGuid();
            var g3 = Guid.NewGuid();
            var orig = 50;
            var obfuscator = new ObfuscationService();
            var opts = new ObfuscationOptions { Enabled = true, ShiftValue = 10 };

            var count1 = new PatientCount { Value = orig };
            var count2 = new PatientCount { Value = orig };
            var count3 = new PatientCount { Value = orig };
            var count4 = new PatientCount { Value = orig };

            var ctx1 = MockPanel.Context();
            var ctx2 = MockPanel.Context();
            var ctx3 = MockPanel.Context();
            var ctx4 = MockPanel.Context();

            // Set context one with two panels, the first with two concepts, second with one.
            ctx1.Allowed.ElementAt(0).SubPanels.ElementAt(0).PanelItems = new List<PanelItem> { new PanelItem { Concept = new Concept { Id = g1 } }, new PanelItem { Concept = new Concept { Id = g2 } } };
            ctx1.Allowed.Append(new Panel { SubPanels = new List<SubPanel> { new SubPanel { PanelItems = new List<PanelItem> { new PanelItem { Concept = new Concept { Id = g3 } } } } } });

            // Set context two to same as one, but with panel one concept order flipped.
            ctx2.Allowed.ElementAt(0).SubPanels.ElementAt(0).PanelItems = new List<PanelItem> { new PanelItem { Concept = new Concept { Id = g2 } }, new PanelItem { Concept = new Concept { Id = g1 } } };
            ctx2.Allowed.Append(new Panel { SubPanels = new List<SubPanel> { new SubPanel { PanelItems = new List<PanelItem> { new PanelItem { Concept = new Concept { Id = g3 } } } } } });

            // Set context three to same as one, but with panel order flipped.
            ctx3.Allowed.ElementAt(0).SubPanels.ElementAt(0).PanelItems = new List<PanelItem> { new PanelItem { Concept = new Concept { Id = g1 } }, new PanelItem { Concept = new Concept { Id = g2 } } };
            ctx3.Allowed.Prepend(new Panel { SubPanels = new List<SubPanel> { new SubPanel { PanelItems = new List<PanelItem> { new PanelItem { Concept = new Concept { Id = g3 } } } } } });

            // Set context four to a combination of two and three, with both concept order and panel order flipped.
            ctx4.Allowed.ElementAt(0).SubPanels.ElementAt(0).PanelItems = new List<PanelItem> { new PanelItem { Concept = new Concept { Id = g2 } }, new PanelItem { Concept = new Concept { Id = g1 } } };
            ctx4.Allowed.Prepend(new Panel { SubPanels = new List<SubPanel> { new SubPanel { PanelItems = new List<PanelItem> { new PanelItem { Concept = new Concept { Id = g3 } } } } } });

            obfuscator.Obfuscate(ref count1, ctx1, opts);
            obfuscator.Obfuscate(ref count2, ctx2, opts);
            obfuscator.Obfuscate(ref count3, ctx3, opts);
            obfuscator.Obfuscate(ref count4, ctx4, opts);

            Assert.NotEqual(orig, count1.Value);
            Assert.NotEqual(orig, count2.Value);
            Assert.NotEqual(orig, count3.Value);
            Assert.NotEqual(orig, count4.Value);
            Assert.NotEqual(count1.Value, opts.ShiftValue);
            Assert.NotEqual(count2.Value, opts.ShiftValue);
            Assert.NotEqual(count3.Value, opts.ShiftValue);
            Assert.NotEqual(count4.Value, opts.ShiftValue);
            Assert.False(count1.UnderThreshold);
            Assert.False(count2.UnderThreshold);
            Assert.False(count3.UnderThreshold);
            Assert.False(count4.UnderThreshold);
            Assert.Equal(count1.Value, count2.Value);
            Assert.Equal(count1.Value, count3.Value);
            Assert.Equal(count1.Value, count4.Value);
        }
    }
}

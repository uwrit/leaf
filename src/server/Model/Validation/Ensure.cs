// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Runtime.CompilerServices;
using System.Diagnostics;

namespace Model.Validation
{
    public static class Ensure
    {
        [MethodImpl(MethodImplOptions.AggressiveInlining), DebuggerStepThrough]
        public static void NotNull<T>(T value, string name) where T : class
        {
            if (value == null)
                throw new ArgumentNullException(name);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining), DebuggerStepThrough]
        public static void NotNullOrWhitespace(string value, string name)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentNullException(name);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining), DebuggerStepThrough]
        public static void NotDefault<T>(T value, string name)
        {
            if (value.Equals(default))
                throw new ArgumentException($"Value cannot be default.{Environment.NewLine}Parameter name: {name}");
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining), DebuggerStepThrough]
        public static void Defined<T>(object value, string name) where T : Enum
        {
            var ty = typeof(T);
            if (!Enum.IsDefined(ty, value))
                throw new ArgumentException($"Value not defined in {ty.ToString()}.{Environment.NewLine}Value: {value.ToString()}.{Environment.NewLine}Parameter name: {name}");
        }
    }
}

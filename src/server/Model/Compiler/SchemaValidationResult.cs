// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;

namespace Model.Compiler
{
    public class SchemaValidationResult
    {
        public Shape Shape { get; private set; }
        public SchemaValidationState State { get; internal set; }
        public ICollection<string> Messages => _messages;
        ICollection<string> _messages { get; set; }


        SchemaValidationResult(Shape shape)
        {
            Shape = shape;
            State = SchemaValidationState.Ok;
            _messages = new List<string>();
        }

        SchemaValidationResult(Shape shape, SchemaValidationState state, ICollection<string> messages)
        {
            Shape = shape;
            State = state;
            _messages = messages;
        }

        public static SchemaValidationResult Ok(Shape shape)
        {
            return new SchemaValidationResult(shape);
        }

        public static SchemaValidationResult Warning(Shape shape, ICollection<string> messages)
        {
            return new SchemaValidationResult(shape, SchemaValidationState.Warning, messages);
        }

        public static SchemaValidationResult Error(Shape shape, ICollection<string> messages)
        {
            return new SchemaValidationResult(shape, SchemaValidationState.Error, messages);
        }

        public void AddMessage(string message)
        {
            _messages.Add(message);
        }
    }

    public enum SchemaValidationState
    {
        Ok,
        Warning,
        Error,
    }
}
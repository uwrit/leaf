// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
namespace Model.Collections
{
    /// <summary>
    /// A threadsafe Queue that does not allow duplicates as determined by
    /// the GetKey override.
    /// </summary>
    public abstract class ConcurrentQueueSet<K, V>
    {
        readonly object sync;
        readonly Queue<V> queue;
        readonly HashSet<K> index;

        protected ConcurrentQueueSet()
        {
            sync = new object();
            queue = new Queue<V>();
            index = new HashSet<K>();
        }

        /// <summary>
        /// Gets a value indicating whether this <see cref="T:Model.Collections.ConcurrentQueueSet`2"/> is empty.
        /// </summary>
        /// <value><c>true</c> if is empty; otherwise, <c>false</c>.</value>
        public bool IsEmpty
        {
            get
            {
                lock (sync)
                {
                    return IsEmptyDirty;
                }
            }
        }

        /// <summary>
        /// Override this method to return the key for the type <typeparamref name="V"/>
        /// </summary>
        /// <returns>The key.</returns>
        /// <param name="val">Value.</param>
        protected abstract K GetKey(V val);

        /// <summary>
        /// Tries the enqueue.
        /// </summary>
        /// <returns><c>true</c>, if enqueue was successful, <c>false</c> otherwise.</returns>
        /// <param name="val">Item to enqueue.</param>
        public bool TryEnqueue(V val)
        {
            var key = GetKey(val);

            lock (sync)
            {
                if (index.Add(key))
                {
                    queue.Enqueue(val);
                    return true;
                }
            }

            return false;
        }

        /// <summary>
        /// Dequeue this instance.
        /// </summary>
        /// <returns>The dequeue.</returns>
        public bool TryDequeue(out V val)
        {
            val = default;
            lock (sync)
            {
                if (!IsEmptyDirty)
                {
                    val = DequeueDirty();
                    return true;
                }

                return false;
            }
        }

        /// <summary>
        /// Drains and returns the values in the queue.
        /// </summary>
        /// <returns>The drained values.</returns>
        public IEnumerable<V> Drain()
        {
            lock (sync)
            {
                var drained = new List<V>();

                if (!IsEmptyDirty)
                {
                    while (!IsEmptyDirty)
                    {
                        var val = DequeueDirty();
                        drained.Add(val);
                    }
                }

                return drained;
            }
        }

        /// <summary>
        /// Gets a value indicating whether this <see cref="T:Model.Collections.ConcurrentQueueSet`2"/>
        /// is empty without acquiring a lock.
        /// Internal use only.
        /// </summary>
        /// <value><c>true</c> if dirty empty; otherwise, <c>false</c>.</value>
        bool IsEmptyDirty => queue.Count == 0;

        /// <summary>
        /// Dequeue this instance without checking the queue status or acquiring a lock.
        /// Internal use only.
        /// </summary>
        /// <returns>The dequeued value.</returns>
        V DequeueDirty()
        {
            var val = queue.Dequeue();
            var key = GetKey(val);
            index.Remove(key);

            return val;
        }
    }
}

'use strict';

const { Pool } = require('pg');

/**
 * In-memory min-heap with O(1) id lookup for update/delete.
 * Priorities with equal value preserve insertion order (stable tie-breaking via id).
 */
class MinHeap {
  constructor() {
    this.items = [];
    this.indexById = new Map();
  }

  _parent(index) {
    return Math.floor((index - 1) / 2);
  }

  _left(index) {
    return index * 2 + 1;
  }

  _right(index) {
    return index * 2 + 2;
  }

  _compare(a, b) {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return a.id - b.id;
  }

  _swap(i, j) {
    const left = this.items[i];
    const right = this.items[j];
    this.items[i] = right;
    this.items[j] = left;
    this.indexById.set(left.id, j);
    this.indexById.set(right.id, i);
  }

  _siftUp(index) {
    while (index > 0) {
      const parent = this._parent(index);
      if (this._compare(this.items[parent], this.items[index]) <= 0) {
        break;
      }
      this._swap(index, parent);
      index = parent;
    }
  }

  _siftDown(index) {
    while (true) {
      const left = this._left(index);
      const right = this._right(index);
      let smallest = index;

      if (left < this.items.length && this._compare(this.items[left], this.items[smallest]) < 0) {
        smallest = left;
      }
      if (right < this.items.length && this._compare(this.items[right], this.items[smallest]) < 0) {
        smallest = right;
      }
      if (smallest === index) {
        break;
      }
      this._swap(index, smallest);
      index = smallest;
    }
  }

  insert(item) {
    this.items.push(item);
    this.indexById.set(item.id, this.items.length - 1);
    this._siftUp(this.items.length - 1);
  }

  peek() {
    return this.items[0] ?? null;
  }

  extractMin() {
    if (this.items.length === 0) {
      return null;
    }

    const min = this.items[0];
    const last = this.items.pop();
    this.indexById.delete(min.id);

    if (this.items.length > 0) {
      this.items[0] = last;
      this.indexById.set(last.id, 0);
      this._siftDown(0);
    }

    return min;
  }

  extractMax() {
    if (this.items.length === 0) {
      return null;
    }

    let maxIndex = 0;
    for (let i = 1; i < this.items.length; i += 1) {
      const current = this.items[i];
      const best = this.items[maxIndex];
      if (
        current.priority > best.priority ||
        (current.priority === best.priority && current.id > best.id)
      ) {
        maxIndex = i;
      }
    }

    return this._removeAt(maxIndex);
  }

  update(id, priority) {
    const index = this.indexById.get(id);
    if (index === undefined) {
      throw new Error(`Item with id ${id} not found`);
    }

    const item = this.items[index];
    const oldPriority = item.priority;
    item.priority = priority;

    if (priority < oldPriority) {
      this._siftUp(index);
    } else if (priority > oldPriority) {
      this._siftDown(index);
    }

    return item;
  }

  delete(id) {
    const index = this.indexById.get(id);
    if (index === undefined) {
      throw new Error(`Item with id ${id} not found`);
    }
    return this._removeAt(index);
  }

  _removeAt(index) {
    const removed = this.items[index];
    const last = this.items.pop();
    this.indexById.delete(removed.id);

    if (index < this.items.length) {
      this.items[index] = last;
      this.indexById.set(last.id, index);
      this._siftUp(index);
      this._siftDown(index);
    }

    return removed;
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }

  rebuild(items) {
    this.items = [];
    this.indexById.clear();
    const sorted = [...items].sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.id - b.id;
    });
    for (const item of sorted) {
      this.insert(item);
    }
  }
}

class PriorityQueue {
  /**
   * @param {object} [options]
   * @param {string} [options.connectionString] - PostgreSQL connection string
   * @param {import('pg').Pool} [options.pool] - Existing pg Pool instance
   */
  constructor(options = {}) {
    this.pool =
      options.pool ||
      new Pool({
        connectionString:
          options.connectionString ||
          process.env.DATABASE_URL ||
          'postgresql://postgres:postgres@localhost:5432/priority_queue',
      });
    this.ownsPool = !options.pool;
    this.heap = new MinHeap();
    this.ready = false;
  }

  async connect() {
    if (this.ready) {
      return;
    }

    await this._ensureSchema();
    await this._loadFromDatabase();
    this.ready = true;
  }

  async _ensureSchema() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS pq_items (
        id INTEGER PRIMARY KEY,
        priority INTEGER NOT NULL,
        value JSONB NOT NULL DEFAULT 'null'::jsonb
      );
      CREATE INDEX IF NOT EXISTS idx_pq_items_priority ON pq_items (priority);
      CREATE TABLE IF NOT EXISTS pq_meta (
        key TEXT PRIMARY KEY,
        value BIGINT NOT NULL
      );
      INSERT INTO pq_meta (key, value)
      VALUES ('next_id', 1)
      ON CONFLICT (key) DO NOTHING;
    `);
  }

  async _loadFromDatabase() {
    const result = await this.pool.query(
      'SELECT id, priority, value FROM pq_items ORDER BY id ASC'
    );
    this.heap.rebuild(
      result.rows.map((row) => ({
        id: row.id,
        priority: row.priority,
        value: row.value,
      }))
    );
  }

  async _allocateId(client) {
    const result = await client.query(
      `UPDATE pq_meta
       SET value = value + 1
       WHERE key = 'next_id'
       RETURNING value - 1 AS id`
    );
    return Number(result.rows[0].id);
  }

  _assertReady() {
    if (!this.ready) {
      throw new Error('PriorityQueue is not connected. Call connect() first.');
    }
  }

  _toPublicItem(item) {
    if (!item) {
      return null;
    }
    return {
      id: item.id,
      priority: item.priority,
      value: item.value,
    };
  }

  /**
   * Insert an element with the given priority.
   * @param {number} priority
   * @param {*} [value=null]
   * @returns {Promise<{id: number, priority: number, value: *}>}
   */
  async insert(priority, value = null) {
    this._assertReady();

    if (!Number.isInteger(priority)) {
      throw new TypeError('priority must be an integer');
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const id = await this._allocateId(client);
      const item = { id, priority, value };

      await client.query(
        'INSERT INTO pq_items (id, priority, value) VALUES ($1, $2, $3)',
        [id, priority, JSON.stringify(value)]
      );
      await client.query('COMMIT');

      this.heap.insert(item);
      return this._toPublicItem(item);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Remove and return the element with the smallest priority.
   * @returns {Promise<{id: number, priority: number, value: *}|null>}
   */
  async extract_min() {
    this._assertReady();

    const item = this.heap.extractMin();
    if (!item) {
      return null;
    }

    await this.pool.query('DELETE FROM pq_items WHERE id = $1', [item.id]);
    return this._toPublicItem(item);
  }

  /**
   * Remove and return the element with the largest priority.
   * @returns {Promise<{id: number, priority: number, value: *}|null>}
   */
  async extract_max() {
    this._assertReady();

    const item = this.heap.extractMax();
    if (!item) {
      return null;
    }

    await this.pool.query('DELETE FROM pq_items WHERE id = $1', [item.id]);
    return this._toPublicItem(item);
  }

  /**
   * Return the smallest-priority element without removing it.
   * @returns {{id: number, priority: number, value: *}|null}
   */
  peek() {
    this._assertReady();
    return this._toPublicItem(this.heap.peek());
  }

  /**
   * Update the priority of an existing element.
   * @param {number} id
   * @param {number} priority
   * @returns {Promise<{id: number, priority: number, value: *}>}
   */
  async update(id, priority) {
    this._assertReady();

    if (!Number.isInteger(id)) {
      throw new TypeError('id must be an integer');
    }
    if (!Number.isInteger(priority)) {
      throw new TypeError('priority must be an integer');
    }

    const item = this.heap.update(id, priority);
    await this.pool.query('UPDATE pq_items SET priority = $1 WHERE id = $2', [
      priority,
      id,
    ]);
    return this._toPublicItem(item);
  }

  /**
   * Delete an element by id.
   * @param {number} id
   * @returns {Promise<{id: number, priority: number, value: *}>}
   */
  async delete(id) {
    this._assertReady();

    if (!Number.isInteger(id)) {
      throw new TypeError('id must be an integer');
    }

    const item = this.heap.delete(id);
    await this.pool.query('DELETE FROM pq_items WHERE id = $1', [id]);
    return this._toPublicItem(item);
  }

  /**
   * Check whether the queue is empty.
   * @returns {boolean}
   */
  is_empty() {
    this._assertReady();
    return this.heap.isEmpty();
  }

  /**
   * Close the database connection pool if this instance created it.
   */
  async close() {
    if (this.ownsPool) {
      await this.pool.end();
    }
    this.ready = false;
  }
}

/**
 * Factory helper that connects and returns a ready queue instance.
 * @param {object} [options]
 * @returns {Promise<PriorityQueue>}
 */
async function createPriorityQueue(options = {}) {
  const queue = new PriorityQueue(options);
  await queue.connect();
  return queue;
}

module.exports = {
  PriorityQueue,
  createPriorityQueue,
};

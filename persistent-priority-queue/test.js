'use strict';

const assert = require('assert');
const { Pool } = require('pg');
const { PriorityQueue } = require('./module');

const TEST_DB =
  process.env.TEST_DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/priority_queue_test';

async function resetDatabase(pool) {
  await pool.query('DROP TABLE IF EXISTS pq_items CASCADE');
  await pool.query('DROP TABLE IF EXISTS pq_meta CASCADE');
}

async function runTests() {
  const pool = new Pool({ connectionString: TEST_DB });
  await resetDatabase(pool);

  const queue = new PriorityQueue({ pool });
  await queue.connect();

  assert.strictEqual(queue.is_empty(), true);
  assert.strictEqual(queue.peek(), null);

  const a = await queue.insert(10, 'a');
  const b = await queue.insert(5, 'b');
  const c = await queue.insert(20, 'c');

  assert.strictEqual(queue.is_empty(), false);
  assert.strictEqual(queue.peek().id, b.id);

  const updated = await queue.update(b.id, 25);
  assert.strictEqual(updated.priority, 25);
  assert.strictEqual(queue.peek().id, a.id);

  const deleted = await queue.delete(a.id);
  assert.strictEqual(deleted.id, a.id);
  assert.strictEqual(queue.peek().id, c.id);

  const max = await queue.extract_max();
  assert.strictEqual(max.id, b.id);

  const min = await queue.extract_min();
  assert.strictEqual(min.id, c.id);
  assert.strictEqual(queue.is_empty(), true);

  await queue.insert(1, 'persist-me');
  await queue.close();

  const reloaded = new PriorityQueue({ pool });
  await reloaded.connect();
  assert.strictEqual(reloaded.peek().value, 'persist-me');

  await reloaded.close();
  await resetDatabase(pool);
  await pool.end();

  console.log('All tests passed.');
}

runTests().catch((error) => {
  console.error('Tests failed:', error);
  process.exitCode = 1;
});

# Persistent Priority Queue

A JavaScript priority queue with **PostgreSQL-backed persistence**. State survives process restarts and can be shared across application instances.

## Requirements

- Node.js 18+
- PostgreSQL 14+ (local install or Docker)

## Quick Start

### 1. Start PostgreSQL

Using Docker (recommended):

```bash
cd persistent-priority-queue
docker compose up -d
```

This starts PostgreSQL on port **5433** with database `priority_queue`.

### 2. Install dependencies

```bash
npm install
```

### 3. Initialize the database schema

```bash
export DATABASE_URL=postgresql://postgres:postgres@localhost:5433/priority_queue
npm run setup
```

### 4. Run the demo

```bash
npm run demo
```

### 5. Run tests (optional)

```bash
createdb -h localhost -p 5433 -U postgres priority_queue_test  # if needed
export TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5433/priority_queue_test
npm test
```

## API

The main implementation is in `module.js`. Create a connected queue instance:

```javascript
const { createPriorityQueue } = require('./module');

async function main() {
  const queue = await createPriorityQueue({
    connectionString: process.env.DATABASE_URL,
  });

  await queue.insert(10, { task: 'Send email' });
  await queue.insert(3, { task: 'Fix outage' });

  console.log(queue.peek());           // lowest priority item
  console.log(queue.is_empty());       // false

  await queue.update(2, 1);            // reprioritize by id
  await queue.extract_min();           // remove lowest priority
  await queue.extract_max();           // remove highest priority
  await queue.delete(1);               // remove by id

  await queue.close();
}
```

| Method | Description | Time Complexity |
|--------|-------------|-----------------|
| `insert(priority, value)` | Add an element | O(log n) |
| `extract_min()` | Remove and return smallest priority | O(log n) |
| `extract_max()` | Remove and return largest priority | O(n)* |
| `peek()` | View smallest priority without removing | O(1) |
| `update(id, priority)` | Change priority of an existing element | O(log n) |
| `delete(id)` | Remove element by id | O(log n) |
| `is_empty()` | Check if queue has no elements | O(1) |

\* `extract_max` scans the heap for the maximum element. A dual-heap design would achieve O(log n) at the cost of more complex synchronization.

Each mutating operation is written to PostgreSQL in the same logical step, so the in-memory heap and database stay consistent.

---

## Implementation Notes

### Data Structure

The queue uses a **binary min-heap** stored in memory for fast access, backed by PostgreSQL for durability.

- **Heap array**: Each node holds `{ id, priority, value }`.
- **Index map (`id → heap index`)**: Enables O(1) lookup for `update` and `delete`, followed by O(log n) sift-up or sift-down to restore the heap property.
- **Stable ordering**: When priorities tie, lower `id` wins (FIFO among equals).

### Persistence Strategy

Two PostgreSQL tables are used:

- `pq_items` — stores each element (`id`, `priority`, `value`)
- `pq_meta` — stores the next auto-increment id

On startup, all rows are loaded from `pq_items` and the heap is rebuilt. After every mutating operation, the corresponding row is inserted, updated, or deleted. `insert` uses a transaction to allocate a new id atomically.

This **write-through** design keeps the database as the durable source of truth while the heap provides efficient in-process operations.

### Why Not a Heap-Only File Store?

PostgreSQL was chosen because it provides:

- ACID transactions for concurrent writers
- Queryability for debugging and monitoring
- Natural fit with Node.js backend stacks (as referenced in the job description)

### Design Trade-offs

| Choice | Benefit | Cost |
|--------|---------|------|
| Min-heap + linear `extract_max` | Simple, correct, fast updates | `extract_max` is O(n) |
| Write-through on every mutation | Strong consistency | One DB round-trip per operation |
| JSONB values | Flexible payloads | Not ideal for very large blobs |

For workloads needing frequent `extract_max` at scale, a dual-heap or balanced tree would be a natural extension.

---

## Real-World Use Cases

Priority queues appear wherever work must be ordered by urgency rather than arrival time:

1. **Task schedulers** — Background job systems (Sidekiq, Celery-style) dequeue the highest-priority work first; persistence ensures jobs survive crashes.
2. **Hospital triage / ER systems** — Patients are served by severity; priorities change as conditions evolve (`update`).
3. **Network packet scheduling** — Routers use priority queues (e.g., QoS) to send latency-sensitive traffic before bulk transfers.
4. **Event-driven simulations** — Discrete-event simulators process events in timestamp order using a priority queue.
5. **Dijkstra's shortest path** — The algorithm relies on extracting the minimum-distance unvisited node repeatedly.
6. **Rate-limited API gateways** — Requests from premium customers receive lower priority numbers and are processed first.
7. **Merge of sorted streams** — Combining multiple sorted inputs efficiently by always picking the smallest head element.

---

## Project Structure

```
persistent-priority-queue/
├── module.js              # Main priority queue implementation
├── demo.js                # Usage demonstration
├── test.js                # Basic integration tests
├── package.json
├── docker-compose.yml     # PostgreSQL for local development
├── scripts/
│   ├── init-db.sql        # Database schema
│   └── setup.js           # Schema initialization script
└── .env.example
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/priority_queue` | PostgreSQL connection string |
| `TEST_DATABASE_URL` | — | Separate database for running tests |

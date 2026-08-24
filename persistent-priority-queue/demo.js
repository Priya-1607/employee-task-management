'use strict';

const { createPriorityQueue } = require('./module');

async function runDemo() {
  const queue = await createPriorityQueue();

  console.log('--- Persistent Priority Queue Demo ---\n');

  await queue.insert(30, 'low urgency task');
  await queue.insert(5, 'critical bug fix');
  await queue.insert(15, 'feature request');
  await queue.insert(5, 'another critical item');

  console.log('After inserts:');
  console.log('  peek():', queue.peek());
  console.log('  is_empty():', queue.is_empty());

  const min = await queue.extract_min();
  console.log('\nextract_min():', min);

  const max = await queue.extract_max();
  console.log('extract_max():', max);

  const critical = queue.peek();
  console.log('\npeek() after extractions:', critical);

  if (critical) {
    const updated = await queue.update(critical.id, 1);
    console.log(`update(${critical.id}, 1):`, updated);
  }

  console.log('\nRemaining queue (by repeated extract_min):');
  while (!queue.is_empty()) {
    console.log(' ', await queue.extract_min());
  }

  console.log('\nis_empty():', queue.is_empty());
  await queue.close();
}

runDemo().catch((error) => {
  console.error('Demo failed:', error.message);
  process.exitCode = 1;
});

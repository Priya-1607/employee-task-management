#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/priority_queue';

  const client = new Client({ connectionString });

  try {
    await client.connect();
    const sql = fs.readFileSync(
      path.join(__dirname, 'init-db.sql'),
      'utf8'
    );
    await client.query(sql);
    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Database setup failed:', error.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();

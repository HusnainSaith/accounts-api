import { Client } from 'pg';

async function createDatabase() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres', // Connect to default postgres db first
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Check if database exists
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = 'accounts-api'`,
    );

    if (result.rows.length > 0) {
      console.log('Database "accounts-api" already exists');
    } else {
      console.log('Creating database "accounts-api"...');
      await client.query(
        'CREATE DATABASE "accounts-api" WITH ENCODING \'UTF8\'',
      );
      console.log('Database created successfully');
    }

    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createDatabase();

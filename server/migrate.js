import { getDb } from './db.js';

async function runMigration() {
  console.log('--- NAVI-3D Database Migration ---');
  try {
    const db = await getDb();
    const stats = await db.getDbStats();
    console.log('Migration successful!');
    console.log('Database Type:', stats.database);
    console.log('Total Accounts:', stats.userCount);
    console.log('Session Count:', stats.sessionCount);
    console.log('Status: ACTIVE');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();

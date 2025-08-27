import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function openDb() {
  const db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      subscriptionType TEXT,
      startDate TEXT,
      endDate TEXT,
      gender TEXT,
      age INTEGER,
      weight INTEGER,
      height INTEGER,
      dailyCalories INTEGER
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  return db;
}
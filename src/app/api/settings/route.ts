import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function GET() {
  const db = await openDb();
  const settings = await db.all('SELECT * FROM settings');
  const settingsObj = settings.reduce((acc, setting) => {
    acc[setting.key] = JSON.parse(setting.value);
    return acc;
  }, {});
  return NextResponse.json(settingsObj);
}

export async function POST(req: Request) {
  const db = await openDb();
  const data = await req.json();

  const stmt = await db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  for (const key in data) {
    await stmt.run(key, JSON.stringify(data[key]));
  }
  await stmt.finalize();

  return NextResponse.json({ message: 'Settings saved successfully' });
}
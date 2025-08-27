
import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await openDb();
    const members = await db.all('SELECT * FROM members ORDER BY startDate DESC');
    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const db = await openDb();
    const result = await db.run(
      'INSERT INTO members (name, phone, subscriptionType, startDate, endDate, gender, age, weight, height, dailyCalories) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [data.name, data.phone, data.subscriptionType, data.startDate, data.endDate, data.gender, data.age, data.weight, data.height, data.dailyCalories]
    );
    return NextResponse.json({ id: result.lastID });
  } catch (error) {
    console.error("Error adding member:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

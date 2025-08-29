import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';
import { hashPassword } from '@/lib/crypto';

export async function POST(request: Request) {
  try {
    const { email, password, admin_id } = await request.json();
    const db = await openDb();
    
    // In a real app, you'd want to verify that the request is coming from an admin.
    // We'll skip that for now but add it later.

    const result = await db.run(
      'INSERT INTO users (email, password, role, admin_id) VALUES (?, ?, ?, ?)',
      [email, hashPassword(password), 'assistant', admin_id]
    );

    return NextResponse.json({ id: result.lastID });
  } catch (error) {
    console.error('Error signing up:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

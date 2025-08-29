import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';
import { hashPassword } from '@/lib/crypto';

export async function PUT(request: Request) {
  try {
    const { userId, oldPassword, newPassword } = await request.json();
    const db = await openDb();

    // In a real app, you'd get the userId from the session.
    const user = await db.get('SELECT * FROM users WHERE id = ?', userId);

    if (!user || user.password !== hashPassword(oldPassword)) {
      return new NextResponse('Invalid credentials', { status: 401 });
    }

    await db.run('UPDATE users SET password = ? WHERE id = ?', [hashPassword(newPassword), userId]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error changing password:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

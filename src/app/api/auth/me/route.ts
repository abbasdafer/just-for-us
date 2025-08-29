import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const cookie = request.headers.get('cookie');
    const sessionToken = cookie?.split(';').find(c => c.trim().startsWith('session_token='))?.split('=')[1];

    if (!sessionToken) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const db = await openDb();
    const session = await db.get('SELECT * FROM sessions WHERE id = ?', sessionToken);

    if (!session || session.expiresAt < Date.now()) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await db.get('SELECT * FROM users WHERE id = ?', session.userId);

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error getting user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
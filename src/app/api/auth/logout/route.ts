import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const cookie = request.headers.get('cookie');
    const sessionToken = cookie?.split(';').find(c => c.trim().startsWith('session_token='))?.split('=')[1];

    if (!sessionToken) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const db = await openDb();
    await db.run('DELETE FROM sessions WHERE id = ?', sessionToken);

    const response = new NextResponse('Logged out', { status: 200 });
    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error('Error logging out:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';
import { hashPassword } from '@/lib/crypto';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const db = await openDb();
    const user = await db.get('SELECT * FROM users WHERE email = ?', email);

    if (!user || user.password !== hashPassword(password)) {
      return new NextResponse('Invalid credentials', { status: 401 });
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const sessionToken = randomBytes(32).toString('hex');
    await db.run('INSERT INTO sessions (id, userId, expiresAt) VALUES (?, ?, ?)', sessionToken, user.id, expiresAt.getTime());

    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json(userWithoutPassword);

    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: expiresAt,
    });

    return response;
  } catch (error) {
    console.error('Error logging in:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

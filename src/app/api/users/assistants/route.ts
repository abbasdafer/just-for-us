import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const admin_id = searchParams.get('admin_id');
    const db = await openDb();
    
    // In a real app, you'd get the admin_id from the session.
    const assistants = await db.all('SELECT id, email, role FROM users WHERE admin_id = ?', admin_id);
    
    return NextResponse.json(assistants);
  } catch (error) {
    console.error('Error fetching assistants:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

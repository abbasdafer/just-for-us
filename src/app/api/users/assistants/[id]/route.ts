import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = await openDb();
    
    // In a real app, you'd want to verify that the request is coming from an admin.
    await db.run('DELETE FROM users WHERE id = ? AND role = ?', [params.id, 'assistant']);
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting assistant ${params.id}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

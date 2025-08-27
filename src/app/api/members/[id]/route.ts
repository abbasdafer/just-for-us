
import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = await openDb();
    const member = await db.get('SELECT * FROM members WHERE id = ?', params.id);
    if (!member) {
      return new NextResponse('Member not found', { status: 404 });
    }
    return NextResponse.json(member);
  } catch (error) {
    console.error(`Error fetching member ${params.id}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    const db = await openDb();
    await db.run(
      'UPDATE members SET name = ?, phone = ?, gender = ?, age = ?, weight = ?, height = ?, dailyCalories = ?, mealPlan = ? WHERE id = ?',
      [data.name, data.phone, data.gender, data.age, data.weight, data.height, data.dailyCalories, data.mealPlan, params.id]
    );
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error updating member ${params.id}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = await openDb();
    await db.run('DELETE FROM members WHERE id = ?', params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting member ${params.id}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

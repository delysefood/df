import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Table from '@/models/Table';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();
    const tables = await Table.find().sort({ name: 1 });
    return NextResponse.json(tables);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { name, capacity, isActive } = await req.json();
    await dbConnect();
    
    const table = await Table.create({ name, capacity, isActive });
    return NextResponse.json(table, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

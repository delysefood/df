import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Table from '@/models/Table';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { name, capacity, isActive } = await req.json();
    const { id } = await params;
    await dbConnect();
    
    const table = await Table.findByIdAndUpdate(id, { name, capacity, isActive }, { new: true });
    return NextResponse.json(table);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();
    
    await Table.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Table supprimée' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

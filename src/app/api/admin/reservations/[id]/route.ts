import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Reservation from '@/models/Reservation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'super-admin')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await req.json();
    const { id } = await params;
    
    await dbConnect();
    const reservation = await Reservation.findByIdAndUpdate(id, { status }, { new: true });
    
    return NextResponse.json(reservation);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'super-admin')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();
    await Reservation.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Reservation deleted' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

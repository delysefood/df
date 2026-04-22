import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import Reservation from "@/models/Reservation";
import Table from "@/models/Table";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'super-admin')) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const reservations = await Reservation.find({})
      .populate('user', 'name email')
      .populate('table', 'name capacity')
      .sort({ date: -1 });
    return NextResponse.json(reservations, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Vous devez être connecté pour réserver." }, { status: 401 });
    }

    const { date, time, guests, table, specialRequests } = await req.json();
    await dbConnect();

    // Check if table is available
    if (table) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(targetDate.getDate() + 1);

      const existing = await Reservation.findOne({
        table,
        date: { $gte: targetDate, $lt: nextDay },
        time: time,
        status: { $in: ['pending', 'confirmed'] }
      });

      if (existing) {
        return NextResponse.json({ message: "Cette table a déjà été réservée pour ce créneau." }, { status: 400 });
      }
    }

    const reservation = await Reservation.create({
      date, time, guests, table, specialRequests,
      user: (session.user as any).id,
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

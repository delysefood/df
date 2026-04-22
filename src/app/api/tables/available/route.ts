import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Table from '@/models/Table';
import Reservation from '@/models/Reservation';

export async function POST(req: Request) {
  try {
    const { date, time, guests } = await req.json();

    if (!date || !time || !guests) {
      return NextResponse.json({ message: 'Date, heure et nombre de convives requis' }, { status: 400 });
    }

    await dbConnect();

    // 1. Trouver les tables actives avec une capacité suffisante
    const tables = await Table.find({ 
      isActive: true, 
      capacity: { $gte: parseInt(guests) } 
    }).sort({ capacity: 1 });

    // 2. Trouver les réservations existantes pour la même date (sans tenir compte de l'heure d'abord si on compare les strings)
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);

    const existingReservations = await Reservation.find({
      date: { $gte: targetDate, $lt: nextDay },
      time: time,
      status: { $in: ['pending', 'confirmed'] }
    });

    const bookedTableIds = existingReservations.map(res => res.table?.toString());

    // 3. Filtrer les tables qui ne sont pas prises
    const availableTables = tables.filter(table => !bookedTableIds.includes(table._id.toString()));

    return NextResponse.json(availableTables);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

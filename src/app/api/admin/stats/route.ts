import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import Order from "@/models/Order";
import Reservation from "@/models/Reservation";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'super-admin')) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get current date boundaries
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Fetch Stats
    const [
      reservationCount,
      orderCount,
      revenueData,
      customerCount,
      recentActivity
    ] = await Promise.all([
      Reservation.countDocuments({ date: { $gte: startOfToday } }),
      Order.countDocuments({ status: { $ne: 'cancelled' } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } }
      ]),
      User.countDocuments({ role: 'user' }),
      Order.find().sort({ createdAt: -1 }).limit(4).populate('user', 'name')
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    return NextResponse.json({
      reservations: reservationCount,
      orders: orderCount,
      revenue: totalRevenue,
      customers: customerCount,
      recentActivity: recentActivity
    }, { status: 200 });

  } catch (error: any) {
    console.error('Stats Error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

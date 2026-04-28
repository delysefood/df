import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import MenuItem from "@/models/MenuItem";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'super-admin')) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json();

    if (!orderId) {
       return NextResponse.json({ message: "L'ID de la commande est requis." }, { status: 400 });
    }

    await dbConnect();
    
    // Ensure User and MenuItem models are loaded
    User.findOne({});
    MenuItem.findOne({});

    const order = await Order.findById(orderId).populate('user', 'name email');

    if (!order) {
      return NextResponse.json({ message: "Commande introuvable." }, { status: 404 });
    }

    if (order.isScanned) {
       return NextResponse.json({ 
         success: false,
         alreadyScanned: true, 
         message: "Cette commande a déjà été scannée précédemment.",
         scannedAt: order.scannedAt,
         order: order
       }, { status: 400 });
    }

    // Mark as scanned
    order.isScanned = true;
    order.scannedAt = new Date();
    await order.save();

    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (error: any) {
    console.error("Order Scan Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

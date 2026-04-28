import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    const updateData: any = {
      orderType: body.orderType
    };

    if (body.orderType === 'dine_in') {
      updateData.tableNumber = body.tableNumber;
    } else if (body.orderType === 'delivery') {
      updateData.deliveryDetails = body.deliveryDetails;
    }

    const order = await Order.findOneAndUpdate(
      { _id: id, user: (session.user as any).id }, // Ensure user owns the order
      updateData,
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (error: any) {
    console.error('Order Preferences Patch Error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

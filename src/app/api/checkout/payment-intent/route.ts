import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import dbConnect from "@/lib/db/mongodb";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Vous devez être connecté pour passer une commande." },
        { status: 401 }
      );
    }

    const { items, totalPrice, specialInstructions } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ message: "Le panier est vide." }, { status: 400 });
    }

    await dbConnect();

    // Create the order in DB with 'unpaid' status
    const order = await Order.create({
      user: (session.user as any).id,
      items: items.map((i: any) => ({
        menuItem: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      totalPrice,
      paymentStatus: "unpaid",
      specialInstructions: specialInstructions || "",
    });

    // Create a PaymentIntent (amount in cents)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100),
      currency: "eur",
      metadata: {
        orderId: order._id.toString(),
        userEmail: session.user.email || "",
      },
      description: `Commande Delyse Food #${order._id.toString().slice(-8).toUpperCase()}`,
    });

    // Save intent ID on order
    await Order.findByIdAndUpdate(order._id, {
      stripeSessionId: paymentIntent.id,
    });

    return NextResponse.json(
      {
        clientSecret: paymentIntent.client_secret,
        orderId: order._id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PaymentIntent error:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

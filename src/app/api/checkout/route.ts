import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: "Vous devez être connecté pour passer une commande." }, { status: 401 });
    }

    const { items, totalPrice, specialInstructions, successUrl, cancelUrl } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ message: "Le panier est vide." }, { status: 400 });
    }

    await dbConnect();

    const order = await Order.create({
      user: (session.user as any).id,
      items: items.map((i: any) => ({
        menuItem: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        extras: i.selectedExtras || [],
        sauces: i.selectedSauces || [],
      })),
      totalPrice,
      specialInstructions,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((i: any) => {
        const saucesText = i.selectedSauces?.length > 0 ? `Sauces: ${i.selectedSauces.join(', ')}` : '';
        const extrasText = i.selectedExtras?.length > 0 ? `Suppléments: ${i.selectedExtras.map((e: any) => `${e.name}${e.quantity > 1 ? ' x' + e.quantity : ''}`).join(', ')}` : '';
        const description = [saucesText, extrasText].filter(Boolean).join(' | ');

        return {
          price_data: {
            currency: "eur",
            product_data: {
              name: i.name,
              description: description || undefined,
              ...(i.image ? { images: [i.image] } : {}),
            },
            unit_amount: Math.round(i.price * 100),
          },
          quantity: i.quantity,
        };
      }),
      mode: "payment",
      success_url: successUrl
        ? `${successUrl}?orderId=${order._id}&session_id={CHECKOUT_SESSION_ID}`
        : `${baseUrl}/checkout/success?orderId=${order._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${baseUrl}/cart`,
      metadata: {
        orderId: order._id.toString(),
      },
      customer_email: session.user?.email ?? undefined,
    });

    // Persist Stripe session ID on the order
    await Order.findByIdAndUpdate(order._id, { stripeSessionId: stripeSession.id });

    return NextResponse.json({ url: stripeSession.url, orderId: order._id }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

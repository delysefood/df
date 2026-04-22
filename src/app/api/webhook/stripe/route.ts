import { NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/db/mongodb";
import Order from "@/models/Order";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16" as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

// Must disable body parsing — Stripe requires the raw body
export const config = {
  api: { bodyParser: false },
};

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ message: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error("⚡ Webhook signature verification failed:", err.message);
    return NextResponse.json({ message: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  await dbConnect();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "paid",
          stripeSessionId: session.id,
          // Auto-advance to preparing once paid
          status: "preparing",
        });
        console.log(`✅ Order ${orderId} marked as PAID`);
      }
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "failed",
          status: "cancelled",
        });
        console.log(`❌ Order ${orderId} payment expired / cancelled`);
      }
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      // Find order by stripeSessionId
      const paymentIntentId = charge.payment_intent as string;
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
      const session = pi.metadata?.orderId
        ? null
        : await stripe.checkout.sessions.list({ payment_intent: paymentIntentId });

      const orderId =
        pi.metadata?.orderId ||
        (session as any)?.data?.[0]?.metadata?.orderId;

      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "refunded",
          status: "cancelled",
        });
        console.log(`💸 Order ${orderId} refunded`);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

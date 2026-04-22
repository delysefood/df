import { NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/db/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import { sendOrderEmails } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16" as any,
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");
  const paymentIntentId = searchParams.get("payment_intent");
  const orderId = searchParams.get("orderId");

  if (!orderId || (!sessionId && !paymentIntentId)) {
    return NextResponse.json({ message: "Paramètres manquants." }, { status: 400 });
  }

  try {
    await dbConnect();
    let isPaid = false;

    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      isPaid = session.payment_status === "paid";
    } else if (paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      isPaid = paymentIntent.status === "succeeded";
    }

    if (isPaid) {
      // Find the order and populate user to get email
      const order = await Order.findById(orderId);
      
      // Only send emails if not already marked as paid
      if (order && order.paymentStatus !== "paid") {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "paid",
          status: "preparing",
        });

        // Fetch user info for email
        const user = await User.findById(order.user);

        if (user) {
          // Trigger the premium emails
          await sendOrderEmails({
            orderId: order._id.toString(),
            customerName: user.name || "Client",
            customerEmail: user.email,
            items: order.items,
            totalPrice: order.totalPrice,
          }).catch(err => console.error("Email sending failed:", err));
        }
      }

      return NextResponse.json({ success: true, status: "paid" });
    } else {
      return NextResponse.json({ success: false, status: "pending" });
    }
  } catch (error: any) {
    console.error("Stripe verify error:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

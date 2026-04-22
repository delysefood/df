import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import MenuItem from "@/models/MenuItem";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    // Allow admins to see all items, visitors see only available
    const session = await getServerSession(authOptions);
    const isAdmin = session && ((session.user as any).role === 'admin' || (session.user as any).role === 'super-admin');
    
    const query = isAdmin ? {} : { isAvailable: true };
    const items = await MenuItem.find(query).sort({ category: 1 });
    return NextResponse.json(items, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'super-admin')) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();

    const newItem = await MenuItem.create(data);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    console.error('Menu POST Error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

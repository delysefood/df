import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import Review from "@/models/Review";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, role, review, rating } = body;

    if (!name || !review || !rating) {
      return NextResponse.json({ message: "Veuillez remplir tous les champs obligatoires." }, { status: 400 });
    }

    await dbConnect();

    const newReview = await Review.create({
      name,
      role: role || 'Client',
      review,
      rating,
      status: 'pending' // En attente de validation par l'admin
    });

    return NextResponse.json({ message: "Avis soumis avec succès", review: newReview }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    // Ne récupérer que les avis approuvés pour l'affichage public
    const reviews = await Review.find({ status: 'approved' }).sort({ createdAt: -1 }).limit(10);
    return NextResponse.json(reviews, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

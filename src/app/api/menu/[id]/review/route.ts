import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import MenuItem from '@/models/MenuItem';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { rating } = await req.json();
    const { id } = await params;
    
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ message: "La note doit être comprise entre 1 et 5." }, { status: 400 });
    }

    await dbConnect();
    
    const menuItem = await MenuItem.findById(id);
    if (!menuItem) {
      return NextResponse.json({ message: "Plat introuvable." }, { status: 404 });
    }

    // Mathematical breakdown of the rating addition
    const currentRating = menuItem.rating || 4.8;
    const currentReviewsCount = menuItem.reviewsCount || 0;

    const newReviewsCount = currentReviewsCount + 1;
    // Calculate new average: ((old Average * old Count) + new Rating) / new Count
    const newRating = ((currentRating * currentReviewsCount) + rating) / newReviewsCount;

    menuItem.rating = parseFloat(newRating.toFixed(1)); // Keep 1 decimal place (e.g. 4.8)
    menuItem.reviewsCount = newReviewsCount;
    
    await menuItem.save();

    return NextResponse.json({ 
      message: "Avis ajouté avec succès", 
      newRating: menuItem.rating, 
      newReviewsCount: menuItem.reviewsCount 
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

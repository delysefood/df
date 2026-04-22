import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db/mongodb";
import User from "@/models/User";
import MenuItem from "@/models/MenuItem";

const SEED_DATA = [
  {
    name: {
      fr: "Tartare de Saumon",
      en: "Salmon Tartare",
      es: "Tartar de Salmón",
      it: "Tartare di Salmone",
      ar: "تارتار السلمون"
    },
    description: {
      fr: "Saumon frais, aneth, baies roses et zestes de citron.",
      en: "Fresh salmon, dill, pink peppercorns and lemon zest.",
      es: "Salmón fresco, eneldo, pimienta rosa y ralladura de limón.",
      it: "Salmone fresco, aneto, grani di pepe rosa e scorza di limone.",
      ar: "سلمون طازج، شبت، فلفل وردي وبشر ليمون."
    },
    price: 18,
    category: "starter",
    image: "https://res.cloudinary.com/demo/image/upload/v1672323456/salmon_tartare.jpg"
  },
  {
    name: {
      fr: "Filet de Bœuf Rossini",
      en: "Beef Fillet Rossini",
      es: "Solomillo de Ternera Rossini",
      it: "Filetto di Manzo Rossini",
      ar: "فيليه لحم بقري روسيني"
    },
    description: {
      fr: "Cœur de filet, foie gras poêlé, sauce Madère et truffe noire.",
      en: "Prime fillet, seared foie gras, Madeira sauce and black truffle.",
      es: "Centro de solomillo, foie gras a la plancha, salsa Madeira y trufa negra.",
      it: "Cuore di filetto, foie gras saltato, salsa Madeira e tartufo nero.",
      ar: "فيليه بقري فاخر، كبدة أوز مقلية، صلصة ماديرا وكمأ أسود."
    },
    price: 45,
    category: "main",
    image: "https://res.cloudinary.com/demo/image/upload/v1672323456/beef_rossini.jpg"
  },
  {
    name: {
      fr: "Soufflé au Chocolat Noir",
      en: "Dark Chocolate Soufflé",
      es: "Soufflé de Chocolate Negro",
      it: "Soufflé al Cioccolato Fondente",
      ar: "سوفليه الشوكولاتة الداكنة"
    },
    description: {
      fr: "Chocolat 70% de Madagascar, cœur fondant et glace vanille.",
      en: "70% Madagascar chocolate, molten heart and vanilla ice cream.",
      es: "Chocolate 70% de Madagascar, corazón fundente y helado de vainilla.",
      it: "Cioccolato 70% del Madagascar, cuore fondente e gelato alla vaniglia.",
      ar: "شوكولاتة مدغشقر 70%، قلب ذائب وآيس كريم فانيليا."
    },
    price: 15,
    category: "dessert",
    image: "https://res.cloudinary.com/demo/image/upload/v1672323456/chocolate_souffle.jpg"
  }
];

export async function GET() {
  try {
    await dbConnect();
    await MenuItem.deleteMany({});
    await MenuItem.insertMany(SEED_DATA);

    const adminHash = await bcrypt.hash("admin123", 12);
    await User.findOneAndUpdate(
      { email: "admin@delysefood.com" },
      { 
        name: "Admin Delyse", 
        password: adminHash,
        role: "admin"
      },
      { upsert: true }
    );

    return NextResponse.json({ message: "Database seeded successfully with ADMIN: admin@delysefood.com / admin123" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db/mongodb";
import Settings from "@/models/Settings";

export const dynamic = "force-dynamic";

// GET settings
export async function GET() {
  try {
    await dbConnect();
    let settings = await Settings.findOne({ key: 'site_config' });

    if (!settings) {
      // Initialize with default values
      settings = await Settings.create({
        key: 'site_config',
        hero: {
          title: {
            fr: "Une Cuisine Délicieuse Vous Attend",
            en: "Delicious Food Is Waiting For You",
            es: "La Comida Deliciosa Te Espera",
            it: "Il Cibo Delizioso Ti Aspetta",
            ar: "طعام لذيذ في انتظارك"
          },
          description: {
            fr: "Notre équipe de chefs diplômés et d'experts culinaires fournit des ingrédients frais et de haute qualité livrés directement à votre table. Vivez la perfection à chaque bouchée.",
            en: "Our team of registered chefs and food experts provide high-quality, fresh ingredients delivered right to your table. Experience perfection in every bite.",
            es: "Nuestro equipo de chefs titulados y expertos en alimentación ofrece ingredientes frescos y de alta calidad directamente en su mesa. Experimente la perfección en chaque bocado.",
            it: "Il nostro team di chef certificati ed esperti alimentari fornisce ingredienti freschi e di alta qualità consegnati direttamente alla vostra tavola. Provate la perfezione in ogni boccone.",
            ar: "يوفر فريقنا من الطهاة المعتمدين وخبراء الغذاء مكونات طازجة وعالية الجودة يتم تسليمها مباشرة إلى طاولتك. جرب الكمال في كل قضمة."
          }
        },
        footer: {
          address: "2 Chem. des Frères Garbero, 06600 Antibes, France",
          phone: "+33 1 23 45 67 89",
          email: "contact@delysefood.com",
          socials: {
            facebook: "https://facebook.com",
            instagram: "https://instagram.com",
            twitter: "https://twitter.com"
          }
        }
      });
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// UPDATE settings
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'super-admin')) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { logo, hero, footer } = body;
    
    await dbConnect();

    const settings = await Settings.findOneAndUpdate(
      { key: 'site_config' },
      { 
        $set: { 
          logo,
          hero,
          footer
        } 
      },
      { new: true, upsert: true }
    );

    revalidatePath("/", "layout");

    return NextResponse.json(settings, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

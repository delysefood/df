import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'super-admin')) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    await dbConnect();
    // Ne pas inclure le super-admin dans la liste des clients gérables
    const clients = await User.find({ role: { $ne: 'super-admin' } })
      .select('-password')
      .sort({ createdAt: -1 });
      
    return NextResponse.json(clients, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'super-admin')) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Veuillez remplir tous les champs obligatoires." }, { status: 400 });
    }

    await dbConnect();

    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json({ message: "Cet email est déjà utilisé." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      status: 'active'
    });

    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json({ message: "Client créé avec succès", client: userResponse }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'super-admin')) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, email, role, status } = body;

    if (!id) {
      return NextResponse.json({ message: "ID requis" }, { status: 400 });
    }

    await dbConnect();
    
    // Prevent blocking/changing self unless super-admin, prevent touching super-admin
    const targetUser = await User.findById(id);
    if (!targetUser) return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 404 });
    
    if (targetUser.role === 'super-admin') {
      return NextResponse.json({ message: "Impossible de modifier le super-admin" }, { status: 403 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    
    return NextResponse.json({ message: "Client mis à jour", client: updatedUser }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'super-admin')) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: "ID requis" }, { status: 400 });
    }

    await dbConnect();
    
    const targetUser = await User.findById(id);
    if (!targetUser) return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 404 });
    
    if (targetUser.role === 'super-admin') {
      return NextResponse.json({ message: "Impossible de supprimer le super-admin" }, { status: 403 });
    }

    await User.findByIdAndDelete(id);
    
    return NextResponse.json({ message: "Client supprimé avec succès" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

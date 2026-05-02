import { connectDB } from "@/lib/db";
import Subject from "@/models/Subject";

// 🔹 GET all subjects
export async function GET() {
  await connectDB();
  const subjects = await Subject.find();
  return Response.json(subjects);
}

// 🔹 ADD subject
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name } = body;

    // ✅ VALIDATION
    if (!name || name.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "Subject must be at least 2 characters" }),
        { status: 400 }
      );
    }

    // your existing DB logic
    const newSubject = await Subject.create({
      name: name.trim(),
    });

    return new Response(JSON.stringify(newSubject), { status: 201 });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      { status: 500 }
    );
  }
}

  

// 🔹 DELETE subject
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  await connectDB();
  await Subject.findByIdAndDelete(id);

  return Response.json({ message: "Deleted successfully" });
}

// 🔹 UPDATE subject
export async function PUT(req: Request) {
  const body = await req.json();

  await connectDB();

  await Subject.findByIdAndUpdate(body.id, {
    name: body.name,
  });

  return Response.json({ message: "Updated successfully" });
}
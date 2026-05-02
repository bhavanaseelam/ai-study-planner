import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { subjects } = await req.json();

    const suggestions = [
      "Start with basics and revise daily",
      "Practice previous questions",
      "Focus on weak topics",
      "Do quick revision before sleep",
      "Solve 2 problems daily",
      "Watch concept videos",
      "Take short notes",
    ];

    const result = subjects.map((sub: string, i: number) => {
      return `📘 ${sub}: ${suggestions[i % suggestions.length]}`;
    });

    return NextResponse.json({
      result: result.join("\n"),
    });

  } catch (error) {
    return NextResponse.json({ error: "AI failed" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST() {
  try {
    const db = await getDb();
    const doc = {
      message: "Hello from Campfire — API route",
      createdAt: new Date(),
    };
    const result = await db.collection("examples").insertOne(doc);
    return NextResponse.json({
      ok: true,
      insertedId: result.insertedId.toString(),
      database: "campfire",
      collection: "examples",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err.message ?? "MongoDB error" },
      { status: 500 },
    );
  }
}

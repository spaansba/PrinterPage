import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json(
      { error: "Filename is required" },
      { status: 400 },
    );
  }

  // Get payload from request
  const file = await request.blob();

  // Upload to Vercel Blob
  const { url } = await put(filename, file, {
    access: "public",
  });

  return NextResponse.json({ url });
}

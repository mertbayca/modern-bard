import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { uploadLimiter, getClientIdentifier, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // Rate limiting: 5 uploads per minute per IP (lower for larger files)
    const identifier = getClientIdentifier(request);
    const rateCheck = uploadLimiter.check(request, 5, `upload-audio:${identifier}`);

    if (!rateCheck.success) {
      return rateLimitResponse(rateCheck.resetAt);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type - only MP3
    const allowedTypes = ["audio/mpeg", "audio/mp3"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only MP3 files are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (20MB max for audio)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 20MB." },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
    });

    // Calculate duration using Web Audio API would require client-side processing
    // For now, we'll return the URL and let the client calculate duration
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Audio upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to upload audio file";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

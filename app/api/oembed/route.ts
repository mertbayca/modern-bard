import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;

    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      return NextResponse.json({
        type: "youtube",
        url,
        title: "YouTube video",
        provider: "youtube",
      });
    }

    if (hostname.includes("twitter.com") || hostname.includes("x.com")) {
      return NextResponse.json({
        type: "twitter",
        url,
        title: "Twitter post",
        provider: "twitter",
      });
    }

    return NextResponse.json({
      type: "link",
      url,
      title: `Link to ${hostname}`,
      description: `Open ${parsed.pathname}`,
      provider: hostname,
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }
}


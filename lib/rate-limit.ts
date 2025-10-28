import { NextResponse } from "next/server";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

interface RateLimitOptions {
  interval: number; // in milliseconds
  uniqueTokenPerInterval: number; // max requests per interval
}

export function rateLimit(options: RateLimitOptions) {
  return {
    check: (request: Request, limit: number, token: string) => {
      const now = Date.now();
      const tokenKey = `${token}`;

      if (!store[tokenKey]) {
        store[tokenKey] = {
          count: 0,
          resetAt: now + options.interval,
        };
      }

      const tokenData = store[tokenKey];

      // Reset if interval has passed
      if (now > tokenData.resetAt) {
        tokenData.count = 0;
        tokenData.resetAt = now + options.interval;
      }

      tokenData.count += 1;

      const success = tokenData.count <= limit;
      const remaining = Math.max(0, limit - tokenData.count);
      const resetAt = tokenData.resetAt;

      return {
        success,
        limit,
        remaining,
        resetAt,
      };
    },
  };
}

// Pre-configured rate limiters
export const authLimiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 500,
});

export const apiLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export const uploadLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 100,
});

// Helper function to get client identifier
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  // Fallback to a generic identifier
  return "unknown";
}

// Helper to create rate limit error response
export function rateLimitResponse(resetAt: number) {
  return NextResponse.json(
    {
      error: "Too many requests. Please try again later.",
      resetAt: new Date(resetAt).toISOString(),
    },
    {
      status: 429,
      headers: {
        "Retry-After": Math.ceil((resetAt - Date.now()) / 1000).toString(),
      },
    }
  );
}

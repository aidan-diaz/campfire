import { ConvexReactClient } from "convex/react";

let convexClient: ConvexReactClient | null = null;

export function getConvexClient() {
  if (convexClient) {
    return convexClient;
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_CONVEX_URL. Set it in your environment before using Convex."
    );
  }

  const normalizedConvexUrl = convexUrl.replace(/\/+$/, "");
  convexClient = new ConvexReactClient(normalizedConvexUrl);
  return convexClient;
}

"use client";

import { useEffect } from "react";

interface ViewTrackerProps {
  postId: string;
}

export function ViewTracker({ postId }: ViewTrackerProps) {
  useEffect(() => {
    // Track view on mount
    fetch(`/api/posts/${postId}/view`, {
      method: "POST",
    }).catch((error) => {
      console.error("Failed to track view:", error);
    });
  }, [postId]);

  return null;
}

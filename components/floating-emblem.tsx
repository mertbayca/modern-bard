"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import logo from "@/assets/logo.png";

export function FloatingEmblem() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 opacity-80">
      <Image
        src={logo}
        alt="The Modern Bard emblem"
        width={48}
        height={48}
        className="rounded-full"
        priority
      />
    </div>
  );
}

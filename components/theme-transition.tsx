"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";

export function ThemeTransition() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sweepKey, setSweepKey] = useState(0);
  const [sweepDirection, setSweepDirection] = useState<"light-to-dark" | "dark-to-light">("light-to-dark");
  const isFirstRender = useRef(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Trigger sweep animation when theme changes
  useEffect(() => {
    if (!mounted || !resolvedTheme) return;

    // Skip the first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const isDark = resolvedTheme === "dark";
    setSweepDirection(isDark ? "light-to-dark" : "dark-to-light");

    // Increment key to trigger new animation
    setSweepKey(prev => prev + 1);
  }, [resolvedTheme, mounted]);

  if (!mounted) return null;

  // Diagonal sweep from corner to corner
  const isLightToDark = sweepDirection === "light-to-dark";

  return (
    <AnimatePresence mode="wait">
      {sweepKey > 0 && (
        <motion.div
          key={sweepKey}
          initial={{
            x: isLightToDark ? "-150%" : "150%",
            y: isLightToDark ? "-150%" : "150%",
          }}
          animate={{
            x: isLightToDark ? "150%" : "-150%",
            y: isLightToDark ? "150%" : "-150%",
          }}
          exit={{ opacity: 0 }}
          transition={{
            x: { duration: 2.2, ease: [0.25, 0.1, 0.25, 1] },
            y: { duration: 2.2, ease: [0.25, 0.1, 0.25, 1] },
            opacity: { duration: 0.4, delay: 1.8 }
          }}
          className={`theme-transition-sweep ${isLightToDark ? 'warm-to-embers' : 'cool-to-dawn'}`}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '300%',
            height: '300%',
            pointerEvents: 'none',
            zIndex: 9999,
            mixBlendMode: isLightToDark ? 'darken' : 'lighten',
          }}
        />
      )}
    </AnimatePresence>
  );
}

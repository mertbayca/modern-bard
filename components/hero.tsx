"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import logo from "@/assets/logo.png";

export function Hero() {
  return (
    <section className="relative py-20 sm:py-32 min-h-[70vh] flex items-center">
      <div className="relative mx-auto max-w-prose px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-6 flex justify-center">
            <Image
              src={logo}
              alt="The Modern Bard emblem"
              width={112}
              height={112}
              className="rounded-full"
              priority
            />
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-ink dark:text-paper mb-6 text-balance">
            The Modern Bard
          </h1>

          <p className="text-xl sm:text-2xl text-ink/85 dark:text-paper/85 mb-8 max-w-2xl mx-auto text-balance">
            Essays, verse, and musings on craft, psyche, tech, and culture
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button asChild size="lg">
              <Link href="/library">Read the Library</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/subscribe">Subscribe</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

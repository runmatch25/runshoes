"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { cardTheme } from "./cardTheme";

interface TiltedCardProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
}

export default function TiltedCard({ children, href, className = "" }: TiltedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -cardTheme.tiltMaxAngle;
    const rotateY = ((x - centerX) / centerX) * cardTheme.tiltMaxAngle;

    setTransform(`perspective(${cardTheme.tiltPerspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${cardTheme.tiltScale}, ${cardTheme.tiltScale}, ${cardTheme.tiltScale})`);
    
    // Update glare overlay directly for immediate feedback
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    const glareOverlay = card.querySelector(".glare-overlay") as HTMLElement;
    if (glareOverlay) {
      glareOverlay.style.opacity = cardTheme.glareOpacity.toString();
      glareOverlay.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, ${cardTheme.glareColor} 0%, transparent 50%)`;
    }
  };

  const handleMouseLeave = () => {
    setTransform("perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)");
    
    // Reset glare overlay
    if (cardRef.current) {
      const glareOverlay = cardRef.current.querySelector(".glare-overlay") as HTMLElement;
      if (glareOverlay) {
        glareOverlay.style.opacity = "0";
      }
    }
  };

  const cardContent = (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: cardTheme.tiltTransition,
        transformStyle: "preserve-3d",
        height: "100%",
      }}
      className={className}
    >
      {children}
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none", color: "inherit", display: "block", width: "100%", height: "100%" }}>
        {cardContent}
      </Link>
    );
  }

  return <div style={{ height: "100%" }}>{cardContent}</div>;
}


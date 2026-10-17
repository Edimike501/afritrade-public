"use client";

import { useState } from "react";
import Image from "next/image";

export interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  size?: "sm" | "md" | "lg";
}

const PLACEHOLDER_SRC = "/images/product-placeholder.png";

export function ProductImage({
  src,
  alt,
  className = "",
  priority = false,
  size = "md",
}: ProductImageProps) {
  const initialSrc = src && src.trim() ? src.trim() : PLACEHOLDER_SRC;
  const [imgSrc, setImgSrc] = useState<string>(initialSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(PLACEHOLDER_SRC);
    }
  };

  return (
    <div className={`product-img-wrapper product-img-${size} ${className}`}>
      <Image
        src={imgSrc}
        alt={alt || "AfriTrade Product"}
        fill
        sizes={
          size === "lg"
            ? "(max-width: 768px) 100vw, 600px"
            : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
        }
        className="product-img-media group-hover:scale-105"
        priority={priority}
        onError={handleError}
        unoptimized={imgSrc.startsWith("http://") || imgSrc.startsWith("https://")}
      />
    </div>
  );
}

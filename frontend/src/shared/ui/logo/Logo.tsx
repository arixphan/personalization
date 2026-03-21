import React from "react";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 32, className = "" }) => {
  return (
    <Link href="/" className={`flex items-center justify-center ${className}`}>
      <Image
        src="/icon.png"
        alt="Personalization Logo"
        width={size}
        height={size}
        className="rounded-lg object-contain"
      />
    </Link>
  );
};

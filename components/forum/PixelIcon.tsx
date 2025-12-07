import React from 'react';
import Image from 'next/image';

export function PixelIcon() {
  return (
    <Image
      src="/icons/badge3.svg"
      alt="Badge Icon"
      width={50}
      height={50}
      className="flex-shrink-0"
    />
  );
}


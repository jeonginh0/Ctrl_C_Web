import React from "react";
import Image from "next/image";

type ImageWrapperProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
};

const ImageWrapper: React.FC<ImageWrapperProps> = ({ src, alt, width, height, className = "" }) => {
  return <Image src={src} alt={alt} width={width} height={height} className={className} />;
};

export default ImageWrapper;
import React from "react";
import Image from "next/image";

type ImageWrapperProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
};

const ImageWrapper: React.FC<ImageWrapperProps> = ({
  src,
  alt,
  width,
  height,
  className = "",
  onClick,
}) => {
  return <Image src={src} alt={alt} width={width} height={height} className={className} onClick={onClick} />; // onClick 전달
};

export default ImageWrapper;

import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Logo({
  width = 35,
  height = 35,
  priority = true,
  className = "rounded-lg active:scale-95 transition-transform",
}) {
  return (
    <Image
      src="/logo.jpeg"
      alt="Ethnic Elegance Logo"
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}

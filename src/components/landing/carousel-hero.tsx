"use client";
import Autoplay from "embla-carousel-autoplay";
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function CarouselHeroSection() {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true }),
  );
  return (
    <section className="w-full p-6 flex flex-col justify-center gap-y-3">
      <Carousel
        className="w-full h-fit"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        plugins={[plugin.current]}
      >
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card className="w-full h-96 ">
                  <CardContent className="flex items-center justify-center p-6">
                    <span className="text-4xl font-semibold">{index + 1}</span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="flex lg:flex-row flex-col gap-3 justify-between">
        <Card className="w-full h-44 ">
          <CardContent className=" flex items-center justify-center p-6">
            <span className="text-4xl font-semibold">Side Card</span>
          </CardContent>
        </Card>
        <Card className="w-full  h-44 ">
          <CardContent className="flex items-center justify-center p-6">
            <span className="text-4xl font-semibold">Side Card</span>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

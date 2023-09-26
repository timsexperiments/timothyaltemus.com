import React from "react";
export type CarouselProps<T> = {
    items: T[];
};
export declare const Carousel: ({ items }: CarouselProps<string>) => React.JSX.Element;
export default Carousel;

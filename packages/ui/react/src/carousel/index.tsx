import { useDimensions } from "@timsexperiments/react-hooks";
import { motion } from "framer-motion";
import React, { ReactNode, useEffect, useRef, useState } from "react";

export type CarouselProps<T extends Record<any, any>> = {
  parent: React.MutableRefObject<HTMLElement>;
  items: T[];
  as: (props: T) => ReactNode;
};

export function Carousel<T extends Record<any, any>>({ items, as: AsComponent }: CarouselProps<T>) {
  const [currentItem, setCurrentItem] = useState(0);
  const [averageItemWidth, setAverageItemWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const dimensions = useDimensions(ref);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    setAverageItemWidth(
      itemRefs.current
        .map((item) => item?.clientWidth ?? 0)
        .reduce((sum, item) => sum + item)
    );
  }, [itemRefs]);
  return (
    <div style={{ display: "relative" }}>
      {items.map((item, index) => (
        <motion.div
          key={index}
          style={{ display: "absolute" }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{
            rotate: 0,
            scale: index !== currentItem ? 0.8 : 1,
            left: `${
              (index - currentItem + 1) * (dimensions.width / 3) -
              averageItemWidth
            }px`,
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 5,
          }}
        >
          <AsComponent {...item} />
        </motion.div>
      ))}
    </div>
  );
}

export default Carousel;

const useCarousel = () => {};

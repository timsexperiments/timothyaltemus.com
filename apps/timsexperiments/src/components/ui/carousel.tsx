import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useRef, useState } from 'react';

export const Carousel = ({ items }: { items: string[] }) => {
  const [currentItem, setCurrentItem] = useState(0);
  const nextItem = useMemo(
    () => (currentItem === items.length - 1 ? 0 : currentItem + 1),
    [currentItem],
  );
  const lastItem = useMemo(
    () =>
      currentItem === items.length - 1
        ? 1
        : currentItem === items.length - 2
        ? 0
        : currentItem + 2,
    [currentItem],
  );
  const ref = useRef<HTMLDivElement>(null);
  console.log(ref.current?.clientWidth);
  useEffect(() => {}, [ref]);
  return (
    <div className="flex w-full gap-4">
      <button
        onClick={() =>
          setCurrentItem((currentItem) =>
            currentItem === 0 ? items.length - 1 : currentItem - 1,
          )
        }>
        prev
      </button>
      <div ref={ref} className="relative h-32 w-full">
        <motion.div
          className="absolute top-6 flex h-20 w-20 items-center justify-center rounded bg-red-400 text-grey-900"
          style={{
            left: (ref.current?.clientWidth ?? 0) / 2 - 40 + 'px',
          }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
          {items[currentItem]}
        </motion.div>
      </div>
      <button
        onClick={() =>
          setCurrentItem((currentItem) =>
            currentItem === items.length - 1 ? 0 : currentItem + 1,
          )
        }>
        next
      </button>
    </div>
  );
};

export default Carousel;

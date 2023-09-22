import { RefObject, useEffect, useState } from "react";

export function useDimensions(ref: RefObject<HTMLElement>) {
  const [dimensions, setDimensions] = useState({
    width: ref.current?.clientWidth ?? 0,
    height: ref.current?.clientHeight ?? 0,
  });
  useEffect(() => {
    if (ref.current) {
      setDimensions({
        width: ref.current.clientWidth,
        height: ref.current.clientHeight,
      });
    }
  }, [ref]);
  return dimensions;
}

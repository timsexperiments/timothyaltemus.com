'use strict';Object.defineProperty(exports,'__esModule',{value:true});var reactHooks=require('@timsexperiments/react-hooks'),framerMotion=require('framer-motion'),React=require('react');const Carousel = ({ items }) => {
  const [currentItem, setCurrentItem] = React.useState(0);
  const [averageItemWidth, setAverageItemWidth] = React.useState(0);
  const ref = React.useRef(null);
  const dimensions = reactHooks.useDimensions(ref);
  const itemRefs = React.useRef([]);
  React.useEffect(() => {
    setAverageItemWidth(
      itemRefs.current.map((item) => {
        var _a;
        return (_a = item == null ? void 0 : item.clientWidth) != null ? _a : 0;
      }).reduce((sum, item) => sum + item)
    );
  }, [itemRefs]);
  return /* @__PURE__ */ React.createElement("div", { className: "flex w-full gap-4" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setCurrentItem(
        (currentItem2) => currentItem2 === 0 ? items.length - 1 : currentItem2 - 1
      )
    },
    "prev"
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      id: "ackabulucka",
      ref,
      className: "flex h-32 w-full items-center justify-center overflow-hidden"
    },
    /* @__PURE__ */ React.createElement("div", { className: "relative" }, items.map((item, index) => /* @__PURE__ */ React.createElement(
      framerMotion.motion.div,
      {
        key: index,
        ref: (el) => itemRefs.current[index] = el,
        className: "absolute -top-10 flex h-20 w-20 items-center justify-center rounded bg-red-400 text-grey-900",
        initial: { scale: 0, rotate: -180 },
        animate: {
          rotate: 0,
          scale: 1,
          left: `${(index - currentItem + 1) * (dimensions.width / 3) - averageItemWidth}px`
        },
        transition: {
          type: "spring",
          stiffness: 260,
          damping: 20,
          duration: 5
        }
      },
      item
    )))
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setCurrentItem(
        (currentItem2) => currentItem2 === items.length - 1 ? 0 : currentItem2 + 1
      )
    },
    "next"
  ));
};exports.Carousel=Carousel;exports.default=Carousel;
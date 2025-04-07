import { useEffect, useRef } from "react";

const MinDomRender = ({
  item,
  index,
  style,
  itemKey,
  heightKey,
  Item,
  setDataHeight,
  getItemTop,
}) => {
  const itemRef = useRef(null);
  const top = getItemTop(index) || 0;
  useEffect(() => {
    const dom = itemRef.current;
    if (dom) {
      const height = dom.getBoundingClientRect().height || item[heightKey];
      if (height !== item[heightKey]) {
        setDataHeight(index, height);
      }
    }
  }, [itemRef]);
  return Item(
    { item, index, key: item[itemKey], ref: itemRef, height: item[heightKey] },
    { ...style, top }
  );
};
export default MinDomRender;

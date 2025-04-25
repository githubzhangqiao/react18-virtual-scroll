import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
export type Item<T> = (
  currentData: {
    item: T;
    index: number;
    height: number;
    ref?: React.RefObject<HTMLDivElement>;
  },
  defaultStyle: React.CSSProperties
) => React.JSX.Element;
export interface Props<T> {
  Item: Item<T>;
  data: T[];
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  className?: string;
  itemNumber?: number;
  overscan?: number;
  gap?: number | number[];
  // isUnknownHeight?: boolean;
  getNextData?: () => void;
  getLastData?: (
    scrollTo: (obj: {
      top: number;
      left: number;
      behavior?: "smooth" | "auto" | "instant";
    }) => void
  ) => void;
}

const VirtualList = <T,>(props: Props<T>) => {
  const {
    width = "100%",
    height = "500px",
    style = {},
    className = "",
    itemNumber = 10,
    overscan = 5,
    gap = 8,
    Item,
    data: dataList,
    // isUnknownHeight = false,
    getNextData = () => {},
    getLastData = () => {},
  } = props;
  type EnhancedData<T> = T & { height: number };
  const verticalInterval = useMemo(() => {
    try {
      if (typeof gap === "number") {
        return gap;
      } else if (Array.isArray(gap) && gap.length > 0) {
        return gap[0];
      } else {
        return 8;
      }
    } catch (error) {
      return 8;
    }
  }, [gap]);
  const [data, setData] = useState<EnhancedData<T>[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const ref = useRef<HTMLDivElement>(null);

  const heightList = useMemo(() => {
    let height = 0;
    const heightList: number[] = [];
    data.forEach((item, index) => {
      if (index) {
        height += verticalInterval;
      }
      height += item.height;
      heightList.push(height);
    });

    return heightList;
  }, [data]);

  useEffect(() => {
    // if (isUnknownHeight) {
    //   setData(dataList);
    // } else {
    // @ts-ignore
    setData(dataList);
    // }
  }, [dataList]);

  const handleScroll = useCallback(
    (e: any) => {
      setCurrentIndex(
        heightList.findIndex((item) => item > e.target.scrollTop)
      );
      if (e.target.scrollTop === 0) {
        getLastData((options) => ref.current?.scrollTo(options));
      }
      if (heightList[heightList.length - 2 - overscan] < e.target.scrollTop) {
        getNextData();
      }
    },
    [heightList]
  );

  useEffect(() => {
    if (ref.current) {
      ref.current.addEventListener("scroll", handleScroll);
    }
    return () => {
      ref.current?.removeEventListener("scroll", handleScroll);
    };
  }, [ref.current, data]);
  return (
    <div
      className={className}
      style={{
        ...style,
        width,
        height,
        overflow: "auto",
        position: "relative",
      }}
      ref={ref}
    >
      {/* !isUnknownHeight ? data.reduce((sum, i) => sum + i.height, 0) : data.reduce((sum, i) => sum + i.height, 0) */}
      <div
        style={{ height: `${data.reduce((sum, i) => sum + i.height, 0)}px` }}
      >
        {data.map((item, index) => {
          if (
            index < currentIndex - overscan ||
            index > currentIndex + overscan + itemNumber
          ) {
            return null;
          }

          const style: { top: string; position: "absolute" } = {
            position: "absolute",
            top: `${data
              .slice(0, index)
              .reduce((sum, i) => sum + i.height + verticalInterval, 0)}px`,
          };
          return Item(
            {
              item,
              index,
              height: item.height,
            },
            { ...style }
          );
        })}
      </div>
    </div>
  );
};

export { VirtualList };

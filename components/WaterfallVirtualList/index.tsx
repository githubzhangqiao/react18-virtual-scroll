import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface Props<T> {
  Item: (
    currentData: {
      item: T;
      index: number;
      height: number;
      ref?: React.RefObject<HTMLDivElement>;
    },
    defaultStyle: React.CSSProperties
  ) => React.JSX.Element;
  data: T[];
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  className?: string;
  columnNumber?: number;
  isVirtual?: boolean;
  itemNumber?: number;
  overscan?: number;
  gap?: number | number[];
  // isUnknownHeight?: boolean;
  getNextData?: () => void;
}

const WaterfallVirtualList = <T,>(props: Props<T>) => {
  const {
    width = "100%",
    height = "500px",
    style = {},
    className = "",
    columnNumber = 2,
    isVirtual = true,
    itemNumber = 10,
    overscan = 5,
    gap = 8,
    Item,
    data: dataList,
    // isUnknownHeight = false,
    getNextData = () => {},
  } = props;
  type EnhancedData<T> = T & { height: number };
  const verticalInterval = useMemo(() => {
    try {
      if (typeof gap === "number") {
        return [gap, gap];
      } else if (Array.isArray(gap) && gap.length > 1) {
        return gap;
      } else {
        return [8, 8];
      }
    } catch (error) {
      return [8, 8];
    }
  }, [gap]);
  const [data, setData] = useState<EnhancedData<T>[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemHeights, setItemHeights] = useState(0);

  const ref = useRef([]);

  const getMinAndIndex = (arr) => {
    if (arr.length === 0) return { value: undefined, index: -1 }; // 处理空数组

    let min = arr[0];
    let index = 0;

    for (let i = 1; i < arr.length; i++) {
      if (arr[i] < min) {
        min = arr[i];
        index = i;
      }
    }

    return { value: min, index };
  };

  const heightList = useMemo(() => {
    const heightList: { height: number; width: string | number }[] = [];
    const heightsList = new Array(columnNumber).fill(0);

    data.forEach((item, index) => {
      const mixObj = getMinAndIndex(heightsList);

      let heightCount = 0;
      if (mixObj.value) {
        heightCount += verticalInterval[0];
      }
      heightCount += Number(item.height.toFixed());
      heightsList[mixObj.index] = mixObj.value + heightCount;
      heightList.push({
        height: mixObj.value + heightCount,
        width: index
          ? `calc((${width} + ${
              verticalInterval[1] * (columnNumber - 1)
            }px) / ${columnNumber} * ${mixObj.index})`
          : 0,
      });
    });
    console.log(heightList);
    console.log(heightsList);
    setItemHeights(Math.max(...heightsList));
    return heightList;
  }, [data, columnNumber]);

  useEffect(() => {
    // if (isUnknownHeight) {
    //   setData(dataList);
    // } else {
    setData(dataList);
    // }
  }, [dataList]);

  const handleScroll = useCallback(
    (e) => {
      setCurrentIndex(
        heightList.findIndex((item) => item.height > e.target.scrollTop)
      );
      if (
        heightList[heightList.length - 2 - overscan].height < e.target.scrollTop
      ) {
        console.log("下一页");
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
      <div style={{ height: `${itemHeights}px` }}>
        {data.map((item, index) => {
          if (
            isVirtual &&
            (index < currentIndex - overscan ||
              index > currentIndex + overscan + itemNumber)
          ) {
            return null;
          }

          const style = {
            position: "absolute",
            width: `calc((${width} - ${verticalInterval[1]}px) / ${columnNumber})`,
            top: heightList[index].height - Number(item.height.toFixed()),
            left: heightList[index].width,
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

export default WaterfallVirtualList;

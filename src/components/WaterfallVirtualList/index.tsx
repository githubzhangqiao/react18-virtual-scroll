import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { WaterfallVirtualListProps } from "../type";
const WaterfallVirtualList = <T,>(props: WaterfallVirtualListProps<T>) => {
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
    getCurrentIndex = () => {},
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

  const ref = useRef<HTMLDivElement>(null);

  // 获取高度最小的一列的高度和索引
  const getMinAndIndex = (arr: number[]) => {
    if (arr.length === 0) return { value: 0, index: -1 }; // 处理空数组

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

  // 计算每个 item 的 top left
  const positionList = useMemo(() => {
    const positionList: { top: number; left: string | number }[] = [];
    const heightsList = new Array(columnNumber).fill(0);

    data.forEach((item, index) => {
      const mixObj = getMinAndIndex(heightsList);

      let heightCount = 0;
      if (mixObj.value) {
        heightCount += verticalInterval[0];
      }
      heightCount += Number(item.height.toFixed());
      heightsList[mixObj.index] = mixObj.value + heightCount;
      positionList.push({
        top: mixObj.value + heightCount,
        left: index ? `calc(${width} / ${columnNumber} * ${mixObj.index})` : 0,
      });
    });
    setItemHeights(Math.max(...heightsList));
    return positionList;
  }, [data, columnNumber]);

  useEffect(() => {
    setData(dataList as EnhancedData<T>[]);
  }, [dataList]);

  const handleScroll = useCallback(
    (e: any) => {
      const index = positionList.findIndex(
        (item) => item.top > e.target.scrollTop
      );
      setCurrentIndex(index);
      getCurrentIndex(index);
      if (
        positionList[positionList.length - 2 - overscan].top <
        e.target.scrollTop
      ) {
        getNextData();
      }
    },
    [positionList]
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
      <div style={{ height: `${itemHeights}px` }}>
        {data.map((item, index) => {
          if (
            isVirtual &&
            (index < currentIndex - overscan ||
              index > currentIndex + overscan + itemNumber)
          ) {
            return null;
          }

          let w = "";
          if (typeof width === "number") {
            w =
              (width - verticalInterval[1] * (columnNumber - 1)) /
                columnNumber +
              "px";
          } else if (width.includes("px")) {
            w =
              (Number(width.slice(0, width.length - 2)) -
                verticalInterval[1] * (columnNumber - 1)) /
                columnNumber +
              "px";
          } else {
            w = `calc((${width} - ${
              verticalInterval[1] * (columnNumber - 1)
            }px) / ${columnNumber})`;
          }
          const style: {
            top: number;
            left: number | string;
            width: string;
            position: "absolute";
          } = {
            position: "absolute",
            width: w,
            top: positionList[index].top - Number(item.height.toFixed()),
            left: positionList[index].left,
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

export { WaterfallVirtualList };

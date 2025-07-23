import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { HasHeight, VirtualListProps } from "../type";
const VirtualList = <T extends HasHeight>(props: VirtualListProps<T>) => {
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
    itemKey,
    isUnknownHeight = false,
    getNextData = () => {},
    getLastData = () => {},
    getCurrentIndex = () => {},
  } = props;
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
  const [data, setData] = useState<T[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const getHeightRef = useRef<HTMLDivElement>(null);
  const [heightIndex, setHeightIndex] = useState(0);
  const [heightObj, setHeightObj] = useState<{ [key in keyof T]?: number }>({});
  const ref = useRef<HTMLDivElement>(null);

  const heightList = useMemo(() => {
    let height = 0;
    const heightList: number[] = [];
    data.forEach((item, index) => {
      if (index) {
        height += verticalInterval;
      }
      if (isUnknownHeight) {
        height += heightObj[item[itemKey]];
      } else {
        height += item.height;
      }
      heightList.push(height);
    });

    return heightList;
  }, [data, isUnknownHeight, heightObj]);

  const handleScroll = useCallback(
    (e: any) => {
      const index = heightList.findIndex((item) => item > e.target.scrollTop);
      setCurrentIndex(index);
      getCurrentIndex(index);
      if (e.target.scrollTop === 0) {
        getLastData((options) => ref.current?.scrollTo(options));
      }
      if (heightList[heightList.length - 2 - overscan] < e.target.scrollTop) {
        getNextData();
      }
    },
    [heightList, heightList]
  );

  useEffect(() => {
    if (
      isUnknownHeight &&
      data.length &&
      getHeightRef.current &&
      heightIndex < data.length
    ) {
      setHeightObj({
        ...heightObj,
        [data[heightIndex][itemKey]]: getHeightRef.current.offsetHeight,
      });
      setHeightIndex(heightIndex + 1);
    }
  }, [isUnknownHeight, heightIndex, data]);

  useEffect(() => {
    setData(dataList);
  }, [dataList]);

  useEffect(() => {
    if (ref.current) {
      ref.current.addEventListener("scroll", handleScroll);
    }
    return () => {
      ref.current?.removeEventListener("scroll", handleScroll);
    };
  }, [ref.current, data, heightList]);
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
            top: isUnknownHeight
              ? `${data
                  .slice(0, index)
                  .reduce(
                    (sum, i) => sum + heightObj[i[itemKey]] + verticalInterval,
                    0
                  )}px`
              : `${data
                  .slice(0, index)
                  .reduce((sum, i) => sum + i.height + verticalInterval, 0)}px`,
          };
          return Item(
            {
              item,
              index,
              height: isUnknownHeight
                ? heightObj[item[itemKey]] || 0
                : item.height,
            },
            { ...style }
          );
        })}
      </div>
      <div
        className="aaa"
        ref={getHeightRef}
        style={{ position: "fixed", left: "-9999999", right: "-9999999" }}
      >
        {data.length && heightIndex < data.length
          ? Item(
              {
                item: data[heightIndex],
                index: heightIndex,
                height: "auto",
              },
              {}
            )
          : null}
      </div>
    </div>
  );
};

export { VirtualList };

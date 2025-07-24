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
    messageType = "",
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
  type HeightObjType = { [key in keyof T]?: number };
  const [currentIndex, setCurrentIndex] = useState(0);
  const [heightIndex, setHeightIndex] = useState(0);
  const [heightObj, setHeightObj] = useState<HeightObjType>({});

  const getHeightRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  const heightList = useMemo(() => {
    let height = 0;
    const heightsList: number[] = [];
    data.forEach((item, index) => {
      if (index) {
        height += verticalInterval;
      }
      if (isUnknownHeight) {
        height += heightObj[item[itemKey] as keyof HeightObjType] || 0;
        const a = item[itemKey];
      } else {
        height += item.height;
      }
      heightsList.push(height);
    });

    return heightsList;
  }, [data, isUnknownHeight, heightObj]);

  const handleScroll = useCallback(
    (e: any) => {
      const index = heightList.findIndex((item) => item > e.target.scrollTop);
      setCurrentIndex(index < 0 ? 0 : index);
      getCurrentIndex(index < 0 ? 0 : index);
      if (e.target.scrollTop === 0) {
        getLastData((options) => ref.current?.scrollTo(options));
      }
      if (heightList[heightList.length - 2 - overscan] < e.target.scrollTop) {
        getNextData();
      }
    },
    [heightList]
  );

  const setHeightObjItem = useCallback(
    (data: { item: T; height: number; type: string }) => {
      const { item, height, type } = data;

      if (
        type === messageType ||
        (messageType === "" && String(item?.[itemKey]) && height)
      ) {
        setHeightObj({
          ...heightObj,
          [item[itemKey] as keyof T]: height,
        });
      }
    },
    [messageType, heightObj]
  );

  useEffect(() => {
    window.addEventListener("message", (data: any) =>
      setHeightObjItem(data.data)
    );
    return () => {
      window.removeEventListener("message", (data: any) =>
        setHeightObjItem(data.data)
      );
    };
  }, [messageType, heightObj]);

  useEffect(() => {
    setData(dataList);
  }, [dataList]);

  useEffect(() => {
    if (
      isUnknownHeight &&
      data.length &&
      getHeightRef.current &&
      heightIndex < data.length
    ) {
      setHeightObj({
        ...heightObj,
        [data[heightIndex][itemKey] as keyof T]:
          getHeightRef.current.offsetHeight,
      });
      setHeightIndex(heightIndex + 1);
    }
  }, [isUnknownHeight, heightIndex, data]);

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
      <div
        style={{
          height: isUnknownHeight
            ? `${data.reduce(
                (sum, i) =>
                  sum +
                  (heightObj[i[itemKey] as keyof HeightObjType] || 0) +
                  verticalInterval,
                -verticalInterval
              )}px`
            : `${data.reduce(
                (sum, i) => sum + i.height + verticalInterval,
                -verticalInterval
              )}px`,
        }}
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
                    (sum, i) =>
                      sum +
                      (heightObj[i[itemKey] as keyof HeightObjType] || 0) +
                      verticalInterval,
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
        style={{
          width,
          position: "absolute",
          left: "-99999px",
          right: "-99999px",
        }}
      >
        {data.length
          ? Item(
              {
                item: heightIndex < data.length ? data[heightIndex] : data[0],
                index: heightIndex < data.length ? heightIndex : 0,
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

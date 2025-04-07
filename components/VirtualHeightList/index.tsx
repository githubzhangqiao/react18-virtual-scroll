import React, { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import MinDomRender from "../MixRender";

interface Props<T> {
  Item: (
    currentData: {
      item: T;
      index: number;
      key: string | number;
      ref: React.MutableRefObject<any>;
      height: number;
    },
    defaultStyle: React.CSSProperties
  ) => React.JSX.Element;

  data: T[];

  width?: number;
  height?: number;
  className?: string;
  itemKey?: keyof T;
  heightKey?: string;
  style?: React.CSSProperties;
  itemSize?: number;
  overscan?: number;
  hasNextPage?: boolean;
  hasLastPage?: boolean;
  getNextData?: () => void;
  getLastData?: () => Promise<T[]>;
  delKeys?: any[];
  clearDelKeys?: () => void;
}

const VirtualList = <T,>(props: Props<T>) => {
  const {
    width = 300,
    height = 500,
    style = {},
    className = "",
    itemSize = 20,
    overscan = 5,
    hasNextPage = false,
    hasLastPage = false,
    getNextData = () => {},
    getLastData = () => Promise.resolve([]),
    itemKey = "id" as keyof T,
    heightKey = "height" as string,
    delKeys = [],
    clearDelKeys = () => {},
    Item,
    data: dataList,
  } = props;
  type EnhancedData<T> = T & { heightKey: number };
  const addHeight: (data: T[], defaultHeight?: number) => EnhancedData<T>[] = (
    data: T[],
    defaultHeight = itemSize
  ) =>
    data.map((item) => ({
      ...item,
      heightKey: defaultHeight,
    }));

  const [preData, setPreData] = useState<EnhancedData<T>[]>([]);
  const setPreDataHeight = (index: number, height: number) => {
    preData[index][heightKey] = height;
    if (preData.some((i) => i[heightKey!] === 0)) {
      setPreData([...preData]);
    } else {
      ref.current!.scrollBy(
        0,
        preData.reduce((sum, i) => sum + i[heightKey!], 0)
      );
      setData([...preData, ...data]);
      setPreData([]);
    }
  };

  const extra = overscan > 0 ? overscan : 1;

  const showCount = useMemo(
    () => Math.floor(height / itemSize),
    [height, itemSize]
  );
  const [data, setData] = useState<EnhancedData<T>[]>([]);

  useEffect(() => {
    if (!dataList || !dataList.length) return;
    setData(addHeight(dataList));
  }, [dataList]);

  const getPreItemTop = useRef<(index: number) => number>(() => 0);

  useEffect(() => {
    getPreItemTop.current = (index) =>
      preData.slice(0, index).reduce((sum, i) => sum + i[heightKey!], 0);
  }, [preData]);

  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(showCount);
  const requestLoadingRef = useRef(false);

  const ref = useRef<HTMLDivElement>(null);
  const handleScroll = useRef<(e: Event) => void>(() => {});

  const setDataHeight = (index: number, height: number) => {
    data[index]![heightKey!] = height;
    setData([...data]);
  };

  const getItemTop = useRef<(index: number) => number>(() => 0);

  useEffect(() => {
    getItemTop.current = (index) =>
      data.slice(0, index).reduce((sum, i) => sum + i[heightKey!], 0);
  }, [data]);

  const loadMoreFn = async (direction: "next" | "last") => {
    if (requestLoadingRef.current) return;
    requestLoadingRef.current = true;

    if (direction === "next" && hasNextPage) {
      const ls = await getNextData();
      if (Array.isArray(ls)) {
        setData([...data, ...addHeight(ls)]);
      }
    } else if (direction === "last" && hasLastPage) {
      const ls = await getLastData();
      if (Array.isArray(ls)) {
        setPreData(addHeight(ls));
      }
    }
    requestLoadingRef.current = false;
  };

  useEffect(() => {
    ref.current?.removeEventListener("scroll", handleScroll.current);
    handleScroll.current = (e) => {
      let currentStart =
        Math.floor((e.target as HTMLDivElement).scrollTop / itemSize) + 1;
      let currentHeight = data
        .slice(0, currentStart)
        .reduce((sum, i) => sum + i[heightKey!], 0);
      while (currentHeight > (e.target as HTMLDivElement).scrollTop) {
        currentHeight -= data[currentStart]?.[heightKey!] || 0;
        currentStart -= 1;
      }
      flushSync(() => {
        setStart(currentStart);
        setEnd(currentStart + showCount);
      });
      if ((e.target as HTMLDivElement).scrollTop === 0 && hasLastPage) {
        loadMoreFn("last");
      }
    };
    ref.current?.addEventListener("scroll", handleScroll.current);
    return () =>
      ref.current?.removeEventListener("scroll", handleScroll.current);
  }, [hasLastPage, showCount, data]);

  useEffect(() => {
    if (end + showCount >= data.length && hasNextPage) {
      loadMoreFn("next");
    }
  }, [end, hasNextPage, showCount]);

  useEffect(() => {
    flushSync(() => {
      setEnd(start + showCount);
    });
  }, [showCount, start]);

  const delData = () => {
    if (!data.length) return;
    const delIndex: number[] = [];
    delKeys.forEach((item) => {
      const index = data.findIndex((it) => it[itemKey!] === item);
      if (index !== -1) delIndex.push(index);
    });
    const delEndData = data.filter((_, index) => !delIndex.includes(index));
    clearDelKeys();
    return delEndData;
  };

  useEffect(() => {
    if (delKeys.length && data.length) {
      const delDataList = delData() || [];
      setData(delDataList);
    }
  }, [delKeys]);

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
          height: `${data.reduce((sum, i) => sum + i[heightKey!], 0)}px`,
        }}
      >
        {data.map((item, index) => {
          if (index < start - extra || index >= end + extra) return null;
          const style = { position: "absolute", left: 0 };
          return (
            <MinDomRender
              item={item}
              index={index}
              style={style}
              itemKey={itemKey}
              heightKey={heightKey}
              Item={Item}
              setDataHeight={setDataHeight}
              getItemTop={getItemTop.current}
            />
          );
        })}
        {preData.map((item, index) => {
          const style = { position: "absolute", left: "-99999px" };
          return (
            <MinDomRender
              item={item}
              index={index}
              style={style}
              itemKey={itemKey}
              heightKey={heightKey}
              Item={Item}
              setDataHeight={setPreDataHeight}
              getItemTop={getPreItemTop.current}
            />
          );
        })}
      </div>
    </div>
  );
};

export default VirtualList;

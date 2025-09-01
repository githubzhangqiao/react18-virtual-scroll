import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { WaterfallVirtualList } from "../WaterfallVirtualList";
import { EnhancedData, WaterfallVirtualListProps } from "../type";

const NonFixedHeight = <T,>(props: WaterfallVirtualListProps<T>) => {
  const {
    isUnknownHeight = false,
    width = "100%",
    Item,
    gap = 8,
    messageType = "",
    columnNumber = 2,
    data: dataList,
    itemKey,
  } = props;
  const [data, setData] = useState<T[]>([]);
  const [heightIndex, setHeightIndex] = useState(0);
  const [componentData, setComponentData] = useState<EnhancedData<T>[]>([]);
  type HeightObjType = { [key in keyof T]?: number };
  const [heightObj, setHeightObj] = useState<HeightObjType>({});

  const [w, setW] = useState("100%");

  const getHeightRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (
      isUnknownHeight &&
      data.length &&
      getHeightRef.current &&
      heightIndex < data.length
    ) {
      console.log(
        "getHeightRef.current.offsetHeight",
        getHeightRef.current.offsetHeight
      );

      setHeightObj({
        ...heightObj,
        [data[heightIndex][itemKey] as keyof T]:
          getHeightRef.current.offsetHeight,
      });
      setHeightIndex(heightIndex + 1);
    }
  }, [isUnknownHeight, heightIndex, data]);

  useEffect(() => {
    setData(dataList);
  }, [isUnknownHeight, dataList]);

  const setHeightObjItem = useCallback(
    (data: { item: T; height: number; type: string }) => {
      const { item, height, type } = data;

      if (
        type === messageType ||
        (messageType === "" && item?.[itemKey] && height)
      ) {
        console.log("data", data);

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
    if (Object.keys(heightObj).length === data.length) {
      console.log(
        "componentData",
        componentData,
        data.map((item) => {
          return {
            ...item,
            height: heightObj[item[itemKey] as keyof T],
          };
        })
      );

      setComponentData(
        data.map((item) => {
          return {
            ...item,
            height: heightObj[item[itemKey] as keyof T],
          };
        }) as EnhancedData<T>[]
      );
    }
  }, [heightObj, data]);
  useEffect(() => {
    let w = "";
    if (typeof width === "number") {
      w =
        (width - verticalInterval[1] * (columnNumber - 1)) / columnNumber +
        "px";
    } else if (width.includes("px")) {
      w =
        (Number(width.split("px")[0]) -
          verticalInterval[1] * (columnNumber - 1)) /
          columnNumber +
        "px";
    } else {
      w = `calc((${width} - ${
        verticalInterval[1] * (columnNumber - 1)
      }px) / ${columnNumber})`;
    }
    setW(w);
  }, []);

  return (
    <>
      {data.length > 0 ? (
        <WaterfallVirtualList
          {...props}
          {...{ data: componentData.length ? componentData : data }}
        />
      ) : null}

      <div
        ref={getHeightRef}
        style={{
          width: w,
          position: "absolute",
          left: "-99999px",
          top: "-99999px",
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
    </>
  );
};

export { NonFixedHeight };

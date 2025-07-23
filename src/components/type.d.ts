interface HasHeight {
  height: number;
}

type Item<T> = (
  currentData: {
    item: T;
    index: number;
    height: number | "auto";
    ref?: React.RefObject<HTMLDivElement>;
  },
  defaultStyle: React.CSSProperties
) => React.JSX.Element;

interface VirtualListProps<T> {
  Item: Item<T>;
  data: T[];
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  className?: string;
  itemNumber?: number;
  overscan?: number;
  gap?: number | number[];
  isUnknownHeight?: boolean;
  itemKey: keyof T?;
  getCurrentIndex?: (index: number) => void;
  getNextData?: () => void;
  getLastData?: (
    scrollTo: (obj: {
      top: number;
      left: number;
      behavior?: "smooth" | "auto" | "instant";
    }) => void
  ) => void;
}

interface WaterfallVirtualListProps<T> {
  Item: Item<T>;
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
  getCurrentIndex?: (index: number) => void;
  // isUnknownHeight?: boolean;
  getNextData?: () => void;
}

export { HasHeight, Item, VirtualListProps, WaterfallVirtualListProps };

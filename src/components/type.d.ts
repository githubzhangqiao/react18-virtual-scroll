interface HasHeight {
  height: number;
}

type Item<T> = (
  currentData:
    | {
        item: T;
        index: number;
        height: number | "auto";
        ref: React.RefObject<HTMLDivElement>;
      }
    | {
        item: T;
        index: number;
        height: number | "auto";
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
  messageType?: string;
  isUnknownHeight?: boolean;
  itemKey: string & keyof T;
  getNextData?: () => void;
  getLastData?: (
    scrollTo: (obj: {
      top: number;
      left: number;
      behavior?: "smooth" | "auto" | "instant";
    }) => void
  ) => void;
  getCurrentIndex?: (index: number) => void;
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
  // isUnknownHeight?: boolean;
  getNextData?: () => void;
  getCurrentIndex?: (index: number) => void;
}

export { HasHeight, Item, VirtualListProps, WaterfallVirtualListProps };

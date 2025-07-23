import {
  Item,
  VirtualListProps,
  WaterfallVirtualListProps,
} from "./components/type";
type Props<T> = VirtualListProps<T> | WaterfallVirtualListProps<T>;

export { VirtualList } from "./components/VirtualList";
export { WaterfallVirtualList } from "./components/WaterfallVirtualList";
export type { Item, Props, VirtualListProps, WaterfallVirtualListProps };

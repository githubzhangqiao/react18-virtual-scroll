import type {
  Item as VirtualItem,
  Props as VirtualProps,
} from "./components/VirtualList";
import type {
  Item as WaterfallItem,
  Props as WaterfallProps,
} from "./components/WaterfallVirtualList";
type Props<T> = VirtualProps<T> | WaterfallProps<T>;

export { VirtualList } from "./components/VirtualList";
export { WaterfallVirtualList } from "./components/WaterfallVirtualList";
export type { VirtualItem as Item, Props };

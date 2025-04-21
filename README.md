# react18-virtual-scroll

> 高效渲染大数据列表和表格的 react 组件

react18-virtual-scrollReact window 基于仅渲染大数据中的部分数据的方式，来帮助我们解决一些常见的的性能瓶颈问题：

1. 它减少了初始渲染和处理更新时的耗时
2. 减少内存占用，从而避免大量 DOM 节点引起的内存泄漏.

## 安装

```bash
# Yarn
yarn add react18-virtual-scroll

# NPM
npm install --save react18-virtual-scroll
```

## 使用

|      属性      | 说明                                                          | 类型                  | 默认值              |        生效组件        |
| :------------: | ------------------------------------------------------------- | --------------------- | ------------------- | :--------------------: |
|      data      | 需要渲染的数据列表                                            | object[ ]             | [ ]                 |          all           |
|     width      | 虚拟滚动容器的宽度                                            | string                | 100%                |          all           |
|     height     | 虚拟滚动容器的高度                                            | string                | 500px               |          all           |
|  `className`   | 虚拟滚动容器的 class 名                                       | string                | ""                  |          all           |
|     style      | 虚拟滚动容器的 style 样式                                     | `React.CSSProperties` | `{ }`               |          all           |
|  `itemNumber`  | 虚拟滚动容器中渲染的数量                                      | number                | 10                  |          all           |
|   `overscan`   | 以`itemNumber` 为基础向上下额外渲染的数量                     | number                | 5                   |          all           |
|      gap       | 虚拟滚动容器每项的间距                                        | number`               | `[ number, number ] |           8            |
|     `Item`     | 每一项的渲染组件                                              | Item (具体见下文)     | 必传项              |          all           |
| `getNextData`  | 获取下一页数据的方法                                          | `() => void`          | `() `=> `{ }`       |          all           |
| `getLastData`  | 获取上一页数据的方法                                          | `() => void`          | `() `=> `{ }`       |     `VirtualList`      |
| `columnNumber` | 瀑布流的列数                                                  | number                | `2`                 | `WaterfallVirtualList` |
|  `isVirtual`   | 是否启用虚拟滚动，禁用虚拟滚动时`itemNumber 和 `overscan 失效 | boolean               | `true`              | `WaterfallVirtualList` |

### Item 渲染组件类型

```typescript
type Item = (
  currentData: {
    item: T;
    index: number;
    height: number;
    ref?: React.RefObject<HTMLDivElement>;
  },
  defaultStyle: React.CSSProperties
) => React.JSX.Element;
```

### 使用方法

```tsx
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { WaterfallVirtualList } from "react18-virtual-scroll";

const Home = ({ initialData }) => {
  const { list } = initialData || {};

  const Item = ({ item, index, height }, defaultStyle) => {
    return (
      <div style={{ ...defaultStyle, height }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1,
            backgroundColor: "red",
          }}
        >
          {item.title} - {index}
        </div>
        <img
          src={item.image_url}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            objectFit: "cover",
          }}
          alt=""
        />
      </div>
    );
  };

  const dataList = list.map((item) => {
    return {
      ...item,
      height: (300 * item.image_height) / item.image_width,
    };
  });
  return (
    <div>
      <WaterfallVirtualList
        data={dataList}
        Item={Item}
        height={"100vh"}
        width={"100%"}
      />
    </div>
  );
};

export default Home;
```

## 注意事项

1. data 中需要包含 height 这个 height 必须是真实的渲染高度
2. react18-virtual-scroll 是基于 react 18+ 开发的，对 react 低版本支持程度不高，如在 react 18 - 版本遇到问题可以尝试升级 react 版本到 18+ 解决
3. 目前暂不支持非固定高度渲染，正在火速开发中，欢迎各位用户留言

## 问题反馈

<img width="368" alt="screen shot 2019-03-07 at 7 32 32 pm" src="./qrcode_1745215856457.jpg">

# react18-virtual-scroll

> 支持虚拟滚动和瀑布流的 高效渲染大数据列表 react 组件

react18-virtual-scroll 基于仅渲染大数据中的部分数据的方式，来帮助我们解决一些常见的的性能瓶颈问题：

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

|      属性       | 说明                                                                       | 类型                         | 默认值    | 生效组件                               |
| :-------------: | -------------------------------------------------------------------------- | ---------------------------- | --------- | -------------------------------------- |
|      data       | 需要渲染的数据列表                                                         | object[ ]                    | [ ]       | all                                    |
|      width      | 虚拟滚动容器的宽度                                                         | string                       | 100%      | all                                    |
|     height      | 虚拟滚动容器的高度                                                         | string                       | 500px     | all                                    |
|    className    | 虚拟滚动容器的 class 名                                                    | string                       | ""        | all                                    |
|      style      | 虚拟滚动容器的 style 样式                                                  | React.CSSProperties          | { }       | all                                    |
|   itemNumber    | 虚拟滚动容器中渲染的数量                                                   | number                       | 10        | all                                    |
|    overscan     | 以 itemNumber 为基础向上下额外渲染的数量                                   | number                       | 5         | all                                    |
|       gap       | 虚拟滚动容器每项的间距                                                     | number or [ number, number ] | 8         | all                                    |
|      Item       | 每一项的渲染组件                                                           | Item                         | 必传项    | all                                    |
|   getNextData   | 获取下一页数据的方法                                                       | () => void                   | () => { } | all                                    |
|   getLastData   | 获取上一页数据的方法                                                       | (scrollTo: scrollTo) => void | () => { } | VirtualList                            |
| getCurrentIndex | 获取当前页面可视区域中第一个 item 的 index                                 | (number) => void             | () => { } | VirtualList                            |
|  columnNumber   | 瀑布流的列数                                                               | number                       | 2         | WaterfallVirtualList or NonFixedHeight |
|    isVirtual    | 是否启用虚拟滚动，禁用虚拟滚动时 itemNumber 和 overscan 失效               | boolean                      | true      | WaterfallVirtualList or NonFixedHeight |
| isUnknownHeight | 是否启用自动计算 item 高度，启用后将不在使用 data 中的 height 属性作为高度 | boolean                      | false     | all                                    |
|     itemKey     | 每个 item 中的唯一值，在启用 isUnknownHeight 时必传                        | string                       |           | all                                    |
|   messageType   | 在 dom 渲染成功后想要修改某个元素的高度时 postMessage 的 type              | string                       |           | NonFixedHeight                         |

### Item 渲染组件类型

```tsx
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

### scrollTo 渲染组件类型

```tsx
type scrollTo = (obj: {
  top: number;
  left: number;
  behavior?: "smooth" | "auto" | "instant";
}) => void;
```

### 使用方法

1. VirtualList (虚拟滚动列表) [demo](https://codesandbox.io/p/sandbox/holy-sea-p5hpgh)

```tsx
import React from "react";
import { VirtualList } from "react18-virtual-scroll";

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
          style={{ width: "300px", height: "100%", position: "absolute" }}
          alt=""
        />
      </div>
    );
  };

  return (
    <div>
      <VirtualList data={list} Item={Item} height={"100vh"} width={"100vw"} />
    </div>
  );
};

export default Home;
```

2. WaterfallVirtualList (瀑布流虚拟滚动) [demo](https://codesandbox.io/p/sandbox/ecstatic-wilbur-hstvcl)

```tsx
import React from "react";
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

  return (
    <div>
      <WaterfallVirtualList
        data={list}
        Item={Item}
        height={"100vh"}
        width={"100%"}
        columnNumber="2"
      />
    </div>
  );
};

export default Home;
```

3. NonFixedHeight (非固定高度虚拟滚动)

```tsx
import React from "react";
import { NonFixedHeight } from "react18-virtual-scroll";

const Home = ({ initialData }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(
      new Array(30).fill({}).map((item, index) => {
        return {
          ...item,
          index: index,
          height: 200,
          text: new Array(Math.ceil(Math.random() * 5) + 3)
            .fill(1)
            .map(() => {
              return "测试试";
            })
            .join(""),
        };
      })
    );
  }, []);

  const Item: React.FC<{
    item: any;
    index: number;
    height: number | "auto";
    ref: React.RefObject<HTMLDivElement>;
  }> = ({ item, index, height, ref }, defaultStyle) => {
    return (
      <div style={{ overflow: "hidden", ...defaultStyle, height }} ref={ref}>
        <div
          style={{
            zIndex: 1,
            backgroundColor: "red",
          }}
        >
          {item.text}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div
        onClick={() => {
          window.postMessage({ item: { index: 0 }, height: 200, type: "type" });
        }}
      >
        点击
      </div>
      <NonFixedHeight
        Item={Item}
        data={data}
        width={"110px"}
        className="container"
        columnNumber={3}
        isVirtual={true}
        itemNumber={10}
        overscan={5}
        gap={10}
        messageType={"messageType"}
        isUnknownHeight={true}
        itemKey={"index"}
        getCurrentIndex={(index) => {
          console.log(index);
        }}
      />
    </div>
  );
};

export default Home;
```

## 注意事项

1. data 中需要包含 height 这个 height 必须是真实的渲染高度
2. react18-virtual-scroll 是基于 react 18+ 开发的，对 react 低版本支持程度不高，如在 react 18 - 版本遇到问题可以尝试升级 react 版本到 18+ 解决

## 问题反馈

<img width="368" alt="screen shot 2019-03-07 at 7 32 32 pm" src="./qrcode_1745215856457.jpg">

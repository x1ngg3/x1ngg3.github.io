---
title: React Hooks 完全指南
date: 2024-01-24
author: x1ngg3
description: 深入理解 React Hooks 的工作原理和最佳实践
---

React Hooks 彻底改变了我们编写 React 组件的方式。

## useState

最基础的 Hook，用于在函数组件中添加状态。

```jsx
const [count, setCount] = useState(0);
```

## useEffect

处理副作用的 Hook。

```jsx
useEffect(() => {
  document.title = `点击了 ${count} 次`;
}, [count]);
```

## useContext

消费 Context 的 Hook。

## useMemo 和 useCallback

性能优化 Hook。

## 自定义 Hook

创建可复用的逻辑。

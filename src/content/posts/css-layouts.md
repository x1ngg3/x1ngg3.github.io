---
title: 现代 CSS 布局技术
date: 2024-01-22
author: x1ngg3
description: 掌握 Flexbox、Grid 等现代布局方法
---

CSS 布局技术在不断进化。

## Flexbox

一维布局系统。

```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

## Grid

二维布局系统。

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
```

## Container Queries

基于容器的响应式设计。

## Subgrid

网格的嵌套布局。

---
title: "功能测试文章"
description: "测试代码高亮、图片、各种 Markdown 语法"
date: 2024-01-25
---

## 代码高亮测试

### JavaScript 代码

```javascript
// JavaScript 高亮测试
const greeting = "Hello, World!";

function sayHello(name) {
  console.log(`Hello, ${name}!`);
  return true;
}

class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
}

sayHello("测试");
```

### Python 代码

```python
# Python 高亮测试
def fibonacci(n):
    """计算斐波那契数列"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

class Calculator:
    def __init__(self):
        self.result = 0

    def add(self, x, y):
        self.result = x + y
        return self.result

print(fibonacci(10))
```

### TypeScript 代码

```typescript
// TypeScript 高亮测试
interface User {
  id: number;
  name: string;
  email?: string;
}

function greetUser(user: User): string {
  return `Hello, ${user.name}!`;
}

const user: User = {
  id: 1,
  name: "张三"
};

console.log(greetUser(user));
```

### HTML/CSS 代码

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>测试页面</title>
  <style>
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello World</h1>
  </div>
</body>
</html>
```

### Bash 命令

```bash
# Bash 高亮测试
#!/bin/bash

echo "Hello, World!"

for i in {1..5}; do
  echo "Count: $i"
done

npm install
git add .
git commit -m "Update"
```

## 图片测试

### 本地图片（需要放在 public/images/ 目录）

![本地图片示例](/images/example.jpg)

### URL 图片

![Astro Logo](https://astro.build/assets/press/astro-logo-light.svg)

![GitHub Logo](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png)

## 其他 Markdown 语法测试

### 行内代码

这是一段包含 `const x = 42;` 行内代码的文本。

### 引用

> 这是一段引用文字。
>
> 可以跨多行。
>
> —— 作者名

### 列表

**无序列表：**
- 项目 1
- 项目 2
  - 子项目 2.1
  - 子项目 2.2
- 项目 3

**有序列表：**
1. 第一步
2. 第二步
3. 第三步

**任务列表：**
- [x] 已完成任务
- [x] 已完成任务 2
- [ ] 未完成任务
- [ ] 未完成任务 2

### 表格

| 语言 | 用途 | 难度 |
|------|------|------|
| JavaScript | 前端开发 | ⭐⭐⭐ |
| Python | 后端/数据科学 | ⭐⭐ |
| Rust | 系统编程 | ⭐⭐⭐⭐⭐ |

### 分隔线

---

### 链接

- [Astro 官网](https://astro.build)
- [GitHub](https://github.com)
- [我的博客首页](/)

### 强调

**粗体文字** 和 *斜体文字* 以及 ***粗斜体***

~~删除线文字~~

### 嵌套结构

1. 第一级列表
   - 嵌套无序列表
   - 另一个项目
     1. 嵌套有序列表
     2. 另一个嵌套项目
2. 返回第一级

## 特殊字符测试

中文字符：你好世界
Emoji: 🚀 📝 ✨ 🎉 💻 🔥
数学符号：≈ ≠ ≤ ≥ ∑ ∏

## 长代码块测试

```javascript
// 测试长代码块的显示
function complexFunction(data) {
  // 这是一个比较长的函数
  const result = data
    .filter(item => item.active)
    .map(item => ({
      ...item,
      processed: true,
      timestamp: new Date().toISOString()
    }))
    .reduce((acc, curr) => {
      if (!acc[curr.category]) {
        acc[curr.category] = [];
      }
      acc[curr.category].push(curr);
      return acc;
    }, {});

  // 返回处理结果
  return {
    success: true,
    data: result,
    count: Object.keys(result).length
  };
}

// 调用示例
const testData = [
  { id: 1, name: "Item 1", category: "A", active: true },
  { id: 2, name: "Item 2", category: "B", active: false },
  { id: 3, name: "Item 3", category: "A", active: true },
];

console.log(complexFunction(testData));
```

---

如果所有内容都正常显示，说明：
✅ 代码高亮正常工作
✅ 图片显示正常（包括 URL 图片）
✅ Markdown 语法解析正确
✅ 样式应用正确

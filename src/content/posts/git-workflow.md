---
title: Git 工作流最佳实践
date: 2024-01-19
author: x1ngg3
description: 团队协作中的 Git 工作流和分支管理策略
---

选择合适的 Git 工作流对团队协作至关重要。

## Git Flow

经典的分支管理模型。

- main/master：生产分支
- develop：开发分支
- feature/*：功能分支
- release/*：发布分支
- hotfix/*：热修复分支

## GitHub Flow

更简单的工作流。

```bash
git checkout -b feature/new-feature
git commit -am "Add new feature"
git push origin feature/new-feature
# 创建 Pull Request
```

## Trunk Based Development

基于主干的开发模式。

## 提交规范

遵循约定式提交。

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建过程或辅助工具的变动
```

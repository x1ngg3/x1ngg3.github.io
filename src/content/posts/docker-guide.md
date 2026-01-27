---
title: Docker 容器化实践指南
date: 2024-01-18
author: x1ngg3
description: 使用 Docker 构建、部署和管理应用程序
---

Docker 简化了应用程序的部署和管理。

## Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## docker-compose

编排多容器应用。

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret
```

## 最佳实践

- 使用多阶段构建
- 最小化层数
- 使用 .dockerignore
- 不要在容器中存储数据

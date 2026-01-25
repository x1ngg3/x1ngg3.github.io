# 换电脑部署指南

当你换了新电脑，想要继续维护博客时，按照以下步骤操作。

## 前置要求

新电脑需要安装：
1. **Node.js** (版本 >= 18)
2. **Git**

### 安装 Node.js

**macOS:**
```bash
# 使用 Homebrew
brew install node

# 或者从官网下载
# https://nodejs.org/
```

**Windows:**
- 从 https://nodejs.org/ 下载安装包
- 下载 LTS 版本（推荐）

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install nodejs npm
```

### 验证安装
```bash
node -v   # 应该显示 v18.x.x 或更高
npm -v    # 应该显示 9.x.x 或更高
```

## 快速开始（3个命令）

```bash
# 1. 克隆仓库（替换成你的 GitHub 用户名）
git clone https://github.com/x1ngg3/blog.git
cd blog

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

访问 http://localhost:4321 就能看到你的博客了！

## 详细步骤说明

### 步骤 1: 克隆仓库

```bash
# 克隆仓库
git clone https://github.com/x1ngg3/blog.git

# 进入项目目录
cd blog
```

**注意：** 把 `x1ngg3` 替换成你自己的 GitHub 用户名！

### 步骤 2: 安装依赖

```bash
npm install
```

这会安装所有需要的包，大约需要 1-2 分钟。

### 步骤 3: 启动开发服务器

```bash
npm run dev
```

看到这样的输出就成功了：
```
astro  v5.x.x ready in 150 ms

┃ Local    http://localhost:4321/
┃ Network  use --host to expose
```

### 步骤 4: 开始写作

现在你可以：
1. 在 `src/content/posts/` 创建新文章
2. 在 `src/content/thoughts/` 创建新说说
3. 修改已有文章

保存文件后，浏览器会自动刷新！

### 步骤 5: 发布更新

```bash
# 添加更改
git add .

# 提交
git commit -m "新文章：xxx"

# 推送到 GitHub
git push
```

等待 1-2 分钟，GitHub Actions 会自动部署！

## 常用命令

```bash
# 启动开发服务器（本地预览）
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 停止开发服务器
按 Ctrl + C
```

## 配置 Git（首次使用新电脑）

如果是全新的电脑，需要配置 Git：

```bash
# 设置用户名
git config --global user.name "你的名字"

# 设置邮箱
git config --global user.email "your-email@example.com"
```

### 配置 GitHub 认证

**方法 1: HTTPS + Personal Access Token（推荐）**

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 复制生成的 token
5. 第一次 `git push` 时：
   - Username: 输入你的 GitHub 用户名
   - Password: 粘贴刚才的 token（不是你的密码！）

**方法 2: SSH（进阶）**

```bash
# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your-email@example.com"

# 复制公钥
cat ~/.ssh/id_ed25519.pub

# 然后在 GitHub Settings → SSH and GPG keys 中添加
```

## 故障排查

### 问题 1: `git clone` 失败

**错误信息：** `fatal: repository not found`

**解决：** 检查仓库 URL 是否正确，确保你有访问权限

### 问题 2: `npm install` 很慢

**解决：** 使用国内镜像

```bash
# 临时使用淘宝镜像
npm install --registry=https://registry.npmmirror.com

# 或永久设置
npm config set registry https://registry.npmmirror.com
```

### 问题 3: `npm run dev` 报错

**错误信息：** `Error: Cannot find module...`

**解决：**
```bash
# 删除依赖重新安装
rm -rf node_modules package-lock.json
npm install
```

### 问题 4: 端口被占用

**错误信息：** `Port 4321 is already in use`

**解决：**
```bash
# macOS/Linux
lsof -ti:4321 | xargs kill

# Windows
netstat -ano | findstr :4321
# 然后使用任务管理器结束进程

# 或者使用不同端口
npm run dev -- --port 3000
```

### 问题 5: `git push` 需要密码

如果每次都要输入密码，配置缓存：

```bash
# 缓存密码 15 分钟
git config --global credential.helper cache

# 或者永久保存（macOS）
git config --global credential.helper osxkeychain

# Windows
git config --global credential.helper wincred
```

## 同步多台电脑

如果你在多台电脑上工作：

**电脑 A 修改后：**
```bash
git add .
git commit -m "更新"
git push
```

**电脑 B 同步：**
```bash
# 拉取最新更改
git pull

# 如果有冲突，先解决冲突再继续
```

## 备份策略

虽然代码在 GitHub 上已经是一份备份，但建议：

1. **定期推送到 GitHub**（最重要！）
2. **本地备份**：可以把 `blog` 文件夹复制到云盘
3. **导出文章**：`src/content/` 目录包含所有文章，单独备份也可以

## 文件说明

换电脑时，这些文件会自动恢复：

✅ **需要的（自动恢复）：**
- 所有代码文件
- 所有文章和说说 (`src/content/`)
- 配置文件
- 图片资源 (`public/`)

❌ **不需要的（不用管）：**
- `node_modules/` - 会重新安装
- `dist/` - 构建输出
- `.astro/` - 缓存文件

## 小贴士

1. **定期推送**：写完文章就 `git push`，不要攒太多
2. **写有意义的 commit 信息**：方便以后查找
3. **善用分支**：大改动时可以创建新分支
4. **保存环境配置**：记录你常用的 VS Code 插件、终端配置等

## 推荐工具

- **编辑器**: VS Code（推荐）、Cursor
- **Markdown 编辑**: Typora、MacDown
- **Git 客户端**: GitHub Desktop（图形界面）

---

**就这么简单！3个命令就能在新电脑上继续写作！** 🚀

# SSH 认证问题解决方案

## 问题描述

推送代码到 GitHub 时遇到错误：
```
remote: Invalid username or token.
Password authentication is not supported for Git operations.
```

## 原因分析

- 你已经在 GitHub 上配置了 SSH 公钥 ✅
- 但 Git 仓库的远程地址使用的是 HTTPS 协议 ❌
- HTTPS 协议需要 Personal Access Token，不能使用 SSH 密钥

## 解决方案

### ✅ 已为你修复

我已经将远程地址从 HTTPS 改为 SSH：

```bash
# 之前（HTTPS）
https://github.com/x1ngg3/x1ngg3.github.io.git

# 之后（SSH）
git@github.com:x1ngg3/x1ngg3.github.io.git
```

### 验证结果

SSH 连接测试成功：
```
Hi x1ngg3! You've successfully authenticated, but GitHub does not provide shell access.
```

这表示你的 SSH 密钥配置正确！

---

## 现在可以推送了

```bash
# 推送代码
git push -u origin main
```

**不再需要输入用户名和密码！** 🎉

---

## HTTPS vs SSH 对比

| 协议 | 认证方式 | 优点 | 缺点 |
|------|---------|------|------|
| **HTTPS** | Personal Access Token | 简单，防火墙友好 | 需要管理 Token |
| **SSH** | SSH 密钥对 | 无需密码，更安全 | 需要配置密钥 |

---

## 如果以后遇到类似问题

### 检查当前使用的协议

```bash
git remote -v
```

**输出示例：**

HTTPS 格式：
```
origin  https://github.com/x1ngg3/repo.git (fetch)
origin  https://github.com/x1ngg3/repo.git (push)
```

SSH 格式：
```
origin  git@github.com:x1ngg3/repo.git (fetch)
origin  git@github.com:x1ngg3/repo.git (push)
```

### 切换到 SSH（推荐）

如果你已经配置了 SSH 密钥：

```bash
git remote set-url origin git@github.com:USERNAME/REPO.git
```

### 切换到 HTTPS

如果你想用 HTTPS：

```bash
git remote set-url origin https://github.com/USERNAME/REPO.git
```

然后使用 Personal Access Token 作为密码。

---

## SSH 密钥配置指南

如果你需要在其他电脑上配置 SSH：

### 1. 生成 SSH 密钥

```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
```

或者（如果系统不支持 ed25519）：

```bash
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
```

按 Enter 使用默认路径，设置密码（可选）。

### 2. 查看公钥

```bash
cat ~/.ssh/id_ed25519.pub
# 或
cat ~/.ssh/id_rsa.pub
```

### 3. 添加到 GitHub

1. 访问 https://github.com/settings/keys
2. 点击 `New SSH key`
3. Title: 输入描述（如"我的MacBook"）
4. Key: 粘贴公钥内容
5. 点击 `Add SSH key`

### 4. 测试连接

```bash
ssh -T git@github.com
```

成功会显示：
```
Hi USERNAME! You've successfully authenticated, but GitHub does not provide shell access.
```

---

## 常见问题

### Q: 如何知道我用的是哪种协议？

**A:** 运行 `git remote -v`，查看 URL：
- `https://` 开头 = HTTPS
- `git@` 开头 = SSH

### Q: SSH 和 HTTPS 哪个更好？

**A:**
- **SSH 推荐**：一次配置，永久使用，更安全
- **HTTPS**：简单，但需要管理 Personal Access Token

### Q: 已经配置 SSH 但还是不行？

**A:** 检查：
1. GitHub 上是否添加了公钥
2. 私钥权限是否正确（`chmod 600 ~/.ssh/id_rsa`）
3. SSH agent 是否运行（`ssh-add ~/.ssh/id_rsa`）

### Q: 多个 GitHub 账号怎么办？

**A:** 配置 SSH config 文件（`~/.ssh/config`）：

```
# 个人账号
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_rsa_personal

# 工作账号
Host github-work
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_rsa_work
```

---

## 快速命令参考

```bash
# 查看远程地址
git remote -v

# 改为 SSH
git remote set-url origin git@github.com:USERNAME/REPO.git

# 改为 HTTPS
git remote set-url origin https://github.com/USERNAME/REPO.git

# 测试 SSH 连接
ssh -T git@github.com

# 查看公钥
cat ~/.ssh/id_rsa.pub

# 生成新密钥
ssh-keygen -t ed25519 -C "your-email@example.com"
```

---

## 总结

✅ **已解决**：远程地址已改为 SSH
✅ **已验证**：SSH 连接测试成功
✅ **可以推送**：现在可以直接 `git push` 了

**不再需要输入用户名和密码！** 🎊

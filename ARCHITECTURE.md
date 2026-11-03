# 架构说明

## 技术栈

- Astro 5.x，静态页面生成。
- Markdown + Astro Content Collections 管理文章和说说。
- 原生 CSS、CSS Variables 和少量原生浏览器脚本。
- GitHub Actions 构建并部署到 GitHub Pages。
- Giscus 提供文章评论。

## 文件与职责

| 文件 | 职责 |
| --- | --- |
| `src/content/config.ts` | 文章和说说的元数据 Schema |
| `src/content/posts/` | 文章 Markdown |
| `src/content/thoughts/` | 说说 Markdown |
| `src/layouts/BaseLayout.astro` | 全局导航、页面容器、简洁页脚 |
| `src/layouts/ContentLayout.astro` | 归档、说说、关于页共用双栏布局 |
| `src/components/BlogSidebar.astro` | 资料卡片、分类链接、说说摘要 |
| `src/components/Icon.astro` | 统一尺寸、描边的本地 SVG 图标 |
| `src/utils/content.ts` | 首页、归档与侧栏共用的纯文字节选 |
| `src/styles/global.css` | 色板、字体、排版与通用容器 |
| `src/pages/index.astro` | 全屏摄影封面、图标导航与文章卡片 |
| `src/pages/posts/index.astro` | 按年分组的文章列表、分类筛选 |
| `src/pages/posts/[slug].astro` | 正文、目录、分享、评论和其他文章 |
| `src/pages/thoughts/index.astro` | 按月分组的完整说说与单条锚点 |
| `src/pages/about/index.astro` | 关于与联系方式 |
| `src/components/Comments.astro` | Giscus 加载及评论绑定 |
| `public/giscus-theme.css` | 保留的旧评论主题，当前未加载 |
| `public/images/avatar.webp` | 导航、侧栏、首页文章卡片和说说共用的 256×256 本地头像 |
| `public/favicon-avatar.png` | 从头像生成的 48×48 圆角网站图标 |
| `public/apple-touch-icon-avatar.png` | 从头像生成的 180×180 触屏图标 |
| `public/images/DJI_20240916081052_0037_D.webp` | 指定海浪照片的 2560×1440 网页封面 |
| `public/images/DJI_20240916081052_0037_D-thumb.webp` | 同一照片的 640×360 侧栏缩略图 |
| `astro.config.mjs` | 站点域名、代码高亮设置 |

评论组件通过 `data-theme="light"` 使用 Giscus 内置 GitHub 浅色主题：白色正文区、极浅灰蓝色页签栏。保留原始组件结构、框线与间距，不加载本站旧的 `giscus-theme.css`，无需评论专用响应头或缓存版本参数。不附加表情面板，Giscus 的认证、提交、原生反应类型和 `commentId` 保持不变。

`src/components/Sidebar.astro` 是未被当前页面使用的旧文章侧栏，不参与布局。

## 内容元数据

文章包含：

- `title`：必填标题。
- `date`：发布日期。
- `description`：可选摘要，允许为空。
- `author`：默认 `x1ngg3`。
- `category`：非空分类名，默认 `Writing`。不根据标题猜测分类。
- `draft`：默认 `false`，用于首页、列表和其他文章区域的过滤。
- `tags`：可选标签数组。
- `commentId`：必填、稳定且唯一的评论绑定键，发布后不修改。

说说包含 `date`、可选 `mood` 和可选 `tags`。内容渲染为 Markdown，单条地址为 `/thoughts#note-{slug}`。

## 布局与交互

### 首页

- 封面放在 `BaseLayout` 的 `cover` 插槽中，独立占满 `100dvh`（回退为 `100vh`），禁止 flex 收缩。导航无负边距，排在完整首屏之后，下滚后保持粘性。矮屏保留封面的最低可用高度。
- 封面使用指定照片的本地 WebP 网页版本并预加载，侧栏使用小尺寸版本；输出移除 EXIF 等元数据，不改动原始 JPG。不依赖外部图片、字体或动画库，图标入口和向下按钮均为原生链接。
- 内容区标题独立于卡片，左侧文章卡片与右侧 264px 资料栏顶部对齐。
- 首页展示最新 6 篇文章。缺少摘要时从正文截取纯文字，不改写原文；首页最多显示三行，归档页最多两行。
- 资料栏包含作者信息、真实文章与说说计数、分类链接及最新 3 条说说摘要；保留完整标题，正文摘要最多两行。
- 摘要使用纯文本，避免与说说正文重复生成相同标题 ID；点击说说标题跳到完整内容的锚点。
- 900px 以下内容区改单栏，保留基本窄屏可用性。

### 文章列表

- 按年份分组，日期倒序排列。
- 分类来自 `category`，用按钮过滤文章并更新年份计数、选中态和结果提示。
- 支持 `/posts?category=Reading#categories` 直接筛选；点击分类同步地址参数，未知分类回退到全部。
- 没有 JavaScript 时隐藏筛选按钮，但全部文章仍可阅读。

### 文章详情

- 标题、摘要、正文和评论在同一白色内容卡片，阅读宽度上限为 `--reading-width`，当前 760px。
- 1200px 及以上且有二、三级标题时显示右侧 264px 粘性目录。
- 没有目录时使用居中单栏，不保留空目录列。
- 复制链接、Twitter 和邮件分享使用 `Astro.site` 下的正式文章地址。
- 复制失败或浏览器不支持剪贴板时给出提示；没有 JavaScript 时仍可使用分享链接。
- 文末“再读一篇”按时间展示其他文章，不宣称内容相关性。

### 导航与页脚

- 顶部粘性导航显示当前栏目，提供键盘焦点样式。
- 页脚保留版权、文章归档、关于和 GitHub，不重复大块导航。

## 样式约定

- 浅灰背景、白色圆角卡片、轻阴影、青绿强调色。
- 标题与正文使用系统无衬线字体栈，代码使用等宽字体栈，不加载远程字体。
- 外层容器最大宽度 1160px，侧栏 264px，栏间距 24px，卡片内边距 32px，阅读列独立限制宽度。
- 站点控件使用统一 SVG 图标，封面入口用低饱和底色区分。文章中作者自己写的 emoji 不受影响。
- 主色、卡片尺寸、阴影、导航高度使用全局变量；文章页不再叠加旧主题的字号和间距覆盖规则。
- 锚点偏移统一由根元素的 `scroll-padding-top` 提供，避免与局部 `scroll-margin-top` 重复累加。
- 首页 `#latest` 位于内容容器内边距之后的标题栏，跳转时导航已到达吸顶位置，封面完整移出视口。导航头像为圆角方形，侧栏头像用圆形容器裁切。
- 页面专属样式写在对应 `.astro` 的 `<style>` 中；Markdown 后代使用 `:global()`。
- `[hidden]` 的显示规则不能被页面的 grid/flex 覆盖，分类筛选依赖此规则。

## 验证

验证和调试在 `/tmp` 的项目副本进行，构建产物、缓存和测试文件不要写回工作目录。

重点检查全屏封面与内容跳转、资料栏、目录有无两种文章布局、分类深链接与切换、单条说说跳转、分享地址和剪贴板失败提示。文章正文与 `commentId` 不因布局调整而改变。

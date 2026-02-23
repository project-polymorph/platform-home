# 多元性别中文数字图书馆 (Polymorph)

[![Website](https://img.shields.io/badge/Website-transchinese.org-blue)](https://transchinese.org)
[![License](https://img.shields.io/badge/License-AGPL--3.0-green)](LICENSE)

> 跨性别与多元性别中文资料数字归档平台

## 🌐 在线访问

- **主站**: https://transchinese.org
- **文档库**: https://digital.transchinese.org
- **新闻库**: https://news.transchinese.org
- **漫画库**: https://comic.transchinese.org
- **小说库**: https://novel.transchinese.org

## 🏗️ 技术架构

### 前端
- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **内容管理**: Contentlayer
- **搜索**: 客户端搜索 (pako.js 解压 gzip 索引)

### 部署
- **平台**: Cloudflare Pages
- **CI/CD**: GitHub Actions
- **构建**: 静态导出 (`EXPORT=true UNOPTIMIZED=true`)

### 搜索索引
搜索使用客户端实现，索引文件位于 `public/search-index/`：
- 10 个仓库索引，gzip 压缩后约 13MB
- 支持渐进式加载，按优先级获取
- 使用 pako.js 在浏览器端解压

## 🚀 开发

### 环境要求
- Node.js 20+
- Yarn

### 本地开发

```bash
# 安装依赖
yarn install

# 启动开发服务器
yarn dev
```

访问 http://localhost:3000

### 构建

```bash
# 静态导出构建
EXPORT=true UNOPTIMIZED=true yarn build

# 输出目录: out/
```

## 📁 项目结构

```
platform-home/
├── app/                    # Next.js App Router
│   ├── search/            # 搜索页面
│   └── ...
├── components/            # React 组件
├── data/                  # 站点元数据、导航等
├── lib/                   # 工具函数
│   └── clientSearch.ts   # 客户端搜索实现
├── public/                # 静态资源
│   └── search-index/     # 搜索索引 (gzip)
├── scripts/               # 构建脚本
│   ├── prebuild.mjs      # 预构建处理
│   ├── postbuild.mjs     # 后构建处理
│   └── rss.mjs           # RSS 生成
└── .github/workflows/     # CI/CD 配置
    └── cf-pages-deploy.yml
```

## 🔍 搜索实现

搜索功能完全在客户端实现：

1. **索引加载**: 按需加载仓库索引文件
2. **解压**: 使用 pako.js 解压 gzip 数据
3. **查询**: 在内存中执行关键词匹配
4. **限制**: 最多返回 100 条结果

索引配置见 `lib/clientSearch.ts` 中的 `REPO_INDEXES`。

## 🔄 CI/CD

GitHub Actions 工作流 (`.github/workflows/cf-pages-deploy.yml`):

- **PR/手动触发**: 部署到 `transchinese-test` (预览)
- **main 分支推送**: 部署到 `transchinese-org` (生产)

需要配置 GitHub Secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## 📝 内容管理

内容通过 Contentlayer 管理，源文件位于：
- `data/blog/` - 博客文章
- `data/authors/` - 作者信息
- `data/projects/` - 项目展示

## 🤝 参与贡献

1. Fork 本仓库
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

## 📄 许可证

[AGPL-3.0](LICENSE) © 多元性别中文数字图书馆

---

*基于 [Tailwind Nextjs Starter Blog](https://github.com/timlrx/tailwind-nextjs-starter-blog) 构建*

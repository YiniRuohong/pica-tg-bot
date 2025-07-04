# AGENT 指南

本仓库是哔咔漫画下载命令行工具，使用 TypeScript 编写，依赖 Node.js 环境。

## 目录结构简介
- `src/`    主要源代码
  - `index.ts` CLI 入口，负责解析用户输入与下载流程
  - `sdk.ts`  封装与哔咔 API 的交互
  - `utils.ts` 常用工具方法
  - `zip.ts`  将已下载的漫画按章节压缩
  - `types.ts` 类型定义
- `scripts/` 辅助脚本，如上传打包文件和校验提交信息
- `test/`    vitest 单元测试

## 技术栈
- Node.js + TypeScript
- 构建：rollup、esbuild
- 依赖管理：pnpm
- 代码规范：eslint、prettier、commitlint
- 测试：vitest

## Agent 工作流程
1. 安装依赖：`pnpm install`
2. 提交前运行 `pnpm lint`、`pnpm format`、`pnpm test`
3. 测试或安装依赖若失败，请在 PR 描述中说明原因

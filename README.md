# 一步之差 / One Step Wrong

《一步之差》是一款面向普通大学生的校园网络安全互动模拟。本仓库实现第一版 vertical slice「最后一次提交」：玩家需要在作业截止前恢复网络并完成提交；便利路径会先带来真实成功，再以延迟事件引出账号和设备异常。玩家可以逐项止损，最终复盘页面只依据实际操作生成时间线、线索、有效行为和结局。

本项目不是知识问答。网络选择阶段不会标注危险、正确或推荐答案。

## Demo 案例

- 正常任务：在 23:59 前提交 `Final_Assignment.pdf`
- 可选连接：`Campus-Secure`、`Campus-Guest`、`Campus_Free_5G`、个人热点
- 完整流程：上传失败 → 网络选择 → 认证/配置 → 作业提交 → 正常操作 → 延迟异常 → 事故响应 → 动态复盘
- 可达结局：多确认一步、及时止损、影响扩大
- 重玩方式：从网络选择、异常提醒或完整开场重新体验

## 启动

环境要求：Node.js 20.9 或更高版本、npm 10 或更高版本。

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。追加 `?dev=1` 可显示仅用于开发的剧情检查点面板。

## 构建与测试

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run start
```

Playwright 首次运行前可执行：

```bash
npx playwright install chromium
```

## 技术栈

- Next.js 16、React 19、TypeScript
- 原生 CSS 视觉系统与手绘像素 SVG 场景
- `useReducer` 集中式剧情状态机
- Lucide React 统一操作图标
- Vitest、React Testing Library、Playwright

## 项目结构

```text
src/
  app/                         Next.js 入口
  components/
    desktop/                   桌面壳、系统栏、任务、Dock、调试面板
    network/                   网络列表与模拟配置安装
    notifications/             通知 toast 与通知中心
    windows/                   课程、接入页、聊天、安全、网络、IT、日程
    debrief/                   动态复盘与关键节点重玩
    ui/                        基础按钮和图标按钮
  scenarios/
    index.ts                   scenario 注册表
    final-submission/          当前案例的配置、文案、事件与结局
    types.ts                   可复用 scenario 契约
  state/
    GameContext.tsx            运行时注入、计时器、音效与上传推进
    gameMachine.ts             集中式状态转换和检查点重置
    selectors.ts               结局、评分、线索与有效操作派生
  tests/                       单元、组件与 E2E 测试
  styles/                      色板、像素规范与响应式布局
artifacts/screenshots/         最终交付截图
```

## 状态机

主流程阶段为：

```text
intro
  → network-selection
  → captive-portal
  → submission
  → calm
  → incident
  → response
  → debrief
```

倒计时按真实时间减少；剧情异常按玩家完成的不同正常操作推进，避免强制等待。所有一次性事件都有稳定 ID 并记录在 `firedEvents`，重复操作不会再次触发。`REPLAY_NETWORK`、`REPLAY_INCIDENT` 和 `RESET_FULL` 都从工厂函数创建完整新状态，避免旧路线字段泄漏。

结局不只看总分：安全连接直接进入「多确认一步」；危险路线必须同时完成退出异常会话、删除配置、通知同学和上报 IT 才进入「及时止损」，否则进入「影响扩大」。评分只在复盘页显示。

## 新增 Scenario

1. 在 `src/scenarios/<scenario-id>/` 新建 `index.ts`、`copy.ts`、`events.ts` 和 `endings.ts`。
2. 实现 `ScenarioDefinition`，至少提供元数据、网络列表、结局和复盘配置。
3. 在 `src/scenarios/index.ts` 注册定义。
4. 将案例专有的状态转换作为小型 action/effect 扩展到 reducer；桌面壳、窗口框架、通知系统、倒计时、事件日志和复盘布局保持复用。
5. 为安全路线、可止损路线、影响扩大路线和检查点重置各补一条测试。

`GameProvider` 支持注入 `ScenarioDefinition` 与初始 `GameState`，可用于后续场景选择器、展台模式或精确组件测试。

## 安全与隐私

所有行为均为纯模拟：

- 不请求或保存真实账号、密码、手机号或验证码
- 演示凭据为只读固定字符，不写入 `localStorage`、analytics 或日志
- 不发送模拟凭据或表单数据到服务器
- 不扫描或连接真实 Wi-Fi
- 不下载、安装或删除真实证书/配置文件
- 不修改本机账号、会话或网络设置
- 所有学校与域名均为虚构；页面不会请求这些域名

## 已知限制

- 第一版只包含「最后一次提交」一个案例
- 桌面体验优先，宽度低于 1100 px 时显示桌面端提示
- 窗口位置固定，不支持拖拽和自由缩放
- 音效为浏览器端即时合成的轻量提示音，没有背景音乐或配音
- 没有后端、用户系统、持久化进度或真实校园服务集成

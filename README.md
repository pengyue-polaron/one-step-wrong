# 一步之差 / One Step Wrong

《一步之差》是一款面向普通大学生的 NYU 数字安全互动故事集。玩家从案例档案库进入三个独立章节，在完成作业、共享资料或登录会议的过程中作出实际选择；便利路径可能先完成任务，再以延迟事件暴露账号、设备或协作范围的影响。复盘页面只依据真实操作生成时间线、线索、止损行为和结局。

本项目不是知识问答。选择发生前不会标注危险、正确或推荐答案。

## 可玩案例

- `01 最后一次提交`：Brightspace 截止、公共 Wi-Fi、假接入页、配置安装与账号止损。
- `02 共享范围`：NYU Drive 协作、具体身份、链接范围、编辑权限、版本恢复与影响沟通。
- `03 这次是你吗`：NYU Duo 意外推送、登录动作绑定、未知会话、恢复方式与 IT 上报。
- 每章都有正常任务、无预警选择、延迟后果、逐项响应、动态复盘和章节重玩。
- 案例库记录当前浏览会话内的完成进度，离开页面后不保留。

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
    cases/                     案例档案库与通用决策章节运行器
    desktop/                   桌面壳、系统栏、任务、Dock、调试面板
    network/                   网络列表与配置安装交互
    notifications/             通知 toast 与通知中心
    windows/                   课程、接入页、聊天、安全、网络、IT、日程
    debrief/                   动态复盘与关键节点重玩
    ui/                        基础按钮和图标按钮
  scenarios/
    caseCatalog.ts             多章节目录、剧情数据与复盘规则
    index.ts                   scenario 注册表
    final-submission/          深度桌面案例的配置、文案、事件与结局
    types.ts                   可复用 scenario 契约
  state/
    GameContext.tsx            运行时注入、计时器、音效与上传推进
    gameMachine.ts             集中式状态转换和检查点重置
    selectors.ts               结局、评分、线索与有效操作派生
  tests/                       单元、组件与 E2E 测试
  styles/                      色板、像素规范与响应式布局
artifacts/screenshots/         最终交付截图
```

## 章节运行方式

「最后一次提交」使用完整桌面状态机：

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

「共享范围」和「这次是你吗」使用数据驱动章节运行器：

```text
intro → decision → outcome → response（按需）→ debrief
```

`DecisionCaseDefinition` 提供任务、选择、延迟事件、关键响应项、结局、证据、因果链和迁移规则。界面分别模拟 NYU Drive 与 Duo，但状态和复盘契约保持一致。

## 扩展章节

1. 短章节优先在 `caseCatalog.ts` 增加 `DecisionCaseDefinition`，并为专属工具界面增加渲染组件。
2. 需要多个自由窗口、通知和长链响应的章节使用 `ScenarioDefinition` 与独立 reducer。
3. 每章必须同时提供安全路线、后果路线、逐项止损、因果复盘与关键 E2E 测试。
4. 案例入口统一注册到 `caseCatalog`，不要另建营销式落地页。

`GameProvider` 支持注入 `ScenarioDefinition` 与初始 `GameState`，用于深度桌面章节、检查点重放与精确组件测试。

## 安全与隐私

所有交互均在本地故事状态机内完成：

- 不请求或保存真实账号、密码、手机号或验证码
- 页面凭据为只读固定字符，不写入 `localStorage`、analytics 或日志
- 不发送任何凭据或表单数据到服务器
- 不扫描或连接真实 Wi-Fi
- 不下载、安装或删除真实证书/配置文件
- 不修改本机账号、会话或网络设置
- NYU、Brightspace、Google Workspace 与 Duo 信息只作为静态界面文本；页面不会请求这些服务

## 场景依据

- [NYU Google Workspace](https://shanghai.nyu.edu/page/google-workspace-nyu) 包含 NYU Email、Calendar、Groups 和 Drive。
- [NYU MFA 说明](https://wp.nyu.edu/blog/multi-factor-authentication-mfa/) 记录 Duo Mobile 推送作为 NYU MFA 方式。
- [NYU Courant 安全公告](https://cims.nyu.edu/dynamic/systems/announcements/critical/) 明确建议联系 IT 处理并非本人发起的 Duo 推送。
- [NYU Email 反钓鱼说明](https://cims.nyu.edu/dynamic/systems/userservices/mail/) 记录 PhishAlarm 与 `phishing@nyu.edu` 上报方式。

## 已知限制

- 桌面体验优先，宽度低于 1100 px 时显示桌面端提示
- 窗口位置固定，不支持拖拽和自由缩放
- 音效为浏览器端即时合成的轻量提示音，没有背景音乐或配音
- 没有后端、用户系统、跨会话持久化进度或真实校园服务集成

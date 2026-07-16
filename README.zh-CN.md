# 一步之差

<p>
  <a href="./README.md">English</a> ·
  <a href="./README.zh-CN.md"><strong>简体中文</strong></a>
</p>

<p>
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-111827?logo=next.js" />
  <img alt="React 19" src="https://img.shields.io/badge/React-19-1f6f8b?logo=react" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white" />
  <img alt="测试" src="https://img.shields.io/badge/tests-24%20unit%20%2B%2010%20E2E-456b52" />
</p>

**《一步之差》**是一套以纽约大学为背景的数字安全互动故事。玩家进入普通的学生任务，在可信的工具界面中作出选择，经历延迟出现的后果，并通过一份根据实际操作生成的因果复盘理解安全知识。

它不是知识问答。结果发生前，任何选择都不会被标注为安全、危险、正确或推荐。

![包含三个 NYU 数字安全故事的案例库](./artifacts/screenshots/case-library.png)

## 为什么做这个项目

许多安全培训会在学习者感受到压力之前直接给出答案，《一步之差》反过来组织学习过程：

1. 先给玩家一项正常任务和可信的截止时间。
2. 把没有预警标签的选择放进任务本身。
3. 让便利路径先完成任务，再逐步显露更广的影响。
4. 要求玩家分别处理账号、设备、内容和社交影响。
5. 最后在复盘中还原完整因果链。

## OpenAI Build Week 方向

**《一步之差》是一台训练数字判断力的飞行模拟器。** 在计划中的 Build Week 版本里，教师只需输入学校名称或官方域名。GPT-5.6 研究智能体会搜索官方公开资料，建立一份带引用的 Institution Profile，涵盖该校的学习平台、登录与 MFA 术语、共享工具、无线网络环境和安全事件上报渠道。教师审核确认后，Scenario Studio 再把学校背景、威胁主题和学习目标转化为经过校验、贴合该校的可玩模拟。现有确定性引擎继续掌管事实、状态转换、止损要求和结局；GPT-5.6 还会根据玩家的规范化操作轨迹和已批准来源生成个性化复盘。

> **AI 负责写出模拟世界，代码负责让它诚实运行。**

以上 AI 能力目前仍是实施目标，不属于当前静态原型。完整产品故事、架构、安全边界、验收标准、演示脚本和实施顺序见 [`BUILD_WEEK_PLAN.md`](./BUILD_WEEK_PLAN.md)。

## 可玩案例

| 案例 | 学生任务 | 安全边界 | 体验形式 |
| --- | --- | --- | --- |
| **01 · 最后一次提交** | 在截止前恢复网络，把作业提交至 NYU Brightspace。 | 无线网络身份、域名、配置文件和账号止损。 | 深度桌面模拟，最低宽度 1100 px。 |
| **02 · 共享范围** | 给项目小组开放完成访谈核对所需的权限。 | 具体身份、链接范围、编辑权限、版本恢复和影响沟通。 | 响应式决策章节。 |
| **03 · 这次是你吗** | 在连续收到 Duo 请求时进入导师会议。 | 本人发起的登录、设备与位置、会话、恢复方式和上报。 | 响应式决策章节。 |

每个案例都有普通任务、无预警选择、必要时出现的延迟后果、逐项响应、多种结局和可重玩的因果复盘。完成进度只保留在当前浏览会话中。

## 产品截图

### 情境中的选择

<table>
  <tr>
    <td width="50%"><img alt="NYU Drive 共享范围选择" src="./artifacts/screenshots/drive-sharing.png" /></td>
    <td width="50%"><img alt="意外 Duo 请求选择" src="./artifacts/screenshots/duo-request.png" /></td>
  </tr>
  <tr>
    <td align="center">NYU Drive 共享范围</td>
    <td align="center">Duo 登录确认</td>
  </tr>
</table>

### 因果复盘

![把玩家选择、沿途证据、响应动作和迁移规则连接起来的复盘页面](./artifacts/screenshots/drive-debrief.png)

### 响应式章节

<table>
  <tr>
    <td width="33%"><img alt="手机上的案例库" src="./artifacts/screenshots/mobile-case-library.png" /></td>
    <td width="33%"><img alt="手机上的 NYU Drive 章节" src="./artifacts/screenshots/mobile-drive-sharing.png" /></td>
    <td width="33%"><img alt="手机上的 Duo 章节" src="./artifacts/screenshots/mobile-duo-request.png" /></td>
  </tr>
</table>

## 技术栈

- Next.js 16、React 19 和严格模式 TypeScript
- 原生 CSS 设计系统，克制使用 NYU Violet
- Lucide React 图标
- 使用 `useReducer` 构建可复现的剧情状态机
- Vitest 与 React Testing Library 状态/组件测试
- Playwright 完整流程与响应式布局测试

应用完全在本地、以静态页面运行，不包含后端、分析服务、账号系统或真实校园服务集成。

## 快速开始

### 环境要求

- Node.js 20.9 或更高版本
- npm 10 或更高版本

### 本地运行

```bash
git clone https://github.com/pengyue-polaron/one-step-wrong.git
cd one-step-wrong
npm ci
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。追加 `?dev=1` 可以显示只在开发阶段使用的剧情检查点面板。

首次运行 Playwright 前执行：

```bash
npx playwright install chromium
```

## 可用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动 Next.js 开发服务器。 |
| `npm run build` | 创建优化后的生产构建。 |
| `npm run start` | 启动生产构建。 |
| `npm run lint` | 对整个仓库运行 ESLint。 |
| `npm run typecheck` | 检查 TypeScript，不生成文件。 |
| `npm test` | 单次运行 Vitest 状态与组件测试。 |
| `npm run test:watch` | 以监听模式运行 Vitest。 |
| `npm run test:e2e` | 运行 Playwright 浏览器测试。 |

## 工程结构

```text
src/
  app/                              Next.js 路由与页面元数据
  product/
    Game.tsx                        会话级案例选择与完成状态
    CaseLibrary.tsx                 可直接游玩的第一屏
    caseRegistry.ts                 所有已发布案例的唯一注册入口
  cases/
    types.ts                        通用案例模块契约
    final-submission/               深度桌面案例：界面、状态、内容、测试
    shared-draft/                   Drive 剧情定义与场景
    unexpected-push/                Duo 剧情定义与场景
  engine/decision/
    DecisionCaseRunner.tsx          通用流程编排
    reducer.ts                      纯状态转换与结局派生
    components/                     通用章节外壳与选择控件
    views/                          结果、响应与复盘页面
  components/ui/                    只包含可复用按钮原语
  styles/                           设计变量、通用样式与案例库样式
  tests/e2e/                        浏览器流程和响应式布局检查
artifacts/screenshots/              已验收的产品截图
```

注册表只依赖一个很小的 `CaseModule` 契约：案例元数据加运行组件。产品层不需要知道某一章使用通用决策引擎还是独立状态机。

项目有意保留两种章节模型：

- **决策章节**使用 `intro → decision → outcome → response? → debrief`，只提供剧情数据和该案例拥有的场景。
- **深度模拟**拥有自己的状态机与界面，但仍从同一个注册表进入产品。

架构边界、内容约束和完成检查清单见 [`AGENTS.md`](./AGENTS.md)。

## 扩展案例

1. 创建 `src/cases/<case-id>/`，提供摘要、剧情定义或状态模型、场景和测试。
2. 聚焦一次选择和复盘时使用决策引擎；只有需要多个工具、自由导航或长事件链时才建立独立 reducer。
3. 导出实现 `CaseRunnerProps` 的运行组件。
4. 只在 `src/product/caseRegistry.ts` 注册一次。
5. 补齐经过验证的剧情路线、响应式检查和验收截图。

不要在产品外壳中增加具体案例分支。工具界面和剧情文案应留在拥有它们的案例模块内。

## 质量门槛

每次变更完成前运行：

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

当前测试集包含 24 个状态/组件测试和 10 个浏览器测试。浏览器覆盖安全与事故完整路线、止损结局、1366×768 至 1920×1080 桌面布局，以及 390×844 手机流程。

## 安全与隐私

- 账号和个人信息都是固定、只读的剧情数据。
- 任何表单数据都不会被持久化或发送。
- 不使用真实 Wi-Fi、账号、证书、下载或设备 API。
- 真实服务名称和域名只作为静态界面文本出现。
- 应用不会请求 NYU、Brightspace、Google Workspace、Duo 或其他校园服务。

这些保证应落实在代码和测试中，而不是用破坏沉浸感的免责声明显示在游戏里。

## 参与贡献

欢迎提交范围明确的 Issue 和 Pull Request。请遵守 `AGENTS.md` 中的产品规则，把案例专属代码留在对应模块，并根据行为风险提供相应测试。视觉变更需要附上相关桌面和移动尺寸的前后截图。

## 已知限制

- 第一章的多窗口工作区需要至少 1100 px，因此有意只支持桌面体验。
- 桌面窗口使用固定位置，不支持自由拖拽和缩放。
- 音效由浏览器即时合成，没有背景音乐或配音。
- 当前没有后端、登录、跨会话进度、国际化框架或真实校园集成。

## 许可证

本仓库尚未发布开源许可证。在许可证加入之前，代码可以查看，但不授予复用权利。

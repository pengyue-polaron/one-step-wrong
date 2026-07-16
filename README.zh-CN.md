# 一步之差

<p>
  <a href="./README.md">English</a> ·
  <a href="./README.zh-CN.md"><strong>简体中文</strong></a>
</p>

<p>
  <img alt="CI" src="https://github.com/pengyue-polaron/one-step-wrong/actions/workflows/ci.yml/badge.svg" />
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-111827?logo=next.js" />
  <img alt="React 19" src="https://img.shields.io/badge/React-19-1f6f8b?logo=react" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white" />
  <img alt="测试" src="https://img.shields.io/badge/tests-79%20unit%20%2B%2013%20E2E-456b52" />
  <img alt="OpenAI Responses API" src="https://img.shields.io/badge/OpenAI-Responses%20API-276a69" />
</p>

**《一步之差》**是一台“数字判断力飞行模拟器”。学习者进入普通学生任务，在可信的工具界面中作出选择，经历延迟出现的后果，再通过根据实际操作生成的因果复盘理解安全知识。教师还可以使用 **Scenario Studio**，把经过审核的学校画像与教学简报编译成一场有边界、可游玩的演练。

它不是知识问答。结果发生前，任何选择都不会被标注为安全、危险、正确或推荐。

![包含三个 NYU 数字安全故事的案例库](./artifacts/screenshots/case-library.png)

## 为什么做这个项目

许多安全培训会在学习者感受到压力之前直接给出答案，《一步之差》反过来组织学习过程：

1. 先给玩家一项正常任务和可信的截止时间。
2. 把没有预警标签的选择放进任务本身。
3. 让便利路径先完成任务，再逐步显露更广的影响。
4. 要求玩家分别处理账号、设备、内容和社交影响。
5. 最后在复盘中还原完整因果链。

## OpenAI Build Week 体验

**这不是一棵固定分支的剧情树，而是一场会呼吸的安全演练。** 打开 [`/studio`](http://localhost:3000/studio) 可以体验已经实现的 Build Week 完整链路：

1. 从官方公开来源研究一所学校，或载入审核过的 NYU 来源画像。
2. 查看引用、置信度、冲突、研究警告和明确未知项；解决事实问题，逐项批准或拒绝来源，再批准 Institution Profile。
3. 向 Scenario Architect 提交一份有长度与范围限制的教学简报。
4. 对生成的世界设定、关键动作、证据、恢复步骤、结局与最多三个角色执行运行时验证。
5. 与有知识和频道边界的角色自然对话；学习者不会提前看到隐藏身份，所有高影响行为仍须通过明确的界面动作完成。
6. 到达确定性结局，并获得只依据规范化动作轨迹生成的复盘。

GPT-5.6 在演练前负责学校研究和场景编译，演练中负责有边界的角色表演，演练后负责选择基于轨迹的辅导重点。Debrief Analyst 只能返回经过验证的因果链、已执行动作、遗漏恢复动作和迁移规则 ID；最终显示文案由服务器使用规范化文本组合。Zod schema、来源校验、事件白名单、类型化状态转换和确定性结局选择拥有最终解释权。每条 OpenAI 路径都有审核过的离线回退，因此没有 API key 也能完整体验旗舰案例。

> **Agents 演出这个世界，确定性代码定义它的物理规则。**

旗舰案例 **The Voice You Know** 使用虚构的 Northbridge University，不包含真实人物、声音、付款信息或校园操作。产品规格见 [`BUILD_WEEK_PLAN.md`](./BUILD_WEEK_PLAN.md)，可复现证据和三分钟演示手册见 [`BUILD_WEEK_EVIDENCE.md`](./BUILD_WEEK_EVIDENCE.md)，已执行的架构与安全边界见 [`AGENTS.md`](./AGENTS.md)。

审核过的离线画像使用 NYU 官方公开页面作为来源，覆盖 [Brightspace](https://engineering.nyu.edu/academics/teaching-innovation/learning-management-system)、[Duo 与文件共享](https://tisch.nyu.edu/cit/information-technology/faq)、[Google Workspace](https://shanghai.nyu.edu/page/google-workspace-nyu)、[校园无线网络](https://library.nyu.edu/services/computing/on-campus/wifi/)、[钓鱼特征与上报](https://wp.nyu.edu/itsecurity/2024/08/02/salary-adjustment-acknowledgement-phishing-message/)和[学生报销材料](https://www.stern.nyu.edu/portal-partners/budget/students)。画像明确把“全校统一的付款信息变更回拨规则”保留为未知；品牌安全编译随后转换受保护的校名、域名与平台名，同时保留来源事实 ID。

默认发布方式是品牌安全虚构化。使用精确学校品牌前必须明确确认已获授权，而且确认会写入通过验证的 Institution Profile。用户提供官方域名后，模型不能把它替换为其他域名；学校来源必须位于该域名、使用 HTTPS、由服务器写入访问时间，而且 URL 必须出现在同一次 Responses Web Search 返回的工具证据中。

## 可玩案例

| 案例 | 学生任务 | 安全边界 | 体验形式 |
| --- | --- | --- | --- |
| **01 · 最后一次提交** | 在截止前恢复网络，把作业提交至 NYU Brightspace。 | 无线网络身份、域名、配置文件和账号止损。 | 深度桌面模拟，最低宽度 1100 px。 |
| **02 · 共享范围** | 给项目小组开放完成访谈核对所需的权限。 | 具体身份、链接范围、编辑权限、版本恢复和影响沟通。 | 响应式决策章节。 |
| **03 · 这次是你吗** | 在连续收到 Duo 请求时进入导师会议。 | 本人发起的登录、设备与位置、会话、恢复方式和上报。 | 响应式决策章节。 |

每个案例都有普通任务、无预警选择、必要时出现的延迟后果、逐项响应、多种结局和可重玩的因果复盘。完成进度只保留在当前浏览会话中。

## 产品截图

### Scenario Studio

![包含引用、置信度和明确未知项的 NYU Institution Profile 审核页面](./artifacts/screenshots/studio-profile.png)

<table>
  <tr>
    <td width="50%"><img alt="通过验证的 Scenario Studio 场景包" src="./artifacts/screenshots/studio-preview.png" /></td>
    <td width="50%"><img alt="有边界角色参与的实时演练" src="./artifacts/screenshots/studio-live.png" /></td>
  </tr>
  <tr>
    <td align="center">通过验证的世界、角色与关键动作</td>
    <td align="center">自适应对话与确定性操作控件</td>
  </tr>
</table>

![以证据和确定性轨迹为基础的 Studio 复盘](./artifacts/screenshots/studio-debrief.png)

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
- OpenAI Responses API、GPT-5.6、Structured Outputs 与 Web Search
- 对所有模型输出执行 Zod 运行时 schema 和跨引用验证
- 原生 CSS 设计系统，克制使用 NYU Violet
- Lucide React 图标
- 使用纯 reducer 与模拟物理层构建可复现的剧情状态
- Vitest 与 React Testing Library 状态/组件测试
- Playwright 完整流程与响应式布局测试

案例库可以完全在本地运行。配置 `OPENAI_API_KEY` 后，Scenario Studio 会调用范围受限的 Next.js 服务端路由；否则自动使用审核过的 fixture。项目不包含数据库、分析服务、账号系统、持久化或真实校园服务集成。

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

GPT-5.6 的在线研究、生成、对话和复盘是可选能力。根据 [`.env.example`](./.env.example) 创建 `.env.local`，并设置仅供服务端读取的密钥：

```bash
OPENAI_API_KEY=your_key_here
```

不要给这个密钥添加 `NEXT_PUBLIC_` 前缀。没有密钥时，在 Scenario Studio 中选择 **Load reviewed example** 即可走完离线流程。

首次运行 Playwright 前执行：

```bash
npx playwright install chromium
```

### 运行生产容器

镜像使用 Next.js standalone 输出，并以非特权用户运行。不提供 API key 时，仍可通过审核过的 fixture 完整游玩。

```bash
docker build -t one-step-wrong .
docker run --rm -p 3000:3000 one-step-wrong
```

如需启用服务端 GPT-5.6 在线路径，请在运行时注入密钥，不要把它构建进镜像：

```bash
docker run --rm -p 3000:3000 \
  -e OPENAI_API_KEY="$OPENAI_API_KEY" \
  one-step-wrong
```

### 录制 fixture 演示

应用在 3000 端口运行，并安装 Playwright Chromium 与 `ffmpeg`/`ffprobe` 后，录制脚本会自动走完审核过的 fixture 流程，并把英文字幕烧录到经过校验的 1280x720 H.264 视频中：

```bash
npm run demo:record
```

输出位于 `artifacts/demo/build-week-fixture-demo.mp4`。生成的视频文件不会进入 Git；可复用录制脚本和字幕源会保留在仓库中。视频会明确标识 fixture 与确定性输出，不能把它当成 GPT-5.6 在线调用证据。

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
| `npm run demo:record` | 自动录制并添加英文字幕的完整 fixture 演示。 |

## 工程结构

```text
src/
  app/
    api/                            仅服务端研究、生成、对话与复盘路由
    studio/                         教师工作流与旗舰案例实时预览
  ai/
    schemas/                        运行时契约、跨引用与安全验证
    research/                       Institution Research Agent 适配层
    scenarios/                      Scenario Architect 适配层
    simulation/                     Director 与角色回合边界验证
    debrief/                        依据轨迹生成复盘的适配层
  fixtures/                         审核过的画像、场景与回退对话
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
  engine/simulation/               纯关键动作、结局与规范化轨迹
  components/ui/                    只包含可复用按钮原语
  styles/                           设计变量、通用样式与案例库样式
  tests/e2e/                        浏览器流程和响应式布局检查
artifacts/screenshots/              已验收的产品截图
scripts/                            可复现的 Build Week 演示录制脚本与字幕
```

注册表只依赖一个很小的 `CaseModule` 契约：案例元数据加运行组件。产品层不需要知道某一章使用通用决策引擎还是独立状态机。Scenario Studio 是单独的创作路由，不会替换默认的可玩案例库。

项目有意保留两种章节模型：

- **决策章节**使用 `intro → decision → outcome → response? → debrief`，只提供剧情数据和该案例拥有的场景。
- **深度模拟**拥有自己的状态机与界面，但仍从同一个注册表进入产品。
- **Agentic 模拟**只接受通过运行时验证的声明式场景包。模型对话属于会话状态；只有显式、类型化的界面动作能够改变规范化状态。

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

当前测试集包含 79 个 schema、API、状态与组件测试，以及 13 个浏览器测试。覆盖范围包括可操作的画像审核、精确品牌授权、权威 hostname 校验、Web Search URL 证据、HTTPS 来源、服务端访问时间、fixture/画像原子归因、动作前置条件、受影响层恢复、规范化 ID 复盘约束、异常模型输出、prompt/凭据诱导拒绝、确定性结局、离线回退、安全与事故完整路线、1366×768 至 1920×1080 桌面布局，以及 390×844 手机流程。

## Build Week 开发说明

Codex 加速了仓库分析、架构提取、schema 与 fixture 实现、确定性引擎、API 接入、界面搭建和浏览器验证。GPT-5.6 只作为上述可选服务端路径中的产品运行时能力，绝不选择规范化动作或结局。原有基础是三个案例的案例库、通用决策引擎和深度桌面章节；Build Week 新增了 Scenario Studio、运行时 schema、审核过的 NYU 来源画像、虚构化为 Northbridge 的 **The Voice You Know**、四条服务端路由、有边界对话、确定性模拟物理层、基于轨迹的复盘与离线 fixture。

## 安全与隐私

- 账号和个人信息都是固定、只读的剧情数据。
- 创作输入和对话只在当前会话存在；仅在使用对应功能时发送给明确的服务端路由，本应用不会持久化它们。
- 不使用真实 Wi-Fi、账号、证书、下载或设备 API。
- 真实服务名称和域名只作为静态界面文本出现。
- 在线学校研究仅通过 OpenAI Web Search 访问公开资料；应用不会登录或调用校园服务。
- OpenAI 密钥只存在于服务端，请求有长度限制；模型输出无效或不可用时自动回退到审核内容。

这些保证应落实在代码和测试中，而不是用破坏沉浸感的免责声明显示在游戏里。

## 参与贡献

欢迎提交范围明确的 Issue 和 Pull Request。请遵守 `AGENTS.md` 中的产品规则，把案例专属代码留在对应模块，并根据行为风险提供相应测试。视觉变更需要附上相关桌面和移动尺寸的前后截图。

## 已知限制

- 第一章的多窗口工作区需要至少 1100 px，因此有意只支持桌面体验。
- 桌面窗口使用固定位置，不支持自由拖拽和缩放。
- 音效由浏览器即时合成，没有背景音乐或配音。
- 当前没有登录、数据库、跨会话进度、协作系统、国际化框架或真实校园集成。
- 在线 GPT-5.6 能力需要有效 API key 和网络；没有二者时仍可通过 fixture 完成评审路径。

## 许可证

本仓库尚未发布开源许可证。在许可证加入之前，代码可以查看，但不授予复用权利。

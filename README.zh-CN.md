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
  <img alt="测试" src="https://img.shields.io/badge/tests-146%20unit%20%2B%2023%20E2E-456b52" />
  <img alt="OpenAI Responses API" src="https://img.shields.io/badge/OpenAI-Responses%20API-276a69" />
  <img alt="MIT License" src="https://img.shields.io/badge/license-MIT-6b7280" />
</p>

**《一步之差》**是一台“数字判断力飞行模拟器”。学习者进入普通学生任务，在可信的工具界面中作出选择，经历延迟出现的后果，再回看自己的操作如何影响结果。教师可以使用 **Scenario Studio**，把审核通过的学校指导与教学简报做成可游玩的演练。

它不是知识问答。结果发生前，任何选择都不会被标注为安全、危险、正确或推荐。

![包含三个审核互动演练和两个归档章节的案例库](./artifacts/screenshots/case-library.png)

案例库把三个审核演练组织成清楚的 01–03 学习路径，再单独呈现早期归档案例和仅限当前会话的完成状态。

## 体验完整闭环

审核过的产品路径不需要 API key：

1. 打开 [`/rehearsal`](http://localhost:3000/rehearsal)，完成至少一个任务动作。
2. 结束演练，查看因果复盘。
3. 在阅读内置迁移规则前，选择 **Test in a new situation**。
4. 针对本次已经发现的证据向 Evidence Coach 提问。
5. 打开教师报告，查看动作顺序、最终状态、讨论流程和审核过的来源指导。

教师随后可以打开 [`/studio`](http://localhost:3000/studio)，依次选择 **Use example institution**、批准审核画像，再选择 **Use example rehearsal**，在不提供外部凭据的情况下体验从创作到教学讨论的完整流程。

## 为什么做这个项目

许多安全培训会在学习者感受到压力之前直接给出答案，《一步之差》反过来组织学习过程：

1. 先给玩家一项正常任务和可信的截止时间。
2. 把没有预警标签的选择放进任务本身。
3. 让便利路径先完成任务，再逐步显露更广的影响。
4. 要求玩家分别处理账号、设备、内容和社交影响。
5. 最后在复盘中还原完整因果链。

## Scenario Studio

打开 [`/studio`](http://localhost:3000/studio)，可以根据公开学校指导和教学简报制作一场演练：

1. 从官方公开来源研究一所学校，或载入审核过的 NYU 来源画像。
2. 审核引用、冲突、研究警告和未解决问题，再批准学校环境。
3. 定义受众、普通任务、压力、威胁和学习目标。
4. 查看审核通过的事实如何进入虚构化学生场景，再检查角色、动作、恢复步骤和可能结局。
5. 进入演练，在工作区中完成任务和检查动作。
6. 回看本次选择、证据、后果和恢复过程。
7. 把同一条判断规则用到另一个任务中。

学习者可以打开 [`/rehearsal`](http://localhost:3000/rehearsal) 进入 **The Voice You Know**，打开 [`/rehearsal/sharing-scope`](http://localhost:3000/rehearsal/sharing-scope) 进入 **Sharing Scope**，或打开 [`/rehearsal/recovery-window`](http://localhost:3000/rehearsal/recovery-window) 进入 **Recovery Window**。Evidence Coach 只根据本次已经发现的证据和审核通过的学校指导回答追问。教师报告把动作顺序、结束状态、证据、讨论问题和来源链接整理到一个可打印页面中。

自适应生成和对话是可选能力。关键任务动作和结局始终来自学习者已经完成的选择。没有 Platform API key 时，演练直达入口和 **Use example...** 路径仍可正常使用；本地开发也可以使用已登录的 Codex 为教学简报匹配审核场景、调整标题与短标语，并完成对话与复盘。实时来源研究仍然需要 Platform API。

> **对话可以变化，后果由学习者完成的动作决定。**

三个审核演练都使用虚构的 Northbridge University，不包含真实人物、付款信息、私人文档或校园操作。产品方向见 [`PRODUCT_PLAN.md`](./PRODUCT_PLAN.md)，可复现质量证据见 [`QUALITY_EVIDENCE.md`](./QUALITY_EVIDENCE.md)，架构与安全边界见 [`AGENTS.md`](./AGENTS.md)。

如需直接组织一次 10–35 分钟课堂或工作坊活动，可以使用双语 [`FACILITATOR_GUIDE.zh-CN.md`](./FACILITATOR_GUIDE.zh-CN.md)。

内置 NYU 画像引用了学校关于 [Brightspace](https://engineering.nyu.edu/academics/teaching-innovation/learning-management-system)、[Duo 与文件共享](https://tisch.nyu.edu/cit/information-technology/faq)、[Google Workspace](https://shanghai.nyu.edu/page/google-workspace-nyu)、[校园无线网络](https://library.nyu.edu/services/computing/on-campus/wifi/)、[伪造发件人识别与钓鱼上报](https://cims.nyu.edu/dynamic/systems/userservices/mail/)和[学生报销材料](https://www.stern.nyu.edu/portal-partners/budget/students)的公开页面。因为没有找到全校统一的付款信息变更回拨规则，画像把这个问题保留为未解决。虚构化发布会替换受保护的校名、域名与平台名，同时保留来源链接。

默认发布方式是品牌安全虚构化。使用精确学校品牌前必须明确确认已获授权，而且确认会写入通过验证的 Institution Profile。用户提供官方域名后，模型不能把它替换为其他域名；学校来源必须位于该域名、使用 HTTPS、由服务器写入访问时间，而且 URL 必须出现在同一次 Responses Web Search 返回的工具证据中。

## 可玩案例

| 案例 | 学生任务 | 安全边界 | 体验形式 |
| --- | --- | --- | --- |
| **The Voice You Know** | 在熟悉声音要求变更付款信息时完成嘉宾报销。 | 独立验证、付款状态、工作区访问和分层恢复。 | 审核过的 Agentic 演练，支持响应式布局。 |
| **Sharing Scope** | 给三位纪录片项目成员开放核对访谈引文所需的权限。 | 具名对象、权限级别、可转发链接、内容恢复和泄露响应。 | 审核过的 Agentic 演练，支持响应式布局。 |
| **Recovery Window** | 给晚间制作人开放修改直播排期所需的访问。 | 任务访问、账号恢复权限、设备绑定、会话检查和撤销。 | 审核过的 Agentic 演练，支持响应式布局。 |
| **最后一次提交** | 在截止前恢复网络，把作业提交至 NYU Brightspace。 | 无线网络身份、域名、配置文件和账号止损。 | 深度桌面模拟，最低宽度 1100 px。 |
| **这次是你吗** | 在连续收到 Duo 请求时进入导师会议。 | 本人发起的登录、设备与位置、会话、恢复方式和上报。 | 响应式决策章节。 |

每个案例都有普通任务、无预警选择、必要时出现的延迟后果、逐项响应、多种结局和可重玩的因果复盘。归档案例的完成状态只保留在当前浏览会话中；审核演练不会持久化学习者状态。

## 产品截图

### Scenario Studio

![包含引用、置信度和未解决问题的 NYU Institution Profile 审核页面](./artifacts/screenshots/studio-profile.png)

<table>
  <tr>
    <td width="50%"><img alt="通过验证的 Scenario Studio 场景包" src="./artifacts/screenshots/studio-preview.png" /></td>
    <td width="50%"><img alt="实时角色演练" src="./artifacts/screenshots/studio-live.png" /></td>
  </tr>
  <tr>
    <td align="center">通过验证的世界、角色与关键动作</td>
    <td align="center">由动作解锁的渠道与明确的学习者动作</td>
  </tr>
</table>

![不同验证渠道会在演练中揭示不同证据](./artifacts/screenshots/studio-evidence.png)

![根据学习者实际操作生成的 Studio 复盘](./artifacts/screenshots/studio-debrief.png)

![Evidence Coach 解释一个验证渠道实际证明了什么、没有证明什么](./artifacts/screenshots/studio-coach.png)

![通过新情境检验判断规则是否真正迁移](./artifacts/screenshots/studio-transfer.png)

![连接演练证据、迁移结果和审核指导的教师报告](./artifacts/screenshots/facilitator-report.png)

### 情境中的选择

<table>
  <tr>
    <td width="50%"><img alt="Campus Drive 工作区中的 Sharing Scope 公开链接事件" src="./artifacts/screenshots/sharing-scope-incident.png" /></td>
    <td width="50%"><img alt="意外 Duo 请求选择" src="./artifacts/screenshots/duo-request.png" /></td>
  </tr>
  <tr>
    <td align="center">任务工作区中的访问对象与权限范围</td>
    <td align="center">Duo 登录确认</td>
  </tr>
</table>

### 因果复盘

![把链接选择、活动证据、分层恢复和迁移规则连接起来的 Sharing Scope 复盘](./artifacts/screenshots/sharing-scope-debrief.png)

### 账号恢复权限

![Recovery Window 中的交接设备获得恢复权限并打开新会话](./artifacts/screenshots/recovery-window-incident.png)

### 响应式章节

<table>
  <tr>
    <td width="50%"><img alt="手机上的案例库" src="./artifacts/screenshots/mobile-case-library.png" /></td>
    <td width="50%"><img alt="手机上的 Recovery Window 任务工作区" src="./artifacts/screenshots/mobile-recovery-window.png" /></td>
  </tr>
  <tr>
    <td width="50%"><img alt="手机上的 Sharing Scope 对话工作区" src="./artifacts/screenshots/mobile-sharing-conversation.png" /></td>
    <td width="50%"><img alt="手机上的教师报告" src="./artifacts/screenshots/mobile-facilitator-report.png" /></td>
  </tr>
</table>

## 技术栈

- Next.js 16、React 19 和严格模式 TypeScript
- OpenAI Responses API、Structured Outputs 与 Web Search
- OpenAI Codex SDK，用于本地开发的场景匹配、文案调整、对话与复盘
- 对所有模型输出执行 Zod 运行时 schema 和跨引用验证
- 使用状态空间遍历检查场景声明的每一种结局是否可达
- 原生 CSS 设计系统，根据案例使用不同学校环境配色
- Lucide React 图标
- 使用纯 reducer 与模拟物理层构建可复现的剧情状态
- Vitest 与 React Testing Library 状态/组件测试
- Playwright 与 Axe 完整流程、键盘焦点、自动无障碍和响应式布局测试
- 不含学习者级记录的场次汇总试用工具

案例库和三个完整的审核演练都可以在本地运行。Scenario Studio 只通过范围受限的 Next.js 服务端路由调用自适应能力。`OPENAI_API_KEY` 可启用包含来源研究与完整场景编译在内的路径；显式启用的本地 Codex 会话会选择最贴近简报的审核拓扑、调整标题与短标语，并在开发环境承担对话和复盘，但绝不伪造学校研究引用或重写验证过的动作逻辑。项目不包含数据库、分析服务、账号系统、持久化或真实校园服务集成。

## 技术证据

AI 用于五项工作：

1. 使用来源证据研究官方公开的学校指导。
2. 把已批准的画像与教学简报编译成通过验证的场景包。
3. 在固定身份、知识范围、渠道和允许事件内生成角色对话。
4. 只从已记录动作中选择通过验证的复盘元素。
5. 只使用已发现证据和审核通过的来源事实回答追问。

模型不执行关键动作，不修改付款、访问或内容状态，不选择结局，也不评估学习者的迁移动作。这些决定保留在 [`src/engine/simulation/physics.ts`](./src/engine/simulation/physics.ts)。运行时验证位于 [`src/ai/schemas`](./src/ai/schemas)，模型适配器位于 [`src/ai`](./src/ai)，浏览器请求通过 [`src/app/api`](./src/app/api) 中的服务端路由。

生成演练在启动前，会由 [`src/engine/simulation/coverage.ts`](./src/engine/simulation/coverage.ts) 使用正式游玩规则检查可能的动作组合。审核语音案例会检查 248 种组合，Sharing Scope 会检查 29 种，Recovery Window 会检查 46 种。只要有一种结局无法到达，生成就会停止；教师预览会显示每种结局的一条可玩路径。

恢复动作只会在事故已经显现后出现，每一个受影响层都需要单独处理。旗舰案例里，付款批准会先表现为成功，后续状态复查才揭示异常；完成控制还必须单独请求财务冻结。对话渠道只有在学习者打开后才出现，后续回复也会留在当前选中的角色频道。

每个审核演练最后都会提供第二个情境，让学习者把同一条规则用到不同任务中。它只是形成性检查，不是学习效果证明。

运行 `npm run verify:ai` 可以检查模型边界和 API。启动本地服务并配置 `OPENAI_API_KEY` 后，运行 `npm run verify:live` 可以检查研究、生成、角色对话、复盘和 Evidence Coach 的实时结果。启用本地 Codex 适配器后，运行 `npm run verify:codex` 可以检查场景匹配、文案调整、对话、复盘和 Evidence Coach；该模式不提供来源研究。

## 开发过程

产品方向始终由维护者决定：使用演练而不是问答、结果发生前不标记选择、保留延迟后果、让高影响动作由确定性代码处理、发布前审核来源、在学习者界面中使用虚构学校，以及不追踪学习者。这些决策共同定义了学习模型与信任边界。

Codex 作为实现伙伴参与了整个仓库的开发，加速了架构调整、场景与 reducer 实现、schema 和边界测试、响应式修复、浏览器流程、无障碍检查、文案审阅与文档整理。维护者持续从学习者和教师视角检查实际运行结果，决定产品取舍，删除破坏沉浸感的安全提示，并确保模型输出不会直接改变规范状态。

GPT-5.6 用于可选的自适应路径：通过 Responses API 完成带来源证据的学校研究、生成通过验证的场景、提供受限角色对话、从操作记录中选择复盘材料，以及进行基于证据的追问辅导。所有模型输出都必须通过 Zod 运行时边界；动作、后果、恢复、迁移和结局仍由确定性模拟引擎决定。

主要 Codex 开发线程是 `019f66ce-a05a-7573-b1b3-b57c5051fa10`。带日期的 Git 提交与 [`QUALITY_EVIDENCE.md`](./QUALITY_EVIDENCE.md) 中的可复现检查共同构成对应的实现记录。

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

自适应研究、生成、对话和复盘是可选能力。如需完整 Platform 路径，根据 [`.env.example`](./.env.example) 创建 `.env.local`，并设置仅供服务端读取的密钥：

```bash
OPENAI_API_KEY=your_key_here
```

不要给这个密钥添加 `NEXT_PUBLIC_` 前缀。

应用拥有正式公开地址后，还应设置 `SITE_URL`，让 Open Graph 等绝对地址元数据指向正确来源：

```dotenv
SITE_URL=https://example.com
```

暂时没有 Platform API 权限时，可以先登录 Codex，并显式启用仅供本地开发使用的适配器：

```bash
codex login
```

```dotenv
CODEX_LOCAL_PROVIDER=1
# 可选；留空时使用当前 Codex 账号的默认模型。
CODEX_LOCAL_MODEL=gpt-5.6-sol
```

模型可用性取决于账号。这个适配器通过 Codex SDK 启动本地结构化输出进程；`NODE_ENV=production` 时会被忽略，并在临时只读工作区中关闭 Web Search。不要把它暴露为公开或多用户服务。使用这一模式时，先选择 **Use example institution**，再点击 **Create rehearsal**，系统会在三个验证过的判断模式中匹配并调整可见标题与短标语；带来源证据的学校研究和不受模板约束的拓扑生成仍需要 `OPENAI_API_KEY`。

首次运行 Playwright 前执行：

```bash
npx playwright install chromium
```

### 运行生产容器

镜像使用 Next.js standalone 输出，并以非特权用户运行。不提供 API key 时，仍可通过明确的审核示例路径完整游玩。

```bash
docker build -t one-step-wrong .
docker run --rm -p 3000:3000 one-step-wrong
```

如需启用可选的服务端自适应路径，请在运行时注入密钥，不要把它构建进镜像：

```bash
docker run --rm -p 3000:3000 \
  -e OPENAI_API_KEY="$OPENAI_API_KEY" \
  one-step-wrong
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
| `npm run verify:ai` | 运行聚焦于 AI schema、边界、适配器和 API 的测试。 |
| `npm run verify:codex` | 对运行中的开发服务要求真实本地 Codex 匹配/调整、对话、复盘与教练结果。 |
| `npm run verify:live` | 在运行中的服务上要求全部自适应路径返回实时来源。 |
| `npm run pilot:analyze -- <文件>` | 校验并汇总只含场次计数的试用数据。 |

## 工程结构

```text
src/
  app/
    api/                            仅服务端研究、生成、对话、复盘与教练路由
    rehearsal/                      审核演练的学习者直达路由
    studio/                         教师工作流、受保护标签编辑器与通用演练界面
  ai/
    schemas/                        运行时契约、跨引用与安全验证
    providers/                      Platform 选择与隔离的本地 Codex 适配层
    research/                       Institution Research Agent 适配层
    scenarios/                      Scenario Architect 适配层
    simulation/                     Director 与角色回合边界验证
    debrief/                        根据操作记录生成复盘与 Evidence Coach 的适配层
  fixtures/                         审核过的画像/场景原子包与对话内容
  product/
    Game.tsx                        会话级案例选择与完成状态
    CaseLibrary.tsx                 可直接游玩的第一屏
    caseRegistry.ts                 旧章节注册表
    reviewedRehearsals.ts           轻量审核演练目录
  cases/
    types.ts                        通用案例模块契约
    final-submission/               深度桌面案例：界面、状态、内容、测试
    shared-draft/                   已归档的早期共享原型
    unexpected-push/                Duo 剧情定义与场景
  engine/decision/
    DecisionCaseRunner.tsx          通用流程编排
    reducer.ts                      纯状态转换与结局派生
    components/                     通用章节外壳与选择控件
    views/                          结果、响应与复盘页面
  engine/simulation/               状态转换、动作记录、迁移与结局检查
  components/ui/                    只包含可复用按钮原语
  styles/                           设计变量、通用样式与案例库样式
  tests/e2e/                        浏览器流程、无障碍和响应式检查
pilot/                              只含场次汇总的形成性试用协议
artifacts/screenshots/              已验收的产品截图
```

旧章节只依赖一个很小的 `CaseModule` 契约：案例元数据加运行组件。审核过的 Agentic 演练则以画像/场景原子包按 ID 选择，并通过同一套界面运行。Scenario Studio 是单独的创作路由，不会替换默认的可玩案例库。

项目有意保留三种章节模型：

- **决策章节**使用 `intro → decision → outcome → response? → debrief`，只提供剧情数据和该案例拥有的场景。
- **深度模拟**拥有自己的状态机与界面，但仍从同一个注册表进入产品。
- **Agentic 模拟**只接受通过运行时验证的声明式场景包。模型对话属于会话状态；只有显式、类型化的界面动作能够改变规范化状态。

架构边界、内容约束和完成检查清单见 [`AGENTS.md`](./AGENTS.md)。

## 扩展案例库

新增审核过的 Agentic 演练时：

1. 添加通过验证的场景 fixture，并在 `src/fixtures/reviewedScenarioRegistry.ts` 中与已批准画像组成原子包。
2. 在 `src/product/reviewedRehearsals.ts` 注册学习者目录元数据，并通过共享静态路由开放。
3. 补齐 schema、可达性、物理层、直达路由、浏览器流程、响应式和截图覆盖。

新增旧式决策章节或深度章节时：

1. 创建 `src/cases/<case-id>/`，提供摘要、剧情定义或状态模型、场景和测试。
2. 聚焦流程使用决策引擎；只有需要多个工具、自由导航或长事件链时才建立独立 reducer。
3. 导出实现 `CaseRunnerProps` 的运行组件，并只在 `src/product/caseRegistry.ts` 注册一次。

不要在产品外壳中增加具体案例分支。

## 质量门槛

每次变更完成前运行：

```bash
npm run lint
npm run typecheck
npm test
npm run verify:ai
npm run build
npm run test:e2e
```

当前测试集包含 146 个 schema、API、状态与组件测试，以及 23 个浏览器测试。覆盖三个审核演练、Studio 审核与编辑、动作和恢复规则、四种结局、Evidence Coach 引用、教师报告、无障碍检查、生产构建、桌面布局和 390x844 手机流程。产品主张与测试的对应关系见 [`QUALITY_EVIDENCE.md`](./QUALITY_EVIDENCE.md)。

## 安全与隐私

- 账号和个人信息都是固定、只读的剧情数据。
- 创作输入和对话只在当前会话存在；仅在使用对应功能时发送给明确的服务端路由，本应用不会持久化它们。
- 不使用真实 Wi-Fi、账号、证书、下载或设备 API。
- 真实服务名称和域名只作为静态界面文本出现。
- 在线学校研究仅通过 OpenAI Web Search 访问公开资料；应用不会登录或调用校园服务。
- OpenAI 密钥只存在于服务端，请求有长度限制。本地 Codex 适配器使用隔离的临时运行状态，也不会代替来源研究。对话或复盘输出无效时只使用同场景审核内容；研究和生成失败会返回清楚错误，不替换教师输入。

这些保证应落实在代码和测试中，而不是用破坏沉浸感的免责声明显示在游戏里。

## 参与贡献

欢迎提交范围明确的 Issue 和 Pull Request。请遵守 `AGENTS.md` 中的产品规则，把案例专属代码留在对应模块，并根据行为风险提供相应测试。视觉变更需要附上相关桌面和移动尺寸的前后截图。协作约定见 [`CONTRIBUTING.md`](./CONTRIBUTING.md)，私下报告安全问题的方法见 [`SECURITY.md`](./SECURITY.md)。

仓库媒体来源说明见 [`ASSET_NOTES.md`](./ASSET_NOTES.md)。调整仓库可见性前，请按 [`RELEASE_CHECKLIST.md`](./RELEASE_CHECKLIST.md) 完成检查。

## 已知限制

- **Final Submission** 的多窗口工作区需要至少 1100 px，因此有意只支持桌面体验。
- 桌面窗口使用固定位置，不支持自由拖拽和缩放。
- Final Submission 会即时合成短界面音效，The Voice You Know 包含一段本地合成语音；项目不克隆真人声音，也不调用运行时文字转语音服务。
- 当前没有登录、数据库、跨会话进度、协作系统、运行时国际化框架或真实校园集成。
- 带来源证据的在线研究和完整拓扑生成需要有效 Platform API key 和网络。本地 Codex 可以在开发环境匹配并调整审核拓扑，并承担运行时自适应路径；明确的审核示例始终是可移植的完整基线。

## 许可证

本项目使用 [MIT License](./LICENSE)。

# 一步之差

<p>
  <a href="./README.md">English</a> ·
  <a href="./README.zh-CN.md"><strong>简体中文</strong></a>
</p>

[![CI](https://github.com/pengyue-polaron/one-step-wrong/actions/workflows/ci.yml/badge.svg)](https://github.com/pengyue-polaron/one-step-wrong/actions/workflows/ci.yml)

**一台训练数字判断力的“飞行模拟器”。**

《一步之差》把学生放进可信的数字任务中：看似方便的选择可能在稍后产生后果。学习者先行动，再逐层处理影响，最后回看完整因果链，并在一个新的情境中再次运用同一项判断。

它不是知识问答。结果发生前，任何选择都不会被标注为安全、危险、正确或推荐。

**[体验线上版本](https://one-step-wrong.pengyue.space)** · **[观看 2 分 38 秒 Demo](https://youtu.be/4Tbf2Icpybw)**

完整的审核学习路径不需要 API key。

![包含三个审核演练和独立归档区的案例库](./artifacts/screenshots/case-library.png)

## 产品能力

- 把没有预警标签的选择嵌入普通学生工作流。
- 先让压力和便利感成立，再让后果逐步出现。
- 将止损拆分为付款、访问、账号、内容和上报等具体动作。
- 用因果复盘还原发生了什么，而不是把体验简化成一个分数。
- 在揭示教学规则前，用第二个不同情境检验学习迁移。
- 根据学习者实际完成的动作生成可直接讨论的教师报告。

**Scenario Studio** 允许教师把审核通过的公开指导与教学简报组合起来，先检查学校画像和场景包，再启动可玩的演练。公开分享的场景默认使用虚构学校和通用工具。

## 审核学习路径

| 顺序 | 演练 | 学生任务 | 训练的判断 |
| --- | --- | --- | --- |
| **01** | **The Voice You Know** | 在熟悉声音要求变更付款信息时完成嘉宾报销。 | 独立验证、付款状态、工作区访问和分层恢复。 |
| **02** | **Sharing Scope** | 给纪录片项目成员开放核对访谈引文所需的访问。 | 具名对象、权限范围、可转发链接、内容恢复和披露响应。 |
| **03** | **Recovery Window** | 给晚间制作人开放修改直播排期所需的访问。 | 任务访问与账号恢复权限、设备绑定、会话检查和撤销。 |

早期的 **最后一次提交** 和 **这次是你吗** 仍保留在独立归档区。归档案例的完成状态只存在于当前会话中，也不会被展示成审核学习路径的进度。

<table>
  <tr>
    <td width="50%"><img alt="Scenario Studio 已验证场景包预览" src="./artifacts/screenshots/studio-preview.png" /></td>
    <td width="50%"><img alt="包含明确学习者动作的实时角色演练" src="./artifacts/screenshots/studio-live.png" /></td>
  </tr>
  <tr>
    <td align="center">启动前由教师审核</td>
    <td align="center">在任务工作区中完成选择</td>
  </tr>
</table>

## GPT-5.6 在哪里发挥作用

GPT-5.6 通过 OpenAI Responses API 驱动可选的自适应层：

1. 根据公开来源证据研究学校指导。
2. 将审核通过的画像和教学简报编译成通过 Schema 验证的场景。
3. 在固定身份、知识范围、渠道和允许事件内生成角色对话。
4. 从已记录的动作轨迹中选择复盘材料。
5. 仅使用已发现证据和审核通过的来源回答 Evidence Coach 问题。

模型不会执行关键动作、改变付款或访问状态、选择结局，也不会替学习者完成迁移判断。这些结果由 [`src/engine/simulation/physics.ts`](./src/engine/simulation/physics.ts) 中的确定性模拟引擎产生。所有模型输出都必须通过 [`src/ai/schemas`](./src/ai/schemas) 中的运行时契约。

> 对话可以变化，后果由学习者完成的动作决定。

## 形成性用户测试

20 名大学本科生参加了这套系统的形成性测试：

- **100%** 认为它对大学安全教育有价值。
- **95%** 表示自己学到了新知识。

这些结果来自一个小规模便利样本，并且是参与者自我报告。它们可以作为早期产品证据，但不能替代对学习效果的对照实验。仅保存汇总数据的测试流程与分析器位于 [`pilot/`](./pilot/)。

## 本地运行

环境要求：Node.js 22.12+、npm 10+。

```bash
git clone https://github.com/pengyue-polaron/one-step-wrong.git
cd one-step-wrong
npm ci
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。三个审核演练和 Studio 的 **Use example...** 路径不需要任何外部凭据。

### 启用 OpenAI Platform 完整路径

根据 [`.env.example`](./.env.example) 创建 `.env.local`，并添加只供服务端使用的 key：

```dotenv
OPENAI_API_KEY=your_key_here
SITE_URL=http://localhost:3000
```

不要通过 `NEXT_PUBLIC_*` 变量暴露 key。设置 `OPENAI_API_KEY` 后，可以使用带来源的研究、完整场景生成、自适应对话、复盘选择和 Evidence Coach。

### 可选的本地 Codex 开发路径

开发时，已登录的本地 Codex 会话可以把教学简报匹配到审核场景，并提供有边界的文案、对话和复盘：

```bash
codex login
```

```dotenv
CODEX_LOCAL_PROVIDER=1
```

该后备路径在生产环境中禁用，也不能执行学校来源研究。OpenAI Platform API 仍是完整的自适应路径。

## 架构

```text
src/
  app/studio/          教师创作、审核、演练和报告
  app/rehearsal/       三个审核演练的学习者直达路由
  app/api/             有边界的服务端 OpenAI 路由
  ai/                  Prompt、Provider、运行时 Schema 和防护
  fixtures/            审核过的学校与场景原子包
  engine/simulation/   确定性动作、后果、轨迹与结局
  product/             案例库与审核学习路径目录
  cases/               各案例自己的内容、状态、界面与测试
  tests/e2e/            浏览器流程、无障碍与布局检查
```

系统有一条明确的信任边界：模型可以提出通过验证的文本与事件 ID，只有学习者完成的类型化动作能够改变权威状态。项目没有数据库、学习者账号、分析系统或真实校园服务集成。

产品与 AI 架构见 [`PRODUCT_PLAN.md`](./PRODUCT_PLAN.md)，产品声明与测试映射见 [`QUALITY_EVIDENCE.md`](./QUALITY_EVIDENCE.md)，10–35 分钟课堂用法见 [`FACILITATOR_GUIDE.zh-CN.md`](./FACILITATOR_GUIDE.zh-CN.md)。

## 质量检查

```bash
npm run lint
npm run typecheck
npm test
npm run verify:ai
npm run build
npm run test:e2e
```

当前测试套件包含 151 个 Schema、API、状态和组件测试，以及 23 个浏览器测试，覆盖三个审核演练、所有声明结局、恢复规则、Evidence Coach 引用、迁移检查、键盘操作、Axe 检查，以及从 390×844 到 1920×1080 的布局。

## 安全与隐私

- OpenAI 凭据只存在于服务端；应用不会记录 Prompt、对话或动作轨迹。
- 创作输入和学习者对话只存在于当前会话，不会写入 Cookie、本地存储、分析系统或数据库。
- 关键状态变化全部是由确定性代码处理的明确类型化动作。
- 学校研究仅限公开官方来源，不访问登录门户或真实校园服务。
- 审核场景使用虚构的 Northbridge University、通用产品和固定故事数据。

## 已知限制

- 带来源的学校研究和完整场景生成需要有效的 OpenAI Platform API key 与网络连接。
- 归档中的 **最后一次提交** 深度模拟需要至少 1100 px 宽的桌面视口。
- 项目没有登录、持久化进度、多人协作、运行时本地化或真实校园集成。
- 当前用户测试是形成性、自我报告结果；要衡量学习效果仍需要更大规模的对照研究。

## 贡献与许可

欢迎贡献。提交前请阅读 [`CONTRIBUTING.md`](./CONTRIBUTING.md)，安全问题请通过 [`SECURITY.md`](./SECURITY.md) 报告，公开发布前请检查 [`RELEASE_CHECKLIST.md`](./RELEASE_CHECKLIST.md)。

项目采用 [MIT License](./LICENSE)。

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';

// ── Constants ─────────────────────────────────────────────────────────────────

const CN = ['一','二','三','四','五','六','七','八'];
const AB = ['A','B','C','D','E'];

const ACADEMIES = {
  anthropic: {
    id: 'anthropic', name: 'Anthropic 学院', letter: 'A', accent: '#D97757',
    kicker: 'ANTHROPIC ACADEMY · 中文学习版',
    headline: '和 Claude 一起，从入门到精通',
    intro: '6 门免费课程：从零基础用好 Claude，到亲手构建 MCP、Agent Skills 和 Subagents。全程中文讲解，关键术语保留英文。挑一门开始吧。',
  },
  openai: {
    id: 'openai', name: 'OpenAI 学院', letter: 'O', accent: '#10A37F',
    kicker: 'OPENAI ACADEMY · 中文学习版',
    headline: '掌握 AI，从基础到智能体',
    intro: '3 门 OpenAI Academy 基础课程：先打牢 AI 的概念地基，再学会把它应用到真实工作，最后构建会自己干活的 Agents 与工作流。全程中文讲解。',
  },
};

function buildAnthropicCourses() {
  return [
    { id: 'claude101', title: 'Claude 101', en: 'Claude 101', level: '入门', academy: 'anthropic',
      desc: '用 Claude 处理日常工作：写作、总结、头脑风暴、整理资料。零基础友好。',
      longDesc: '这是一门面向零基础的入门课。不需要任何技术背景，跟着学完，你就能把 Claude 用在每天的工作里——写作、总结、头脑风暴、整理资料，都能交给它。',
      modules: [
        { id: 'm1', title: '认识 Claude', en: 'Meet Claude', locked: false, lessons: [
          { id: 'l1', title: '什么是 Claude？', blocks: [
            { t: 'lead', text: 'Claude 是由 Anthropic 开发的 AI 助手。你可以像和一位知识渊博的同事聊天那样，用日常语言向它提问、请它帮忙——它能理解你的意思，并用文字回应你。' },
            { t: 'h', text: 'Claude 能帮你做什么' },
            { t: 'list', items: ['写作与润色：邮件、报告、文案、演讲稿','总结与提炼：把长文档、会议记录浓缩成要点','头脑风暴：为方案、活动、命名提供创意','翻译与跨语言沟通','分析数据、解释概念、辅助你做判断','写代码、查错、解释技术问题'] },
            { t: 'callout', variant: 'note', tag: '注意', text: 'Claude 不是搜索引擎。它擅长理解、推理和创作，而不是实时查询最新新闻或股价。当你需要处理某份资料时，把资料贴给它，让它帮你读、帮你写，效果最好。' },
            { t: 'h', text: '它和普通软件有什么不同' },
            { t: 'p', text: '传统软件需要你点按钮、填表格，按固定流程操作。和 Claude 协作时，你只要用自然语言说出想要什么，它就会理解并完成——没有菜单，没有固定步骤，对话本身就是界面。' },
            { t: 'quiz', q: '下面哪一项最适合交给 Claude 来做？', options: ['查询此刻北京的实时天气','把一份 20 页的报告总结成 5 个要点','帮我把 1000 元转账给同事','远程控制家里的空调'], answer: 1, explain: 'Claude 最擅长理解和处理你提供的内容，比如总结、写作、分析。实时天气、转账、控制设备这类任务需要专门的工具或最新数据，不是 Claude 的强项。' },
            { t: 'task', title: '发出你的第一条消息', steps: ['打开浏览器，访问 claude.ai 并注册一个免费账号','在底部的输入框里输入：你好，请用三句话介绍一下你自己','按回车发送，读一读 Claude 的回复'] },
          ]},
          { id: 'l2', title: '与 Claude 的第一次对话', blocks: [
            { t: 'lead', text: '和 Claude 的互动就是一场对话：你发一条消息，它回一条，你可以继续追问、补充、修改要求。理解这个「来回」的节奏，是用好 Claude 的第一步。' },
            { t: 'h', text: '一轮对话长什么样' },
            { t: 'p', text: '在输入框里写下你的请求，按回车发送，这就是一条「消息」。Claude 会立刻开始回复。你们的每一次来回都留在同一个对话里，Claude 记得前面说过的内容，所以你不必每次都从头交代背景。' },
            { t: 'callout', variant: 'tip', tag: '提示', text: '把 Claude 当成一位聪明但刚入职的同事：它很能干，但并不了解你的具体情况。你给的背景越清楚，它帮得越准。' },
            { t: 'h', text: '不满意？继续追问就好' },
            { t: 'p', text: '第一次回复很少是完美的，这很正常。你不需要重新开始，只要像和同事沟通一样接着说：「再正式一点」「太长了，压缩到 100 字」「加一个具体例子」。Claude 会在原来的基础上修改。' },
            { t: 'prompt', text: '帮我写一封请假邮件，发给我的经理。\n\n背景：我下周三因为家里有事需要请一天假，手头的工作会提前安排好。\n语气：礼貌、简洁、专业。' },
            { t: 'quiz', q: '对 Claude 的第一次回复不满意时，最好的做法是？', options: ['删掉对话，从头重新开始','在同一个对话里直接告诉它哪里要改','算了，自己动手改','换一个别的 AI 试试'], answer: 1, explain: '在同一对话里追问，Claude 能记住上下文并在原基础上修改，这正是对话式协作最大的优势。' },
            { t: 'task', title: '练习一次多轮对话', steps: ['请 Claude 帮你写一段 50 字的自我介绍','收到后，回复「太正式了，轻松活泼一点」','再回复「加一句我喜欢的爱好」，观察它如何逐步调整'] },
          ]},
          { id: 'l3', title: '获得更好的结果', blocks: [
            { t: 'lead', text: '同样一个问题，提问方式不同，答案质量差别很大。好消息是：写出好提示词（Prompt）不需要任何技巧术语，只要把四件事说清楚。' },
            { t: 'h', text: '好提示词的四要素' },
            { t: 'list', items: ['角色：让 Claude 扮演什么身份，例如「你是一位资深 HR」','任务：你具体想要它做什么，越明确越好','上下文：相关背景、限制条件、受众是谁','格式：你想要的输出长什么样，例如列表、表格、限定字数'] },
            { t: 'callout', variant: 'key', tag: '重点', text: '你不需要每次都写全这四点。简单任务一句话就够；任务越复杂、越重要，多补充的信息就越能帮你拿到好结果。' },
            { t: 'h', text: '对比一下' },
            { t: 'p', text: '模糊的提问：「帮我写个活动方案」。清楚的提问见下方示例——它指定了角色、任务、背景和格式，Claude 就能给出可以直接拿去用的结果。' },
            { t: 'prompt', text: '你是一位经验丰富的活动策划。\n\n请为我们 15 人的市场团队设计一场半天的团建活动。\n背景：预算每人 200 元，大家平时久坐、希望多互动，地点在市区。\n\n请给出 3 个不同主题的方案，每个方案包含：主题名称、活动流程、预计花费。' },
            { t: 'quiz', q: '下面哪一项「不」属于好提示词的四要素？', options: ['角色','任务','上下文','对话时长'], answer: 3, explain: '四要素是角色、任务、上下文、格式。对话时长长短并不会影响结果质量。' },
            { t: 'task', title: '改写你的提问', steps: ['先用一句话向 Claude 提一个工作上的真实请求','记下它的回复','再按「角色 + 任务 + 上下文 + 格式」补全你的提问，重新发一次','对比两次结果的差别'] },
          ]},
          { id: 'l4', title: '桌面应用：Chat、Cowork、Code', blocks: [
            { t: 'lead', text: '除了网页版，Claude 还有桌面应用，把它放在你电脑触手可及的地方。桌面应用提供三种工作方式：Chat、Cowork 和 Code，分别对应不同深度的协作。' },
            { t: 'h', text: '三种模式，三种场景' },
            { t: 'list', items: ['Chat：最基础的对话，问答、写作、头脑风暴都在这里','Cowork：让 Claude 在你的电脑上协助处理文件、跨应用完成任务','Code：面向写代码、运行和调试程序的场景'] },
            { t: 'callout', variant: 'note', tag: '注意', text: '刚开始你只需要用好 Chat 就足够了。等熟悉之后，再去尝试 Cowork 和 Code，按需解锁更强的能力，不用一上来全部掌握。' },
            { t: 'p', text: '桌面应用最大的好处是随手可用：配一个快捷键，无论你正在写文档还是浏览网页，都能立刻唤起 Claude，不必切换回浏览器。' },
            { t: 'quiz', q: '如果你只是想问问题、让 Claude 帮忙写邮件，应该用哪种模式？', options: ['Chat','Cowork','Code','以上都不行'], answer: 0, explain: '日常问答和写作，用 Chat 就完全足够了。Cowork 和 Code 面向更复杂的文件操作和编程场景。' },
            { t: 'task', title: '把 Claude 放到手边', steps: ['访问 claude.ai/download，下载并安装桌面应用','登录你的账号','用 Chat 模式问一个今天工作中真实遇到的问题'] },
          ]},
        ]},
        { id: 'm2', title: '整理工作与知识', en: 'Organizing your work', locked: false, lessons: [
          { id: 'l5', title: 'Projects 入门', blocks: [
            { t: 'lead', text: '当你围绕某件事反复和 Claude 打交道时——比如一个长期项目、一门课、一类重复的工作——Projects 能把相关的对话和资料集中在一个空间里，让 Claude 始终了解背景。' },
            { t: 'h', text: 'Project 是什么' },
            { t: 'p', text: 'Project 就像一个专属文件夹：你可以往里上传资料（文档、说明、参考），再写一段「自定义说明」告诉 Claude 这个项目的背景和你的偏好。之后在这个 Project 里的每一次对话，Claude 都会自动参考这些内容。' },
            { t: 'list', items: ['把背景资料上传一次，之后不用反复粘贴','用自定义说明固定语气、格式和角色','把同一主题的多次对话集中管理'] },
            { t: 'callout', variant: 'tip', tag: '提示', text: '举个例子：建一个 Project 叫「周报助手」，上传公司的周报模板，写明「请用这个模板帮我整理每周工作」。以后每周只要把要点丢进去，Claude 就按模板输出。' },
            { t: 'quiz', q: 'Projects 最大的好处是什么？', options: ['让回复速度更快','让 Claude 持续记住某个主题的背景和资料','可以多人同时聊天','免费使用更多次数'], answer: 1, explain: 'Projects 把资料和说明集中存放，让 Claude 在该主题下始终了解背景，不必每次重复提供。' },
            { t: 'task', title: '建一个你自己的 Project', steps: ['在 Claude 里新建一个 Project，起个名字（例如「我的求职助手」）','上传一份相关资料（比如你的简历）','写一句自定义说明，例如「你是我的求职教练，请用鼓励的语气给建议」','在里面开一个对话，试试效果'] },
          ]},
          { id: 'l6', title: '用 Artifacts 创作', blocks: [
            { t: 'lead', text: '当 Claude 生成较长、可以独立使用的内容——一份文档、一段代码、一个表格、甚至一个小网页——它会把成果放进一个叫 Artifact 的独立窗口里，方便你查看、编辑和保存。' },
            { t: 'h', text: 'Artifact 解决了什么' },
            { t: 'p', text: '在普通对话里，长内容会和聊天记录混在一起，难以复用。Artifact 把这类「作品」单独拎出来，显示在对话右侧。你可以直接在上面修改，或让 Claude 继续调整，改完一键复制或下载。' },
            { t: 'list', items: ['文档、文章、长文案','代码片段，甚至可以预览的网页','表格、清单、结构化内容'] },
            { t: 'callout', variant: 'note', tag: '注意', text: '不是每次回复都会生成 Artifact。只有当内容足够长、适合独立保存和复用时，Claude 才会用它。' },
            { t: 'prompt', text: '帮我写一份「新员工第一周指南」，面向刚入职的同事。\n包含：报到当天要做的事、第一周的学习重点、需要认识的关键同事。\n请整理成清晰的分段文档。' },
            { t: 'quiz', q: 'Artifact 最适合用来承载哪类内容？', options: ['一句简短的回答','一份需要保存和反复修改的长文档','一个表情符号','一次随口的闲聊'], answer: 1, explain: 'Artifact 专为较长、可独立复用的成果设计，方便你编辑、保存和迭代。' },
            { t: 'task', title: '做出你的第一个 Artifact', steps: ['请 Claude 帮你写一份「本周待办清单」模板','在右侧的 Artifact 窗口里查看结果','让 Claude「把它改成表格形式」，观察 Artifact 实时更新'] },
          ]},
          { id: 'l7', title: '使用 Skills', blocks: [
            { t: 'lead', text: 'Skills 让 Claude 掌握针对特定任务的「专长」——按照预设的标准流程和规范来完成某类工作，比如生成符合公司格式的文档、制作特定样式的图表。' },
            { t: 'h', text: 'Skill 是什么' },
            { t: 'p', text: '你可以把 Skill 理解成给 Claude 的一套「操作手册」：里面写好了某类任务该怎么做、要遵守什么规范。需要时 Claude 会自动调用合适的 Skill，让结果更专业、更一致。' },
            { t: 'callout', variant: 'tip', tag: '提示', text: '对新手来说，你暂时不需要自己制作 Skill。先知道有这回事就好——当你发现某类工作要反复以同样的标准完成时，Skill 就是为它准备的。想深入可以学习「Agent Skills 入门」这门课。' },
            { t: 'quiz', q: 'Skills 主要解决什么问题？', options: ['让 Claude 回复更简短','让 Claude 按固定标准、专业地完成某类重复任务','替你付款','加快网速'], answer: 1, explain: 'Skills 封装了特定任务的标准流程和规范，让 Claude 在该类任务上输出更专业、更一致的结果。' },
            { t: 'task', title: '想一想你的场景', steps: ['列出你工作中每周都要做、且格式固定的一类任务','想想如果有一套标准流程，Claude 可以怎样帮你自动完成','把它记下来——这就是未来你可能用上 Skill 的地方'] },
          ]},
        ]},
        { id: 'm3', title: '拓展 Claude 的能力', en: "Expanding Claude's reach", locked: false, lessons: [
          { id: 'l8', title: '连接你的工具', blocks: [
            { t: 'lead', text: '通过集成（integrations），你可以把 Claude 和你日常使用的工具连接起来——Slack、邮件、日历、Google Workspace 等等——让 Claude 在这些工具里直接帮你干活，而不只是给文字建议。' },
            { t: 'h', text: '什么是集成' },
            { t: 'p', text: '集成是 Claude 和第三方应用之间的桥梁。配置好之后，Claude 可以读取你应用里的数据、执行操作——比如帮你起草并发送一封邮件、把会议总结自动发到 Slack 频道、在日历里添加日程。你不需要手动复制粘贴，Claude 直接在工具里行动。' },
            { t: 'h', text: '常见的集成场景' },
            { t: 'list', items: ['Slack：让 Claude 总结频道消息、起草回复、管理提醒','邮件（Gmail / Outlook）：自动起草邮件、整理收件箱、生成回复','日历（Google Calendar）：查询日程、安排会议、生成议程','Google Workspace：在 Docs、Sheets、Slides 里直接操作内容','Zapier / Make：通过自动化平台把 Claude 接入几乎任何应用','Notion / Confluence：读取和更新知识库文档'] },
            { t: 'callout', variant: 'tip', tag: '提示', text: '如果你用的应用在 Claude 的官方集成列表里，优先使用官方集成，配置简单、权限清晰。没有官方集成时，Zapier 或 Make 这类自动化平台可以作为中间层把 Claude 接进去。' },
            { t: 'h', text: '集成是如何工作的' },
            { t: 'p', text: '每个集成本质上是给 Claude 开放了一组「动作权限」：读取数据、写入数据、触发操作。你在配置时决定开放哪些权限，Claude 只能在你授权的范围内行动。重要的操作一般会征求你的确认，你始终保持控制权。' },
            { t: 'quiz', q: '连接 Claude 和 Slack 集成之后，Claude 能做什么？', options: ['替你购买付费套餐','总结频道消息并起草回复','删除你的 Slack 账号','监控所有员工'], answer: 1, explain: 'Claude 集成 Slack 后，可以在你授权的范围内读取消息、总结内容、帮你起草回复，而不会超出你设定的权限边界。' },
            { t: 'task', title: '探索可用的集成', steps: ['在 Claude 的设置或应用界面里，找到「集成」或「Integrations」入口','浏览可用的集成列表，选一个你日常用到的应用','按照引导完成授权配置，然后在对话里试着让 Claude 帮你完成一个真实任务'] },
          ]},
          { id: 'l9', title: '企业搜索', blocks: [
            { t: 'lead', text: '企业搜索让 Claude 能跨越组织内部的知识库、文档系统和数据源进行搜索，帮你快速找到散落在各处的信息，而不必一个个系统地手动查询。' },
            { t: 'h', text: '它和普通搜索有什么不同' },
            { t: 'p', text: '普通网页搜索只能找到公开内容。企业搜索连接的是你组织内部的数据——Confluence、SharePoint、Notion、Salesforce、内部数据库等等。Claude 不只是列出链接，而是读懂这些内容，给你直接可用的答案和总结。' },
            { t: 'h', text: '典型使用场景' },
            { t: 'list', items: ['查找内部政策或操作规范："我们的报销流程是什么？"','跨库搜索项目资料："上季度关于 X 产品的所有会议纪要"','整合多来源信息，生成综合报告','快速定位某类合同或法律文件','搜索产品知识库，辅助客服或销售'] },
            { t: 'callout', variant: 'key', tag: '重点', text: '企业搜索的质量取决于你接入的数据源的质量和覆盖范围。接入的来源越全、内容越新，Claude 给出的答案就越准确。' },
            { t: 'h', text: '权限与安全' },
            { t: 'p', text: '企业搜索严格遵守原有系统的权限控制：Claude 只能搜索你本人有权访问的内容，不会因为你用了 Claude 就绕过原有的访问限制。敏感数据的保护机制不变。' },
            { t: 'quiz', q: '企业搜索和在 Google 上搜索最核心的区别是？', options: ['企业搜索更快','企业搜索能检索组织内部的私有数据','企业搜索只能搜 PDF','企业搜索不需要账号'], answer: 1, explain: '企业搜索连接的是组织内部的知识库和数据，而普通网页搜索只能访问公开内容——这是两者最根本的区别。' },
            { t: 'task', title: '用 Claude 搜索你的内部资料', steps: ['确认你的组织已连接了至少一个内部知识库到 Claude','在对话里问一个你平时需要去内部系统查询的问题','对比 Claude 的回答和你平时手动查询的效率，感受差别'] },
          ]},
          { id: 'l10', title: '深度研究模式', blocks: [
            { t: 'lead', text: '深度研究（Research 模式）是 Claude 的一项高级功能：它会自主进行多步骤的网络搜索和资料整合，针对你的问题生成一份结构化的深度报告，而不只是一个简短的回答。' },
            { t: 'h', text: '什么时候用深度研究' },
            { t: 'p', text: '当你需要的不是一句答案，而是对某个话题的全面梳理时，深度研究模式最合适。比如：为一份行业报告做背景调研、了解某项技术的发展现状、比较多种方案的优劣、梳理某个法规的关键条款。Claude 会自己决定搜什么、搜几次，直到有足够的信息来回答你。' },
            { t: 'h', text: '如何使用' },
            { t: 'list', items: ['在 Claude 的对话界面里，找到并启用「Research」或「深度研究」模式','用清晰的问题或研究目标告诉 Claude 你想了解什么','等待 Claude 完成多步搜索（可能需要几分钟），期间可以看到它的搜索过程','收到报告后，仔细阅读并核对关键事实和引用来源'] },
            { t: 'callout', variant: 'warn', tag: '警告', text: '深度研究生成的报告内容丰富，但你仍然需要核查关键数据和引用。Claude 会标注信息来源，遇到重要结论请点开原始链接确认。AI 可能产生错误或过时信息。' },
            { t: 'h', text: '如何得到更好的报告' },
            { t: 'p', text: '研究目标越具体，报告越有针对性。比起「帮我研究一下 AI」，「分析 2024 年以来大语言模型在医疗诊断领域的主要应用案例及局限性」能让 Claude 搜到更相关的内容，生成更有用的报告。' },
            { t: 'prompt', text: '请用深度研究模式帮我调研：\n主题：中国零售行业的 AI 应用现状\n重点：1) 头部零售商的实际落地案例 2) 主要应用场景（供应链/个性化推荐/客服）3) 面临的挑战\n输出格式：分章节的综合报告，每个要点标注信息来源' },
            { t: 'quiz', q: '深度研究模式最适合哪种需求？', options: ['快速查询今天的天气','对某个复杂话题进行多步搜索和综合报告','发一封邮件','修改一张图片'], answer: 1, explain: '深度研究模式专为需要全面调研的任务设计，Claude 会自主多步骤搜索和整合信息，适合报告调研、竞品分析等场景。' },
            { t: 'task', title: '完成一次深度研究', steps: ['想一个你工作中真实需要调研的话题','启用深度研究模式，用清晰具体的语言描述你的研究目标','等报告生成后，重点检查它列出的信息来源，验证 2-3 个关键事实'] },
          ]},
        ]},
        { id: 'm4', title: '融会贯通', en: 'Putting it all together', locked: false, lessons: [
          { id: 'l11', title: '各职业的实战用例', blocks: [
            { t: 'lead', text: 'Claude 不是只有一种用法。不同职业的人每天都在用它解决不同的真实问题——从写文案到分析数据，从准备法律文件到设计教案。这节课用具体场景告诉你，你的同行是怎么把 Claude 用进日常工作的。' },
            { t: 'h', text: '市场与内容创作' },
            { t: 'list', items: ['头脑风暴活动主题、起名方案、口号创意','起草社交媒体文案，批量生成多个版本做 A/B 测试','把一篇长文章改写成不同平台的格式（微信、小红书、LinkedIn）','写新闻稿、产品介绍、落地页文案初稿'] },
            { t: 'h', text: '工程师与开发者' },
            { t: 'list', items: ['解释陌生代码库，快速上手新项目','写单元测试、生成 mock 数据','调试报错，让 Claude 分析错误信息并给出修复建议','生成技术文档、API 说明、注释'] },
            { t: 'h', text: '人力资源、教育与法务' },
            { t: 'list', items: ['HR：起草招聘 JD、面试问题、员工手册、绩效反馈模板','财务：整理财报要点、生成数据摘要、起草投资人简报','教师：备课大纲、课堂练习题、学生反馈评语','律师与法务：整理合同要点、梳理法规条款、起草法律文件初稿（需专业复核）'] },
            { t: 'callout', variant: 'note', tag: '注意', text: '在法律、医疗、财务等专业领域，Claude 的输出是草稿和参考，不能替代持牌专业人士的判断。重要决策请始终由相关专业人员最终审核。' },
            { t: 'quiz', q: '一位 HR 专员最可能用 Claude 完成哪项工作？', options: ['直接批准员工的报销申请','起草招聘职位描述和面试问题','监控员工电脑','替代 HR 部门的所有职能'], answer: 1, explain: 'HR 最常把 Claude 用于起草文字性内容（JD、面试题、手册、绩效评语），节省重复的写作工作，再自己做最终审核和判断。' },
            { t: 'task', title: '找到你职业里的高价值用法', steps: ['列出你每周做 3 次以上的重复性文字或分析工作','选其中一项，把真实任务发给 Claude 试一次','评估它的输出：有多少可以直接用，哪里需要修改','把这个场景加入你的「Claude 常规用法」清单'] },
          ]},
          { id: 'l12', title: '其他协作方式', blocks: [
            { t: 'lead', text: 'Claude 不只是一个答题机。它还能扮演思考伙伴、辩论对手、反思教练——帮你理清思路、检验想法、复盘决策。这节课介绍几种不那么常见但同样有价值的协作方式。' },
            { t: 'h', text: '把 Claude 当作思考伙伴' },
            { t: 'p', text: '当你面对复杂决策或模糊问题时，和 Claude 「大声思考」很有用。把你的困惑、想法、顾虑一股脑说给它听，让它帮你梳理逻辑、找出盲点、列出你没想到的角度。它不会替你做决定，但能帮你把混乱的思路变清晰。' },
            { t: 'prompt', text: '我在考虑是否要跳槽。现在的工作稳定但成长空间有限，新机会薪资高 30% 但公司规模小、有一定风险。\n\n请帮我梳理这个决策：列出我应该考虑的关键因素，帮我看清楚两边各自的核心风险，并提出 3 个我现在应该去弄清楚的问题。' },
            { t: 'h', text: '语音功能' },
            { t: 'p', text: 'Claude 的桌面应用和移动端支持语音对话——你说话，它回应。不想打字的时候，或者边开车边想事情，语音模式让 Claude 更像一个随时在旁边的助手。' },
            { t: 'h', text: '分享对话与协作' },
            { t: 'list', items: ['生成对话分享链接，把 Claude 的分析发给同事或客户参考','在 Project 里上传团队共用的资料，让团队成员各自和 Claude 交互','把 Claude 写的草稿直接复制进协作工具（飞书、Notion、Google Docs）继续编辑'] },
            { t: 'callout', variant: 'tip', tag: '提示', text: '和 Claude 进行思考伙伴式对话时，不要只等它给答案——主动追问，让对话深入。「这里还有什么我没想到的？」「如果我错了，错在哪里？」这类问题往往能挖出最有价值的洞察。' },
            { t: 'quiz', q: '把 Claude 当思考伙伴使用，最核心的价值是什么？', options: ['它能替你做所有决定','帮你梳理逻辑、找出盲点、看清更多角度','它比你聪明所以你该完全听它的','只适合聊工作，不能聊个人决策'], answer: 1, explain: 'Claude 作为思考伙伴的价值在于帮你梳理混乱的思路、发现盲点、列出你没考虑到的角度——决策权始终在你自己手里。' },
            { t: 'task', title: '用 Claude 做一次思维梳理', steps: ['找一个你最近有点纠结的问题（工作或个人都行）','把你的困惑、已知条件和顾虑完整地写给 Claude','让它帮你列出关键考量因素和你应该先搞清楚的问题','根据它的梳理，写下你自己的下一步行动'] },
          ]},
        ]},
        { id: 'm5', title: '结业与证书', en: 'Conclusion & certificate', locked: false, lessons: [
          { id: 'l13', title: '接下来学什么', blocks: [
            { t: 'lead', text: '恭喜完成 Claude 101！你已经掌握了把 AI 用进日常工作的核心能力。接下来该去哪里，取决于你的目标和背景——这节课帮你找到最适合自己的下一步。' },
            { t: 'h', text: '如果你是非技术背景' },
            { t: 'list', items: ['深化 AI 工作流：探索如何把 Claude 接入你的日常应用，用 Zapier 或 Make 搭建自动化流程','学习 Claude 的企业功能：Projects 的高级用法、团队协作最佳实践','等等本学院后续推出的「Claude 进阶」和「AI 工作流实战」课程'] },
            { t: 'h', text: '如果你有技术背景或想学开发' },
            { t: 'list', items: ['Claude Code 101：学会用 AI 代理在终端里写代码、管理项目','MCP 入门：用 Python 构建 MCP 服务器，让 Claude 安全接入外部工具和数据','Agent Skills 入门：把你的专业知识打包成可复用的 Skill','Subagents 入门：学会委派任务给子代理，处理更复杂的工作流'] },
            { t: 'h', text: '持续进步的习惯' },
            { t: 'list', items: ['每次用 Claude 后，问自己：下次怎样提问能得到更好的结果','关注 Anthropic 官方博客和更新日志，了解 Claude 的新能力','在团队里分享你的用法，互相学习实战经验','建立自己的「提示词收藏夹」，把好用的 Prompt 记下来重复使用'] },
            { t: 'callout', variant: 'key', tag: '重点', text: 'AI 能力进化很快。最重要的不是一次学完所有功能，而是养成「遇到问题就想想 Claude 能不能帮上忙」的习惯——这会让你在未来持续受益。' },
            { t: 'quiz', q: '一位没有编程背景的市场人员，完成本课后最适合的下一步是？', options: ['直接学 MCP 服务器开发','探索 AI 工作流和自动化，或等待进阶课程','不需要再学了，Claude 101 已足够','学 Python 编程'], answer: 1, explain: '非技术背景的用户完成 Claude 101 后，最自然的进阶是 AI 工作流和自动化（如 Zapier 集成），而不是直接跳到面向开发者的 MCP 开发课程。' },
            { t: 'task', title: '制定你的学习计划', steps: ['根据你的职业背景和目标，从上面的建议里选出 1-2 个最适合你的下一步','把它们写进你的日历或待办清单','在 Anthropic 学院的课程列表里找到对应课程，提前了解它的内容简介'] },
          ]},
          { id: 'l14', title: '结业证书', blocks: [
            { t: 'lead', text: '你完成了 Claude 101 的全部学习内容。从认识 Claude，到掌握提示词技巧，到学会用 Projects、Artifacts 和 Skills 组织工作——这些能力从今天起就可以用进你的实际工作里。' },
            { t: 'h', text: '你学到了什么' },
            { t: 'list', items: ['Claude 是什么、能做什么，和传统工具有何不同','如何写出高质量的提示词（角色、任务、上下文、格式）','用 Projects 管理长期任务背景，用 Artifacts 创作和迭代成果','通过 Skills 获得专业化的输出','连接第三方工具，用企业搜索和深度研究拓展能力','找到适合自己职业的实战用法，养成 AI 协作的思维方式'] },
            { t: 'h', text: '鼓励与期待' },
            { t: 'p', text: '学会一门工具最好的方式，永远是在真实工作里反复用它。不要等到「完全准备好」——就从今天开始，把下一个任务交给 Claude 试一试。遇到不好的结果，调整提问方式再来一次。每一次使用都是进步。' },
            { t: 'callout', variant: 'tip', tag: '提示', text: '分享你的学习成果！把你在课程里发现的最有用的技巧告诉同事或朋友，帮助更多人用好 AI——也加深你自己的理解。' },
            { t: 'h', text: '领取并分享你的证书' },
            { t: 'p', text: '完成所有模块的学习后，你可以在学院页面领取结业证书。把它分享到 LinkedIn 或你的团队群，让大家知道你已经是一位会用 AI 的高效协作者。' },
            { t: 'quiz', q: '完成 Claude 101 之后，最重要的下一步是什么？', options: ['把课程内容背下来','在真实工作中持续使用 Claude，从实践中提升','等 AI 技术更成熟再用','把课程重新学一遍'], answer: 1, explain: '学习技能最有效的路径是在真实场景里反复使用。带着你在课程里学到的思路，直接把 Claude 用进日常工作，你会进步得最快。' },
            { t: 'task', title: '完成结业', steps: ['回顾一下：在这门课里，你觉得最有价值的一个技巧是什么','用这个技巧，完成今天的一项真实工作任务','在学院页面领取你的结业证书','把证书或你学到的最有用的技巧分享给至少一位同事或朋友'] },
          ]},
        ]},
      ],
    },

    { id: 'claudecode', title: 'Claude Code 101', en: 'Claude Code 101', level: '进阶', academy: 'anthropic',
      desc: '在终端里用 AI 编程代理：读写代码、运行命令、定制工作流。',
      longDesc: '面向开发者的实战课。无论你是刚入门的工程师，还是没用过 AI 编程代理的老手，这门课会带你从安装到高级定制，把 Claude Code 用进日常开发流程。',
      modules: [
        { id: 'm1', title: '认识 Claude Code', en: 'What is Claude Code?', locked: false, lessons: [
          { id: 'l1', title: '什么是 Claude Code？', blocks: [
            { t: 'lead', text: 'Claude Code 是一个在你的终端（命令行）里运行的 AI 编程代理。和聊天式 AI 不同，它能直接读取、修改你项目里的文件，运行命令，帮你真正地把代码写出来、跑起来。' },
            { t: 'h', text: '它和聊天式 AI 有什么不同' },
            { t: 'list', items: ['聊天式 AI：你复制代码进去、再把回答粘回来，来回搬运','Claude Code：直接在你的项目里读文件、改代码、运行测试，闭环完成','它是一个「代理（agent）」：能自己决定下一步该用什么工具'] },
            { t: 'callout', variant: 'note', tag: '注意', text: 'Claude Code 面向开发者，需要你对命令行和代码编辑器有基本了解。如果你完全没接触过编程，建议先学「Claude 101」。' },
            { t: 'h', text: '它能在哪里运行' },
            { t: 'list', items: ['终端（Terminal）','VS Code','JetBrains 系列 IDE','Claude 桌面应用','网页版'] },
            { t: 'quiz', q: 'Claude Code 和聊天式 AI 最大的区别是？', options: ['回答速度更快','能直接读写你的项目文件并运行命令','只能写 Python','不需要联网'], answer: 1, explain: 'Claude Code 是一个能直接操作你代码库的编程代理，可以读文件、改代码、运行命令形成闭环，而不只是给出文本建议。' },
            { t: 'task', title: '确认你的环境', steps: ['确认电脑上装了一个代码编辑器（如 VS Code）','打开终端，确认能输入命令','准备一个 Claude 账号（Pro / Max / Enterprise）或 API key'] },
          ]},
          { id: 'l2', title: 'Claude Code 如何工作', blocks: [
            { t: 'lead', text: '理解 Claude Code 背后的几个概念，能帮你更好地驾驭它：代理循环、上下文窗口、工具和权限。' },
            { t: 'h', text: '代理循环（The agentic loop）' },
            { t: 'p', text: 'Claude Code 的工作方式是一个循环：理解你的目标 → 选择一个工具（读文件、改代码、运行命令）→ 看结果 → 决定下一步，直到任务完成。它会自己一步步推进，而不是一次性给完答案。' },
            { t: 'h', text: '上下文窗口（Context window）' },
            { t: 'p', text: '上下文窗口是 Claude「当前能记住的内容」的容量。项目越大、对话越长，占用越多。学会管理上下文（后面会讲 /compact、/clear、/context）能让它保持高效。' },
            { t: 'h', text: '工具与权限（Tools & permissions）' },
            { t: 'p', text: 'Claude Code 通过「工具」来读写文件、运行命令。出于安全，危险操作会先征求你的同意——你可以逐次批准，也可以开启自动接受。你始终掌握控制权。' },
            { t: 'prompt', label: '在终端里', text: '# 启动 Claude Code\nclaude\n\n# 然后用自然语言描述任务\n> 帮我在 src/utils.js 里写一个把秒数格式化成 mm:ss 的函数，并补一个测试' },
            { t: 'callout', variant: 'tip', tag: '提示', text: '一开始建议用「逐次批准」模式，看清楚 Claude 每一步要做什么；熟悉之后再用自动接受（auto-accept）来提速。' },
            { t: 'quiz', q: '「代理循环」指的是什么？', options: ['Claude 不停地重复同一句话','理解目标→用工具→看结果→决定下一步，循环推进直到完成','一种付费套餐','代码里的 for 循环'], answer: 1, explain: '代理循环是 Claude Code 自主推进任务的方式：不断地选择工具、观察结果、决定下一步，直到目标达成。' },
            { t: 'task', title: '想象一个任务', steps: ['想一个你最近在代码里做过的小改动','拆解一下：要读哪些文件、改什么、怎么验证','这正是 Claude Code 会替你走的「代理循环」'] },
          ]},
        ]},
        { id: 'm2', title: '你的第一个 prompt', en: 'Your first prompt', locked: false, lessons: [
          { id: 'l3', title: '安装 Claude Code', blocks: [
            { t: 'lead', text: '安装 Claude Code 只需要几分钟。它是一个 npm 包，装好之后你就能在任何项目目录里用命令行唤起它。这节课带你完成安装、认证和初次探索。' },
            { t: 'h', text: '前置条件' },
            { t: 'list', items: ['Node.js 18 或更高版本（运行 node -v 检查）','一个 Anthropic 账号（Pro、Max 或 Enterprise 套餐，或有 API key）','一个熟悉的终端（macOS Terminal、Windows PowerShell、Linux bash 都可以）'] },
            { t: 'h', text: '安装步骤' },
            { t: 'prompt', text: '# 第一步：全局安装 Claude Code\nnpm install -g @anthropic-ai/claude-code\n\n# 第二步：检查安装是否成功\nclaude --version\n\n# 第三步：启动并完成首次认证\nclaude\n# 首次运行会引导你登录 Anthropic 账号或输入 API key' },
            { t: 'h', text: '初次认证' },
            { t: 'p', text: '第一次运行 claude 时，终端会提示你登录。如果你有 Claude 账号（Pro/Max），选择通过浏览器登录；如果你使用 API key，选择输入 key 的方式。认证完成后，Claude Code 会保存凭据，之后启动不需要重复登录。' },
            { t: 'callout', variant: 'note', tag: '注意', text: 'Claude Code 需要 Claude Pro、Max 或 Enterprise 订阅，或有效的 Anthropic API key。免费版的 claude.ai 账号无法使用 Claude Code。如果你只有免费账号，请先升级或申请 API key。' },
            { t: 'quiz', q: '安装 Claude Code 最常用的命令是？', options: ['pip install claude','npm install -g @anthropic-ai/claude-code','brew install claude-code','apt-get install claude'], answer: 1, explain: 'Claude Code 是一个 Node.js 工具，通过 npm install -g @anthropic-ai/claude-code 全局安装。安装后用 claude 命令启动。' },
            { t: 'task', title: '完成安装与认证', steps: ['在终端里运行 node -v，确认 Node.js 版本 >= 18','运行 npm install -g @anthropic-ai/claude-code 完成安装','运行 claude，按照提示完成账号认证','认证成功后，输入 /help 查看可用命令，再输入 /exit 退出'] },
          ]},
          { id: 'l4', title: '你的第一个 prompt', blocks: [
            { t: 'lead', text: '安装好 Claude Code 之后，就进入一个真实的项目目录，发出你的第一条指令。这节课演示最经典的开场白：让 Claude Code 读懂一个代码库，然后用自然语言告诉你它是干什么的。' },
            { t: 'h', text: '进入项目目录' },
            { t: 'p', text: 'Claude Code 的能力依赖于它所在的目录。在哪个目录里启动，它就能读取那个目录里的文件。所以第一步，cd 进入你的项目目录，然后再运行 claude。' },
            { t: 'prompt', text: '# 进入你的项目目录\ncd /path/to/your/project\n\n# 启动 Claude Code\nclaude\n\n# 然后在提示符后输入你的第一个任务\n> 读一读这个项目，用中文告诉我：这是什么项目，主要做什么，技术栈是什么，入口文件在哪里？' },
            { t: 'h', text: 'Claude Code 会做什么' },
            { t: 'p', text: '收到这个指令后，Claude Code 会开始读取项目文件：先看 package.json 或 README，再读主要的源码目录，然后给你一份清晰的项目概览。整个过程你可以在终端里看到它在读哪些文件，这就是代理循环在实际运行。' },
            { t: 'callout', variant: 'tip', tag: '提示', text: '如果你暂时没有现成项目，可以用 git clone 一个开源项目来练习，比如 github.com/anthropics/anthropic-sdk-python，然后让 Claude Code 帮你解读它的结构。' },
            { t: 'quiz', q: '在哪个目录里启动 Claude Code，最为关键？', options: ['总在根目录 / 启动','在你想要 Claude Code 操作的项目目录里启动','在桌面启动','在 /tmp 目录启动'], answer: 1, explain: 'Claude Code 能读取的文件范围取决于它启动时所在的目录。应该先 cd 进入你的项目目录，再运行 claude。' },
            { t: 'task', title: '完成你的第一次对话', steps: ['找一个你本机有的代码项目（或 clone 一个开源项目）','cd 进入该目录，然后运行 claude 启动 Claude Code','输入：读一读这个项目，用中文说明它是什么、主要结构是什么','看 Claude Code 的读文件过程和最终回答，再追问一个你感兴趣的细节'] },
          ]},
        ]},
        { id: 'm3', title: '日常工作流', en: 'Daily workflows', locked: false, lessons: [
          { id: 'l5', title: '探索 → 规划 → 编码 → 提交', blocks: [
            { t: 'lead', text: 'Claude Code 最推荐的工作方式是四步走：先让它探索代码库，再一起规划方案，然后写代码，最后你审查并提交。跳过前两步直接叫它「改代码」，往往会让它走弯路。' },
            { t: 'h', text: '第一步：探索（Explore）' },
            { t: 'p', text: '在动手之前，先让 Claude Code 读懂相关文件。这和你自己阅读代码是一回事——理解了上下文，才能做出正确的修改。可以让它读指定的文件、模块或测试，告诉你它理解了什么。' },
            { t: 'h', text: '第二步：规划（Plan）' },
            { t: 'p', text: '不要直接说「去改这个文件」，而是先和 Claude Code 讨论方案：「为了实现 X，你打算怎么做？要改哪些文件？有没有潜在风险？」让它把计划说出来，你确认之后再开始写代码。这一步能发现很多误解和隐患。' },
            { t: 'h', text: '第三、四步：编码与提交' },
            { t: 'p', text: '规划确认后，让 Claude Code 开始写代码。代码写完后，仔细检查 diff，确认改动符合你的预期，再提交。不要跳过这一步——Claude Code 很能干，但最终的质量把关在你。' },
            { t: 'prompt', text: '# 探索阶段\n> 先读一下 src/auth/ 目录下的文件，告诉我用户认证流程是怎么实现的\n\n# 规划阶段\n> 我需要在 token 过期时自动弹出重新登录的提示。你打算怎么改？要动哪些文件？\n\n# 编码阶段\n> 好，按你说的方案去改，一个文件一个文件地来，每改完一个告诉我' },
            { t: 'callout', variant: 'key', tag: '重点', text: '「先规划，后编码」是使用 Claude Code 最重要的习惯。规划阶段多花 5 分钟，能避免后面几小时的返工。' },
            { t: 'quiz', q: '四步工作流中，「规划」阶段的核心目的是什么？', options: ['让 Claude Code 直接开始写代码','在动手之前让 Claude Code 说出方案、提前发现问题','生成文档','运行测试'], answer: 1, explain: '规划阶段让 Claude Code 把要做什么、怎么做说清楚，你确认后再开始编码。这能避免理解偏差导致的大量返工。' },
            { t: 'task', title: '用四步法完成一个小改动', steps: ['找一个你项目里的小需求或 bug','先让 Claude Code 探索相关文件，再让它说出修改方案','确认方案后，让它开始编码，过程中保持关注','改完后 git diff 看一遍改动，满意后再提交'] },
          ]},
          { id: 'l6', title: '上下文管理', blocks: [
            { t: 'lead', text: '上下文窗口是 Claude Code「当前记忆」的容量。对话越长、读的文件越多，上下文就越满。学会管理上下文，能让 Claude Code 始终保持高效、不走弯路。' },
            { t: 'h', text: '上下文窗口是什么' },
            { t: 'p', text: '每一次 Claude Code 的会话都有一个上下文窗口——它能「看到」和「记住」的内容总量是有限的。当上下文快满时，Claude 会开始忘记之前的内容，或者行为变得不稳定。你可以用 /context 查看当前的使用情况。' },
            { t: 'h', text: '三个关键命令' },
            { t: 'prompt', text: '# 查看当前上下文使用量\n/context\n\n# 压缩上下文（保留关键信息，删除冗余历史）\n/compact\n\n# 清空上下文，从头开始（用于切换完全不同的任务）\n/clear' },
            { t: 'h', text: '什么时候用哪个命令' },
            { t: 'list', items: ['/compact：同一个任务还没完成，但对话已经很长——用它压缩历史、保留重点，继续干活','/clear：当前任务已完成，要切换到完全不同的工作——彻底清空，重新出发','/context：随时查看，了解剩余空间，判断是否需要压缩或清空'] },
            { t: 'callout', variant: 'tip', tag: '提示', text: '把长对话的任务拆成小块完成，每完成一块就 /clear 或新开会话，是保持 Claude Code 高效的最好习惯。一个会话塞太多任务，往往得不到好结果。' },
            { t: 'quiz', q: '当你完成一个任务、准备开始一个全新的不相关任务时，最应该用哪个命令？', options: ['/compact','/context','/clear','/help'], answer: 2, explain: '/clear 会完全清空当前对话上下文，让 Claude Code 以全新的状态开始下一个任务。/compact 只是压缩，适合同一任务继续推进。' },
            { t: 'task', title: '练习上下文管理', steps: ['启动 Claude Code，完成一个小任务（让它读几个文件、做一处改动）','运行 /context，看看上下文占用了多少','运行 /compact，感受一下压缩前后的变化','再运行 /clear，开始一个全新的任务，体会从头开始的干净感'] },
          ]},
          { id: 'l7', title: '代码评审', blocks: [
            { t: 'lead', text: 'Claude Code 不只是写代码的助手，它也是一个很好的代码评审员。无论是审查你自己写的代码，还是在接受 Claude Code 的改动之前仔细核查，代码评审是保持代码质量的关键习惯。' },
            { t: 'h', text: '让 Claude Code 评审你的代码' },
            { t: 'p', text: '把你写的代码发给 Claude Code，让它找问题：潜在的 bug、边界条件、性能问题、代码风格、安全漏洞。它的视角和你不同，往往能发现你自己忽略的问题。' },
            { t: 'prompt', text: '# 评审一个具体文件\n> 帮我评审 src/api/user.js 这个文件，重点关注：1) 有没有潜在的安全问题 2) 错误处理是否完善 3) 有没有明显的性能问题\n\n# 让它解释自己的改动\n> 你刚才修改了 auth.js，告诉我你具体改了什么、为什么这么改，有没有潜在的副作用' },
            { t: 'h', text: '评审 Claude Code 自己的输出' },
            { t: 'p', text: '在接受 Claude Code 的任何改动之前，都应该审查一遍。养成看 git diff 的习惯，确认每一行改动你都理解并认可。特别注意 Claude Code 有时会改动它「顺手」改了但你没要求的地方。' },
            { t: 'h', text: '实用的评审技巧' },
            { t: 'list', items: ['让它解释：「这个改动的逻辑是什么，为什么这样写而不是那样写」','让它找问题：「如果这段代码上线后出问题，最可能是哪里」','让它写测试：「给这个函数写几个测试用例，覆盖正常和边界情况」','保持怀疑：Claude Code 有时会自信地写出有问题的代码，你的判断是最后一道关'] },
            { t: 'callout', variant: 'warn', tag: '警告', text: '永远不要在没有审查的情况下直接接受并部署 Claude Code 的输出。AI 生成的代码可能有微妙的 bug 或安全问题，最终的质量责任在你，不在 Claude。' },
            { t: 'quiz', q: '在接受 Claude Code 的代码改动之前，你应该做什么？', options: ['直接提交，Claude Code 不会出错','仔细看 git diff，理解每一处改动再决定是否接受','把代码复制到另一个文件备份','重启终端'], answer: 1, explain: 'Claude Code 的输出需要你审查后才能接受。看 git diff、理解改动逻辑，是保持代码质量的关键步骤。' },
            { t: 'task', title: '做一次代码评审', steps: ['选一段你最近写的代码，或者让 Claude Code 先写一段','让 Claude Code 从安全、性能和错误处理三个角度评审这段代码','对它指出的每一个问题，自己判断是否认同','如果有你不同意的点，和它讨论，让它解释理由'] },
          ]},
        ]},
        { id: 'm4', title: '定制 Claude Code', en: 'Customizing', locked: false, lessons: [
          { id: 'l8', title: 'CLAUDE.md 文件', blocks: [
            { t: 'lead', text: 'CLAUDE.md 是放在项目根目录里的一个 Markdown 文件，专门写给 Claude Code 看的。每次 Claude Code 在这个项目里启动，它都会先读这个文件，了解你的项目背景和规范。' },
            { t: 'h', text: '为什么需要 CLAUDE.md' },
            { t: 'p', text: '没有 CLAUDE.md 时，每次开新对话你都要重新告诉 Claude Code「我们用 TypeScript」「测试用 Jest 跑」「提交信息要用英文写」。CLAUDE.md 把这些一次写清楚，之后每个会话都自动生效，你再也不用重复交代背景。' },
            { t: 'h', text: 'CLAUDE.md 应该写什么' },
            { t: 'prompt', text: '# CLAUDE.md 示例结构\n\n## 项目简介\n这是一个用 Next.js + TypeScript 构建的电商平台前端。\n\n## 技术栈\n- 框架：Next.js 14（App Router）\n- 语言：TypeScript（严格模式）\n- 样式：Tailwind CSS\n- 测试：Vitest + React Testing Library\n- 包管理：pnpm\n\n## 常用命令\n- 启动开发服务器：pnpm dev\n- 运行测试：pnpm test\n- 构建：pnpm build\n\n## 规范与约定\n- 组件放在 src/components/，按功能模块分子目录\n- Git 提交信息用英文，遵循 Conventional Commits 格式\n\n## 不要做的事\n- 不要安装新的 npm 包，除非我明确要求\n- 不要改动 .env 文件' },
            { t: 'callout', variant: 'tip', tag: '提示', text: '先从「常用命令」和「不要做的事」两个部分开始写你的 CLAUDE.md，这是最立竿见影的两部分。边用边补充，不用一次写完。' },
            { t: 'quiz', q: 'CLAUDE.md 最主要的作用是什么？', options: ['替代 README.md','告诉 Claude Code 项目背景和规范，避免每次重复交代','加密项目文件','替代 .gitignore'], answer: 1, explain: 'CLAUDE.md 是写给 Claude Code 看的项目说明文件，让它在每次会话开始就了解技术栈、规范和约束，不需要你每次重复介绍。' },
            { t: 'task', title: '为你的项目创建 CLAUDE.md', steps: ['在你的项目根目录里创建 CLAUDE.md 文件','至少写上：技术栈、常用命令（测试/启动/构建）、2-3 条不要做的事','启动 Claude Code，问它「你对这个项目了解哪些」，验证它是否读取了 CLAUDE.md','根据实际使用中遇到的问题，持续补充 CLAUDE.md'] },
          ]},
          { id: 'l9', title: 'Subagents', blocks: [
            { t: 'lead', text: 'Subagents（子代理）是 Claude Code 可以派生出来、在独立上下文里完成特定任务的助手代理。当一个大任务可以拆成多个独立的部分时，Claude Code 会自动或在你的提示下，把子任务委派给子代理并行处理。' },
            { t: 'h', text: '什么时候会出现子代理' },
            { t: 'p', text: '当你给 Claude Code 一个可以并行处理的复杂任务时，它可能会自动拆解并派生多个子代理同时工作。比如：「同时给 user、product、order 三个模块写单元测试」——Claude Code 可以派三个子代理各自写一个模块，比串行处理快得多。' },
            { t: 'h', text: '子代理的工作方式' },
            { t: 'list', items: ['每个子代理有自己独立的上下文窗口，不会污染主会话','子代理完成任务后，把结果交回给主代理','你可以在终端里看到子代理的创建和进度','主代理负责协调子代理的结果，整合成最终输出'] },
            { t: 'callout', variant: 'note', tag: '注意', text: '子代理在后台工作，你无法直接向子代理发消息——你只和主代理交互。如果子代理的输出有问题，告诉主代理你想调整什么，由它重新处理。' },
            { t: 'quiz', q: '使用子代理的最大好处是？', options: ['让 Claude Code 回复更短','多个独立子任务可以并行处理，大幅提高效率','减少 API 费用','让代码运行更快'], answer: 1, explain: '子代理让多个独立任务可以同时进行，不必排队串行处理，对于可以拆分的大任务效率提升非常明显。' },
            { t: 'task', title: '触发一次子代理工作', steps: ['给 Claude Code 一个可以拆分为多个并行部分的任务（例如：为三个不同的模块各写一个 README）','观察终端里是否出现子代理被创建的提示','等待子代理完成，查看整合后的结果','如果结果有需要调整的地方，告诉主代理修改哪个部分'] },
          ]},
          { id: 'l10', title: 'Skills', blocks: [
            { t: 'lead', text: 'Skills 是可以赋予 Claude Code 特定专长的可复用模块。把某类任务的标准做法封装成一个 Skill，Claude Code 就会在合适的时候自动调用它，给出更专业、更一致的结果。' },
            { t: 'h', text: 'Skill 在 Claude Code 里是什么' },
            { t: 'p', text: '在 Claude Code 的上下文里，Skill 通常是项目里一个专门的目录（如 .claude/skills/），里面放着描述特定工作方式的 Markdown 文件。Claude Code 在处理相关任务时会读取并遵循这些文件里的规范。' },
            { t: 'h', text: '常见的 Skill 场景' },
            { t: 'list', items: ['代码评审 Skill：统一评审标准，让每次 review 遵循相同的检查清单','API 文档 Skill：规定文档的格式和必填字段','测试编写 Skill：规定测试文件结构、命名规范、必覆盖的场景','提交信息 Skill：强制遵循 Conventional Commits 或你团队的格式'] },
            { t: 'callout', variant: 'tip', tag: '提示', text: '从你最常需要反复交代给 Claude Code 的那类要求开始，把它们写成一个 Skill。写一次，长期省心。' },
            { t: 'quiz', q: 'Skills 的核心价值是什么？', options: ['让 Claude Code 写代码更快','把某类任务的标准做法封装成可复用的规范，保证输出稳定专业','替代 CLAUDE.md','减少 API 调用次数'], answer: 1, explain: 'Skills 把特定任务的规范和做法封装起来，每次 Claude Code 处理该类任务时都会遵循，确保输出的一致性和专业性。' },
            { t: 'task', title: '构思你的第一个 Skill', steps: ['想一想：你最常需要反复告诉 Claude Code 的规范是什么（比如代码风格、文档格式）','在项目里创建 .claude/skills/ 目录','创建一个简单的 Skill 文件，写上这类任务的标准步骤和要求','让 Claude Code 处理一个相关任务，观察它是否遵循了 Skill 里的规范'] },
          ]},
          { id: 'l11', title: 'MCP', blocks: [
            { t: 'lead', text: 'MCP（Model Context Protocol）让 Claude Code 能连接外部工具和数据源——数据库、API、代码质量工具、内部服务等等。通过 MCP 服务器，Claude Code 的能力边界大幅扩展。' },
            { t: 'h', text: 'MCP 在 Claude Code 里能做什么' },
            { t: 'list', items: ['直接查询数据库，让 Claude Code 在分析代码的同时查看实际数据','连接 GitHub/GitLab API，读取 PR 内容、创建 issue','接入内部 API 文档服务，让 Claude Code 了解你们的私有接口','连接代码质量平台（如 SonarQube），在对话里直接获取扫描结果','接入任何你自己构建的 MCP 服务器'] },
            { t: 'h', text: '如何给 Claude Code 添加 MCP 服务器' },
            { t: 'prompt', text: '# 通过命令行添加（推荐新手）\nclaude mcp add <server-name> <command> [args...]\n\n# 例如：添加一个本地 SQLite MCP 服务器\nclaude mcp add sqlite npx -y @modelcontextprotocol/server-sqlite ./mydb.db' },
            { t: 'callout', variant: 'warn', tag: '警告', text: '使用第三方 MCP 服务器时，请确认来源可信。MCP 服务器可以访问你授权给它的所有资源，引入不可信的 MCP 服务器存在安全风险。' },
            { t: 'quiz', q: '给 Claude Code 添加一个 MCP 服务器后，最直接的效果是？', options: ['Claude Code 会变得更快','Claude Code 能访问该 MCP 服务器提供的工具和数据','Claude Code 会自动重启','减少上下文占用'], answer: 1, explain: 'MCP 服务器向 Claude Code 暴露一组工具和数据接口，接入后 Claude Code 就能在对话中调用这些工具，如查询数据库、调用 API 等。' },
            { t: 'task', title: '添加你的第一个 MCP 服务器', steps: ['在 GitHub 上搜索 "awesome-mcp-servers" 找一个你用得上的 MCP 服务器','按照它的文档，用 claude mcp add 命令添加到 Claude Code','重启 Claude Code，让它帮你完成一个需要用到该 MCP 服务器的任务','确认工具被正确调用并返回了预期结果'] },
          ]},
          { id: 'l12', title: 'Hooks', blocks: [
            { t: 'lead', text: 'Hooks 让你可以在 Claude Code 执行工具的前后，自动运行你指定的 shell 命令。比如：每次 Claude Code 改完一个文件，自动跑一遍格式化；每次运行命令前，先做一个安全检查。' },
            { t: 'h', text: 'Hooks 是什么' },
            { t: 'p', text: 'Hook 是绑定在 Claude Code 工具调用生命周期上的钩子。目前支持两种：PreToolUse（工具调用之前运行）和 PostToolUse（工具调用完成之后运行）。你可以指定匹配哪些工具、运行什么命令。' },
            { t: 'h', text: '典型用法' },
            { t: 'list', items: ['自动格式化：每次 Claude Code 写完文件后，自动运行 prettier 或 gofmt','自动 lint：每次文件被修改后，自动运行 eslint 检查','安全检查：在 Claude Code 运行某些命令之前，先验证目标路径是否安全','自动测试：每次代码改动后，自动运行相关测试'] },
            { t: 'prompt', text: '// .claude/settings.json 示例\n// 每次 Claude Code 写文件后，自动运行 prettier 格式化\n{\n  "hooks": {\n    "PostToolUse": [\n      {\n        "matcher": "Write",\n        "hooks": [{ "type": "command", "command": "npx prettier --write \\"$CLAUDE_FILE_PATHS\\"" }]\n      }\n    ]\n  }\n}' },
            { t: 'callout', variant: 'warn', tag: '警告', text: 'Hooks 里的命令会自动执行，不需要你确认。务必只配置你完全信任的命令，避免在 hooks 里写有副作用或破坏性的操作。' },
            { t: 'quiz', q: 'PostToolUse hook 最常见的用途是什么？', options: ['在 Claude Code 执行工具前做安全验证','在 Claude Code 执行工具完成后，自动做格式化或测试等后处理','替代 CLAUDE.md','管理上下文窗口'], answer: 1, explain: 'PostToolUse hook 在工具调用完成后触发，最适合做格式化、lint、测试等后处理工作，让 Claude Code 的每次改动都自动符合规范。' },
            { t: 'task', title: '配置一个格式化 Hook', steps: ['在你的项目里创建或打开 .claude/settings.json','添加一个 PostToolUse hook，在 Claude Code 写文件后自动运行你项目里的格式化命令','让 Claude Code 修改一个代码文件，观察 hook 是否自动触发','确认文件被正确格式化'] },
          ]},
        ]},
        { id: 'm5', title: '测验', en: 'Quiz', locked: false, lessons: [
          { id: 'l13', title: '课程测验', blocks: [
            { t: 'lead', text: '欢迎来到 Claude Code 101 的课程综合测验。这里有 8 道题，覆盖本课程的核心概念。测验不计入成绩，重点是帮你回顾和巩固学到的内容。' },
            { t: 'quiz', q: 'Claude Code 和聊天式 AI 最核心的区别是什么？', options: ['Claude Code 只能处理 Python 代码','Claude Code 能直接读写项目文件并运行终端命令，形成闭环','Claude Code 不需要网络连接','Claude Code 比网页版便宜'], answer: 1, explain: 'Claude Code 是一个编程代理，能直接操作你的代码库——读文件、改代码、运行命令，而不是只给出文字建议。' },
            { t: 'quiz', q: '「代理循环（agentic loop）」描述的是什么？', options: ['Claude Code 无限重复同一个任务','理解目标 → 选择工具 → 观察结果 → 决定下一步，循环直到完成','一种付费套餐','上下文窗口的刷新机制'], answer: 1, explain: '代理循环是 Claude Code 自主推进任务的方式：不断地选择工具、执行、观察结果，再决定下一步行动，直到完成目标。' },
            { t: 'quiz', q: 'CLAUDE.md 文件的主要作用是什么？', options: ['替代项目的 README，面向人类读者','告诉 Claude Code 项目的技术栈、规范和约束，避免每次会话重复交代','加密项目文件','配置 npm 包依赖'], answer: 1, explain: 'CLAUDE.md 是专门给 Claude Code 看的项目说明，每次 Claude Code 启动时都会读取，让它了解背景和规范。' },
            { t: 'quiz', q: '当你完成一个任务、要切换到完全不相关的新任务时，应该用哪个命令？', options: ['/compact','/context','/clear','/exit'], answer: 2, explain: '/clear 会完全清空当前上下文，让 Claude Code 以全新状态开始下一个任务。/compact 只是压缩历史，适合同一任务继续推进。' },
            { t: 'quiz', q: 'MCP 服务器给 Claude Code 带来的核心价值是什么？', options: ['让 Claude Code 回复更快','连接外部工具和数据源（如数据库、API），扩展 Claude Code 的能力边界','减少 API 费用','替代 CLAUDE.md'], answer: 1, explain: 'MCP 服务器向 Claude Code 暴露外部工具和数据，让它能在编程工作中直接查询数据库、调用 API、访问内部服务等。' },
            { t: 'quiz', q: 'Subagents（子代理）最适合处理哪类情况？', options: ['所有任务都应该用子代理','一个大任务可以拆成多个独立部分、可以并行处理时','上下文窗口快满的时候','需要格式化代码的时候'], answer: 1, explain: '子代理让多个独立子任务可以并行处理，每个子代理有自己的上下文，最适合可以拆分的大型并行任务。' },
            { t: 'quiz', q: 'PostToolUse Hook 最典型的用途是什么？', options: ['在 Claude Code 执行任务前做安全验证','在 Claude Code 修改文件后，自动运行格式化、lint 或测试','管理 CLAUDE.md 文件','添加新的 MCP 服务器'], answer: 1, explain: 'PostToolUse Hook 在工具调用完成后触发，最适合做格式化、代码检查、自动测试等后处理工作，让每次改动都自动符合规范。' },
            { t: 'quiz', q: '使用 Claude Code 的四步工作流中，「规划」阶段的正确做法是？', options: ['让 Claude Code 直接开始写代码，规划浪费时间','让 Claude Code 先说出修改方案，你确认后再开始编码','自己写好所有代码再让 Claude Code 检查','跳过规划，直接运行 /clear 清空上下文'], answer: 1, explain: '规划阶段让 Claude Code 先说出它打算怎么做，你确认方向正确后再开始编码，能有效避免理解偏差和大量返工。' },
            { t: 'task', title: '课程结束后做这件事', steps: ['在你正在参与的一个真实项目里创建 CLAUDE.md，写上技术栈、常用命令和至少 2 条约束','用四步工作流（探索→规划→编码→提交）完成一个你本周需要做的开发任务','根据实际使用中的痛点，考虑配置一个 Hook（如自动格式化）来减少重复操作','把你在本课中学到的最有价值的一个技巧分享给团队里的一位同事'] },
          ]},
        ]},
      ],
    },

    { id: 'mcpintro', title: 'Model Context Protocol 入门', en: 'Introduction to MCP', level: '进阶', academy: 'anthropic',
      desc: '用 Python 从零构建 MCP 服务器与客户端，连接 Claude 与外部服务。',
      longDesc: '这门课带你用 Python SDK 从零构建 MCP（Model Context Protocol）的服务器和客户端，掌握三大核心原语——工具、资源、提示，让 Claude 安全地连接外部服务和数据。',
      modules: [
        { id: 'm1', title: '介绍', en: 'Introduction', locked: false, lessons: [
          { id: 'l1', title: '欢迎学习本课', blocks: [
            { t: 'lead', text: '这门课会带你用 Python 从零构建 MCP 的服务器和客户端。学完你能让 Claude 安全地连接到外部服务和数据，而不必为每个集成手写一大堆代码。' },
            { t: 'h', text: '你会学到什么' },
            { t: 'list', items: ['MCP 的整体架构与通信方式','用 Python SDK 构建 MCP 服务器','三大核心原语：工具(tools)、资源(resources)、提示(prompts)','实现一个 MCP 客户端，把能力接给 Claude'] },
            { t: 'callout', variant: 'note', tag: '前置要求', text: '本课需要你具备 Python 基础，并了解 JSON 和 HTTP 请求-响应的基本概念。' },
            { t: 'task', title: '准备环境', steps: ['确认本机安装了 Python','准备一个代码编辑器','回顾一下什么是 JSON（键值对的数据格式）'] },
          ]},
          { id: 'l2', title: '认识 MCP', blocks: [
            { t: 'lead', text: 'MCP（模型上下文协议）是一套开放标准，让 AI 应用能以统一的方式连接到各种外部工具和数据源——就像给 AI 装了一个「通用接口」。' },
            { t: 'h', text: 'MCP 解决了什么问题' },
            { t: 'p', text: '没有 MCP 时，每接一个工具都要单独写一套集成代码。MCP 把「定义工具、执行工具」的工作从你的应用转移到专门的 MCP 服务器上：你只要让应用支持 MCP，就能即插即用地接入任何 MCP 服务器。' },
            { t: 'h', text: '三大核心原语' },
            { t: 'list', items: ['工具（Tools）：由模型决定何时调用，用来执行动作','资源（Resources）：由应用控制，暴露只读数据','提示（Prompts）：由用户触发，提供预设好的高质量指令'] },
            { t: 'callout', variant: 'key', tag: '重点', text: '记住这三者的「控制方」不同——工具是模型控制，资源是应用控制，提示是用户控制。这决定了你该用哪一个。' },
            { t: 'quiz', q: 'MCP 的核心价值是？', options: ['让 AI 回复更快','用统一标准连接外部工具和数据，免去重复写集成代码','替代 Python','加密你的数据'], answer: 1, explain: 'MCP 是一套开放标准，把工具的定义和执行交给专门的 MCP 服务器，让 AI 应用能以统一方式即插即用地接入外部能力。' },
            { t: 'task', title: '辨认三原语', steps: ['设想一个场景：让 AI 帮你管理文档','哪部分是「动作」（如编辑文档）→ 工具','哪部分是「只读数据」（如读取文档内容）→ 资源','哪部分是「预设指令」（如按格式整理）→ 提示'] },
          ]},
          { id: 'l3', title: 'MCP 客户端', blocks: [
            { t: 'lead', text: 'MCP 采用客户端-服务器架构。客户端嵌在 AI 应用里，负责和 MCP 服务器通信，把服务器提供的能力交给 Claude 使用。' },
            { t: 'h', text: '一次请求是怎么流转的' },
            { t: 'p', text: '用户提问 → MCP 客户端把可用的工具告诉 Claude → Claude 决定调用某个工具 → 客户端转发给 MCP 服务器执行 → 结果返回给 Claude → Claude 生成最终回答。整个过程你不用手写集成逻辑。' },
            { t: 'callout', variant: 'note', tag: '注意', text: 'MCP 的通信是「传输无关」的——无论底层走标准输入输出还是 HTTP，消息格式都一致。进阶课会详细讲传输方式。' },
            { t: 'quiz', q: 'MCP 客户端的主要职责是？', options: ['训练模型','在 AI 应用和 MCP 服务器之间通信、转发工具调用','存储用户密码','渲染网页'], answer: 1, explain: '客户端嵌在 AI 应用中，负责发现服务器能力、把工具调用转发给服务器执行，并把结果交回给模型。' },
            { t: 'task', title: '画一画流程', steps: ['在纸上画出：用户 → 客户端 → 服务器 → 外部服务','标出 Claude 在哪一步决定调用工具','标出结果如何回到 Claude'] },
          ]},
        ]},
        { id: 'm2', title: '动手构建 MCP 服务器', en: 'Hands-on with MCP servers', locked: false, lessons: [
          { id: 'l4', title: '项目搭建', blocks: [
            { t: 'lead', text: '工欲善其事，必先利其器。本节带你完成 MCP 服务器项目的完整搭建，从安装依赖到第一次成功启动，打下坚实基础。' },
            { t: 'h', text: '安装 MCP SDK' },
            { t: 'p', text: '使用 pip 或 uv 安装 Python 版 MCP SDK。推荐使用 uv，它速度更快且自带虚拟环境管理。' },
            { t: 'prompt', text: '# 方式一：使用 pip\npip install mcp\n\n# 方式二：使用 uv（推荐）\nuv init my-mcp-server\ncd my-mcp-server\nuv add mcp' },
            { t: 'callout', variant: 'tip', tag: '提示', text: '如果你使用 uv，它会自动创建 pyproject.toml 并管理虚拟环境，省去手动维护 requirements.txt 的麻烦。' },
            { t: 'h', text: '项目结构' },
            { t: 'p', text: '一个最小化的 MCP 服务器项目只需要一个入口文件。推荐的目录结构如下：' },
            { t: 'list', items: [
              'server.py — 主服务器文件，定义所有 Tools / Resources / Prompts',
              'pyproject.toml 或 requirements.txt — 依赖声明',
              '.python-version — 可选，固定 Python 版本（推荐 3.11+）'
            ]},
            { t: 'prompt', text: '# server.py 最小起步代码\nfrom mcp.server.fastmcp import FastMCP\n\nmcp = FastMCP(\'my-server\')\n\n# 稍后在这里添加 tools、resources、prompts\n\nif __name__ == \'__main__\':\n    mcp.run()' },
            { t: 'h', text: '首次启动服务器' },
            { t: 'p', text: '使用 `mcp dev` 命令以开发模式运行服务器，它会自动启动 MCP Inspector 界面，方便你测试。' },
            { t: 'prompt', text: '# 开发模式启动（自动打开 Inspector）\nmcp dev server.py\n\n# 或使用 uv run\nuv run mcp dev server.py' },
            { t: 'callout', variant: 'note', tag: '注意', text: '首次运行时终端会显示 Inspector 的访问地址，通常是 http://localhost:5173。保持终端开启，关闭终端服务器就会停止。' },
            { t: 'quiz', q: '以下哪个命令可以以开发模式启动 MCP 服务器并打开 Inspector？', options: ['python server.py', 'mcp dev server.py', 'mcp start server.py', 'uvicorn server:mcp'], answer: 1, explain: '`mcp dev server.py` 是官方提供的开发模式启动命令，会自动启动 Inspector 界面。`python server.py` 只会直接运行，不会启动 Inspector。' },
            { t: 'task', title: '搭建你的第一个 MCP 项目', steps: [
              '新建一个目录 my-mcp-server，进入目录后运行 `uv init` 或 `pip install mcp` 安装依赖',
              '在目录中创建 server.py，粘贴上方最小起步代码',
              '运行 `mcp dev server.py`，确认终端输出 Inspector 地址且没有报错',
              '在浏览器打开 Inspector 地址，确认看到服务器已连接'
            ]}
          ]},
          { id: 'l5', title: '用 MCP 定义工具', blocks: [
            { t: 'lead', text: 'Tools 是 MCP 的核心原语之一，由模型决定何时调用。本节你将学会用 `@mcp.tool()` 装饰器定义工具，并理解如何让模型"读懂"你的工具。' },
            { t: 'h', text: '工具装饰器基础' },
            { t: 'p', text: '使用 `@mcp.tool()` 装饰一个 Python 函数，FastMCP 会自动将函数名、文档字符串（docstring）和类型注解注册为工具的元数据。模型依赖这些信息决定是否调用工具。' },
            { t: 'callout', variant: 'key', tag: '重点', text: '工具的 docstring 就是工具的"说明书"，模型靠它来理解工具的用途。写得越清晰，模型调用得越准确。务必认真填写。' },
            { t: 'h', text: '定义你的第一个工具' },
            { t: 'p', text: '以下示例定义了两个工具：一个做数学运算，一个读取文件内容。注意类型注解和 docstring 的写法。' },
            { t: 'prompt', text: 'from mcp.server.fastmcp import FastMCP\n\nmcp = FastMCP(\'my-server\')\n\n@mcp.tool()\ndef add_numbers(a: int, b: int) -> int:\n    \'\'\'将两个整数相加并返回结果。\'\'\'\n    return a + b\n\n@mcp.tool()\ndef read_file(path: str) -> str:\n    \'\'\'读取指定路径的文件内容并以字符串形式返回。\n    \n    Args:\n        path: 要读取的文件的绝对路径\n    \'\'\'\n    with open(path, \'r\', encoding=\'utf-8\') as f:\n        return f.read()\n\nif __name__ == \'__main__\':\n    mcp.run()' },
            { t: 'h', text: '参数类型与返回值' },
            { t: 'p', text: 'FastMCP 支持常见的 Python 类型注解，包括 str、int、float、bool、list、dict 以及 Pydantic 模型。返回值可以是字符串、数字或复杂对象，FastMCP 会自动序列化。' },
            { t: 'list', items: [
              '参数类型注解会自动生成 JSON Schema，告诉模型每个参数的格式要求',
              '函数名会成为工具名称（tool name），保持简洁且有描述性',
              '可以使用 `@mcp.tool(name=\'custom_name\')` 自定义工具名称',
              '工具函数可以是同步或异步（async def）均支持'
            ]},
            { t: 'callout', variant: 'warn', tag: '警告', text: '不要在工具函数中做无限制的文件系统访问或网络请求。后续课程中的 Roots 机制可以帮助你安全地约束访问范围。' },
            { t: 'quiz', q: 'MCP 工具的 docstring（文档字符串）主要有什么作用？', options: ['仅供开发者阅读，不影响运行', '模型依靠它来理解工具用途，决定是否调用', '自动生成 API 文档页面', '替代参数的类型注解'], answer: 1, explain: 'docstring 会作为工具描述传递给语言模型，模型依靠它来判断何时应该调用这个工具。这是工具设计中最重要的部分之一。' },
            { t: 'task', title: '给你的服务器添加一个工具', steps: [
              '在 server.py 中用 `@mcp.tool()` 定义一个 `greet` 工具，接收 name: str 参数，返回问候语字符串',
              '为工具添加清晰的中文 docstring，描述它的作用',
              '运行 `mcp dev server.py`，在 Inspector 中找到 greet 工具并手动调用它',
              '确认返回结果正确，然后尝试修改 docstring 观察 Inspector 中描述的变化'
            ]}
          ]},
          { id: 'l6', title: '服务器 Inspector', blocks: [
            { t: 'lead', text: 'MCP Inspector 是官方提供的可视化调试工具，让你无需编写客户端代码就能测试服务器。本节带你掌握 Inspector 的核心用法。' },
            { t: 'h', text: '启动 Inspector' },
            { t: 'p', text: '运行 `mcp dev server.py` 即可同时启动服务器和 Inspector。Inspector 是一个运行在浏览器中的 Web UI，默认监听 5173 端口。' },
            { t: 'prompt', text: '# 启动服务器并打开 Inspector\nmcp dev server.py\n\n# 终端输出示例：\n# MCP Inspector is up and running at http://localhost:5173\n# Starting MCP server my-server...' },
            { t: 'callout', variant: 'tip', tag: '提示', text: '如果 5173 端口被占用，Inspector 会自动尝试其他端口。注意查看终端输出的实际地址。' },
            { t: 'h', text: '使用 Inspector 调用工具' },
            { t: 'p', text: 'Inspector 界面左侧列出所有已注册的工具、资源和 Prompts。点击工具后可以在右侧填入参数并手动触发调用，无需任何额外代码。' },
            { t: 'list', items: [
              '点击左侧 Tools 标签查看所有工具列表',
              '选择一个工具，右侧会显示其参数表单',
              '填写参数后点击 Run 按钮发送请求',
              '底部面板显示完整的 JSON-RPC 请求和响应内容',
              '如果工具抛出异常，错误信息会在响应面板中高亮显示'
            ]},
            { t: 'h', text: '读懂请求与响应 JSON' },
            { t: 'p', text: 'Inspector 底部会展示原始的 JSON-RPC 消息，这对理解 MCP 协议非常有帮助。一个典型的工具调用请求和响应如下：' },
            { t: 'prompt', text: '// 请求（Inspector 发送给服务器）\n{\n  "jsonrpc": "2.0",\n  "id": 1,\n  "method": "tools/call",\n  "params": {\n    "name": "add_numbers",\n    "arguments": { "a": 3, "b": 5 }\n  }\n}\n\n// 响应（服务器返回）\n{\n  "jsonrpc": "2.0",\n  "id": 1,\n  "result": {\n    "content": [{ "type": "text", "text": "8" }]\n  }\n}' },
            { t: 'callout', variant: 'key', tag: '重点', text: 'Inspector 是开发阶段的最佳调试伙伴。在把服务器接入真实 AI 客户端之前，一定要先用 Inspector 验证每个工具都能正确运行。' },
            { t: 'quiz', q: 'MCP Inspector 的主要用途是什么？', options: ['将服务器部署到生产环境', '在不编写客户端的情况下可视化测试服务器工具', '监控服务器的 CPU 和内存使用', '自动生成工具的单元测试'], answer: 1, explain: 'Inspector 提供了一个可视化的 Web UI，让开发者可以直接调用服务器工具并查看请求/响应，无需先实现客户端代码。' },
            { t: 'task', title: '用 Inspector 完整测试你的服务器', steps: [
              '确保 server.py 中已定义至少两个工具，运行 `mcp dev server.py`',
              '在浏览器打开 Inspector，点击 Tools 标签查看工具列表',
              '选择一个工具，填写参数并运行，在底部面板查看原始 JSON 请求和响应',
              '故意传入错误参数（如字符串给 int 参数），观察错误响应的格式'
            ]}
          ]}
        ]},
        { id: 'm3', title: '连接 MCP 客户端', en: 'Connecting MCP clients', locked: false, lessons: [
          { id: 'l7', title: '实现一个客户端', blocks: [
            { t: 'lead', text: '服务器写好了，现在轮到客户端登场。本节你将用 Python 实现一个真正能与 MCP 服务器通信的客户端，亲身体验完整的请求—响应流程。' },
            { t: 'h', text: 'MCP 客户端核心概念' },
            { t: 'p', text: 'MCP Python SDK 提供了 `ClientSession` 类来管理与服务器的连接。客户端通过 `StdioServerParameters` 告诉 SDK 如何启动并连接到服务器进程。' },
            { t: 'list', items: [
              'ClientSession — 管理会话生命周期，提供 list_tools()、call_tool() 等方法',
              'StdioServerParameters — 描述如何通过 STDIO 启动服务器（命令 + 参数）',
              'stdio_client — 上下文管理器，负责启动服务器进程并建立通信通道'
            ]},
            { t: 'h', text: '编写客户端代码' },
            { t: 'p', text: '以下是一个完整的 Python 客户端，连接到本地服务器、列出工具、并调用 add_numbers 工具：' },
            { t: 'prompt', text: 'import asyncio\nfrom mcp import ClientSession, StdioServerParameters\nfrom mcp.client.stdio import stdio_client\n\nasync def main():\n    # 描述如何启动服务器\n    server_params = StdioServerParameters(\n        command=\'python\',\n        args=[\'server.py\']\n    )\n\n    async with stdio_client(server_params) as (read, write):\n        async with ClientSession(read, write) as session:\n            # 初始化连接\n            await session.initialize()\n\n            # 列出所有工具\n            tools = await session.list_tools()\n            print(\'可用工具：\')\n            for tool in tools.tools:\n                print(f\'  - {tool.name}: {tool.description}\')\n\n            # 调用工具\n            result = await session.call_tool(\'add_numbers\', {\'a\': 10, \'b\': 32})\n            print(f\'\\n调用结果：{result.content[0].text}\')\n\nif __name__ == \'__main__\':\n    asyncio.run(main())' },
            { t: 'h', text: '运行客户端' },
            { t: 'p', text: '确保 server.py 在同一目录下，然后直接运行 client.py。SDK 会自动启动服务器进程、建立 STDIO 连接，完成后自动清理。' },
            { t: 'prompt', text: 'python client.py\n\n# 预期输出：\n# 可用工具：\n#   - add_numbers: 将两个整数相加并返回结果。\n#   - read_file: 读取指定路径的文件内容...\n#\n# 调用结果：42' },
            { t: 'callout', variant: 'note', tag: '注意', text: '客户端使用 async/await 语法。整个 MCP Python SDK 是异步设计的，确保你的 Python 版本 >= 3.10。' },
            { t: 'quiz', q: '在 MCP Python 客户端中，`StdioServerParameters` 的作用是什么？', options: ['存储工具的返回结果', '描述如何通过 STDIO 启动服务器进程', '管理客户端的会话状态', '定义服务器端的工具列表'], answer: 1, explain: 'StdioServerParameters 告诉客户端 SDK 用什么命令和参数来启动服务器进程，从而建立 STDIO 通信通道。' },
            { t: 'task', title: '编写你的第一个 MCP 客户端', steps: [
              '创建 client.py，粘贴上方完整客户端代码',
              '确保 server.py 中已定义 add_numbers 工具，运行 `python client.py`',
              '观察输出，确认工具列表和调用结果正确',
              '尝试修改 call_tool 调用参数，调用你自己定义的其他工具'
            ]}
          ]},
          { id: 'l8', title: '定义资源', blocks: [
            { t: 'lead', text: 'Resources 是 MCP 的第二大原语，代表服务器暴露给应用程序读取的数据。与 Tools 不同，Resources 由应用（客户端）决定何时读取，而非由模型决定。' },
            { t: 'h', text: 'Resources 与 Tools 的区别' },
            { t: 'p', text: 'Tools 是"动作"——模型主动调用来完成任务；Resources 是"数据"——应用按需读取，类似只读的数据源。典型的资源包括：配置文件、数据库记录、系统状态信息等。' },
            { t: 'callout', variant: 'key', tag: '重点', text: 'Resources 是应用控制的（application-controlled），Tools 是模型控制的（model-controlled）。这个区别决定了哪个原语适合哪类场景。' },
            { t: 'h', text: '用 @mcp.resource() 定义资源' },
            { t: 'p', text: '使用 `@mcp.resource()` 装饰器，传入资源的 URI。URI 是资源的唯一标识，客户端通过 URI 来请求读取资源内容。' },
            { t: 'prompt', text: 'from mcp.server.fastmcp import FastMCP\n\nmcp = FastMCP(\'my-server\')\n\n# 静态资源：固定 URI\n@mcp.resource(\'resource://config/app\')\ndef get_app_config() -> str:\n    \'\'\'返回应用配置文件内容\'\'\'\n    with open(\'config.json\', \'r\', encoding=\'utf-8\') as f:\n        return f.read()\n\n# 动态资源：URI 模板（使用 {参数} 占位符）\n@mcp.resource(\'resource://files/{filename}\')\ndef get_file(filename: str) -> str:\n    \'\'\'读取 data 目录下指定文件的内容\'\'\'\n    safe_path = f\'./data/{filename}\'\n    with open(safe_path, \'r\', encoding=\'utf-8\') as f:\n        return f.read()\n\nif __name__ == \'__main__\':\n    mcp.run()' },
            { t: 'h', text: 'URI 模板' },
            { t: 'p', text: '资源 URI 支持模板语法（如 `resource://files/{filename}`），大括号中的部分会映射到函数参数。这让一个资源定义可以处理多个具体路径。' },
            { t: 'list', items: [
              '静态 URI：`resource://config/app` — 固定地址，只有一份内容',
              'URI 模板：`resource://files/{filename}` — 动态地址，参数映射到函数入参',
              'URI 可以使用任何 scheme，`resource://` 只是惯例，也可以用 `file://`、`db://` 等'
            ]},
            { t: 'quiz', q: '以下哪种场景最适合用 Resource（而非 Tool）来实现？', options: ['执行一段 Python 代码并返回结果', '向数据库写入一条新记录', '提供应用的只读配置信息供客户端读取', '调用外部 API 发送邮件'], answer: 2, explain: 'Resource 适合暴露只读数据，如配置文件、数据库查询结果等。写操作和有副作用的动作应使用 Tool。' },
            { t: 'task', title: '为服务器添加资源', steps: [
              '在 server.py 中用 `@mcp.resource()` 定义一个返回当前时间的资源，URI 为 `resource://system/time`',
              '再定义一个带 URI 模板的资源，如 `resource://notes/{note_id}`，返回对应笔记内容（可硬编码测试数据）',
              '用 `mcp dev server.py` 启动，在 Inspector 的 Resources 标签中查看它们',
              '在 Inspector 中读取这两个资源，确认返回内容正确'
            ]}
          ]},
          { id: 'l9', title: '访问资源', blocks: [
            { t: 'lead', text: '定义好资源之后，客户端如何读取它们？本节你将在客户端代码中调用 `list_resources()` 和 `read_resource()`，掌握完整的资源访问流程。' },
            { t: 'h', text: '列出可用资源' },
            { t: 'p', text: '`session.list_resources()` 返回服务器上所有已注册资源的元数据，包括 URI、名称和描述。注意 URI 模板资源会以模板形式列出。' },
            { t: 'prompt', text: 'import asyncio\nfrom mcp import ClientSession, StdioServerParameters\nfrom mcp.client.stdio import stdio_client\n\nasync def main():\n    server_params = StdioServerParameters(command=\'python\', args=[\'server.py\'])\n\n    async with stdio_client(server_params) as (read, write):\n        async with ClientSession(read, write) as session:\n            await session.initialize()\n\n            # 列出所有资源\n            resources = await session.list_resources()\n            print(\'可用资源：\')\n            for r in resources.resources:\n                print(f\'  URI: {r.uri}\')\n                print(f\'  描述: {r.description}\')\n\n            # 读取具体资源\n            content = await session.read_resource(\'resource://config/app\')\n            print(f\'\\n配置内容：\')\n            for item in content.contents:\n                print(item.text)\n\nif __name__ == \'__main__\':\n    asyncio.run(main())' },
            { t: 'h', text: '读取资源内容' },
            { t: 'p', text: '`session.read_resource(uri)` 接受一个具体的 URI 字符串（不是模板），返回资源内容。对于 URI 模板资源，需要传入填充后的完整 URI。' },
            { t: 'callout', variant: 'note', tag: '注意', text: '读取 URI 模板资源时，要传入填充完整参数的 URI。例如模板是 `resource://files/{filename}`，读取时应传 `resource://files/readme.txt`。' },
            { t: 'h', text: '资源的典型使用场景' },
            { t: 'list', items: [
              '在对话开始时，客户端读取配置资源并注入到系统提示中',
              '用户打开文件时，应用读取文件资源作为上下文传给模型',
              '定期刷新状态资源（如服务器健康状态），不依赖模型触发',
              '让模型在需要时"请求"应用去读取某个资源（应用控制访问时机）'
            ]},
            { t: 'callout', variant: 'key', tag: '重点', text: '资源的读取时机由应用程序（而非模型）控制。模型不能直接"调用"资源，它可以提示应用去读取，但决定权在应用侧。' },
            { t: 'quiz', q: '在客户端代码中，读取 URI 模板资源 `resource://users/{user_id}` 时，正确的做法是？', options: ['传入模板字符串 resource://users/{user_id}', '传入填充后的完整 URI，如 resource://users/42', '先调用 list_resources() 获取模板，再单独解析', '使用 call_tool() 而不是 read_resource()'], answer: 1, explain: 'read_resource() 需要完整的、已填充参数的 URI。模板只是服务器声明支持哪些 URI 格式，实际读取时必须提供具体值。' },
            { t: 'task', title: '在客户端中读取资源', steps: [
              '确保 server.py 中已定义至少一个静态资源和一个模板资源',
              '在 client.py 中添加调用 `session.list_resources()` 的代码，打印所有资源信息',
              '使用 `session.read_resource()` 读取静态资源，打印其内容',
              '构造一个填充后的模板 URI，读取模板资源并打印结果'
            ]}
          ]},
          { id: 'l10', title: '定义 prompts', blocks: [
            { t: 'lead', text: 'Prompts 是 MCP 的第三大原语，由用户触发。它们是可复用的提示模板，允许用户用标准化的方式启动特定类型的对话。' },
            { t: 'h', text: '什么是 MCP Prompts' },
            { t: 'p', text: 'Prompts 不是发给模型的消息，而是"消息模板"——带有占位参数的预设对话结构。用户或应用选择一个 Prompt、填入参数，得到可直接使用的消息列表。' },
            { t: 'list', items: [
              'Prompts 由用户触发（user-triggered），区别于 Tools（模型触发）和 Resources（应用触发）',
              '每个 Prompt 可以有参数，类似函数入参',
              '返回值是 PromptMessage 对象列表，可直接用于构建对话',
              '适合场景：代码审查模板、邮件起草模板、数据分析引导等'
            ]},
            { t: 'h', text: '用 @mcp.prompt() 定义模板' },
            { t: 'p', text: '使用 `@mcp.prompt()` 装饰器定义 Prompt 函数。函数接收模板参数，返回一个或多个 PromptMessage 对象。' },
            { t: 'prompt', text: 'from mcp.server.fastmcp import FastMCP\nfrom mcp.types import PromptMessage, TextContent\n\nmcp = FastMCP(\'my-server\')\n\n@mcp.prompt()\ndef code_review(code: str, language: str = \'python\') -> list[PromptMessage]:\n    \'\'\'生成代码审查提示模板\'\'\'\n    return [\n        PromptMessage(\n            role=\'user\',\n            content=TextContent(\n                type=\'text\',\n                text=f\'请审查以下 {language} 代码，指出潜在问题并给出改进建议：\\n\\n```{language}\\n{code}\\n```\'\n            )\n        )\n    ]\n\n@mcp.prompt()\ndef summarize_document(document: str, style: str = \'简洁\') -> list[PromptMessage]:\n    \'\'\'生成文档摘要提示模板，支持指定摘要风格\'\'\'\n    return [\n        PromptMessage(\n            role=\'user\',\n            content=TextContent(\n                type=\'text\',\n                text=f\'请以{style}的风格为以下文档写一段摘要：\\n\\n{document}\'\n            )\n        )\n    ]\n\nif __name__ == \'__main__\':\n    mcp.run()' },
            { t: 'h', text: 'PromptMessage 结构' },
            { t: 'p', text: '每个 PromptMessage 包含 role（\'user\' 或 \'assistant\'）和 content（通常是 TextContent）。你可以返回多条消息来构建多轮对话模板。' },
            { t: 'callout', variant: 'tip', tag: '提示', text: '可以在 Prompt 中混合 user 和 assistant 角色的消息，来构建"少样本示例"（few-shot）对话模板，引导模型输出特定格式。' },
            { t: 'quiz', q: 'MCP Prompts 的控制方是谁？', options: ['语言模型（model-controlled）', '服务器进程（server-controlled）', '用户或应用（user-triggered）', '系统自动触发（auto-triggered）'], answer: 2, explain: 'Prompts 是 user-triggered 的，由用户或应用选择并触发。这与 Tools（模型决定调用）和 Resources（应用决定读取）不同。' },
            { t: 'task', title: '为服务器添加 Prompt 模板', steps: [
              '在 server.py 中使用 `@mcp.prompt()` 定义一个 `translate` prompt，接收 text 和 target_lang 两个参数',
              '返回包含翻译请求的 PromptMessage 列表',
              '用 `mcp dev server.py` 启动，在 Inspector 的 Prompts 标签中找到它',
              '在 Inspector 中填入参数并运行，查看生成的消息内容'
            ]}
          ]},
          { id: 'l11', title: '客户端中的 prompts', blocks: [
            { t: 'lead', text: '最后一步：在客户端中列出并使用 Prompts。本节你将看到完整的 Prompt 使用流程，以及如何将 Prompt 结果整合到实际对话中。' },
            { t: 'h', text: '列出可用 Prompts' },
            { t: 'p', text: '`session.list_prompts()` 返回服务器上所有已注册 Prompt 的元数据，包括名称、描述和参数列表。这让客户端可以动态展示可用模板给用户。' },
            { t: 'prompt', text: 'import asyncio\nfrom mcp import ClientSession, StdioServerParameters\nfrom mcp.client.stdio import stdio_client\n\nasync def main():\n    server_params = StdioServerParameters(command=\'python\', args=[\'server.py\'])\n\n    async with stdio_client(server_params) as (read, write):\n        async with ClientSession(read, write) as session:\n            await session.initialize()\n\n            # 列出所有 Prompts\n            prompts = await session.list_prompts()\n            print(\'可用 Prompts：\')\n            for p in prompts.prompts:\n                print(f\'  名称: {p.name}\')\n                print(f\'  描述: {p.description}\')\n                print(f\'  参数: {[arg.name for arg in (p.arguments or [])]}\')\n\n            # 使用 code_review prompt\n            result = await session.get_prompt(\n                \'code_review\',\n                arguments={\n                    \'code\': \'def add(a, b):\\n    return a + b\',\n                    \'language\': \'python\'\n                }\n            )\n\n            print(\'\\n生成的消息模板：\')\n            for msg in result.messages:\n                print(f\'[{msg.role}] {msg.content.text[:100]}...\')\n\nif __name__ == \'__main__\':\n    asyncio.run(main())' },
            { t: 'h', text: 'get_prompt() 的返回值' },
            { t: 'p', text: '`session.get_prompt(name, arguments)` 返回填充好参数的消息列表。这些消息可以直接传给 LLM API（如 Anthropic Claude）作为对话历史使用。' },
            { t: 'callout', variant: 'key', tag: '重点', text: 'Prompt 的价值在于标准化和可复用。将常用的提示模板放在服务器端，所有客户端都能共享，修改时也只需改一处。' },
            { t: 'h', text: '三大原语回顾' },
            { t: 'list', items: [
              'Tools：模型决定调用，有副作用，执行动作（call_tool）',
              'Resources：应用决定读取，只读数据（read_resource）',
              'Prompts：用户触发，消息模板，标准化交互（get_prompt）'
            ]},
            { t: 'quiz', q: '`session.get_prompt()` 的返回值可以直接用于什么场景？', options: ['作为服务器工具的输入参数', '直接传给 LLM API 作为对话消息', '替代 read_resource() 读取资源内容', '触发服务器端的资源刷新'], answer: 1, explain: 'get_prompt() 返回已填充参数的 PromptMessage 列表，这些消息遵循标准的 role/content 格式，可以直接传给 Anthropic Claude 等 LLM API。' },
            { t: 'task', title: '完整使用 Prompt 流程', steps: [
              '在 client.py 中调用 `session.list_prompts()`，打印所有可用 Prompt 的名称和参数',
              '调用 `session.get_prompt()` 获取一个 Prompt 的填充结果',
              '打印返回的消息内容，理解其结构',
              '（进阶）将返回的消息列表传给 Anthropic Claude API，获取真实的模型回复'
            ]}
          ]}
        ]},
        { id: 'm4', title: '评估与总结', en: 'Assessment & wrap-up', locked: false, lessons: [
          { id: 'l12', title: 'MCP 期末测评', blocks: [
            { t: 'lead', text: '恭喜你完成了所有课程内容！现在用这套综合测评检验一下你对 MCP 的理解。每道题都考察一个核心知识点，认真作答吧。' },
            { t: 'quiz', q: 'MCP（Model Context Protocol）的主要目标是什么？', options: ['提高模型的训练速度', '为 AI 模型与外部工具/数据源提供标准化的通信协议', '替代 REST API 成为通用 Web 标准', '提供模型托管和部署服务'], answer: 1, explain: 'MCP 是一个开放协议，标准化了 AI 模型（通过客户端）与外部工具和数据源（通过服务器）之间的通信方式，类似 AI 领域的 USB-C 接口。' },
            { t: 'quiz', q: 'MCP 的三大原语分别由谁控制？', options: ['Tools 由用户控制，Resources 由模型控制，Prompts 由应用控制', 'Tools 由模型控制，Resources 由应用控制，Prompts 由用户触发', '三者都由模型控制，通过不同方式触发', '三者都由服务器控制，客户端只负责展示'], answer: 1, explain: 'Tools 是 model-controlled（模型决定调用），Resources 是 application-controlled（应用决定读取），Prompts 是 user-triggered（用户触发）。' },
            { t: 'quiz', q: '在 FastMCP 中，工具的 docstring 主要用来做什么？', options: ['生成自动化测试用例', '告诉语言模型这个工具的用途，帮助模型决定何时调用', '验证函数参数类型是否正确', '作为 Inspector 的 API 文档'], answer: 1, explain: 'docstring 会作为工具描述（description）传递给语言模型。模型依赖这段文字来理解工具的功能，从而判断在当前对话中是否应该调用它。' },
            { t: 'quiz', q: '以下哪种数据最适合用 Resource 而非 Tool 来暴露？', options: ['执行一个 shell 命令并返回输出', '向数据库插入新记录', '返回应用的只读配置信息', '发起一个 HTTP POST 请求'], answer: 2, explain: 'Resource 专为只读数据设计，由应用按需读取。有副作用的操作（执行命令、写数据库、发 HTTP 请求）应该使用 Tool。' },
            { t: 'quiz', q: '`mcp dev server.py` 命令的作用是？', options: ['将服务器部署到云端', '以开发模式启动服务器并打开 Inspector 界面', '运行服务器的单元测试套件', '生成服务器的 API 文档'], answer: 1, explain: '`mcp dev` 是开发模式启动命令，会同时启动 MCP 服务器和 Inspector Web UI，方便开发者在不编写客户端的情况下测试工具。' },
            { t: 'quiz', q: '在 Python MCP 客户端中，调用工具应该使用哪个方法？', options: ['session.run_tool()', 'session.call_tool()', 'session.execute()', 'session.invoke_tool()'], answer: 1, explain: '`session.call_tool(name, arguments)` 是 ClientSession 提供的标准方法，用于调用服务器端已注册的工具并获取返回结果。' },
            { t: 'quiz', q: '使用 `@mcp.resource()` 装饰器时，URI 模板中的 `{param}` 占位符有什么作用？', options: ['定义资源的访问权限级别', '映射到函数的对应参数，实现动态 URI', '指定资源内容的 MIME 类型', '设置资源的缓存过期时间'], answer: 1, explain: 'URI 模板中的 `{param}` 会映射到函数的同名参数。例如 `resource://files/{filename}` 中的 `{filename}` 对应函数的 `filename: str` 参数。' },
            { t: 'quiz', q: 'Prompt 模板的返回值类型是什么？', options: ['str（纯文本字符串）', 'dict（字典对象）', 'list[PromptMessage]（消息对象列表）', 'bytes（二进制内容）'], answer: 2, explain: 'Prompt 函数应返回 list[PromptMessage]，每个 PromptMessage 包含 role 和 content 字段，格式与 LLM API 的消息格式兼容。' },
            { t: 'task', title: '综合实战：搭建一个完整的 MCP 服务器', steps: [
              '创建一个新的 server.py，同时包含至少 2 个 Tool、1 个 Resource 和 1 个 Prompt',
              '用 `mcp dev server.py` 启动，在 Inspector 中分别测试每种原语',
              '编写对应的 client.py，依次调用 list_tools、list_resources、list_prompts，并各调用一个',
              '确认所有功能正常运行，记录你遇到的问题和解决方法'
            ]}
          ]},
          { id: 'l13', title: 'MCP 回顾', blocks: [
            { t: 'lead', text: '你已经完成了整个 MCP 入门课程！让我们回顾一下这段学习旅程，并展望接下来可以构建的精彩内容。' },
            { t: 'h', text: '我们学了什么' },
            { t: 'p', text: '从零开始，你已经掌握了构建完整 MCP 应用所需的全部基础知识：' },
            { t: 'list', items: [
              '什么是 MCP：AI 工具集成的标准化协议，解决碎片化问题',
              '三大原语：Tools（模型控制）、Resources（应用控制）、Prompts（用户触发）',
              '搭建服务器：FastMCP、`@mcp.tool()`、`@mcp.resource()`、`@mcp.prompt()`',
              '调试工具：MCP Inspector，无需客户端即可测试',
              '编写客户端：ClientSession、list_tools、call_tool、read_resource、get_prompt'
            ]},
            { t: 'h', text: '接下来可以构建什么' },
            { t: 'p', text: '掌握了基础之后，以下是一些可以马上动手的真实项目方向：' },
            { t: 'list', items: [
              '数据库 MCP 服务器：将 SQLite 或 PostgreSQL 通过 Tools 暴露给 AI 助手',
              'GitHub 集成：用 Tool 封装 GitHub API，让模型直接操作 issue 和 PR',
              '文件系统助手：用 Resource 暴露工作目录，用 Tool 实现文件读写',
              '连接 Claude Desktop：将你的服务器配置到 Claude Desktop，真实使用'
            ]},
            { t: 'callout', variant: 'tip', tag: '提示', text: '准备好深入了解 Sampling、Roots、StreamableHTTP 等进阶特性了吗？继续学习《MCP 进阶专题》课程，解锁生产级 MCP 服务器的构建技能！' },
            { t: 'h', text: '给自己一个鼓励' },
            { t: 'p', text: 'MCP 是 AI 工程领域的前沿技术。掌握它，你就拥有了将任何工具、数据库、API 与 AI 模型无缝连接的能力。这个技能将在未来的 AI 应用开发中变得越来越重要。继续探索，继续构建！' },
            { t: 'callout', variant: 'note', tag: '注意', text: '本课程的所有示例代码都可以作为真实项目的起点。记得在生产环境中添加错误处理、日志记录和安全校验。' },
            { t: 'quiz', q: '学完 MCP 入门后，下一步最合适的进阶方向是什么？', options: ['直接学习如何训练自己的语言模型', '学习 MCP 进阶专题，掌握 Sampling、Roots 和 StreamableHTTP', '转向学习前端框架，与 MCP 无关', '学习如何部署 Kubernetes 集群'], answer: 1, explain: 'MCP 进阶专题涵盖 Sampling（服务器请求 LLM 调用）、Roots（文件访问安全机制）、StreamableHTTP（远程部署传输）等生产级特性，是自然的下一步。' },
            { t: 'task', title: '规划你的第一个真实 MCP 项目', steps: [
              '思考一个你日常工作或学习中的重复性任务，想想能否用 MCP 工具自动化',
              '画出你的服务器架构：需要哪些 Tools、Resources 和 Prompts',
              '用本课程所学搭建一个最小可用版本（MVP），先让核心功能跑通',
              '在 Inspector 中测试，然后接入 Claude Desktop 或自己的客户端真实使用'
            ]}
          ]}
        ]},
      ],
    },

    { id: 'mcpadv', title: 'MCP 进阶专题', en: 'MCP: Advanced Topics', level: '高级', academy: 'anthropic',
      desc: '生产级 MCP：采样(sampling)、通知、Roots 与传输机制。',
      longDesc: '这门进阶课假设你已经会构建基本的 MCP 服务器，深入生产级主题：采样、通知系统、Roots 文件访问，以及不同的传输机制与部署考量。',
      modules: [
        { id: 'm1', title: '介绍', en: 'Introduction', locked: false, lessons: [
          { id: 'l1', title: '开始吧', blocks: [
            { t: 'lead', text: '这门进阶课假设你已经会构建基本的 MCP 服务器。我们将深入生产级主题：采样(sampling)、通知、Roots 文件访问，以及不同的传输机制。' },
            { t: 'h', text: '你将深入的主题' },
            { t: 'list', items: ['Sampling：让服务器借用客户端的模型能力，把 AI 成本和复杂度留在客户端','日志与进度通知：为长任务提供实时反馈','Roots：受控的文件系统访问，划定安全边界','传输：STDIO 与 StreamableHTTP 两种机制','生产部署：有状态 vs 无状态、横向扩展的取舍'] },
            { t: 'callout', variant: 'note', tag: '前置要求', text: '需要 Python 异步编程经验，熟悉 JSON 消息和 HTTP 协议，了解 Server-Sent Events（SSE）。建议先完成「MCP 入门」。' },
            { t: 'quiz', q: '这门进阶课最适合谁？', options: ['完全没写过代码的人','已能构建基本 MCP 服务器、想上生产环境的开发者','只用聊天的普通用户','产品经理'], answer: 1, explain: '进阶课面向已掌握 MCP 基础、需要处理采样、通知、传输和部署等生产级问题的开发者。' },
            { t: 'task', title: '回顾基础', steps: ['确认你能独立写出一个带工具的 MCP 服务器','回顾工具、资源、提示三原语','准备好进入生产级话题'] },
          ]},
        ]},
        { id: 'm2', title: '核心特性', en: 'Core MCP features', locked: false, lessons: [
          { id: 'l2', title: 'Sampling', blocks: [
            { t: 'lead', text: 'Sampling 是 MCP 中最独特的机制之一：它让服务器可以反向请求客户端去调用 LLM。理解这个设计，是掌握进阶 MCP 的关键一步。' },
            { t: 'h', text: '什么是 Sampling' },
            { t: 'p', text: '在常规流程中，客户端调用服务器工具。而 Sampling 反转了这个方向：服务器在执行工具时，可以向客户端发送 sampling/createMessage 请求，让客户端代它调用 LLM。' },
            { t: 'list', items: ['服务器不需要持有 API Key，模型访问权限集中在客户端','模型调用的费用由客户端（用户）承担，服务器无需管理账单','服务器可以在工具逻辑中借助模型能力处理复杂任务','人机回路（Human-in-the-loop）：客户端可以在转发请求前让用户审核'] },
            { t: 'h', text: '为什么这个设计很重要' },
            { t: 'p', text: '这个设计解决了一个现实问题：如果每个 MCP 服务器都需要自己的 API Key，部署和费用管理会非常复杂。Sampling 让服务器保持无状态，所有 LLM 访问都通过客户端统一管控。' },
            { t: 'callout', variant: 'key', tag: '重点', text: 'Sampling 体现了 MCP 的核心设计哲学：将模型访问权限和费用控制权留在客户端（用户侧），服务器只负责业务逻辑。' },
            { t: 'callout', variant: 'warn', tag: '警告', text: '恶意服务器理论上可以通过 Sampling 请求注入不安全内容。客户端实现时应考虑展示给用户审核，或实现内容过滤机制。' },
            { t: 'quiz', q: 'Sampling 机制中，谁负责持有 LLM API Key 并实际调用模型？', options: ['MCP 服务器','MCP 客户端','MCP Inspector','FastMCP 框架自动管理'], answer: 1, explain: 'Sampling 的设计初衷就是让 API Key 和模型访问权限留在客户端。服务器只发出 sampling/createMessage 请求，客户端决定如何处理（包括是否让用户审核）。' },
            { t: 'task', title: '理解 Sampling 的数据流', steps: ['画出一个 Sampling 请求的完整流程图：用户 → 客户端 → 服务器工具 → Sampling 请求 → 客户端 → LLM → 返回结果','思考：哪些类型的工具最适合用 Sampling？（例如：需要总结文本、生成报告的工具）','查阅 MCP 官方文档中关于 sampling/createMessage 的参数格式','对比 Sampling 和直接在服务器中调用 LLM API 两种方式的优缺点'] },
          ]},
          { id: 'l3', title: 'Sampling 实战', blocks: [
            { t: 'lead', text: '理论讲完，现在写代码。本节你将实现一个使用 Sampling 的工具，以及对应的客户端处理逻辑，完整跑通整个流程。' },
            { t: 'h', text: '服务器端：发起 Sampling 请求' },
            { t: 'prompt', text: 'from mcp.server.fastmcp import FastMCP, Context\nfrom mcp.types import SamplingMessage, TextContent\n\nmcp = FastMCP(\'sampling-demo\')\n\n@mcp.tool()\nasync def summarize_text(text: str, ctx: Context) -> str:\n    \'\'\'使用 LLM 对给定文本生成摘要（通过 Sampling 机制）\'\'\'\n    result = await ctx.session.create_message(\n        messages=[\n            SamplingMessage(\n                role=\'user\',\n                content=TextContent(\n                    type=\'text\',\n                    text=f\'请用两句话概括以下内容：\\n\\n{text}\'\n                )\n            )\n        ],\n        max_tokens=200\n    )\n    return result.content.text\n\nif __name__ == \'__main__\':\n    mcp.run()' },
            { t: 'h', text: '客户端：处理 Sampling 请求' },
            { t: 'p', text: '客户端需要注册一个 sampling_handler 来处理服务器发来的 Sampling 请求。这个处理器负责调用实际的 LLM API 并返回结果。' },
            { t: 'callout', variant: 'tip', tag: '提示', text: '在测试 Sampling 时，可以先用一个模拟的 sampling_handler（直接返回固定字符串），不需要真实的 API Key 也能验证流程是否正确。' },
            { t: 'quiz', q: '在服务器端工具中发起 Sampling 请求，需要通过什么对象调用 create_message()？', options: ['直接调用 mcp.create_message()','通过 Context 参数的 session 属性调用','通过导入 anthropic 库直接调用','通过全局变量 SESSION 调用'], answer: 1, explain: '工具函数需要声明 `ctx: Context` 参数，FastMCP 会自动注入。然后通过 `ctx.session.create_message()` 向客户端发起 Sampling 请求。' },
            { t: 'task', title: '实现并运行一个 Sampling 工具', steps: ['按照上方代码实现 server.py 中的 summarize_text 工具','实现 client.py，注册 sampling_handler（可先用返回固定字符串的模拟版本）','运行客户端，调用 summarize_text 工具，确认 Sampling 流程正常工作','（进阶）替换为真实的 Anthropic API 调用，测试完整流程'] },
          ]},
          { id: 'l4', title: '日志与进度通知', blocks: [
            { t: 'lead', text: '生产级的 MCP 服务器需要可观测性。日志通知和进度通知是 MCP 内置的两种机制，让客户端实时了解服务器工具的执行状态。' },
            { t: 'h', text: '两种通知原语' },
            { t: 'list', items: ['日志通知（Log Notification）：发送结构化日志消息，支持 debug / info / warning / error 四个级别','进度通知（Progress Notification）：发送当前进度和总量，适合有明确完成标准的长任务','两者都是单向推送（服务器 → 客户端），不需要客户端响应','帮助开发者调试问题，帮助用户了解任务状态'] },
            { t: 'h', text: '日志通知' },
            { t: 'p', text: '通过 `ctx.session.send_log_message()` 发送日志。客户端可以选择展示给用户、写入日志文件、或两者都做。' },
            { t: 'callout', variant: 'key', tag: '重点', text: '日志级别的选择很重要：debug 用于详细调试信息，info 用于正常流程节点，warning 用于非致命异常，error 用于需要关注的错误。' },
            { t: 'callout', variant: 'note', tag: '注意', text: 'Progress Token 由客户端在发起工具调用时提供（在请求的 meta 字段中），服务器在发送进度时引用它。没有 token 就无法发送进度通知。' },
            { t: 'quiz', q: '以下哪个级别的日志通知最适合记录工具成功完成一个主要步骤？', options: ['debug','info','warning','error'], answer: 1, explain: 'info 级别用于正常流程中的重要节点，如文件读取完成、API 调用成功。debug 用于更详细的调试信息，warning 和 error 用于异常情况。' },
            { t: 'task', title: '了解通知机制的结构', steps: ['查阅 MCP Python SDK 文档，找到 send_log_message 和 send_progress 的完整参数列表','理解 progress_token 的作用：它如何让客户端将进度更新与对应的工具调用关联起来','思考你常用工具中哪些步骤适合添加 info 日志，哪些长步骤适合发送进度通知','在下一课实战中，准备好用这些知识编写代码'] },
          ]},
          { id: 'l5', title: '通知实战', blocks: [
            { t: 'lead', text: '现在把日志和进度通知用到实际代码中。本节包含完整的 Python 示例，展示如何在长任务工具里添加通知，以及客户端如何接收它们。' },
            { t: 'h', text: '服务器：发送日志和进度' },
            { t: 'prompt', text: 'from mcp.server.fastmcp import FastMCP, Context\nimport asyncio\n\nmcp = FastMCP(\'notification-demo\')\n\n@mcp.tool()\nasync def process_files(file_count: int, ctx: Context) -> str:\n    \'\'\'模拟批量处理文件，展示日志和进度通知\'\'\'\n    await ctx.session.send_log_message(level=\'info\', data=f\'开始处理 {file_count} 个文件\')\n\n    for i in range(file_count):\n        await asyncio.sleep(0.5)\n        await ctx.session.send_log_message(level=\'debug\', data=f\'正在处理文件 {i + 1}/{file_count}\')\n\n        if ctx.meta and ctx.meta.progress_token:\n            await ctx.session.send_progress(\n                progress_token=ctx.meta.progress_token,\n                progress=i + 1,\n                total=file_count\n            )\n\n    await ctx.session.send_log_message(level=\'info\', data=f\'所有 {file_count} 个文件处理完成\')\n    return f\'成功处理 {file_count} 个文件\'\n\nif __name__ == \'__main__\':\n    mcp.run()' },
            { t: 'h', text: '客户端：接收通知' },
            { t: 'p', text: '客户端可以通过注册回调来处理服务器推送的日志和进度通知：' },
            { t: 'callout', variant: 'tip', tag: '提示', text: '在生产环境中，日志通知可以直接写入你的日志系统（如 Datadog、CloudWatch），进度通知可以驱动前端的进度条 UI，两者都不需要修改服务器代码。' },
            { t: 'quiz', q: '服务器发送进度通知时，progress_token 参数的来源是？', options: ['FastMCP 框架自动生成','服务器工具函数自己生成','由客户端在发起工具调用时提供','从环境变量中读取'], answer: 2, explain: 'progress_token 由客户端在调用工具时通过请求的 meta 字段传递。服务器发送进度通知时引用这个 token，让客户端能将进度更新与对应的调用关联起来。' },
            { t: 'task', title: '为你的工具添加通知', steps: ['在你已有的 server.py 中选一个工具，添加 `ctx: Context` 参数','在工具的关键步骤添加 send_log_message() 调用（至少 info 和 debug 各一条）','运行服务器并在 Inspector 中调用该工具，观察 Inspector 中是否显示日志消息','（进阶）实现客户端的 on_log_message 回调，将日志打印到终端'] },
          ]},
          { id: 'l6', title: 'Roots', blocks: [
            { t: 'lead', text: 'Roots 是 MCP 的安全机制：客户端告诉服务器它被允许访问哪些文件路径，防止服务器越界读写文件系统。这对生产环境的安全至关重要。' },
            { t: 'h', text: '为什么需要 Roots' },
            { t: 'p', text: '没有 Roots 时，一个提供读取文件功能的 MCP 服务器理论上可以访问用户电脑上的任何文件。Roots 机制让用户能够明确声明服务器的访问边界。' },
            { t: 'list', items: ['客户端（代表用户）声明允许访问的目录列表（Roots）','服务器可以通过 roots/list 请求获知这些边界','服务器有责任将所有文件操作限制在这些目录范围内','典型场景：用户打开一个项目文件夹，将该文件夹作为 Root 授权给服务器'] },
            { t: 'callout', variant: 'warn', tag: '警告', text: 'Roots 机制依赖服务器自觉遵守边界。MCP 协议本身不强制拦截越界访问——服务器必须在自己的代码中实现路径验证逻辑。选择可信的服务器实现同样重要。' },
            { t: 'callout', variant: 'key', tag: '重点', text: 'Roots 的设计哲学与 Sampling 一致：控制权在客户端（用户）。用户决定哪些文件夹对服务器可见，而不是服务器自己决定能访问什么。' },
            { t: 'quiz', q: 'MCP Roots 机制中，谁负责声明允许访问的文件路径列表？', options: ['MCP 服务器','MCP 客户端（代表用户）','FastMCP 框架自动检测','操作系统文件权限系统'], answer: 1, explain: 'Roots 由客户端声明，代表用户的意图。客户端在初始化或运行时向服务器提供允许访问的目录列表，服务器需要在自己的逻辑中遵守这些边界。' },
            { t: 'task', title: '理解 Roots 的安全模型', steps: ['思考：如果没有 Roots 机制，一个恶意的 MCP 服务器可以做哪些危险的事情','查阅 MCP 规范中 roots/list 请求和响应的 JSON 格式','设计一个路径验证函数：接收文件路径和 Roots 列表，返回该路径是否在允许范围内','思考 Roots 和操作系统文件权限的区别，以及为什么两者都是必要的'] },
          ]},
          { id: 'l7', title: 'Roots 实战', blocks: [
            { t: 'lead', text: '把 Roots 概念落地到代码中。本节展示服务器如何请求 Roots 列表，以及如何用这些路径安全地约束文件访问。' },
            { t: 'h', text: '服务器请求 Roots 并验证路径' },
            { t: 'prompt', text: 'from mcp.server.fastmcp import FastMCP, Context\nfrom pathlib import Path\n\nmcp = FastMCP(\'roots-demo\')\n\ndef is_path_within_roots(file_path: str, roots: list) -> bool:\n    \'\'\'检查文件路径是否在允许的 Roots 范围内\'\'\'\n    target = Path(file_path).resolve()\n    for root in roots:\n        root_path = Path(root.uri.replace(\'file://\', \'\')).resolve()\n        try:\n            target.relative_to(root_path)\n            return True\n        except ValueError:\n            continue\n    return False\n\n@mcp.tool()\nasync def safe_read_file(file_path: str, ctx: Context) -> str:\n    \'\'\'安全地读取文件，只允许访问客户端声明的 Roots 范围内的路径\'\'\'\n    roots_result = await ctx.session.list_roots()\n    roots = roots_result.roots\n\n    if not roots:\n        return \'错误：客户端未声明任何 Root，无法访问文件\'\n\n    if not is_path_within_roots(file_path, roots):\n        return f\'错误：路径 {file_path} 不在允许的范围内。\'\n\n    with open(file_path, \'r\', encoding=\'utf-8\') as f:\n        return f.read()\n\nif __name__ == \'__main__\':\n    mcp.run()' },
            { t: 'h', text: '客户端声明 Roots' },
            { t: 'p', text: '客户端在创建 Session 时，通过 roots 参数声明允许服务器访问的目录列表。Root 的 URI 使用 file:// 前缀的文件系统路径格式。' },
            { t: 'callout', variant: 'tip', tag: '提示', text: 'Root 的 URI 在 macOS/Linux 上格式为 file:///home/... 或 file:///Users/...，在 Windows 上为 file:///C:/Users/...。' },
            { t: 'quiz', q: '在服务器代码中，通过什么方法获取客户端声明的 Roots 列表？', options: ['mcp.get_roots()','ctx.session.list_roots()','ctx.roots','session.request_roots()'], answer: 1, explain: '通过 `ctx.session.list_roots()` 发起 roots/list 请求，客户端返回其声明的 Root 列表。这需要工具函数声明 `ctx: Context` 参数。' },
            { t: 'task', title: '实现带 Roots 安全检查的文件工具', steps: ['按照上方代码实现 safe_read_file 工具，包含完整的路径验证逻辑','在 client.py 中声明两个 Roots（当前目录和一个子目录）','尝试读取 Roots 范围内的文件（应成功），再尝试读取范围外的文件（应被拒绝）','观察两种情况下的日志输出，确认安全边界正确生效'] },
          ]},
        ]},
        { id: 'm3', title: '传输与通信', en: 'Transports & communication', locked: false, lessons: [
          { id: 'l8', title: 'JSON 消息类型', blocks: [
            { t: 'lead', text: 'MCP 底层使用 JSON-RPC 2.0 作为消息格式。理解四种消息类型，是真正掌握 MCP 通信机制的基础。' },
            { t: 'h', text: '四种消息类型' },
            { t: 'list', items: ['Request（请求）：带 id + method + params，期待对方响应','Response（响应）：带相同的 id + result 或 error，是对 Request 的回答','Notification（通知）：只有 method，没有 id，单向推送，不需要响应','Error（错误响应）：带 id + error 对象（含 code、message、data），请求处理失败时返回'] },
            { t: 'prompt', text: '// Request — 客户端调用工具\n{\n  "jsonrpc": "2.0",\n  "id": "req-001",\n  "method": "tools/call",\n  "params": { "name": "add_numbers", "arguments": { "a": 3, "b": 5 } }\n}\n\n// Response — 服务器成功响应\n{\n  "jsonrpc": "2.0",\n  "id": "req-001",\n  "result": { "content": [{ "type": "text", "text": "8" }] }\n}\n\n// Notification — 服务器推送日志（无 id）\n{\n  "jsonrpc": "2.0",\n  "method": "notifications/message",\n  "params": { "level": "info", "data": "处理完成" }\n}\n\n// Error Response — 请求处理失败\n{\n  "jsonrpc": "2.0",\n  "id": "req-001",\n  "error": { "code": -32602, "message": "参数类型错误" }\n}' },
            { t: 'callout', variant: 'key', tag: '重点', text: 'id 字段是区分 Request/Response 与 Notification 的关键：有 id 的是 Request 或 Response（需要配对），没有 id 的是 Notification（单向推送）。' },
            { t: 'h', text: '消息流向' },
            { t: 'p', text: '消息并非只从客户端流向服务器。Sampling 请求是服务器向客户端发送的 Request；日志通知是服务器向客户端发送的 Notification；Roots 请求也是服务器向客户端发的 Request。' },
            { t: 'quiz', q: '服务器发送进度通知时，应该使用哪种 JSON-RPC 消息类型？', options: ['Request（因为需要客户端确认收到）','Response（作为工具调用的中间响应）','Notification（单向推送，不需要响应）','Error（进度更新属于特殊错误类型）'], answer: 2, explain: '进度通知是单向推送，服务器不需要等待客户端确认。Notification 类型没有 id，客户端收到后处理即可，无需回复。' },
            { t: 'task', title: '分析 Inspector 中的原始消息', steps: ['启动 `mcp dev server.py`，在 Inspector 中调用一个工具','打开 Inspector 底部的原始消息面板，找到工具调用的 Request 消息，记录其 id','找到对应的 Response 消息，确认其 id 与 Request 相同','如果工具有日志通知，找到 Notification 消息，确认它没有 id 字段'] },
          ]},
          { id: 'l9', title: 'STDIO 传输', blocks: [
            { t: 'lead', text: 'STDIO 是最简单的 MCP 传输方式，也是本课程一直在用的方式。本节深入了解它的工作原理、适用场景和局限性。' },
            { t: 'h', text: 'STDIO 传输的工作原理' },
            { t: 'p', text: 'STDIO（Standard Input/Output）传输通过进程的标准输入（stdin）和标准输出（stdout）交换 JSON-RPC 消息。客户端启动服务器子进程，通过管道（pipe）通信。' },
            { t: 'list', items: ['客户端 fork 出服务器子进程','客户端向服务器的 stdin 写入 JSON 消息','服务器向 stdout 写入响应消息','每条消息以换行符分隔','服务器的 stderr 可用于调试输出（不影响协议）'] },
            { t: 'h', text: 'STDIO 的适用场景和局限' },
            { t: 'list', items: ['✅ 适合：本地工具、命令行服务器、Claude Desktop 集成','✅ 适合：开发和测试阶段，简单直接','✅ 优点：无需网络配置，天然安全（进程间通信）','❌ 局限：只支持单个客户端连接','❌ 局限：不支持跨网络访问，不能部署为远程服务'] },
            { t: 'callout', variant: 'tip', tag: '提示', text: 'Claude Desktop 使用 STDIO 传输连接本地 MCP 服务器。如果你的目标是集成 Claude Desktop，STDIO 就是正确的传输方式。' },
            { t: 'quiz', q: 'STDIO 传输最大的局限性是什么？', options: ['消息格式不是标准 JSON，难以调试','只支持单个客户端连接，无法跨网络部署','需要配置复杂的网络防火墙规则','只能在 Windows 系统上运行'], answer: 1, explain: 'STDIO 通过进程间通信工作，天然只支持一对一的客户端-服务器关系，且服务器进程必须在客户端机器上本地运行，无法作为远程服务部署。' },
            { t: 'task', title: '验证 STDIO 传输配置', steps: ['在 server.py 中显式设置 `mcp.run(transport=\'stdio\')`，确认行为与默认相同','运行客户端，理解每次连接都会启动新进程','阅读 Claude Desktop 配置文档，了解如何在 claude_desktop_config.json 中注册 STDIO 服务器','思考 STDIO 和 StreamableHTTP 各自适合哪些场景'] },
          ]},
          { id: 'l10', title: 'StreamableHTTP 传输', blocks: [
            { t: 'lead', text: 'StreamableHTTP 是 MCP 的网络传输方式，支持多客户端并发连接和跨网络部署。它结合了 HTTP 的通用性和 SSE 的实时推送能力。' },
            { t: 'h', text: 'StreamableHTTP 如何工作' },
            { t: 'list', items: ['HTTP POST：客户端向固定端点发送 JSON-RPC 请求','SSE（Server-Sent Events）：服务器通过长连接持续推送消息给客户端','支持多个客户端同时连接（不同于 STDIO 的单客户端限制）','适合部署为云服务或远程 API，客户端通过 URL 连接'] },
            { t: 'h', text: 'STDIO vs StreamableHTTP 对比' },
            { t: 'list', items: ['STDIO：本地进程通信，单客户端，简单，适合 Claude Desktop','StreamableHTTP：网络通信，多客户端，需要 HTTP 服务器，适合云部署','StreamableHTTP 支持认证（通过 HTTP 头），STDIO 无需认证（进程隔离保证安全）','StreamableHTTP 服务器可以水平扩展，STDIO 不行'] },
            { t: 'callout', variant: 'note', tag: '注意', text: 'StreamableHTTP 是 MCP 规范中较新的传输方式，取代了早期的 HTTP+SSE 两端点方案。确保你的 mcp SDK 版本是最新的以获得完整支持。' },
            { t: 'callout', variant: 'key', tag: '重点', text: 'SSE（Server-Sent Events）是 StreamableHTTP 的核心：它允许服务器在处理长任务时持续推送进度通知，而不需要客户端轮询。' },
            { t: 'quiz', q: 'StreamableHTTP 传输使用什么机制来实现服务器向客户端的实时推送？', options: ['WebSocket 双向连接','HTTP 长轮询（Long Polling）','SSE（Server-Sent Events）单向推送','gRPC 流式传输'], answer: 2, explain: 'StreamableHTTP 使用 SSE 实现服务器到客户端的实时推送。SSE 是基于 HTTP 的单向流，服务器可以持续发送事件，无需客户端反复请求。' },
            { t: 'task', title: '了解 SSE 的工作原理', steps: ['在浏览器中打开开发者工具的 Network 标签，访问任意使用 SSE 的网站','找到 EventStream 类型的请求，观察服务器持续发送的事件流格式','对比 SSE 和 WebSocket：两者都能实时推送，但 SSE 是单向的，WebSocket 是双向的','思考：对于 MCP 这个场景，为什么 SSE 比 WebSocket 更合适？'] },
          ]},
          { id: 'l11', title: 'StreamableHTTP 深入', blocks: [
            { t: 'lead', text: '理论够了，来写代码。本节展示如何用 FastMCP 搭建 StreamableHTTP 服务器，以及客户端如何通过 URL 连接它。' },
            { t: 'h', text: '搭建 StreamableHTTP 服务器' },
            { t: 'prompt', text: 'from mcp.server.fastmcp import FastMCP, Context\nimport asyncio\n\nmcp = FastMCP(\'http-server\')\n\n@mcp.tool()\nasync def long_task(steps: int, ctx: Context) -> str:\n    \'\'\'模拟长时间运行的任务，通过 SSE 推送进度\'\'\'\n    for i in range(steps):\n        await asyncio.sleep(1)\n        await ctx.session.send_log_message(level=\'info\', data=f\'步骤 {i + 1}/{steps} 完成\')\n    return f\'任务完成，共执行 {steps} 步\'\n\nif __name__ == \'__main__\':\n    mcp.run(\n        transport=\'streamable-http\',\n        host=\'0.0.0.0\',\n        port=8000\n    )\n\n# 启动后访问：http://localhost:8000/mcp' },
            { t: 'h', text: '编写 StreamableHTTP 客户端' },
            { t: 'prompt', text: 'import asyncio\nfrom mcp import ClientSession\nfrom mcp.client.streamable_http import streamablehttp_client\n\nasync def main():\n    server_url = \'http://localhost:8000/mcp\'\n\n    async with streamablehttp_client(server_url) as (read, write, _):\n        async with ClientSession(read, write) as session:\n            await session.initialize()\n            session.on_log_message = lambda msg: print(f\'[服务器日志] {msg.data}\')\n            result = await session.call_tool(\'long_task\', {\'steps\': 3})\n            print(f\'结果: {result.content[0].text}\')\n\nif __name__ == \'__main__\':\n    asyncio.run(main())' },
            { t: 'callout', variant: 'tip', tag: '提示', text: '使用 StreamableHTTP 时，可以同时运行多个客户端实例。每个客户端都会建立独立的 SSE 连接，服务器可以并发处理它们的请求。' },
            { t: 'quiz', q: '启动 StreamableHTTP 服务器后，客户端应该连接到哪个 URL 路径？', options: ['/api/v1/mcp','/tools','/mcp（FastMCP 默认路径）','/rpc'], answer: 2, explain: 'FastMCP 的 StreamableHTTP 模式默认将 MCP 端点挂载在 /mcp 路径下。完整 URL 格式为 http://host:port/mcp。' },
            { t: 'task', title: '搭建并测试 StreamableHTTP 服务器', steps: ['修改你的 server.py，将 `mcp.run()` 改为使用 streamable-http 传输，端口 8000','启动服务器，用浏览器访问 http://localhost:8000，确认服务器正在运行','编写 client.py 使用 streamablehttp_client 连接，调用一个工具','在两个不同终端同时运行两个客户端实例，确认服务器能并发处理请求'] },
          ]},
          { id: 'l12', title: '状态与 StreamableHTTP', blocks: [
            { t: 'lead', text: '使用 StreamableHTTP 部署服务器时，你必须决定：有状态还是无状态？这个选择对系统的可扩展性和复杂度有深远影响。' },
            { t: 'h', text: '有状态服务器（Stateful）' },
            { t: 'list', items: ['优点：实现简单，状态管理由框架处理，支持复杂的多轮交互','缺点：每个请求必须路由到同一台服务器实例（黏性会话）','缺点：难以水平扩展——增加服务器实例不会自动分担现有会话','适合场景：单机部署、开发环境、用户量小的服务'] },
            { t: 'h', text: '无状态服务器（Stateless）' },
            { t: 'list', items: ['优点：可以水平扩展，负载均衡器可以将请求分发到任意实例','优点：任意实例宕机不影响其他实例的正常服务','缺点：需要外部状态存储（Redis、PostgreSQL 等），架构复杂','适合场景：云端部署、高并发服务、需要高可用的生产环境'] },
            { t: 'callout', variant: 'key', tag: '重点', text: '选择有状态还是无状态，本质上是在开发简单性和运维可扩展性之间权衡。早期阶段用有状态，用户量增长到需要多台服务器时再迁移到无状态。' },
            { t: 'callout', variant: 'warn', tag: '警告', text: 'StreamableHTTP 有状态模式下，如果负载均衡器没有配置黏性会话（Sticky Session），来自同一客户端的请求可能被路由到不同服务器实例，导致状态丢失。' },
            { t: 'quiz', q: '在需要支持大量并发用户的生产环境中，StreamableHTTP 服务器推荐使用哪种模式？', options: ['有状态模式，更容易实现','无状态模式，便于水平扩展','混合模式，奇数请求有状态，偶数请求无状态','STDIO 模式，性能更高'], answer: 1, explain: '无状态模式下，负载均衡器可以将请求分发到任意服务器实例，只要外部存储（如 Redis）保存了会话状态。这使得服务可以根据负载水平扩展。' },
            { t: 'task', title: '规划你的生产部署架构', steps: ['评估你的 MCP 服务器需求：预期并发用户数、状态复杂度、可用性要求','根据评估选择有状态或无状态模式，写下你的理由','如果选择无状态，列出需要持久化的状态字段，以及使用什么外部存储','画出你的部署架构图：负载均衡器、服务器实例、外部存储之间的关系'] },
          ]},
        ]},
        { id: 'm4', title: '评估与下一步', en: 'Assessment & next steps', locked: false, lessons: [
          { id: 'l13', title: 'MCP 概念测评', blocks: [
            { t: 'lead', text: '这是 MCP 进阶专题的综合测评。这些问题覆盖了课程的全部核心概念，认真回答，看看你对进阶特性的掌握程度。' },
            { t: 'quiz', q: 'Sampling 机制的核心目的是什么？', options: ['让服务器能够直接访问 LLM，绕过客户端','让服务器可以请求客户端代其调用 LLM，API Key 留在客户端','提高 LLM 响应的采样随机性','让多个服务器共享同一个模型连接'], answer: 1, explain: 'Sampling 的设计让服务器无需持有 LLM API Key。服务器发送 sampling/createMessage 请求给客户端，客户端负责实际调用 LLM，费用和访问控制权在用户侧。' },
            { t: 'quiz', q: 'MCP Roots 机制的主要安全目标是什么？', options: ['防止客户端读取服务器的配置文件','让客户端声明服务器允许访问的文件路径范围，防止越界访问','加密客户端和服务器之间的所有通信','限制每个工具的最大执行时间'], answer: 1, explain: 'Roots 是客户端声明的文件访问边界。服务器通过 roots/list 请求获取这些边界，然后在自己的代码中验证文件路径，确保不访问用户未授权的目录。' },
            { t: 'quiz', q: 'STDIO 传输和 StreamableHTTP 传输最关键的区别是什么？', options: ['STDIO 使用 JSON，StreamableHTTP 使用 XML','STDIO 只支持单客户端本地连接，StreamableHTTP 支持多客户端网络连接','STDIO 更安全，StreamableHTTP 存在安全风险','StreamableHTTP 不支持工具调用，只支持资源访问'], answer: 1, explain: 'STDIO 通过进程间通信工作，天然单客户端，适合本地工具。StreamableHTTP 基于 HTTP/SSE，支持多客户端并发连接，适合云端部署和远程访问。' },
            { t: 'quiz', q: 'send_log_message 和 send_progress 两种通知的主要区别是什么？', options: ['log 是双向的，progress 是单向的','log 发送结构化日志（带级别），progress 发送数值进度（当前值/总量）','log 只能在工具中使用，progress 可以在任何地方使用','两者完全相同，只是命名不同'], answer: 1, explain: 'send_log_message 发送带 level（debug/info/warning/error）的日志消息，适合记录事件；send_progress 发送 progress/total 数值，适合展示长任务的完成百分比。' },
            { t: 'quiz', q: '有状态（Stateful）StreamableHTTP 服务器在生产环境中的主要挑战是什么？', options: ['无法支持工具调用，只支持资源读取','必须配置黏性会话，同一客户端请求必须路由到同一服务器实例','不支持 SSE，只能使用 HTTP 轮询','每次请求都需要重新连接，性能很差'], answer: 1, explain: '有状态服务器将会话状态保存在内存中，因此来自同一客户端的所有请求必须路由到同一台服务器。在有负载均衡的环境中，需要配置黏性会话（Sticky Session）才能正确工作。' },
            { t: 'quiz', q: 'JSON-RPC 中，Notification 消息和 Request 消息的关键区别是什么？', options: ['Notification 使用 XML 格式，Request 使用 JSON 格式','Notification 没有 id 字段，不需要响应；Request 有 id，需要对应的 Response','Notification 只能从客户端发送给服务器，Request 方向相反','Notification 只包含错误信息，Request 包含正常请求'], answer: 1, explain: 'id 是关键区别：Request 有 id，接收方必须用相同 id 返回 Response 或 Error；Notification 无 id，是单向推送，接收方处理后不需要回复。' },
            { t: 'task', title: '综合进阶实战', steps: ['创建一个新服务器，包含至少一个使用 Sampling 的工具和一个发送进度通知的工具','实现 Roots 安全检查：所有文件访问都必须验证路径是否在 Roots 范围内','选择 StreamableHTTP 传输部署服务器，编写对应的 HTTP 客户端','在 Inspector 中调用工具，在原始消息面板中找到 Request、Response 和 Notification 三种消息类型各一个'] },
          ]},
          { id: 'l14', title: '课程总结', blocks: [
            { t: 'lead', text: '恭喜你完成了 MCP 进阶专题的全部内容！你现在掌握的技能，足以构建真正生产级的 MCP 服务器。' },
            { t: 'h', text: '我们学了什么' },
            { t: 'list', items: ['Sampling：服务器反向请求客户端调用 LLM，API Key 和费用控制权在用户侧','日志通知：send_log_message() 提供结构化日志（debug/info/warning/error）','进度通知：send_progress() 为长任务提供实时进度更新','Roots：客户端声明文件访问边界，服务器验证路径合法性','JSON-RPC 消息类型：Request、Response、Notification、Error 四种类型','STDIO 传输：本地单客户端，简单直接，适合 Claude Desktop 集成','StreamableHTTP 传输：网络多客户端，SSE 推送，适合云端部署','有状态 vs 无状态：理解权衡，根据规模选择合适的架构'] },
            { t: 'h', text: '生产环境的真实考量' },
            { t: 'list', items: ['错误处理：工具内部的异常必须被捕获，返回有意义的错误消息给客户端','认证授权：StreamableHTTP 部署时，通过 HTTP 头实现 API Key 或 OAuth 认证','监控告警：将日志通知接入 Datadog、CloudWatch 等监控系统','速率限制：防止客户端过度调用工具，保护后端资源'] },
            { t: 'callout', variant: 'tip', tag: '提示', text: '持续关注 MCP 官方规范（modelcontextprotocol.io）和 Python SDK 的更新。MCP 是快速发展中的协议，新特性不断涌现。' },
            { t: 'callout', variant: 'key', tag: '重点', text: '你现在拥有了构建完整 MCP 生态系统的全套技能：设计原语、实现服务器、编写客户端、选择传输、保障安全。从想法到生产，你已经具备了所有基础。' },
            { t: 'quiz', q: '在 StreamableHTTP 生产部署中，最推荐的认证方式是？', options: ['将 API Key 硬编码在服务器配置文件中','通过 HTTP 请求头传递认证信息（如 Authorization: Bearer token）','使用 IP 白名单替代任何认证','在 URL 路径中包含密钥'], answer: 1, explain: 'HTTP 头（如 Authorization: Bearer token）是 Web API 认证的标准做法，安全且灵活。硬编码密钥和 URL 中的密钥都存在安全风险，IP 白名单在云环境中难以维护。' },
            { t: 'task', title: '规划你的第一个生产 MCP 项目', steps: ['选择一个真实的集成需求（数据库访问、代码工具、外部 API 封装等）','决定传输方式（本地工具选 STDIO，云端服务选 StreamableHTTP）和状态模式','列出需要实现的 Tools、Resources 和 Prompts，以及各自的安全要求','部署你的第一个生产 MCP 服务器，并接入 Claude Desktop 或自建客户端真实使用'] },
          ]},
        ]},
      ],
    },

    { id: 'skills', title: 'Agent Skills 入门', en: 'Introduction to Agent Skills', level: '进阶', academy: 'anthropic', publicNote: true,
      desc: '把任务的标准做法打包成可复用的 Skill，让 Claude 稳定专业地完成。',
      longDesc: 'Agent Skills 让你把某类任务的标准做法、规范和参考资料打包成可复用的「专长包」，需要时让 Claude 自动调用。本课带你认识 Skills 并构建你的第一个 Skill。',
      modules: [
        { id: 'm1', title: '认识 Agent Skills', en: 'Meet Agent Skills', locked: false, lessons: [
          { id: 'l1', title: '什么是 Agent Skill', blocks: [
            { t: 'lead', text: 'Agent Skill 是一个可复用的「专长包」：把某类任务的标准做法、规范和参考资料打包好，需要时让 Claude 自动调用，从而稳定、专业地完成这类工作。' },
            { t: 'h', text: 'Skill 长什么样' },
            { t: 'p', text: '一个 Skill 通常是一个文件夹，核心是一份 SKILL.md 说明文件，里面写清楚：这个 Skill 是做什么的、什么时候该用、具体怎么做。还可以附带脚本、模板等资源。' },
            { t: 'list', items: ['标准化：让同类任务每次都按同样的高标准完成','可复用：写一次，到处用','渐进式：Claude 先读简介，需要时再深入细节'] },
            { t: 'callout', variant: 'note', tag: '说明', text: '关于 Agent Skills 的具体接口与字段，本课内容基于 Anthropic 公开资料整理，请以官方文档为准。' },
            { t: 'quiz', q: 'Agent Skill 的核心作用是？', options: ['让 Claude 回复更短','把某类任务的标准做法打包，供 Claude 复用','替代提示词','加密文件'], answer: 1, explain: 'Skill 把特定任务的规范、流程和资料封装成可复用的包，让 Claude 稳定、专业地完成这类工作。' },
            { t: 'task', title: '找出你的候选 Skill', steps: ['列出你团队里格式固定、反复出现的一类任务','写下完成它的标准步骤','这就是一个适合做成 Skill 的场景'] },
          ]},
          { id: 'l2', title: '渐进式披露', blocks: [
            { t: 'lead', text: 'Skills 的一个关键设计是「渐进式披露」（progressive disclosure）：Claude 不会一次性加载所有细节，而是先看简短的描述，判断需要时再读取更详细的内容。' },
            { t: 'h', text: '为什么要渐进式' },
            { t: 'p', text: '上下文窗口是有限的。如果把每个 Skill 的全部细节都塞进去，会很快占满。渐进式披露让 Claude 先用一句话的简介判断「这个 Skill 现在用得上吗」，用得上才深入，从而节省上下文、保持高效。' },
            { t: 'callout', variant: 'tip', tag: '提示', text: '写 SKILL.md 时，开头的描述要精准——它是 Claude 判断「要不要用这个 Skill」的唯一依据。' },
            { t: 'quiz', q: '渐进式披露的好处是？', options: ['让 Skill 更长','节省上下文，按需加载细节','让 Claude 更慢','隐藏代码'], answer: 1, explain: '渐进式披露让 Claude 先读简介、需要时再深入，避免一次性占满有限的上下文窗口。' },
            { t: 'task', title: '写一句好描述', steps: ['为上一节想到的 Skill 写一句话描述它做什么','检查：Claude 仅凭这句话能判断何时该用它吗','如果不能，再改得更具体'] },
          ]},
        ]},
        { id: 'm2', title: '构建你的第一个 Skill', en: 'Build your first Skill', locked: false, lessons: [
          { id: 'l3', title: 'SKILL.md 的结构', blocks: [
            { t: 'lead', text: '一个 Skill 文件就是一个普通的 Markdown 文件，但它的结构决定了 Claude 能否准确理解并执行你的意图。本课带你解剖一个完整的 Skill 文件。' },
            { t: 'h', text: '文件名即命令名' },
            { t: 'p', text: '将 Markdown 文件放入 .claude/commands/ 目录后，文件名（不含 .md 后缀）就成为对应的斜杠命令。例如 review.md 对应 /review，deploy-env.md 对应 /deploy-env。文件内容会作为系统消息注入 Claude 的上下文。' },
            { t: 'list', items: ['文件名用小写字母和连字符，避免空格', '命令名应简短且能表达动作意图', '同名文件会覆盖上级目录中的同名 Skill'] },
            { t: 'h', text: 'Skill 文件的核心结构' },
            { t: 'p', text: '一个规范的 Skill 文件包含三个关键部分：描述（description）说明该 Skill 做什么；使用时机（when-to-use）帮助 Claude 判断何时触发；步骤与说明（steps/instructions）是执行的具体指令。' },
            { t: 'prompt', text: '# /review — 代码审查 Skill\n\n## 描述\n对当前改动执行全面的代码审查，输出结构化的审查报告。\n\n## 使用时机\n当用户请求代码审查、想在提交前检查代码质量，或需要找出潜在 bug 时使用。\n\n## 步骤\n1. 读取用户指定的文件或最近的 git diff\n2. 检查以下维度：正确性、可读性、性能、安全性\n3. 对每个问题给出：问题描述、严重程度（高/中/低）、改进建议\n4. 最后给出总体评分和优先改进项' },
            { t: 'h', text: '各部分的作用' },
            { t: 'list', items: ['描述：让用户和 Claude 快速理解 Skill 的用途', '使用时机：防止 Claude 在不合适的场景下调用此 Skill', '步骤：给 Claude 明确的执行路径，减少歧义'] },
            { t: 'callout', variant: 'tip', tag: '提示', text: '描述部分保持一行以内，使用时机部分不超过三条，步骤部分是 Skill 的核心，可以详细展开。' },
            { t: 'quiz', q: '将 review-code.md 放入 .claude/commands/ 后，对应的斜杠命令是什么？', options: ['/review-code.md', '/review-code', '/commands/review-code', '/claude/review-code'], answer: 1, explain: '文件名去掉 .md 后缀即为命令名，路径不会出现在命令中。' },
            { t: 'task', title: '创建你的第一个 Skill 文件', steps: ['在项目根目录创建 .claude/commands/ 文件夹（如不存在）', '新建文件 summarize.md，写入描述、使用时机、步骤三个部分', '在 Claude Code 中输入 /summarize 验证命令可以被识别'] },
          ]},
          { id: 'l4', title: '编写说明与示例', blocks: [
            { t: 'lead', text: '好的 Skill 说明能让 Claude 精准执行你的意图。模糊的指令会导致不一致的输出，而清晰的示例则能大幅提升 Skill 的质量。' },
            { t: 'h', text: '写具体、可验证的指令' },
            { t: 'p', text: '避免使用"好好检查代码"这样模糊的表述。应当明确说明：检查什么、按什么标准、输出什么格式。Claude 会严格按照你的指令行事，模糊的指令带来不可预期的结果。' },
            { t: 'list', items: ['指定输出格式（表格、列表、Markdown 章节）', '明确范围（哪些文件、哪些维度）', '说明优先级（先检查安全，再看性能）'] },
            { t: 'h', text: '使用 $ARGUMENTS 接收用户输入' },
            { t: 'p', text: '在 Skill 文件中使用 $ARGUMENTS 占位符，Claude 会将用户在斜杠命令后输入的内容替换到此处。例如用户输入 /review src/api.py，$ARGUMENTS 就变成 src/api.py。' },
            { t: 'prompt', text: '# /review — Python 代码审查\n\n## 描述\n审查指定的 Python 文件，重点关注 PEP 8 规范、类型注解和异常处理。\n\n## 指令\n审查以下文件：$ARGUMENTS\n\n请按顺序执行：\n1. 检查 PEP 8 命名规范（变量、函数、类名）\n2. 检查是否缺少类型注解（函数参数和返回值）\n3. 检查异常处理：是否有裸 except、是否记录了错误日志\n4. 输出格式：每个问题单独一行，格式为 [严重度] 行号: 问题描述\n5. 最后汇总：发现 N 个问题，其中高危 X 个\n\n## 示例输出\n[高] 第 23 行: 裸 except 会捕获所有异常包括 KeyboardInterrupt\n[中] 第 45 行: 函数 process_data 缺少返回类型注解\n[低] 第 12 行: 变量名 Temp 应改为小写 temp' },
            { t: 'h', text: '在文件中内嵌示例' },
            { t: 'p', text: '在 Skill 文件中提供示例输入和期望输出，可以让 Claude 更好地校准自己的行为。示例充当了"少样本学习"的作用，特别适合输出格式要求严格的场景。' },
            { t: 'callout', variant: 'key', tag: '重点', text: '$ARGUMENTS 是连接用户输入与 Skill 执行的关键。没有它，Skill 只能执行固定任务；有了它，Skill 才能处理用户指定的任意目标。' },
            { t: 'quiz', q: '用户输入 /review src/utils.py 时，Skill 文件中的 $ARGUMENTS 会被替换成什么？', options: ['/review', 'src/utils.py', '$ARGUMENTS', 'review src/utils.py'], answer: 1, explain: '$ARGUMENTS 会被替换为斜杠命令名之后的所有内容，即用户传入的参数。' },
            { t: 'task', title: '改进一个现有 Skill', steps: ['打开你在上一课创建的 summarize.md', '添加 $ARGUMENTS 占位符，让用户可以指定要摘要的文件', '写一段示例输出，展示你期望的摘要格式', '用 /summarize README.md 测试效果'] },
          ]},
          { id: 'l5', title: '打包资源与脚本', blocks: [
            { t: 'lead', text: '有些 Skill 需要辅助脚本、模板文件或参考文档才能正常工作。本课介绍如何将这些资源与 Skill 文件一起组织，以及何时应该保持 Skill 精简。' },
            { t: 'h', text: '在 Skill 文件中引用外部资源' },
            { t: 'p', text: '你可以在 .claude/commands/ 目录下创建子文件夹，将辅助文件放在同一位置。在 Skill 的指令中，告诉 Claude 读取这些文件的路径。Claude 具备文件读取能力，可以在执行 Skill 时自动加载相关内容。' },
            { t: 'list', items: ['.claude/commands/review.md — Skill 主文件', '.claude/commands/review-checklist.md — 审查清单', '.claude/commands/templates/review-report.md — 报告模板'] },
            { t: 'h', text: '何时包含辅助文件' },
            { t: 'p', text: '当 Skill 需要执行特定格式的输出、引用固定的检查项列表，或需要运行一段脚本时，打包辅助文件是合理的。但不应把所有相关内容都打包进来——过多的文件会增加 Claude 读取的上下文，降低响应速度。' },
            { t: 'list', items: ['适合打包：固定的检查清单、报告模板、代码片段库', '不适合打包：整个代码库的文档、频繁变动的配置文件', '原则：Skill 能独立运行，辅助文件只是锦上添花'] },
            { t: 'h', text: '何时保持 Skill 精简' },
            { t: 'p', text: '如果 Skill 的逻辑可以用一页 Markdown 说清楚，就不需要辅助文件。精简的 Skill 加载更快，更容易维护，也更容易与团队分享。当你发现需要用很多文件才能解释清楚一件事，考虑是否应该将其拆分为多个更小的 Skill。' },
            { t: 'callout', variant: 'note', tag: '注意', text: '辅助脚本（如 shell 脚本）可以在 Skill 指令中被 Claude 调用，但要确保这些脚本已被赋予可执行权限，并在指令中写明调用方式。' },
            { t: 'quiz', q: '以下哪种情况最适合为 Skill 打包辅助文件？', options: ['Skill 只需要生成一段简短文字', 'Skill 需要引用一份固定的 50 项检查清单', 'Skill 需要读取整个项目的所有源文件', 'Skill 已经很少使用'], answer: 1, explain: '固定的检查清单是典型的打包场景，它内容稳定、会被反复引用，放在独立文件中便于维护。' },
            { t: 'task', title: '为 Skill 添加一个模板文件', steps: ['在 .claude/commands/ 下创建 templates/ 子文件夹', '新建 templates/summary-report.md，写入你希望摘要报告遵循的结构', '在 summarize.md 的指令中添加一行：按照 .claude/commands/templates/summary-report.md 的格式输出', '测试 Skill，观察输出是否符合模板'] },
          ]},
        ]},
        { id: 'm3', title: '最佳实践', en: 'Best practices', locked: false, lessons: [
          { id: 'l6', title: '何时使用 Skill', blocks: [
            { t: 'lead', text: '并非所有任务都适合封装成 Skill。判断清楚"何时该用、何时不该用"，能让你的 Skill 库保持精简高效。' },
            { t: 'h', text: '适合创建 Skill 的三个信号' },
            { t: 'p', text: '当你发现自己或团队重复输入相同的指令超过三次，这就是创建 Skill 的信号。Skill 最擅长的是：标准化重复工作流、在团队间共享一致的操作规范、以及编码包含多个步骤的复杂流程。' },
            { t: 'list', items: ['重复性：同样的操作你做了 3 次以上', '一致性：团队需要以同样的方式完成某个任务', '复杂性：流程有 3 个以上步骤，容易遗漏'] },
            { t: 'h', text: '命名规范：动词-名词格式' },
            { t: 'p', text: '好的 Skill 名称应该能让人一眼看出它做什么。推荐使用"动词-名词"格式：review-code、deploy-env、generate-changelog、summarize-pr。避免使用过于宽泛的名称如 helper 或 tools，也避免使用缩写。' },
            { t: 'list', items: ['好的命名：review-code.md、deploy-env.md、sync-docs.md', '差的命名：helper.md、do-stuff.md、r.md', '命名应能独立理解，不依赖上下文'] },
            { t: 'h', text: '何时不该创建 Skill' },
            { t: 'p', text: '一次性任务不值得封装：如果你只需要执行某个操作一次，直接告诉 Claude 就好。高度依赖上下文的任务也不适合 Skill——当任务每次都不同，通用的 Skill 反而会限制灵活性。' },
            { t: 'callout', variant: 'tip', tag: '提示', text: '创建 Skill 前问自己：这个操作下周还会再做吗？团队里其他人也需要做吗？如果两个问题都是否，直接对话即可。' },
            { t: 'quiz', q: '以下哪个场景最适合创建 Skill？', options: ['临时帮同事改一封邮件的措辞', '每次发布前都要执行的 10 步检查流程', '只用一次的数据格式转换', '高度个性化的、每次都不同的分析任务'], answer: 1, explain: '重复的、多步骤的、团队共用的发布检查流程是 Skill 的典型使用场景。' },
            { t: 'task', title: '审查你的 Skill 库', steps: ['列出 .claude/commands/ 中的所有 Skill 文件', '对每个 Skill 评估：是否满足"重复、一致、复杂"中的至少一条', '删除或合并不符合标准的 Skill', '检查所有 Skill 名称是否遵循动词-名词格式'] },
          ]},
          { id: 'l7', title: '常见误区', blocks: [
            { t: 'lead', text: '很多 Skill 因为几个常见错误而效果不佳。了解这些误区，能帮你从一开始就写出高质量的 Skill。' },
            { t: 'h', text: '误区一：Skill 太宽泛' },
            { t: 'p', text: '如果一个 Skill 叫 /help 或 /analyze，Claude 无法判断何时该用它、该做什么。过于宽泛的 Skill 会导致 Claude 的行为不一致，每次执行结果都不同。解决方法：明确 Skill 的边界，每个 Skill 只做一件事。' },
            { t: 'h', text: '误区二：Skill 太长' },
            { t: 'p', text: 'Skill 文件过长会占用大量 context window，可能导致 Claude 遗漏后续对话的重要信息。如果你的 Skill 超过 500 字，考虑拆分成两个更专注的 Skill，或者将重复内容提取到辅助文件中按需引用。' },
            { t: 'list', items: ['理想长度：100-300 字，能在一屏内读完', '超过 500 字：考虑拆分', '超过 1000 字：几乎肯定需要重构'] },
            { t: 'h', text: '其他常见误区' },
            { t: 'list', items: ['更新后未测试：修改 Skill 后必须重新验证所有场景', '存放敏感信息：绝不在 Skill 文件中写入 API 密钥、密码或个人数据', '忽略版本控制：Skill 文件应纳入 git，方便追踪变更和团队协作', '没有描述部分：缺少描述让新成员不知道 Skill 的用途'] },
            { t: 'callout', variant: 'warn', tag: '警告', text: '永远不要在 Skill 文件中存储 API 密钥、密码或任何敏感信息。Skill 文件通常会提交到 git 仓库，敏感信息一旦泄露很难完全清除。' },
            { t: 'quiz', q: '一个 Skill 文件内容过长会带来什么主要问题？', options: ['文件无法被 Claude 识别', '占用过多 context window，影响对话效果', '斜杠命令会失效', '辅助文件无法被加载'], answer: 1, explain: '过长的 Skill 文件会占用宝贵的 context window 空间，可能导致 Claude 在处理后续对话时遗漏重要信息。' },
            { t: 'task', title: '审计并修复一个问题 Skill', steps: ['选择你认为可能过于宽泛或过长的 Skill', '检查是否有敏感信息，如有立即删除', '如果超过 300 字，尝试精简或拆分', '更新后重新测试该 Skill 的核心场景'] },
          ]},
        ]},
      ],
    },

    { id: 'subagents', title: 'Subagents 入门', en: 'Introduction to Subagents', level: '进阶', academy: 'anthropic', publicNote: true,
      desc: '用子代理拆分与委派任务，保持主上下文干净。',
      longDesc: 'Subagent（子代理）让你把相对独立的工作委派出去，在各自的上下文里完成、再把结果交回。本课带你认识子代理，并学会创建和使用它们。',
      modules: [
        { id: 'm1', title: '认识 Subagents', en: 'Meet Subagents', locked: false, lessons: [
          { id: 'l1', title: '什么是 Subagent', blocks: [
            { t: 'lead', text: 'Subagent（子代理）是你可以委派任务的「助手代理」。主代理把一项相对独立的工作交给子代理去完成，子代理在自己的上下文里干活，干完把结果交回来。' },
            { t: 'h', text: '为什么要用子代理' },
            { t: 'list', items: ['保持主上下文干净：子代理的中间过程不会塞满主对话','专业分工：可以为不同任务配置不同的子代理','并行与委派：把大任务拆成可独立完成的小块'] },
            { t: 'callout', variant: 'note', tag: '说明', text: '关于 Subagents 的具体配置方式，本课内容基于 Anthropic 公开资料整理，请以官方文档为准。' },
            { t: 'quiz', q: '使用子代理的主要好处是？', options: ['让回复更短','把独立任务委派出去，保持主上下文干净','替代 MCP','加快网速'], answer: 1, explain: '子代理在自己的上下文里完成被委派的任务，只把结果交回，从而让主代理的上下文保持干净、专注。' },
            { t: 'task', title: '想象一次委派', steps: ['想一个由多个独立步骤组成的大任务','哪一步可以整块交给一个子代理独立完成','主代理只需要它的最终结果，对吗'] },
          ]},
          { id: 'l2', title: '创建与使用子代理', blocks: [
            { t: 'lead', text: '你可以为特定职责定义一个子代理：给它名字、说明它负责什么、它能用哪些工具。之后主代理在合适的时候就会把任务派给它。' },
            { t: 'h', text: '一个子代理包含什么' },
            { t: 'list', items: ['名称与职责：它是谁、负责什么','说明（instructions）：它该如何工作','工具范围：它被允许使用哪些工具'] },
            { t: 'h', text: '何时该委派' },
            { t: 'p', text: '当一项工作相对独立、会产生大量中间过程、或者需要专门的处理方式时，就适合交给子代理。简单的小事直接做就好，不必都委派。' },
            { t: 'callout', variant: 'tip', tag: '提示', text: '子代理不是越多越好。先把最常重复、最容易拖累主上下文的那类任务做成子代理。' },
            { t: 'quiz', q: '定义一个子代理时，通常「不」包含以下哪项？', options: ['名称与职责','工作说明','可用的工具范围','用户的银行密码'], answer: 3, explain: '子代理通常由名称/职责、工作说明和被允许使用的工具范围构成，绝不涉及用户的敏感凭据。' },
            { t: 'task', title: '设计一个子代理', steps: ['给上一节想到的任务配一个子代理，起个名字','用一句话写明它负责什么','列出它需要用到的工具'] },
          ]},
        ]},
        { id: 'm2', title: '进阶用法', en: 'Going further', locked: false, lessons: [
          { id: 'l3', title: '多子代理协作', blocks: [
            { t: 'lead', text: '单个 Subagent 已经很强大，但真正的效率提升来自多个 Subagent 的协作。本课介绍两种核心协作模式：扇出（fan-out）和流水线（pipeline）。' },
            { t: 'h', text: '扇出模式：并行处理多个任务' },
            { t: 'p', text: '扇出模式由一个编排者（orchestrator）启动多个并行 Subagent，每个 Subagent 处理独立的子任务，最后编排者收集所有结果进行汇总。这是最常见的并行加速模式。' },
            { t: 'list', items: ['编排者负责拆分任务、分配工作、汇总结果', '每个 Subagent 拥有独立的 context window', 'Subagent 之间通过文件系统共享数据，而不是直接通信'] },
            { t: 'prompt', text: '# 编排者 Prompt 示例\n\n请并行启动 3 个 Subagent 分析以下三个模块，每个 Subagent 将分析结果写入指定文件：\n\nSubagent 1：分析 src/auth/ 目录，将结果写入 /tmp/analysis-auth.md\nSubagent 2：分析 src/api/ 目录，将结果写入 /tmp/analysis-api.md\nSubagent 3：分析 src/db/ 目录，将结果写入 /tmp/analysis-db.md\n\n每个分析应包含：代码质量评分（1-10）、主要问题列表、改进建议。\n\n所有 Subagent 完成后，读取三个文件并生成综合报告 /tmp/analysis-summary.md。' },
            { t: 'h', text: '流水线模式：串行传递数据' },
            { t: 'p', text: '流水线模式中，Subagent A 的输出文件成为 Subagent B 的输入。适合需要依次处理、前一步结果决定后一步行为的场景。例如：Subagent A 提取数据 → Subagent B 分析数据 → Subagent C 生成报告。' },
            { t: 'callout', variant: 'key', tag: '重点', text: '无论哪种模式，Subagent 之间通过文件传递数据是最可靠的方式。在 Prompt 中明确指定输入文件路径和输出文件路径，避免歧义。' },
            { t: 'quiz', q: '在扇出模式中，多个 Subagent 如何将结果返回给编排者？', options: ['直接调用编排者的函数', '通过网络 API 发送', '写入指定的文件，由编排者读取', '存入共享内存变量'], answer: 2, explain: 'Subagent 之间不能直接通信，通过写入文件再由编排者读取是最可靠、最通用的数据传递方式。' },
            { t: 'task', title: '设计一个扇出任务', steps: ['选择一个可以拆分的任务（如分析多个配置文件）', '写出编排者 Prompt，明确指定每个 Subagent 的输入范围和输出文件路径', '写出每个 Subagent 应执行的具体指令', '设计编排者汇总结果的步骤'] },
          ]},
          { id: 'l4', title: '工具与权限范围', blocks: [
            { t: 'lead', text: '默认情况下 Subagent 拥有与主 Agent 相同的工具权限。但在自动化工作流中，你通常希望限制 Subagent 的权限，只给它完成任务所需的最小工具集。' },
            { t: 'h', text: '为什么要限制 Subagent 的权限' },
            { t: 'p', text: '在自动化工作流中，Subagent 可能会在无人监督的情况下执行操作。给予过多权限会带来风险：Subagent 可能误删文件、发起网络请求，或修改不该修改的内容。最小权限原则能有效降低意外损失。' },
            { t: 'list', items: ['只读 Subagent：只能读取文件，不能写入或执行命令', '受限写入：只能写入指定目录下的文件', '无网络：禁止 Subagent 发起外部网络请求'] },
            { t: 'h', text: '在 Prompt 中指定允许的工具' },
            { t: 'p', text: '在启动 Subagent 时，通过 Prompt 明确说明它可以使用哪些工具，以及哪些操作是被禁止的。虽然这不是硬性的技术限制，但清晰的指令能有效引导 Subagent 的行为边界。' },
            { t: 'prompt', text: '# 受限 Subagent Prompt 示例\n\n你是一个只读分析 Agent。你只能：\n- 读取文件（Read 工具）\n- 列出目录内容（Bash ls 命令）\n\n你不能：\n- 写入或修改任何文件\n- 运行除 ls 之外的 shell 命令\n- 发起网络请求\n\n请分析 src/ 目录的结构，将你的发现以文字形式返回（不要写入任何文件）。' },
            { t: 'callout', variant: 'warn', tag: '警告', text: '对于会产生不可逆影响的操作（删除文件、发送邮件、部署代码），始终在 Subagent 执行前增加人工确认步骤，而不是让 Subagent 自主决定。' },
            { t: 'quiz', q: '以下哪种做法最符合 Subagent 最小权限原则？', options: ['给所有 Subagent 完整的系统权限以避免权限不足', '根据任务需要，在 Prompt 中明确限定可用工具', '不给 Subagent 任何工具，让它只能生成文字', '只在生产环境中限制权限，开发环境不限'], answer: 1, explain: '最小权限原则要求根据具体任务按需授权，在 Prompt 中明确说明允许和禁止的操作是最实用的方式。' },
            { t: 'task', title: '为一个 Subagent 设计权限边界', steps: ['选择一个具体的 Subagent 任务（如代码审查）', '列出完成该任务必须用到的工具', '列出该任务明确不需要的工具（如写入、网络）', '将权限说明写入 Subagent Prompt 的开头部分'] },
          ]},
        ]},
        { id: 'm3', title: '最佳实践', en: 'Best practices', locked: false, lessons: [
          { id: 'l5', title: '何时该委派', blocks: [
            { t: 'lead', text: '不是所有任务都适合委派给 Subagent。学会识别好的委派场景和糟糕的委派场景，是高效使用 Subagent 的关键。' },
            { t: 'h', text: '适合委派的任务特征' },
            { t: 'p', text: '最适合委派的任务具备三个特征：任务之间依赖少（可以并行）、输出相互独立（不会互相干扰）、没有共享的可变状态（不会同时修改同一个文件）。' },
            { t: 'list', items: ['好的委派：并行分析 5 个独立的日志文件', '好的委派：同时为 3 个不同模块生成测试用例', '好的委派：并发翻译 10 篇独立文章'] },
            { t: 'h', text: '糟糕的委派场景' },
            { t: 'p', text: '当两个 Subagent 需要修改同一个文件时，就会产生冲突。这是最常见的委派错误。此外，强依赖前一步结果的任务（非流水线场景）也不适合并行委派。' },
            { t: 'list', items: ['坏的委派：两个 Subagent 都写入同一个 output.md', '坏的委派：Subagent B 必须等 Subagent A 分析完才能开始', '坏的委派：任务需要跨 Subagent 维护一个计数器'] },
            { t: 'h', text: '分解任务的实用方法' },
            { t: 'p', text: '将大任务分解时，先画出任务之间的依赖图。没有依赖箭头连接的任务可以并行；有单向依赖的任务适合流水线；有双向依赖的任务不应委派给不同 Subagent。' },
            { t: 'callout', variant: 'key', tag: '重点', text: '判断能否委派的黄金问题：这两个子任务会写入同一个文件吗？如果会，不要并行委派。' },
            { t: 'quiz', q: '以下哪个任务最适合并行委派给多个 Subagent？', options: ['多个 Subagent 协作编辑同一份 README', '并行分析 5 个独立仓库的代码质量', '一个 Subagent 依赖另一个 Subagent 的实时输出', '多个 Subagent 共同维护一个全局计数'], answer: 1, explain: '分析 5 个独立仓库是典型的无依赖并行任务，每个 Subagent 的输入输出互不影响。' },
            { t: 'task', title: '评估一个任务是否适合委派', steps: ['选择一个你经常重复做的任务', '画出任务的步骤依赖图', '标出哪些步骤之间没有依赖，可以并行', '设计委派方案，确保没有 Subagent 会写入同一个文件'] },
          ]},
          { id: 'l6', title: '常见误区', blocks: [
            { t: 'lead', text: 'Subagent 出错往往有规律可循。了解最常见的失败模式，能帮你提前设计防护措施。' },
            { t: 'h', text: '误区一：Subagent 幻觉文件路径' },
            { t: 'p', text: 'Subagent 可能会"发明"一个并不存在的文件路径，然后自信地说它已经读取并分析了该文件。解决方法：在 Prompt 中明确提供完整的绝对路径，并要求 Subagent 在读取文件前先验证文件存在。' },
            { t: 'h', text: '误区二：多个 Subagent 冲突写文件' },
            { t: 'p', text: '当两个 Subagent 同时写入同一个文件时，后写入的内容会覆盖前一个，导致数据丢失。解决方法：为每个 Subagent 分配唯一的输出文件名，例如 output-agent-1.md、output-agent-2.md，由编排者负责合并。' },
            { t: 'h', text: '误区三：编排者误解 Subagent 的输出' },
            { t: 'p', text: '编排者读取 Subagent 输出时，可能因格式不统一而解析错误。解决方法：在每个 Subagent 的 Prompt 中明确规定输出格式（如 JSON 或固定 Markdown 结构），并要求 Subagent 严格遵守。' },
            { t: 'list', items: ['每个 Subagent 用唯一输出文件，避免冲突', '明确规定输出格式，方便编排者解析', '在编排者中记录每个 Subagent 的原始输出，便于调试', '对关键操作增加验证步骤，而不是假设 Subagent 成功'] },
            { t: 'callout', variant: 'tip', tag: '提示', text: '调试 Subagent 工作流时，保留每个 Subagent 的完整输出日志是最有效的手段。不要让编排者直接丢弃 Subagent 的中间结果。' },
            { t: 'quiz', q: '如何最有效地防止两个 Subagent 冲突写入同一文件？', options: ['让两个 Subagent 轮流写入', '为每个 Subagent 分配唯一的输出文件名', '使用文件锁机制', '只让一个 Subagent 有写入权限'], answer: 1, explain: '最简单可靠的方案是为每个 Subagent 预先分配不同的输出文件名，从设计上消除冲突的可能。' },
            { t: 'task', title: '为 Subagent 工作流添加防护措施', steps: ['审查你设计的 Subagent 工作流，检查是否有共享输出文件', '为每个 Subagent 分配独立的输出文件', '在编排者 Prompt 中添加：读取各 Subagent 输出后先验证文件格式再汇总', '添加日志步骤：编排者将每个 Subagent 的原始输出追加到 debug.log'] },
          ]},
        ]},
      ],
    },
  ];
}

function buildOpenAICourses() {
  return [
    { id: 'oai-foundations', title: 'AI 基础', en: 'AI Foundations', level: '入门', academy: 'openai', publicNote: true,
      desc: '搞懂生成式 AI 到底是什么、怎么工作，建立可靠的心智模型。',
      longDesc: '这门课带你从零理解生成式 AI：它是什么、大语言模型如何工作、为什么有时会出错，以及如何写出让它听懂的提示词。不需要任何技术背景。',
      modules: [
        { id: 'm1', title: '认识生成式 AI', en: 'Understanding Generative AI', locked: false, lessons: [
          { id: 'l1', title: '什么是生成式 AI', blocks: [
            { t: 'lead', text: '生成式 AI（Generative AI）是一类能「创造新内容」的人工智能——文字、图片、代码、音频都可以。ChatGPT 就是其中最有名的例子：你用日常语言提问，它生成一段全新的回答。' },
            { t: 'h', text: '「生成」和「检索」的区别' },
            { t: 'p', text: '搜索引擎是把已经存在的网页找出来给你；生成式 AI 则是根据它学到的规律，现场「写出」一段以前并不存在的内容。所以它能帮你起草、改写、续写，而不仅仅是查找。' },
            { t: 'list', items: ['写作：邮件、文案、报告、总结','创意：起名、头脑风暴、不同角度的方案','解释：把复杂概念讲得通俗易懂','转换：翻译、改写语气、调整长度'] },
            { t: 'callout', variant: 'note', tag: '注意', text: '生成式 AI 不「知道」事实，它是在预测「接下来最合理的内容」。大多数时候很有用，但偶尔会一本正经地说错——这就是后面要讲的「幻觉」。' },
            { t: 'quiz', q: '生成式 AI 和搜索引擎最根本的不同是？', options: ['速度更快','它现场生成全新内容，而不是检索已有网页','只能处理英文','永远不会出错'], answer: 1, explain: '搜索引擎检索已存在的信息，生成式 AI 则根据学到的规律现场创造新内容，因此能起草和改写。' },
            { t: 'task', title: '体验一次「生成」', steps: ['打开 chatgpt.com 并登录','输入：用四种不同的语气，各写一句给同事的周末问候','观察它如何同时生成多个全新版本'] },
          ]},
          { id: 'l2', title: '大语言模型如何工作', blocks: [
            { t: 'lead', text: 'ChatGPT 背后是「大语言模型」（LLM）。理解它的一个简单心智模型：它是一个极其强大的「下一个词预测器」，从海量文本中学会了语言的规律。' },
            { t: 'h', text: '一次预测接一次预测' },
            { t: 'p', text: '当你提问时，模型并不是去数据库里查答案，而是一个词一个词地预测「接下来最合理的是什么」，连成一段流畅的回答。正因为如此，它擅长语言任务，但对精确的事实和计算要谨慎核对。' },
            { t: 'h', text: '它的知识从哪来' },
            { t: 'p', text: '模型是在某个时间点之前的大量文本上训练的，所以它对训练之后发生的事可能不了解。需要最新信息时，给它提供资料，或使用带联网/搜索能力的功能。' },
            { t: 'callout', variant: 'key', tag: '重点', text: '把 AI 当成「语言很强、但记忆可能过时、偶尔会编」的助手。重要结论一定要自己复核，尤其是数字、引用和事实。' },
            { t: 'quiz', q: '下面对大语言模型的描述，哪个最准确？', options: ['它在一个事实数据库里查答案','它逐词预测最合理的内容，连成回答','它只会复制粘贴网页','它能联网获取任何实时信息'], answer: 1, explain: 'LLM 的核心机制是逐词预测最合理的延续，而非查询数据库；它的知识也可能有时间截止。' },
            { t: 'task', title: '测试它的边界', steps: ['问 ChatGPT 一个需要最新信息的问题（如本周某新闻）','看它是否提示「知识有截止时间」或给出不确定的回答','再把一段资料贴给它，让它基于资料回答，对比差别'] },
          ]},
          { id: 'l3', title: '提示词基础', blocks: [
            { t: 'lead', text: '同样的问题，问法不同，答案质量天差地别。好的提示词（Prompt）不需要术语，只要把你想要的说清楚：要它做什么、背景是什么、想要什么样的结果。' },
            { t: 'h', text: '清晰提问的三个习惯' },
            { t: 'list', items: ['给角色和目标：「你是一位营养师，帮我……」','给背景和限制：受众是谁、有什么要求、不要什么','给期望的格式：列表、表格、字数、语气'] },
            { t: 'callout', variant: 'tip', tag: '提示', text: '不确定怎么问？可以直接让 AI 帮你：「我想达到 X，应该怎么向你提问才能得到最好的结果？」' },
            { t: 'prompt', label: '示例提示词 · 给 ChatGPT', text: '你是一位经验丰富的职业规划顾问。\n\n请帮我把下面这段工作经历改写成简历里的 3 条成果项。\n要求：用动词开头、尽量量化、每条不超过 25 字。\n\n经历：我负责公司公众号，半年里把阅读量从 2000 提到 1 万。' },
            { t: 'quiz', q: '下面哪种做法最能提升回答质量？', options: ['尽量把问题写得简短模糊','说清角色、背景和想要的格式','一次问十个无关问题','只发一个词'], answer: 1, explain: '明确角色、背景与期望格式，能让模型更准确地命中你的真实需求。' },
            { t: 'task', title: '一题两问', steps: ['先用一句话问 ChatGPT 一个真实问题','再补上角色、背景、格式重新问一次','对比两次结果，记下差别'] },
          ]},
        ]},
        { id: 'm2', title: '能力与局限', en: 'Capabilities & limits', locked: false, lessons: [
          { id: 'l4', title: '它擅长什么', blocks: [
            { t: 'lead', text: 'ChatGPT 在很多任务上表现出色，但它并不是万能的。了解它真正擅长的领域，能让你把时间用在刀刃上。' },
            { t: 'h', text: '写作与内容处理' },
            { t: 'p', text: 'ChatGPT 在文字类工作上表现最为突出。无论是起草邮件、润色文章、改写措辞，还是将长文档压缩成摘要，它都能快速给出高质量的结果。翻译也是它的强项，支持数十种语言之间的互译。' },
            { t: 'list', items: ['写作与编辑：起草、润色、改写、格式调整', '摘要提炼：将长文章、会议记录、报告压缩成要点', '翻译：支持中英文及多种语言互译', '解释复杂概念：用简单语言解释技术或专业内容'] },
            { t: 'h', text: '思维与分析辅助' },
            { t: 'p', text: 'ChatGPT 是出色的头脑风暴伙伴，能快速生成多种角度和创意。它也擅长从你粘贴进来的文本中回答问题、提取信息——前提是信息就在对话窗口里。' },
            { t: 'list', items: ['头脑风暴：快速生成创意清单、方案选项', '问答：从粘贴的文本中提取关键信息', '代码辅助：解释代码逻辑、查找 bug、生成代码片段', '职业建议：模拟面试、修改简历、规划职业路径'] },
            { t: 'h', text: '一个好的多步骤 Prompt 示例' },
            { t: 'prompt', text: '我是一名产品经理，需要向董事会汇报我们 Q3 的用户增长情况。\n\n请帮我完成以下任务：\n1. 将下面这段数据总结为三个核心洞察（每条不超过 30 字）\n2. 为每个洞察提供一个可能的原因\n3. 建议一个下一步行动\n\n数据：[在此粘贴你的数据或报告内容]' },
            { t: 'callout', variant: 'tip', tag: '提示', text: '把你想要的内容、背景信息、输出格式一次性告诉 ChatGPT，比一条条追问效率更高。多步骤 Prompt 是提升效果的核心技巧。' },
            { t: 'quiz', q: '以下哪项任务 ChatGPT 最擅长处理？', options: ['实时查询今天的股票价格', '将你粘贴的会议记录整理成行动清单', '访问你公司内部数据库', '预测明天的天气'], answer: 1, explain: 'ChatGPT 最擅长处理对话窗口内的文本，整理会议记录是典型的强项场景。它无法访问实时数据或外部系统。' },
            { t: 'task', title: '试试 ChatGPT 的摘要能力', steps: ['找一篇你最近读过的文章或会议记录（至少 200 字）', '将全文粘贴到 ChatGPT 对话框', '输入：请将以上内容总结为 5 个要点，每点不超过 20 字', '观察输出，思考哪些信息被保留、哪些被省略'] },
          ]},
          { id: 'l5', title: '幻觉与事实核查', blocks: [
            { t: 'lead', text: 'ChatGPT 有时会自信地说出错误的事情——这种现象叫"幻觉"。理解它为什么会发生，以及如何应对，是负责任使用 AI 的基本功。' },
            { t: 'h', text: '什么是幻觉' },
            { t: 'p', text: '幻觉是指 AI 生成了听起来合理、但实际上不正确的内容。模型可能会捏造一篇不存在的论文引用、给出错误的历史年份、或者描述一个并不真实的统计数据——而且语气听上去完全确定。' },
            { t: 'h', text: '为什么会发生幻觉' },
            { t: 'p', text: 'ChatGPT 的工作原理是预测"在这个上下文中，下一个词最可能是什么"。它不是在查阅数据库或核实事实，而是在生成听起来合理的文本。当它不确定时，它仍然会生成一个看起来合理的答案，而不是说"我不知道"。' },
            { t: 'list', items: ['高风险场景：具体数字和统计数据', '高风险场景：学术论文引用和书目信息', '高风险场景：近期发生的事件（超出训练截止日期）', '高风险场景：特定人物的具体言论或行动'] },
            { t: 'h', text: '养成事实核查的习惯' },
            { t: 'p', text: '对于 ChatGPT 给出的重要信息，分享前务必通过其他来源验证。特别是数字、引用、和近期新闻，不要直接复制粘贴 AI 的输出而不核实。' },
            { t: 'callout', variant: 'warn', tag: '警告', text: 'ChatGPT 说得越自信，越不代表它一定正确。遇到具体的数字、引用或近期事实，请用搜索引擎或权威来源交叉验证后再使用。' },
            { t: 'quiz', q: '为什么 ChatGPT 有时会给出看似可信但实际错误的答案？', options: ['因为它故意欺骗用户', '因为它是在预测合理的文本，而不是查阅事实', '因为它的数据库更新太慢', '因为中文问题它理解有误'], answer: 1, explain: 'ChatGPT 是语言模型，本质上是在预测下一个词，而不是在查找事实。这导致它有时会生成听起来合理但不正确的内容。' },
            { t: 'task', title: '体验并识别幻觉', steps: ['向 ChatGPT 提问一个你知道答案的具体事实（如某本书的出版年份）', '观察它的回答是否准确', '再问一个你不确定的具体统计数字', '在搜索引擎中验证 ChatGPT 的回答'] },
          ]},
          { id: 'l6', title: '负责任地使用', blocks: [
            { t: 'lead', text: '使用 ChatGPT 能提升效率，但也需要了解边界。哪些信息不该分享、哪些决策不该依赖 AI，是每个用户都应该知道的。' },
            { t: 'h', text: '不该输入到 ChatGPT 的内容' },
            { t: 'p', text: '你输入到 ChatGPT 的内容会被 OpenAI 处理，在某些情况下可能用于模型改进。因此，敏感信息应该保留在对话之外。' },
            { t: 'list', items: ['密码和 API 密钥：永远不要粘贴到 AI 对话中', '他人的个人信息：姓名、电话、地址、身份证号', '公司机密信息：未公开的财务数据、商业计划', '医疗或法律文件中包含个人身份的部分'] },
            { t: 'h', text: 'AI 不应做最终决策的领域' },
            { t: 'p', text: 'ChatGPT 可以提供参考信息，但不应该作为医疗、法律或财务决策的唯一依据。AI 没有执照，不了解你的完整情况，也不承担任何责任。重要决策请咨询专业人士。' },
            { t: 'h', text: '透明地使用 AI' },
            { t: 'p', text: '当你用 AI 辅助完成一份工作成果时，考虑向接收者说明。在许多职业和学术场景中，使用 AI 需要遵循相关规范。透明使用不仅是诚信问题，也能帮助建立正确的使用文化。' },
            { t: 'callout', variant: 'key', tag: '重点', text: 'ChatGPT 是辅助工具，不是决策者。用它提升效率、拓展思路，但最终判断和责任由你承担。' },
            { t: 'quiz', q: '以下哪项内容不应该输入到 ChatGPT？', options: ['你想整理的工作邮件草稿', '你公司尚未公开的融资计划', '你想解释的一个技术概念', '你想总结的一篇公开新闻文章'], answer: 1, explain: '未公开的公司机密信息不应输入到第三方 AI 工具，存在数据安全风险。' },
            { t: 'task', title: '制定你的 AI 使用原则', steps: ['列出 3 类你经常做的工作任务', '对每类任务判断：是否适合用 ChatGPT 辅助', '列出你不会输入到 ChatGPT 的信息类型', '写下当你使用 AI 辅助完成工作时，你会如何向他人说明'] },
          ]},
        ]},
        { id: 'm3', title: '动手实践', en: 'Hands-on', locked: false, lessons: [
          { id: 'l7', title: '你的第一次对话', blocks: [
            { t: 'lead', text: '理论学完了，现在动手实践。本课设计了三个具体练习，带你体验 ChatGPT 最实用的三种用法。' },
            { t: 'h', text: '练习一：摘要提炼' },
            { t: 'p', text: '找一篇你最近读过的文章或报告（任何语言均可），将正文粘贴到 ChatGPT 中，然后使用下面的 Prompt。' },
            { t: 'prompt', text: '请将以上内容总结为 5 个关键要点，每个要点用一句话表达，不超过 30 字。' },
            { t: 'h', text: '练习二：角色扮演获取职业建议' },
            { t: 'p', text: '给 ChatGPT 设定一个角色，然后向它寻求职业建议。角色设定能让 AI 的回答更聚焦、更专业。' },
            { t: 'prompt', text: '你是一位有 15 年经验的职业顾问，专注于科技行业。我是一名有 3 年经验的后端工程师，想转型做产品经理。请给我 3 条具体的行动建议，并说明每条建议的理由。' },
            { t: 'h', text: '练习三：用简单语言解释复杂概念' },
            { t: 'p', text: '选一个你工作中常遇到但难以向非专业人士解释的概念，用下面的模板向 ChatGPT 提问。' },
            { t: 'prompt', text: '请用小学生能理解的语言解释什么是[你的概念]。用一个生活中常见的比喻来帮助理解，解释不超过 100 字。' },
            { t: 'callout', variant: 'tip', tag: '提示', text: '每个练习完成后，尝试在回复下方继续追问："能更简短吗？"或"能换一个角度吗？"观察 ChatGPT 如何根据反馈调整输出。' },
            { t: 'quiz', q: '在角色扮演 Prompt 中，给 ChatGPT 设定具体角色的主要好处是什么？', options: ['让 ChatGPT 的回答更长', '让回答更聚焦、更符合特定视角和专业背景', '防止 ChatGPT 出现幻觉', '让 ChatGPT 能访问更多数据'], answer: 1, explain: '角色设定为模型提供了明确的视角和专业背景，让回答更具针对性，而不会让内容更准确或更长。' },
            { t: 'task', title: '完成三个练习', steps: ['练习一：找一段至少 200 字的文本，用摘要 Prompt 提炼要点', '练习二：用角色扮演 Prompt 获取一条对你有用的职业或工作建议', '练习三：选一个你熟悉的专业概念，让 ChatGPT 用比喻解释它', '对比三次对话，思考哪种 Prompt 方式最适合你的工作场景'] },
          ]},
          { id: 'l8', title: '迭代与改进', blocks: [
            { t: 'lead', text: '第一次的回复很少是最好的。学会通过追问和修改指令来迭代输出，是用好 ChatGPT 的核心技能。' },
            { t: 'h', text: '为什么需要迭代' },
            { t: 'p', text: '即使你的 Prompt 写得很好，第一次回复也可能在长度、语气、格式或内容深度上与你的期望有差距。迭代不是因为 AI 出错，而是因为你在逐步明确自己真正想要什么。' },
            { t: 'h', text: '常用的迭代指令' },
            { t: 'list', items: ['调整长度：请将以上内容缩短到 100 字以内 / 请展开第二点，增加更多细节', '改变语气：请用更正式的商务语气重写 / 请用更轻松友好的语气重写', '指定格式：请将以上内容改写为表格格式 / 请用编号列表重新组织', '增加约束：请重新回答，但不要提到竞争对手 / 请只给出最重要的一条建议', '视角转换：请从用户的角度重新描述这个功能'] },
            { t: 'h', text: '三轮迭代练习' },
            { t: 'p', text: '选择一个你关心的话题，先让 ChatGPT 给出初始回答，然后进行三轮迭代：第一轮调整长度，第二轮改变格式，第三轮加入新的约束条件。观察每一轮如何改进输出。' },
            { t: 'prompt', text: '第一轮：[初始问题]\n第二轮：请将上面的回答缩短到 50 字以内，只保留最核心的一点\n第三轮：请将这 50 字改写为一封正式邮件的开头段落\n第四轮：请在邮件开头加上一个吸引眼球的统计数据（如果没有真实数据，请注明"示例数据"）' },
            { t: 'callout', variant: 'note', tag: '注意', text: '迭代时不需要重新开始新对话，直接在同一对话中追问即可。ChatGPT 会记住上下文，根据你的新要求调整前面的内容。' },
            { t: 'quiz', q: '迭代 Prompt 时，最好在哪里进行追问？', options: ['开一个新对话，重新输入所有内容', '在同一对话中直接追问', '复制上一次回答粘贴到新对话', '每次都重写整个 Prompt'], answer: 1, explain: '在同一对话中追问最高效，ChatGPT 会保留上下文记忆，你只需告诉它需要调整什么，而不必重复所有背景。' },
            { t: 'task', title: '三轮迭代练习', steps: ['选一个你工作中实际遇到的问题，向 ChatGPT 提问', '收到第一个回答后，要求它"缩短到一半长度"', '再次收到回答后，要求它"改为适合在会议上口头汇报的语气"', '比较三次版本，选出最符合你需求的，思考哪一轮改进最显著'] },
          ]},
        ]},
        { id: 'm4', title: '测验', en: 'Quiz', locked: false, lessons: [
          { id: 'l9', title: '课程测验', blocks: [
            { t: 'lead', text: '恭喜你完成了 AI 基础课程的全部内容！通过以下 6 道测验题，检验你对核心概念的掌握程度。' },
            { t: 'quiz', q: '生成式 AI 主要擅长创建什么类型的内容？', options: ['实时的股票和天气数据', '文字、图像、代码等基于已有数据学习的内容', '访问互联网上的最新新闻', '直接操作外部软件和系统'], answer: 1, explain: '生成式 AI 通过学习大量已有数据来生成新内容，包括文字、图像、代码等，但它不能实时访问外部数据。' },
            { t: 'quiz', q: 'ChatGPT 是如何生成回复的？', options: ['通过搜索互联网并整合搜索结果', '通过预测在给定上下文中最可能出现的下一个词', '通过查询一个包含所有知识的数据库', '通过随机选择训练数据中的句子'], answer: 1, explain: '语言模型的核心机制是"下一词预测"——根据上下文计算最可能的下一个词，逐词生成回复，而不是查阅数据库。' },
            { t: 'quiz', q: '什么是训练截止日期（training cutoff）对使用的影响？', options: ['ChatGPT 每天会自动更新到最新信息', 'ChatGPT 对截止日期之后发生的事件可能一无所知', 'ChatGPT 只能回答截止日期之前提出的问题', '训练截止日期决定了每天可以问多少问题'], answer: 1, explain: '模型在训练截止日期后不会自动获取新数据，因此对之后发生的事件（新法规、近期新闻等）可能无法提供准确信息。' },
            { t: 'quiz', q: '以下哪项最准确地描述了"幻觉"这一现象？', options: ['ChatGPT 因为服务器故障而无法回答', 'ChatGPT 生成了听起来合理但实际上不正确的内容', 'ChatGPT 拒绝回答某些敏感问题', 'ChatGPT 的回答太长导致用户看不完'], answer: 1, explain: '幻觉是指 AI 生成了看似可信、实际上错误的内容，这是语言模型"预测合理文本"机制的副作用，而非蓄意欺骗。' },
            { t: 'quiz', q: '以下哪类信息最不应该输入到 ChatGPT？', options: ['一篇你想摘要的公开新闻文章', '你的公司尚未对外公布的商业计划书', '你想让 AI 帮你改进的演讲稿草稿', '一个你想简单解释给朋友听的技术概念'], answer: 1, explain: '未公开的公司商业机密不应输入第三方 AI 服务，存在数据安全和保密风险。其他选项均属于可安全使用的场景。' },
            { t: 'quiz', q: '在医疗、法律或财务等专业领域，ChatGPT 的最合适定位是什么？', options: ['替代专业人士给出最终建议', '提供初步参考信息，最终决策仍需咨询专业人士', '这些领域 ChatGPT 完全无法提供任何帮助', '只要提问足够详细，ChatGPT 的建议可以完全信赖'], answer: 1, explain: 'ChatGPT 可以提供背景信息和初步思路，但它没有执照、不了解你的完整情况，也不承担法律责任。重要决策必须咨询专业人士。' },
            { t: 'task', title: '回顾与总结', steps: ['回顾本课程中你觉得最有价值的一个概念', '想一个你工作中可以立即用 ChatGPT 改进的具体任务', '写下你使用 ChatGPT 的两条个人原则（什么情况下用、什么信息不分享）', '在 ChatGPT 中进行一次真实的工作对话，运用本课程学到的技巧'] },
          ]},
        ]},
      ],
    },

    { id: 'oai-applied', title: '应用 AI 基础', en: 'Applied AI Foundations', level: '进阶', academy: 'openai', publicNote: true,
      desc: '把 AI 真正用进日常工作：找到高价值场景，养成可靠习惯。',
      longDesc: '懂了 AI 是什么之后，这门课帮你把它用起来：识别真正能省时间的场景、写出可复用的提示词、定制属于你的 AI 助手，并安全地在团队里落地。',
      modules: [
        { id: 'm1', title: '把 AI 用到工作中', en: 'Putting AI to work', locked: false, lessons: [
          { id: 'l1', title: '从尝试到习惯', blocks: [
            { t: 'lead', text: '很多人用过几次 AI 就停了，因为没把它接进真实的工作流。真正的收益来自「养成习惯」：遇到合适的任务，第一反应就是先问问 AI。' },
            { t: 'h', text: '为什么习惯比技巧更重要' },
            { t: 'p', text: '单次惊艳不会改变你的效率，持续地把重复、繁琐、需要起草的工作交给 AI 才会。关键是降低使用门槛——把它放在手边，并知道哪些事值得交给它。' },
            { t: 'list', items: ['每天会重复做的事','需要「先写个初稿」的事','需要换种说法、换个角度的事','要从一堆信息里提炼要点的事'] },
            { t: 'callout', variant: 'tip', tag: '提示', text: '给自己定个小规则：本周凡是要写邮件或做总结，先让 AI 起个草。一周后回头看省了多少时间。' },
            { t: 'quiz', q: '让 AI 真正提升效率，最关键的是？', options: ['学会很多高级技巧','养成在合适场景先用 AI 的习惯','买最贵的套餐','只在重要任务时才用'], answer: 1, explain: '持续地把重复、起草类工作交给 AI 形成习惯，比掌握零散技巧更能带来实际收益。' },
            { t: 'task', title: '定一个本周习惯', steps: ['选一类你每天都做的小任务（如回复邮件）','这一周每次都先让 AI 起草','周末回顾：哪些有效、哪些需要调整'] },
          ]},
          { id: 'l2', title: '找到你的高价值场景', blocks: [
            { t: 'lead', text: 'AI 不是哪儿都适用。把精力花在「高频 + 耗时 + 不需要你独有判断」的任务上，回报最高。学会快速判断一件事值不值得交给 AI。' },
            { t: 'h', text: '一个简单的筛选标准' },
            { t: 'list', items: ['频率高：每天或每周都要做','耗时长：单次要花不少时间','容错高：出错可以低成本修正','规则清晰：能说明白「好」长什么样'] },
            { t: 'callout', variant: 'note', tag: '注意', text: '涉及重大决策、敏感数据或需要你个人判断与责任的事，AI 可以辅助，但最终判断必须由你来做。' },
            { t: 'quiz', q: '哪类任务最适合优先交给 AI？', options: ['一年只做一次、关系重大的决策','每周重复、耗时且容错较高的起草类工作','涉及机密且不可出错的事','需要你个人签字担责的事'], answer: 1, explain: '高频、耗时、容错较高、规则清晰的任务，是 AI 回报最高的场景。' },
            { t: 'task', title: '列出你的三个场景', steps: ['写下你工作中三件高频又耗时的任务','按「容错高不高、规则清不清」打分','挑分数最高的一个，下周交给 AI 试'] },
          ]},
          { id: 'l3', title: '写出可复用的提示词', blocks: [
            { t: 'lead', text: '当某类任务你要反复做，就别每次从头打字。把一个好用的提示词「模板化」，留出空格填入当次的具体信息，效率立刻翻倍。' },
            { t: 'h', text: '模板化的思路' },
            { t: 'p', text: '先写出一个能产出满意结果的提示词，然后把里面「每次都会变」的部分抽成占位符（如【主题】【受众】），固定不变的要求保留下来。下次只换占位符即可。' },
            { t: 'prompt', label: '可复用模板 · 给 ChatGPT', text: '你是一位资深内容编辑。\n\n请把下面的要点扩写成一篇面向【受众】的短文。\n要求：语气【正式/轻松】，长度约【字数】字，结尾给一句行动号召。\n\n要点：\n【在这里粘贴你的要点】' },
            { t: 'callout', variant: 'key', tag: '重点', text: '好模板会越用越顺手。每次发现结果不够好，就顺手改一句要求，慢慢沉淀成你自己的「提示词库」。' },
            { t: 'quiz', q: '把提示词模板化的核心做法是？', options: ['每次都重新写','把不变的要求固定、把会变的部分留成占位符','把提示词写得越短越好','只用别人给的模板'], answer: 1, explain: '固定通用要求、抽出可变占位符，就能让一个好提示词反复复用、持续打磨。' },
            { t: 'task', title: '做一个你的模板', steps: ['挑一类你常做的任务，写出一个满意的提示词','把每次都变的信息改成【占位符】','保存起来，下次直接套用'] },
          ]},
        ]},
        { id: 'm2', title: '定制你的 AI', en: 'Customizing your AI', locked: false, lessons: [
          { id: 'l4', title: '自定义 GPT 入门', blocks: [
            { t: 'lead', text: 'Custom GPT 让你可以创建一个专为特定用途设计的 AI 助手，配置好之后团队所有人都能直接使用，无需每次重复输入背景信息。' },
            { t: 'h', text: '什么是 Custom GPT' },
            { t: 'p', text: 'Custom GPT 是你在 ChatGPT 中创建的专属 AI 配置。你可以给它设定名字、描述、行为指令，上传参考文档，并开启特定能力。创建后，它会出现在你的 GPT 列表中，一键即可使用。' },
            { t: 'h', text: 'GPT Builder 的主要配置项' },
            { t: 'list', items: ['名称与描述：让用户一眼理解这个 GPT 的用途', '系统指令（Instructions）：定义 GPT 的行为、语气、专注领域', '知识库（Knowledge）：上传 PDF、TXT 等文件供 GPT 参考', '能力开关：网页浏览、图像生成、代码解释器'] },
            { t: 'task', title: '创建你的第一个 Custom GPT', steps: ['登录 ChatGPT，点击左侧"探索 GPT"，然后点击右上角"创建"', '在 GPT Builder 中输入名称（如"会议摘要助手"）和一句话描述', '在"指令"区域写入你的系统 Prompt（告诉它该怎么工作）', '点击"保存"，然后在新对话中测试你的 Custom GPT'] },
            { t: 'callout', variant: 'note', tag: '注意', text: 'Custom GPT 功能需要 ChatGPT Plus 或 Team/Enterprise 订阅。免费账户可以使用他人创建的公开 GPT，但无法自行创建。' },
            { t: 'quiz', q: '在 Custom GPT 的配置中，"系统指令"的主要作用是什么？', options: ['设定 GPT 的名称和头像', '定义 GPT 的行为方式、语气和专注范围', '控制哪些用户可以访问该 GPT', '决定 GPT 的回复速度'], answer: 1, explain: '系统指令是 Custom GPT 的核心配置，它告诉模型应该扮演什么角色、如何回应用户、专注哪些话题。' },
            { t: 'task', title: '配置一个实用的 Custom GPT', steps: ['确定一个你工作中重复出现的场景（如整理周报、回复客户邮件）', '写一段 3-5 句的系统指令，描述 GPT 应该如何工作', '（可选）开启"代码解释器"或"网页浏览"能力', '保存后测试：输入一个真实任务，评估输出质量'] },
          ]},
          { id: 'l5', title: '给它上传你的知识', blocks: [
            { t: 'lead', text: '通过上传文件，你可以让 Custom GPT 参考你的内部文档、产品手册或行业资料来回答问题。这就是 RAG（检索增强生成）的实际应用。' },
            { t: 'h', text: 'RAG 是如何工作的' },
            { t: 'p', text: 'RAG（Retrieval-Augmented Generation）是指 AI 在回答问题时，先从上传的文档中搜索相关片段，再结合这些内容生成回答。它不是把整本书都"塞进"模型记忆，而是在需要时按需检索。' },
            { t: 'list', items: ['支持格式：PDF、TXT、DOCX、CSV 等', '工作方式：用户提问 → GPT 搜索文档 → 结合检索结果生成回答', '优势：无需重新训练模型，快速注入专有知识'] },
            { t: 'h', text: '知识库的局限性' },
            { t: 'p', text: 'RAG 并不完美。如果文档结构混乱、标题不清晰，GPT 可能检索到错误的段落。上传文件过多时，相关性排序可能失准。此外，GPT 不会"背诵"整个文档，而是基于检索到的片段作答。' },
            { t: 'list', items: ['文件建议：结构清晰、有标题层级、不超过 20 个文件', '避免：扫描版 PDF（无法检索文字）、格式混乱的文档', '最佳实践：将不同主题拆分到不同文件，便于精准检索'] },
            { t: 'callout', variant: 'tip', tag: '提示', text: '上传文档前，先整理文档结构：用清晰的标题、小标题和段落分隔内容。结构清晰的文档能显著提升检索准确率。' },
            { t: 'quiz', q: 'RAG 技术让 Custom GPT 能够做什么？', options: ['直接访问公司内部服务器上的实时数据', '基于上传的文档回答特定领域的问题', '无限量存储所有公司文件', '替代公司现有的知识管理系统'], answer: 1, explain: 'RAG 让 GPT 能够在回答时检索上传文档中的相关内容，从而给出更有针对性的回答，但它不能访问实时数据或公司内部系统。' },
            { t: 'task', title: '测试知识库效果', steps: ['准备一份结构清晰的内部文档（产品FAQ、操作手册等）', '在 Custom GPT 配置页面上传该文档', '提出 3 个你知道文档中有答案的具体问题', '评估 GPT 的回答准确度，记录哪些问题回答准确，哪些出现偏差'] },
          ]},
          { id: 'l6', title: '写好指令', blocks: [
            { t: 'lead', text: '系统指令是 Custom GPT 的灵魂。写得好，它每次都像一个专业顾问；写得模糊，它会变成一个不知所措的通用助手。' },
            { t: 'h', text: '好的系统指令包含什么' },
            { t: 'list', items: ['角色定义：你是谁、有什么专业背景', '行为规范：应该做什么、不应该做什么', '语气风格：正式还是友好、详细还是简洁', '输出格式：偏好列表、段落还是表格', '示例问答：展示期望的交互模式'] },
            { t: 'h', text: '一个完整的系统 Prompt 示例' },
            { t: 'prompt', text: '你是"小助"，一位专注于产品管理领域的工作助手，服务于一家 B2B SaaS 公司的产品团队。\n\n你的专长：\n- 帮助撰写和优化产品需求文档（PRD）\n- 整理用户反馈并提炼洞察\n- 协助准备产品 Roadmap 和 Sprint 计划\n\n行为准则：\n- 回答简洁，默认使用中文\n- 遇到不确定的内容，明确说明"我不确定，建议核实"\n- 不提供超出产品管理范畴的专业建议（如法律、财务）\n- 输出内容默认使用 Markdown 格式，便于复制到 Notion\n\n示例对话：\n用户：帮我把这段用户反馈整理成洞察\n小助：好的，请粘贴反馈内容，我会帮你提炼出 3-5 条核心洞察，并标注出现频率。' },
            { t: 'h', text: '测试边界用例' },
            { t: 'p', text: '写完系统指令后，刻意测试一些边界场景：问它不该做的事情、用奇怪的方式提问、给出不完整的信息。好的指令应该让 GPT 在这些情况下也能优雅地处理，而不是给出奇怪的回答。' },
            { t: 'callout', variant: 'key', tag: '重点', text: '系统指令要写"做什么"，也要写"不做什么"。明确的边界让 GPT 在超出范围的请求时能够正确引导用户，而不是硬撑。' },
            { t: 'quiz', q: '在系统指令中加入"示例问答"的主要目的是什么？', options: ['让 GPT 只回答示例中出现过的问题', '向模型展示期望的交互模式和回答风格', '限制 GPT 的回答长度', '防止 GPT 访问外部网络'], answer: 1, explain: '示例问答起到"少样本学习"的作用，向模型展示你期望的回答格式、深度和语气，从而让实际输出更接近预期。' },
            { t: 'task', title: '为你的 Custom GPT 完善系统指令', steps: ['回顾你之前创建的 Custom GPT 的系统指令', '添加"不应该做的事"至少 2 条', '加入 1 组示例问答（用户问题 + 期望的回答格式）', '用 3 个真实场景测试，根据结果迭代修改指令'] },
          ]},
        ]},
        { id: 'm3', title: '协作与安全', en: 'Collaboration & safety', locked: false, lessons: [
          { id: 'l7', title: '团队里的 AI', blocks: [
            { t: 'lead', text: 'Custom GPT 不只是个人工具，它也可以成为团队的共享资产。了解如何在团队工作流中引入 AI，以及设计共享 GPT 时的注意事项。' },
            { t: 'h', text: '在团队中共享 Custom GPT' },
            { t: 'p', text: '使用 ChatGPT Team 或 Enterprise 套餐的组织可以在内部共享 Custom GPT。团队成员可以直接使用你配置好的 GPT，无需各自重新设置，确保大家使用一致的 AI 助手。' },
            { t: 'list', items: ['ChatGPT Team：适合 2-149 人的团队，支持内部 GPT 共享', 'ChatGPT Enterprise：适合大型企业，支持更多安全和管理功能', '免费/Plus 账户：只能将 GPT 设为公开，无法限制为仅组织内可见'] },
            { t: 'h', text: '团队 GPT 的典型用例' },
            { t: 'list', items: ['入职助手：新员工常见问题 FAQ，减少重复培训成本', '会议摘要助手：统一的会议纪要格式，方便归档和检索', '客服回复助手：基于产品手册，快速生成标准化回复', '周报生成器：将工作要点自动整理为规范格式'] },
            { t: 'h', text: '为多用户设计的注意事项' },
            { t: 'p', text: '团队共享的 GPT 应该写对所有成员都适用的通用指令，避免加入只对某一个人有意义的个人偏好。指令中不要假设用户具备特定背景知识，保持语言清晰友好。' },
            { t: 'callout', variant: 'tip', tag: '提示', text: '为团队 GPT 设定一个专门的反馈渠道，定期收集成员的使用体验，根据反馈迭代优化系统指令和知识库。' },
            { t: 'quiz', q: '以下哪种场景最适合为团队创建一个共享的 Custom GPT？', options: ['一次性的临时数据分析任务', '团队每周都需要按统一格式撰写的项目状态报告', '只有一个人需要完成的个人学习计划', '处理高度机密且每次都不同的法律文件'], answer: 1, explain: '重复性、格式统一、多人都需要完成的任务最适合用共享 Custom GPT 来标准化，能显著节省整个团队的时间。' },
            { t: 'task', title: '设计一个团队 GPT', steps: ['在你的团队中找一个重复性任务（如周报、会议纪要）', '写一份适用于所有团队成员的系统指令草稿', '请 1-2 位同事试用并提供反馈', '根据反馈修改指令，确保对不同背景的成员都友好'] },
          ]},
          { id: 'l8', title: '数据与隐私', blocks: [
            { t: 'lead', text: '使用 ChatGPT 时，你输入的数据如何被处理？了解 OpenAI 的数据政策和你的隐私选项，是安全使用 AI 工具的前提。' },
            { t: 'h', text: 'OpenAI 默认如何处理你的数据' },
            { t: 'p', text: '使用 ChatGPT 免费版和 Plus 版时，OpenAI 默认可能使用你的对话内容来改进模型（除非你选择退出）。对话记录会被保存，用于提供服务和安全审查。这意味着你输入的内容不应包含任何不愿意让第三方看到的信息。' },
            { t: 'h', text: '如何选择退出数据训练' },
            { t: 'list', items: ['在 ChatGPT 设置 → 数据控制中关闭"改进我们的模型"选项', '关闭聊天记录功能：你的对话将不再被保存和用于训练', 'ChatGPT Enterprise：企业版默认不使用客户数据训练模型', 'API 调用：通过 API 使用时，OpenAI 默认不使用数据训练模型'] },
            { t: 'callout', variant: 'warn', tag: '警告', text: '以下内容绝对不要粘贴到 ChatGPT：API 密钥和系统密码、客户的个人身份信息（姓名+电话+身份证）、公司未公开的财务数据和商业计划、员工绩效评估和人事档案。一旦输入，你无法确保这些数据的处理方式。' },
            { t: 'h', text: 'ChatGPT Enterprise 的数据保护' },
            { t: 'p', text: 'ChatGPT Enterprise 和 Team 版提供了更强的数据保护：对话内容不用于训练模型、数据在传输和存储中加密、管理员可以查看使用情况报告、支持 SSO 单点登录。如果公司对数据安全有高要求，应优先考虑这些企业级选项。' },
            { t: 'quiz', q: '在 ChatGPT 免费版中，如何防止你的对话被用于模型训练？', options: ['每次对话结束后手动清空聊天记录', '在设置中关闭"改进我们的模型"选项', '不使用 Custom GPT 功能', '使用无痕浏览器访问 ChatGPT'], answer: 1, explain: '在 ChatGPT 设置的"数据控制"中关闭"改进我们的模型"选项，是目前最直接的方式。无痕浏览器不影响服务器端的数据处理。' },
            { t: 'task', title: '检查并调整你的隐私设置', steps: ['登录 ChatGPT，进入设置（右上角头像 → 设置）', '找到"数据控制"选项，查看"改进我们的模型"是否已开启', '根据你的需要决定是否关闭该选项', '回顾你最近的 ChatGPT 对话，检查是否有不应该输入的敏感信息'] },
          ]},
        ]},
        { id: 'm4', title: '测验', en: 'Quiz', locked: false, lessons: [
          { id: 'l9', title: '课程测验', blocks: [
            { t: 'lead', text: '你已经完成了应用 AI 基础课程的全部学习内容。通过以下 6 道测验题，检验你对 Custom GPT、团队协作和数据安全的理解。' },
            { t: 'quiz', q: '以下哪项不是 Custom GPT 可以配置的功能？', options: ['上传参考文档作为知识库', '开启网页浏览能力', '直接访问公司内部数据库', '设定 GPT 的角色和行为指令'], answer: 2, explain: 'Custom GPT 不能直接访问公司内部数据库。它只能通过上传文件、开启内置工具（网页浏览、代码解释器）等方式扩展能力。' },
            { t: 'quiz', q: '写好系统指令的关键是什么？', options: ['指令越长越好，包含越多细节越好', '既要写"该做什么"，也要写"不该做什么"', '只需要写角色名称，其他让模型自己判断', '每次使用前手动修改指令'], answer: 1, explain: '好的系统指令既要正向定义行为（该做什么），也要设置边界（不该做什么）。两者都有才能让 GPT 在各种情况下表现一致。' },
            { t: 'quiz', q: '关于 Custom GPT 的知识库（RAG），以下哪项描述最准确？', options: ['上传的文档会被完整地"记忆"到模型中', 'GPT 在回答时检索文档中的相关片段来辅助生成', '知识库支持实时同步公司数据库中的内容', '上传文件越多，回答越准确'], answer: 1, explain: 'RAG 是检索式方案：GPT 在回答问题时搜索上传文档的相关片段，而不是把整个文档都"记住"。文件过多反而可能降低检索精度。' },
            { t: 'quiz', q: '在 ChatGPT Team 版中，团队如何共享 Custom GPT？', options: ['通过邮件将 GPT 配置文件发送给同事', '在 ChatGPT 工作区内发布，团队成员直接访问', '每位成员需要分别创建相同的 GPT', '共享功能需要额外付费购买插件'], answer: 1, explain: 'ChatGPT Team 版支持在组织内部发布和共享 Custom GPT，团队成员登录后可以直接在 GPT 列表中找到并使用。' },
            { t: 'quiz', q: '以下哪类信息不应该输入到 ChatGPT？', options: ['一段你想让 AI 改进的英语演讲稿', '客户的姓名、手机号和身份证号码', '你想请 AI 帮你解释的行业新闻', '你想摘要的一份公开产品白皮书'], answer: 1, explain: '客户的个人身份信息属于敏感数据，不应输入第三方 AI 服务。其他三项均为可安全使用的公开或非敏感内容。' },
            { t: 'quiz', q: '使用 AI 辅助完成工作成果时，负责任的做法是什么？', options: ['不需要说明，AI 只是工具，使用与否是个人自由', '在适当场合透明说明 AI 的参与程度，遵守相关规范', '将所有 AI 生成内容标注为"100% AI 生成，免责"', '只在没有人知道的情况下使用 AI'], answer: 1, explain: '透明使用 AI 是职业诚信的体现。在学术、职业等场景中，是否使用 AI 可能有具体规定，应主动了解并遵守相关规范。' },
            { t: 'task', title: '制定你的 Custom GPT 计划', steps: ['回顾课程中你最感兴趣的一个 Custom GPT 用例', '写出该 GPT 的名称、用途描述和系统指令框架', '列出你打算上传的参考文件（如有）', '确定这个 GPT 是个人使用还是团队共享，并据此调整指令写法'] },
          ]},
        ]},
      ],
    },

    { id: 'oai-agents', title: 'Agents 与工作流', en: 'Agents and Workflows', level: '高级', academy: 'openai', publicNote: true,
      desc: '让 AI 不止于回答，而是自己分步完成任务、自动化你的工作流。',
      longDesc: '这门课带你从「对话」走向「自动化」：理解 AI Agent 是什么、它和普通对话有何不同、什么时候该用，以及如何把多步骤的工作交给它自动完成。',
      modules: [
        { id: 'm1', title: '认识 Agents', en: 'Meet AI Agents', locked: false, lessons: [
          { id: 'l1', title: '什么是 AI Agent', blocks: [
            { t: 'lead', text: 'AI Agent（智能体）是能「自己分步把任务做完」的 AI。你给它一个目标，它会自己规划步骤、调用需要的工具、一步步执行，而不只是给你一段文字建议。' },
            { t: 'h', text: '从「回答」到「行动」' },
            { t: 'p', text: '普通对话里，AI 给你建议，执行还得你来；Agent 则能真正去做：查资料、填表单、调用其他软件、把结果整理好。它把「想」和「做」连了起来。' },
            { t: 'list', items: ['设定目标：你说清要达成什么','自主规划：它拆解成若干步骤','调用工具：搜索、读写文件、连接应用','交付结果：完成后把成果交给你'] },
            { t: 'callout', variant: 'note', tag: '说明', text: '本课讲的是 Agent 的通用概念与思路。具体产品的功能和界面会持续更新，请以 OpenAI 官方文档为准。' },
            { t: 'quiz', q: 'AI Agent 和普通对话最大的区别是？', options: ['回答更长','能自主分步执行任务、调用工具，而不只是给建议','只能聊天','不需要你设定目标'], answer: 1, explain: 'Agent 能自己规划步骤、调用工具并执行，把「给建议」升级为「把事做完」。' },
            { t: 'task', title: '分辨对话与 Agent', steps: ['想一件你常做、需要多步操作的任务（如整理一份资料）','哪些步骤现在是你手动做的','设想如果交给 Agent，它会怎样一步步替你完成'] },
          ]},
          { id: 'l2', title: 'Agent 是怎么运转的', blocks: [
            { t: 'lead', text: 'Agent 的工作方式可以理解成一个循环：理解目标 → 想下一步 → 用一个工具 → 看结果 → 再决定下一步，直到完成。这个「边做边判断」的循环是它能完成复杂任务的关键。' },
            { t: 'h', text: '三个关键部件' },
            { t: 'list', items: ['目标：你交给它的最终结果','工具：它能动用的能力（搜索、读写、连接的应用）','判断：每一步根据结果决定接下来做什么'] },
            { t: 'callout', variant: 'key', tag: '重点', text: 'Agent 越自主，越需要清晰的目标和边界。把「要达成什么」「不能做什么」说清楚，它才不会跑偏。' },
            { t: 'quiz', q: '下面哪一项「不是」Agent 运转的核心部件？', options: ['明确的目标','可调用的工具','根据结果做判断的能力','更漂亮的界面'], answer: 3, explain: 'Agent 的核心是目标、工具和基于结果的判断循环；界面美观与否不影响它能否完成任务。' },
            { t: 'task', title: '画出一个循环', steps: ['为你上一节想到的任务设一个目标','列出它可能需要的 2-3 个工具','画出「想一步→做一步→看结果」的循环'] },
          ]},
          { id: 'l3', title: '什么时候该用 Agent', blocks: [
            { t: 'lead', text: '不是所有事都需要 Agent。简单的一问一答，普通对话更快更省；多步骤、要调用工具、要自动跑完的流程，才轮到 Agent 出场。' },
            { t: 'h', text: '适合 Agent 的信号' },
            { t: 'list', items: ['任务有明确的多个步骤','需要去「拿」外部信息或操作其他工具','你希望它自动跑完，而不是盯着每一步','流程会重复发生，值得自动化'] },
            { t: 'callout', variant: 'tip', tag: '提示', text: '先用普通对话把任务跑顺、把要求理清，再考虑把这套稳定的流程交给 Agent 自动化——这样更可控。' },
            { t: 'quiz', q: '下列哪种情况最适合用 Agent 而不是普通对话？', options: ['问一句话就能答的小问题','一个需要多步、还要调用其他工具自动跑完的流程','让它改一句文案','问一个定义'], answer: 1, explain: '多步骤、需调用工具、希望自动跑完且会重复的流程，才是 Agent 的用武之地。' },
            { t: 'task', title: '判断你的场景', steps: ['回看你列出的任务，判断它是「一问一答」还是「多步流程」','如果是多步流程，写下它的步骤','想想哪些步骤可以安全地交给 Agent 自动完成'] },
          ]},
        ]},
        { id: 'm2', title: '构建工作流', en: 'Building workflows', locked: false, lessons: [
          { id: 'l4', title: '自动化一个流程', blocks: [
            { t: 'lead', text: '将一个现有的人工流程交给 AI Agent 来执行，需要先仔细拆解这个流程。本课教你如何识别适合自动化的流程，以及如何为 Agent 绘制清晰的执行地图。' },
            { t: 'h', text: '选择合适的自动化候选流程' },
            { t: 'p', text: '最适合自动化的流程具备以下特征：步骤固定、规则清晰、重复执行、不需要人类情感判断。如果一个流程每次执行方式都不同，或需要大量人际沟通和情境判断，自动化的效果会大打折扣。' },
            { t: 'list', items: ['好的候选：每天自动摘要收件箱中的新文件', '好的候选：将新提交的表单数据分类并路由到对应负责人', '不适合：需要和客户深度沟通理解需求的销售谈判', '不适合：需要创意和主观判断的品牌策略制定'] },
            { t: 'h', text: '以文件摘要流程为例' },
            { t: 'p', text: '以"自动摘要新收到的文件"为例，分解步骤：检查是否有新文件 → 读取文件内容 → 判断文件类型（合同/报告/邮件）→ 按模板生成摘要 → 将摘要存入指定位置。其中，"判断文件类型"是 AI 判断点，其余是确定性逻辑。' },
            { t: 'h', text: '标出决策点' },
            { t: 'p', text: '绘制流程图时，明确区分两类步骤：确定性步骤（总是做同一件事）和 AI 判断步骤（需要理解内容后做决定）。Agent 在判断步骤上最有价值，确定性步骤可以用普通代码完成。' },
            { t: 'callout', variant: 'key', tag: '重点', text: '先将流程写成人类版本的操作手册，再思考哪些步骤可以由 AI 执行。自动化的前提是流程本身足够清晰。' },
            { t: 'quiz', q: '以下哪个流程最适合用 AI Agent 来自动化？', options: ['与重要客户进行年度战略规划会议', '每天从固定来源汇总行业新闻并生成简报', '为公司设计新品牌标志的创意方向', '处理需要法律解释的合同纠纷'], answer: 1, explain: '每天汇总固定来源新闻是步骤固定、规则清晰、重复性高的任务，非常适合 Agent 自动化。其他选项都需要大量人类判断和创意。' },
            { t: 'task', title: '拆解一个自动化流程', steps: ['选择你工作中一个每周都要重复执行的任务', '将它拆解为 5-8 个具体步骤', '标注每个步骤：是确定性逻辑还是需要 AI 判断', '评估：如果 AI 在判断步骤出错，后果是否可接受？'] },
          ]},
          { id: 'l5', title: '连接工具与数据', blocks: [
            { t: 'lead', text: 'AI Agent 的力量来自于它能调用工具采取行动，而不只是生成文字。本课介绍 function calling 和 Assistants API 的内置工具，理解 Agent 如何与现实世界交互。' },
            { t: 'h', text: 'Function calling 是什么' },
            { t: 'p', text: 'Function calling（函数调用）允许你给模型定义一组可以调用的函数。模型在对话中判断"这里需要调用某个函数"，然后返回调用指令（函数名和参数），由你的代码实际执行函数并将结果返回给模型。模型再基于结果继续生成回复。' },
            { t: 'list', items: ['模型决定"要调用什么函数"', '你的代码负责实际执行函数', '函数结果返回给模型后，模型继续对话', '典型用途：查询数据库、调用外部 API、操作文件'] },
            { t: 'h', text: '一个函数定义的例子' },
            { t: 'prompt', text: '// 告诉模型你有一个"查询天气"的函数\n{\n  "name": "get_weather",\n  "description": "查询指定城市的当前天气",\n  "parameters": {\n    "city": {\n      "type": "string",\n      "description": "城市名称，如\'北京\'或\'上海\'"\n    }\n  }\n}\n\n// 用户说"北京今天冷吗？"后，模型会返回：\n// { "function": "get_weather", "arguments": { "city": "北京" } }' },
            { t: 'h', text: 'Assistants API 的内置工具' },
            { t: 'list', items: ['代码解释器（Code Interpreter）：运行 Python 代码，处理数据、生成图表', '文件搜索（File Search）：从上传文件中检索信息（即 RAG）', '网页浏览：访问互联网获取最新信息'] },
            { t: 'callout', variant: 'note', tag: '注意', text: 'Function calling 让 Agent 能够"行动"，而不只是"说话"。设计工具时，每个函数只做一件明确的事，命名清晰，便于模型准确判断何时调用。' },
            { t: 'quiz', q: '在 function calling 机制中，谁负责实际执行函数？', options: ['OpenAI 的服务器', '你的应用代码', '模型本身直接执行', '用户手动触发'], answer: 1, explain: '模型只决定"需要调用哪个函数并传入什么参数"，实际的函数执行由开发者的应用代码完成。结果再返回给模型继续处理。' },
            { t: 'task', title: '设计一个工具定义', steps: ['选择一个你的 Agent 需要执行的操作（如"发送通知"或"查询订单状态"）', '写出该工具的名称（英文）、描述（中文）、需要的参数', '思考：这个工具调用后，结果应该如何返回给 Agent？', '（可选）在 OpenAI Playground 的 Assistants 页面添加该工具定义'] },
          ]},
          { id: 'l6', title: '编排多个步骤', blocks: [
            { t: 'lead', text: '真实的 Agent 工作流通常包含多个步骤。如何组织这些步骤的执行顺序，是构建可靠工作流的核心设计问题。' },
            { t: 'h', text: '三种基本编排模式' },
            { t: 'list', items: ['串行（Sequential）：步骤 1 → 步骤 2 → 步骤 3，前一步的输出是后一步的输入', '并行（Parallel）：多个独立步骤同时执行，最后汇总结果', '条件分支（Conditional）：如果 X 发生则执行 Y，否则执行 Z'] },
            { t: 'h', text: '串行模式：流水线处理' },
            { t: 'p', text: '串行模式适合有明确先后顺序的任务：提取数据 → 清洗数据 → 分析数据 → 生成报告。每一步都依赖前一步的结果。设计时要考虑：如果中间某一步失败，是重试、跳过还是终止整个流程？' },
            { t: 'h', text: '并行模式与条件分支' },
            { t: 'p', text: '并行模式适合独立子任务：同时分析 5 个不同部门的报告，最后汇总。条件分支让 Agent 能根据情况选择不同路径：如果文件是合同，执行合同审查流程；如果是发票，执行财务核对流程。' },
            { t: 'list', items: ['串行：有依赖关系的步骤，保证顺序正确', '并行：独立子任务，提升效率', '条件分支：处理多种输入类型，增加灵活性'] },
            { t: 'callout', variant: 'tip', tag: '提示', text: '从最简单的串行流程开始设计，先跑通再优化。过早引入并行和条件分支会让调试变得困难。' },
            { t: 'quiz', q: '以下哪种场景最适合使用并行编排模式？', options: ['需要依次处理的数据清洗、分析、报告三个步骤', '同时处理来自 5 个城市的独立销售报告', '根据用户类型选择不同的回复策略', '按固定顺序执行的系统初始化流程'], answer: 1, explain: '5 个城市的销售报告相互独立，没有依赖关系，非常适合并行处理以节省时间。其他选项更适合串行或条件分支模式。' },
            { t: 'task', title: '设计一个多步骤工作流', steps: ['选择一个包含 4 个以上步骤的实际工作流程', '将步骤分类：哪些是串行、哪些可以并行、哪些有条件分支', '画出流程图（可以用文字描述箭头关系）', '标注每个步骤的失败处理策略：重试、跳过还是终止'] },
          ]},
        ]},
        { id: 'm3', title: '可靠与安全', en: 'Reliability & safety', locked: false, lessons: [
          { id: 'l7', title: '让 Agent 可控', blocks: [
            { t: 'lead', text: 'Agent 越自主，出错的代价可能越大。设计可控的 Agent，意味着在关键节点保留人类干预的能力，而不是让 AI 完全自主运行。' },
            { t: 'h', text: '人在回路（Human-in-the-Loop）模式' },
            { t: 'p', text: '人在回路（Human-in-the-Loop）是一种设计模式：在 Agent 执行过程中，设定特定的检查点，要求人类确认后才能继续。不是所有步骤都需要人工确认，只在关键节点介入即可。' },
            { t: 'list', items: ['不可逆操作前确认：删除文件、发送邮件、提交订单', '批量操作后审查：处理完 100 条记录后，抽查 5 条验证质量', '低置信度时升级：Agent 遇到不确定的情况，主动请求人工判断'] },
            { t: 'h', text: '设定清晰的行为边界' },
            { t: 'p', text: '在 Agent 的系统指令中，明确写出它可以自主执行的操作范围，以及哪些操作必须等待人工批准。边界越清晰，Agent 的行为越可预测，出错时也更容易定位原因。' },
            { t: 'callout', variant: 'warn', tag: '警告', text: '对于不可逆操作（删除数据、转账、发送大批量邮件），永远要设置人工确认步骤，无论 Agent 的置信度有多高。一旦执行，这些操作很难撤销。' },
            { t: 'h', text: '最小权限原则' },
            { t: 'p', text: '只给 Agent 完成当前任务必需的工具访问权限。如果任务只需要读取数据，不要给它写入权限。权限越少，意外破坏的可能性越低。' },
            { t: 'quiz', q: '以下哪种情况最应该设置人工确认步骤？', options: ['Agent 从网页上阅读一篇新闻', 'Agent 准备向 500 位客户发送营销邮件', 'Agent 在本地临时文件夹中创建一个草稿', 'Agent 搜索数据库中的历史记录'], answer: 1, explain: '向 500 位客户发送邮件是不可逆的批量操作，一旦执行无法撤回。这类操作必须在执行前经过人工审查和确认。' },
            { t: 'task', title: '为你的 Agent 设计控制点', steps: ['回顾你在上一模块设计的工作流', '识别其中的不可逆操作', '为每个不可逆操作设计确认机制（如：打印操作摘要，等待人工输入 yes/no）', '在 Agent 指令中写明：遇到哪些情况需要主动暂停并请求人工判断'] },
          ]},
          { id: 'l8', title: '评估与监控', blocks: [
            { t: 'lead', text: '部署 Agent 只是开始。持续监控它的行为、评估输出质量，并建立反馈闭环，才能让 Agent 在长期运行中保持可靠。' },
            { t: 'h', text: '记录每一次工具调用' },
            { t: 'p', text: '每次 Agent 调用工具时，都应该记录：调用了什么工具、传入了什么参数、得到了什么结果、花费了多长时间。这些日志是调试问题和优化性能的基础。没有日志，出问题时你只能猜测。' },
            { t: 'h', text: '定义成功标准' },
            { t: 'p', text: '在部署前，明确定义什么算成功：准确率达到 X%、处理时间不超过 Y 秒、用户满意度评分高于 Z。有了量化标准，你才能判断 Agent 是否达到预期，以及何时需要干预和优化。' },
            { t: 'list', items: ['准确率：正确完成任务的比例', '覆盖率：能够处理（而不是放弃）的请求比例', '延迟：完成任务所需的平均时间', '升级率：需要人工介入的请求比例'] },
            { t: 'h', text: '识别偏轨的 Agent' },
            { t: 'p', text: '当 Agent 开始重复调用同一个工具、产生异常长的输出、或者对相似输入给出截然不同的结果时，这些都是偏轨的信号。设置自动告警阈值，当关键指标异常时及时通知人工审查。' },
            { t: 'callout', variant: 'key', tag: '重点', text: '最好的 Agent 系统不是"不出错"，而是"出错时能快速发现并修复"。日志、监控和反馈机制是实现这一目标的三驾马车。' },
            { t: 'quiz', q: '以下哪项不是评估 Agent 性能的有效指标？', options: ['正确完成任务的准确率', 'Agent 使用的模型版本号', '需要人工介入的请求比例', '完成任务的平均响应时间'], answer: 1, explain: '模型版本号本身不能衡量 Agent 的性能，它只是一个配置参数。准确率、升级率和响应时间才是直接反映 Agent 工作质量的指标。' },
            { t: 'task', title: '为 Agent 设计监控方案', steps: ['列出你 Agent 工作流中需要记录日志的关键操作', '定义 3 个量化的成功指标（如：准确率 > 90%）', '设计偏轨检测规则：哪些异常行为应该触发告警', '规划反馈闭环：如何将发现的问题转化为对 Agent 指令的改进'] },
          ]},
        ]},
        { id: 'm4', title: '测验', en: 'Quiz', locked: false, lessons: [
          { id: 'l9', title: '课程测验', blocks: [
            { t: 'lead', text: '恭喜你完成了 Agents 与工作流课程！以下 6 道测验题覆盖了课程的核心知识点，检验你的掌握程度。' },
            { t: 'quiz', q: 'Function calling 让 AI Agent 能够做什么？', options: ['自动学习新的编程语言', '调用你定义的函数来与外部系统交互', '替代所有人工编写的代码', '直接访问用户的本地文件系统'], answer: 1, explain: 'Function calling 让模型能够在对话中判断"需要调用哪个函数"，由开发者的代码实际执行，从而让 Agent 能够与外部系统、数据库、API 等交互。' },
            { t: 'quiz', q: 'OpenAI Assistants API 中的持久线程（Persistent Threads）有什么作用？', options: ['让多个用户同时使用同一个 Assistant', '保存对话历史，让 Agent 在多次会话间维持上下文', '加快 API 的响应速度', '自动备份 Agent 的配置文件'], answer: 1, explain: '持久线程存储了对话历史，让 Agent 在下一次会话时仍然能记住之前的上下文，适合需要跨会话维护状态的应用场景。' },
            { t: 'quiz', q: '以下哪种情况最需要应用人在回路（Human-in-the-Loop）模式？', options: ['Agent 在搜索引擎中查询公开信息', 'Agent 准备永久删除数据库中 1000 条客户记录', 'Agent 生成一份内部分析报告草稿', 'Agent 将一篇文章翻译成中文'], answer: 1, explain: '永久删除 1000 条数据库记录是不可逆的批量操作，必须在执行前经过人工确认。搜索、生成草稿、翻译都是低风险操作，不需要人工介入。' },
            { t: 'quiz', q: '监控 Agent 工作状态时，以下哪种做法最有效？', options: ['每天手动检查 Agent 的所有输出', '记录每次工具调用的日志并设置关键指标告警', '只在 Agent 报错时才检查日志', '完全信任 Agent，不需要额外监控'], answer: 1, explain: '记录完整的工具调用日志并设置量化指标的自动告警，是兼顾效率和可靠性的监控方案。依赖手动检查或只看报错都无法及时发现偏轨行为。' },
            { t: 'quiz', q: '以下哪类任务是好的 Agent 自动化候选？', options: ['需要与客户进行情感沟通的投诉处理', '每天固定时间从 3 个来源汇总数据并生成报告', '需要创意灵感和个人风格的广告文案创作', '需要法律判断的合同纠纷解决'], answer: 1, explain: '定时数据汇总是步骤固定、规则清晰、重复性高的任务，是 Agent 自动化的理想候选。其他选项都需要大量人类创意判断或情感能力。' },
            { t: 'quiz', q: '在多步骤 Agent 工作流中，以下关于并行模式的描述哪项正确？', options: ['并行模式适合有严格先后顺序依赖的任务', '并行模式让多个独立子任务同时执行，提升整体效率', '并行模式下所有子任务共享同一个上下文窗口', '并行模式只适用于两个子任务的情况'], answer: 1, explain: '并行模式的核心是让互相独立、没有依赖关系的子任务同时执行，从而缩短总完成时间。子任务有依赖时应使用串行模式。' },
            { t: 'task', title: '设计你的第一个 Agent 工作流', steps: ['从你的实际工作中选一个重复性流程，完整描述它的步骤', '标注每个步骤的类型：确定性逻辑 / AI 判断 / 不可逆操作', '设计工具列表：Agent 需要调用哪些函数或 API', '写出监控方案：记录哪些日志，定义什么成功标准'] },
          ]},
        ]},
      ],
    },
  ];
}

const CATALOG = [...buildAnthropicCourses(), ...buildOpenAICourses()];

// ── Helpers ───────────────────────────────────────────────────────────────────

const ACCENT_PALETTE = {
  '#D97757': { soft: '#FBEDE6', deep: '#BF5F3C' },
  '#10A37F': { soft: '#E3F5EF', deep: '#0C7D60' },
};

function accentVars(accent) {
  const p = ACCENT_PALETTE[accent] || { soft: '#FBEDE6', deep: '#BF5F3C' };
  return { '--accent': accent, '--accent-soft': p.soft, '--accent-deep': p.deep };
}

function levelStyle(lvl) {
  const p = { '入门': { bg: '#E4F3EC', c: '#2C6B4F' }, '进阶': { bg: 'var(--accent-soft)', c: 'var(--accent-deep)' }, '高级': { bg: '#EDE7F6', c: '#5E43AB' } }[lvl] || { bg: '#F1ECE3', c: '#6F665B' };
  return { display: 'inline-block', fontSize: '11px', fontWeight: 700, letterSpacing: '.04em', padding: '3px 10px', borderRadius: '20px', background: p.bg, color: p.c };
}

function courseProgress(course, done) {
  const avail = [];
  course.modules.forEach(m => { if (!m.locked) m.lessons.forEach(l => avail.push(l)); });
  const doneCount = avail.filter(l => done[course.id + '::' + l.id]).length;
  return { done: doneCount, total: avail.length, pct: avail.length ? Math.round(doneCount / avail.length * 100) : 0 };
}

function totalLessons(course) {
  let n = 0; course.modules.forEach(m => n += m.lessons.length); return n;
}

function availLessons(course) {
  const out = []; course.modules.forEach(m => { if (!m.locked) m.lessons.forEach(l => out.push(l)); }); return out;
}

function findLesson(course, id) {
  for (let mi = 0; mi < course.modules.length; mi++) {
    const m = course.modules[mi];
    for (const l of m.lessons) {
      if (l.id === id) return { mod: m, lesson: l, mi };
    }
  }
  return null;
}

// ── Block components ──────────────────────────────────────────────────────────

function CalloutBox({ b }) {
  const palette = {
    tip: { bg: '#FBF4E6', bd: '#ECD9A8', tc: '#B07F24' },
    note: { bg: '#EEF3F7', bd: '#CFE0EC', tc: '#3D7196' },
    key: { bg: 'var(--accent-soft)', bd: 'var(--accent)', tc: 'var(--accent-deep)' },
  }[b.variant] || { bg: '#F3EFE8', bd: '#E2DACE', tc: '#6F665B' };
  return (
    <div style={{ padding: '15px 18px', borderRadius: '14px', margin: '8px 0 22px', border: '1px solid ' + palette.bd, background: palette.bg }}>
      <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '.06em', marginBottom: '6px', color: palette.tc }}>{b.tag}</div>
      <div style={{ fontSize: '15.5px', lineHeight: 1.72, color: '#473F38' }}>{b.text}</div>
    </div>
  );
}

function PromptBox({ b, copied, onCopy }) {
  return (
    <div style={{ border: '1px solid #EAE2D6', borderRadius: '15px', overflow: 'hidden', margin: '8px 0 24px', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 15px', background: '#FAF6F0', borderBottom: '1px solid #EFE8DD' }}>
        <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#9A9082', letterSpacing: '.05em' }}>{b.label || '示例提示词 · PROMPT'}</span>
        <button onClick={onCopy} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12.5px', fontWeight: 700, fontFamily: 'inherit', color: copied ? '#3F8F6B' : 'var(--accent-deep)' }}>
          {copied ? '已复制 ✓' : '复制'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '17px 18px', fontFamily: "'Space Grotesk','Noto Sans SC',monospace", fontSize: '14.5px', lineHeight: 1.75, color: '#332F2A', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{b.text}</pre>
    </div>
  );
}

function QuizBlock({ b, blockKey, selected, onSelect }) {
  const revealed = selected != null;
  const optBase = { display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E8E0D5', background: '#fff', cursor: 'pointer', fontSize: '15.5px', color: '#33302B', fontFamily: 'inherit', textAlign: 'left', marginBottom: '9px' };
  const markBase = { flex: 'none', width: '23px', height: '23px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, boxSizing: 'border-box' };
  return (
    <div style={{ border: '1px solid #E9DAC8', borderRadius: '17px', padding: '22px 24px', margin: '12px 0 26px', background: '#FFFCF8' }}>
      <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--accent-deep)', letterSpacing: '.08em', marginBottom: '10px' }}>知识点 · 小测验</div>
      <div style={{ fontSize: '17px', fontWeight: 600, lineHeight: 1.6, marginBottom: '16px', color: '#241E18' }}>{b.q}</div>
      <div>
        {b.options.map((label, oi) => {
          const isSelected = selected === oi;
          const isCorrect = oi === b.answer;
          let optStyle = { ...optBase };
          let markStyle = { ...markBase };
          let mark = AB[oi];
          if (!revealed) {
            markStyle = { ...markBase, border: '1px solid #D9CFC1', color: '#8A8071', background: '#fff' };
          } else if (isCorrect) {
            optStyle = { ...optBase, border: '1px solid #3F8F6B', background: '#EAF4EE', cursor: 'default' };
            markStyle = { ...markBase, background: '#3F8F6B', color: '#fff' }; mark = '✓';
          } else if (isSelected) {
            optStyle = { ...optBase, border: '1px solid #D98A6B', background: '#FBEDE6', cursor: 'default' };
            markStyle = { ...markBase, background: '#D98A6B', color: '#fff' }; mark = '✕';
          } else {
            optStyle = { ...optBase, opacity: 0.5, cursor: 'default' };
            markStyle = { ...markBase, border: '1px solid #D9CFC1', color: '#9A9082', background: '#fff' };
          }
          return (
            <button key={oi} onClick={revealed ? undefined : () => onSelect(oi)} style={optStyle}>
              <span style={markStyle}>{mark}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
            </button>
          );
        })}
      </div>
      {revealed && (
        <div style={{ marginTop: '15px', padding: '12px 15px', borderRadius: '11px', fontSize: '14.5px', lineHeight: 1.7, background: selected === b.answer ? '#EAF4EE' : '#FBF4E6', color: '#473F38', border: '1px solid ' + (selected === b.answer ? '#CDE6D7' : '#ECD9A8') }}>
          {(selected === b.answer ? '回答正确！' : '正确答案是 ' + AB[b.answer] + '。') + b.explain}
        </div>
      )}
    </div>
  );
}

function TaskBlock({ b }) {
  return (
    <div style={{ border: '1px dashed #D6C9B6', borderRadius: '17px', padding: '22px 24px', margin: '12px 0 26px', background: '#F7F3EB' }}>
      <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#3F8F6B', letterSpacing: '.08em', marginBottom: '9px' }}>✎ 动手练习</div>
      <div style={{ fontSize: '16.5px', fontWeight: 600, marginBottom: '14px', color: '#241E18' }}>{b.title}</div>
      <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '11px' }}>
        {b.steps.map((s, si) => (
          <li key={si} style={{ display: 'flex', gap: '13px', alignItems: 'flex-start', fontSize: '15.5px', lineHeight: 1.65, color: '#473F38' }}>
            <span style={{ flex: 'none', width: '23px', height: '23px', borderRadius: '50%', background: '#fff', border: '1px solid #D6C9B6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#3F8F6B', marginTop: '1px' }}>{si + 1}</span>
            <span style={{ flex: 1 }}>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [st, setSt] = useState(() => {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem('academy_v1') || '{}'); } catch (e) {}
    return {
      academy: saved.academy || 'anthropic',
      atCatalog: saved.atCatalog != null ? saved.atCatalog : true,
      courseId: saved.courseId || 'claude101',
      current: saved.current || 'home',
      done: saved.done || {},
      quiz: {},
      copied: null,
    };
  });

  const mainRef = useRef(null);
  const copyTimerRef = useRef(null);

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const save = useCallback((s) => {
    try { localStorage.setItem('academy_v1', JSON.stringify({ academy: s.academy, atCatalog: s.atCatalog, courseId: s.courseId, current: s.current, done: s.done })); } catch (e) {}
  }, []);

  const scrollTop = useCallback(() => { if (mainRef.current) mainRef.current.scrollTop = 0; }, []);

  const openCatalog = useCallback(() => {
    setSt(s => { const ns = { ...s, atCatalog: true }; save(ns); return ns; });
    scrollTop();
    setSidebarOpen(false);
  }, [save, scrollTop]);

  const openCourse = useCallback((id) => {
    const c = CATALOG.find(x => x.id === id);
    setSt(s => { const ns = { ...s, atCatalog: false, courseId: id, current: 'home', academy: c ? c.academy : s.academy }; save(ns); return ns; });
    scrollTop();
    setSidebarOpen(false);
  }, [save, scrollTop]);

  const go = useCallback((id) => {
    setSt(s => { const ns = { ...s, atCatalog: false, current: id }; save(ns); return ns; });
    scrollTop();
    setSidebarOpen(false);
  }, [save, scrollTop]);

  const switchAcademy = useCallback((id) => {
    setSt(s => { if (s.academy === id) return s; const ns = { ...s, academy: id, atCatalog: true }; save(ns); return ns; });
    scrollTop();
    setSidebarOpen(false);
  }, [save, scrollTop]);

  const toggleDone = useCallback((gkey) => {
    setSt(s => {
      const done = { ...s.done };
      if (done[gkey]) delete done[gkey]; else done[gkey] = true;
      const ns = { ...s, done };
      save(ns); return ns;
    });
  }, [save]);

  const selectQuiz = useCallback((key, idx) => {
    setSt(s => { if (s.quiz[key] != null) return s; return { ...s, quiz: { ...s.quiz, [key]: idx } }; });
  }, []);

  const copyPrompt = useCallback((key, text) => {
    try { navigator.clipboard.writeText(text); } catch (e) {}
    setSt(s => ({ ...s, copied: key }));
    clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setSt(s => ({ ...s, copied: null })), 1600);
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────────

  const academyId = st.atCatalog ? (st.academy || 'anthropic') : (() => {
    const c = CATALOG.find(x => x.id === st.courseId);
    return c ? c.academy : (st.academy || 'anthropic');
  })();

  const academy = ACADEMIES[academyId] || ACADEMIES.anthropic;
  const acCss = accentVars(academy.accent);
  const academyCourses = useMemo(() => CATALOG.filter(c => c.academy === academyId), [academyId]);

  const course = CATALOG.find(c => c.id === st.courseId);

  // ── Render: Sidebar ────────────────────────────────────────────────────────

  const sidebarStyle = isMobile
    ? { position: 'fixed', top: 0, left: 0, width: '290px', height: '100dvh', overflowY: 'auto', background: '#FFFFFF', borderRight: '1px solid #ECE5DB', padding: '24px 16px 60px', zIndex: 100, transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.25s ease', boxShadow: sidebarOpen ? '4px 0 24px rgba(0,0,0,0.12)' : 'none' }
    : { width: '322px', flex: 'none', height: '100dvh', overflowY: 'auto', background: '#FFFFFF', borderRight: '1px solid #ECE5DB', padding: '24px 16px 60px' };

  const brandMarkStyle = { width: '30px', height: '30px', flex: 'none', borderRadius: '9px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '15px' };

  function renderSidebar() {
    return (
      <aside style={sidebarStyle}>
        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
            <button onClick={() => setSidebarOpen(false)} style={{ width: '32px', height: '32px', border: '1px solid #ECE5DB', borderRadius: '8px', background: '#F4F0E9', cursor: 'pointer', fontSize: '16px', color: '#6F665B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', lineHeight: 1 }}>×</button>
          </div>
        )}
        <button onClick={openCatalog} style={{ display: 'flex', alignItems: 'center', gap: '11px', width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px 8px', textAlign: 'left', fontFamily: 'inherit' }}>
          <span style={brandMarkStyle}>{academy.letter}</span>
          <span>
            <span style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: '#241E18', letterSpacing: '-0.01em', lineHeight: 1.15 }}>{academy.name}</span>
            <span style={{ display: 'block', fontSize: '11.5px', color: '#9A9082', marginTop: '1px' }}>中文学习版</span>
          </span>
        </button>

        {st.atCatalog ? (
          <div style={{ marginTop: '18px' }}>
            <div style={{ display: 'flex', gap: '4px', padding: '4px', background: '#F4F0E9', borderRadius: '11px', margin: '0 4px 16px' }}>
              {Object.keys(ACADEMIES).map(k => {
                const on = k === academyId;
                return (
                  <button key={k} onClick={() => switchAcademy(k)} style={{ flex: 1, padding: '8px 6px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12.5px', fontWeight: on ? 700 : 500, color: on ? '#241E18' : '#9A9082', background: on ? '#fff' : 'transparent', boxShadow: on ? '0 1px 3px rgba(0,0,0,.07)' : 'none' }}>
                    {ACADEMIES[k].name}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '.12em', color: '#B6AC9D', padding: '0 9px 8px' }}>全部课程</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {academyCourses.map((c, ci) => {
                const pr = courseProgress(c, st.done);
                const active = !st.atCatalog && c.id === st.courseId;
                return (
                  <button key={c.id} onClick={() => openCourse(c.id)} style={{ display: 'flex', alignItems: 'center', gap: '11px', width: '100%', padding: '10px 11px', borderRadius: '11px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                    <span style={{ flex: 'none', width: '30px', height: '30px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, background: active ? 'var(--accent)' : '#F1ECE3', color: active ? '#fff' : '#9A9082' }}>{CN[ci]}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3A332B', lineHeight: 1.3 }}>{c.title}</span>
                      <span style={{ display: 'block', fontSize: '11.5px', color: '#A59A8C', marginTop: '1px' }}>{c.level} · {pr.done > 0 ? pr.pct + '%' : totalLessons(c) + ' 节'}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : course ? (
          <div>
            <button onClick={openCatalog} style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '20px 8px 4px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12.5px', color: '#9A9082', padding: 0 }}>← 全部课程</button>
            <div style={{ padding: '6px 9px 0' }}>
              <span style={levelStyle(course.level)}>{course.level}</span>
              <div style={{ fontSize: '17px', fontWeight: 700, color: '#241E18', marginTop: '9px', letterSpacing: '-0.01em', lineHeight: 1.2 }}>{course.title}</div>
            </div>
            <div style={{ margin: '14px 9px 4px', padding: '13px 14px', background: '#FAF6F0', border: '1px solid #EFE8DD', borderRadius: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#6F665B' }}>学习进度</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-deep)' }}>{courseProgress(course, st.done).pct}%</span>
              </div>
              <div style={{ height: '7px', borderRadius: '6px', background: '#ECE3D6', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: courseProgress(course, st.done).pct + '%', borderRadius: '6px', background: 'var(--accent)', transition: 'width .4s ease' }} />
              </div>
              <div style={{ fontSize: '11.5px', color: '#9A9082', marginTop: '8px' }}>已完成 {courseProgress(course, st.done).done} / {courseProgress(course, st.done).total} 节</div>
            </div>

            <nav style={{ marginTop: '8px' }}>
              {course.modules.map((m, mi) => (
                <div key={m.id} style={{ marginTop: '16px' }}>
                  <div style={{ padding: '0 9px 7px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '.1em', color: '#B6AC9D' }}>模块{CN[mi]}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#3A332B' }}>{m.title}</span>
                    {m.locked && <span style={{ marginLeft: 'auto', fontSize: '9.5px', fontWeight: 700, letterSpacing: '.05em', color: '#B6AC9D', background: '#F1ECE3', padding: '2px 7px', borderRadius: '20px' }}>即将推出</span>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    {m.lessons.map(l => {
                      const active = st.current === l.id;
                      const done = !!st.done[course.id + '::' + l.id];
                      const locked = !!m.locked;
                      const baseBtn = { display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 11px', borderRadius: '10px', border: 'none', background: 'transparent', cursor: locked ? 'default' : 'pointer', fontSize: '14px', color: '#4A4239', fontFamily: 'inherit', textAlign: 'left', lineHeight: 1.4 };
                      const btnStyle = locked ? { ...baseBtn, color: '#B6AC9D' } : active ? { ...baseBtn, background: 'var(--accent-soft)', color: 'var(--accent-deep)', fontWeight: 600 } : baseBtn;
                      const ib = { flex: 'none', width: '19px', height: '19px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, boxSizing: 'border-box' };
                      const indStyle = done ? { ...ib, background: '#3F8F6B', color: '#fff' } : active ? { ...ib, border: '2px solid var(--accent)', background: '#fff' } : locked ? { ...ib, border: '1.5px solid #E4DCCF', background: '#fff' } : { ...ib, border: '1.5px solid #D9CFC1', background: '#fff' };
                      return (
                        <button key={l.id} onClick={locked ? undefined : () => go(l.id)} style={btnStyle}>
                          <span style={indStyle}>{done ? '✓' : ''}</span>
                          <span style={{ flex: 1 }}>{l.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        ) : null}
      </aside>
    );
  }

  // ── Render: Main content ───────────────────────────────────────────────────

  function renderCatalog() {
    const pr = courseProgress;
    return (
      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '.14em', color: 'var(--accent-deep)', marginBottom: '16px' }}>{academy.kicker}</div>
        <h1 style={{ fontSize: isMobile ? '28px' : '44px', lineHeight: 1.12, fontWeight: 700, margin: '0 0 18px', letterSpacing: '-0.025em', color: '#1F1A14' }}>{academy.headline}</h1>
        <p style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: 1.75, color: '#5A5047', maxWidth: '600px', margin: '0 0 30px' }}>{academy.intro}</p>
        <div style={{ fontSize: '14px', color: '#8A8071', marginBottom: '40px' }}>{academyCourses.length} 门课程 · {academyCourses.reduce((s, c) => s + totalLessons(c), 0)} 节课 · 完全免费</div>
        <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '.1em', color: '#A59A8C', marginBottom: '16px' }}>浏览课程</div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
          {academyCourses.map(c => {
            const p = courseProgress(c, st.done);
            return (
              <button key={c.id} onClick={() => openCourse(c.id)} style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', background: '#fff', border: '1px solid #ECE5DB', borderRadius: '18px', padding: '20px 22px', cursor: 'pointer', fontFamily: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span style={levelStyle(c.level)}>{c.level}</span>
                  <span style={{ fontSize: '12px', color: '#9A9082' }}>共 {totalLessons(c)} 节</span>
                </div>
                <div style={{ fontSize: '19px', fontWeight: 700, color: '#241E18', marginBottom: '4px', letterSpacing: '-0.01em', lineHeight: 1.2 }}>{c.title}</div>
                <div style={{ fontSize: '12.5px', color: '#A59A8C', marginBottom: '11px' }}>{c.en}</div>
                <div style={{ fontSize: '14px', lineHeight: 1.6, color: '#6F665B', marginBottom: '18px', flex: 1 }}>{c.desc}</div>
                <div style={{ height: '6px', borderRadius: '5px', background: '#ECE3D6', overflow: 'hidden', marginBottom: '9px' }}>
                  <div style={{ height: '100%', width: p.pct + '%', borderRadius: '5px', background: p.pct ? 'var(--accent)' : 'transparent', transition: 'width .4s ease' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#9A9082' }}>{p.done > 0 ? `已学 ${p.done} / ${p.total} 节` : `${p.total} 节可学`}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-deep)' }}>{p.done > 0 ? '继续 →' : '开始 →'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function renderCourseHome() {
    if (!course) return null;
    const avail = availLessons(course);
    const firstAvail = avail[0];
    const pr = courseProgress(course, st.done);
    return (
      <div>
        <div style={{ marginBottom: '16px' }}><span style={levelStyle(course.level)}>{course.level}</span></div>
        <h1 style={{ fontSize: isMobile ? '26px' : '40px', lineHeight: 1.14, fontWeight: 700, margin: '0 0 16px', letterSpacing: '-0.025em', color: '#1F1A14' }}>{course.title}</h1>
        <p style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: 1.75, color: '#5A5047', maxWidth: '600px', margin: '0 0 28px' }}>{course.longDesc || course.desc}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '48px', flexWrap: 'wrap' }}>
          <button onClick={() => go(firstAvail ? firstAvail.id : 'home')} style={{ padding: '14px 26px', borderRadius: '12px', border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: '16px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 6px 18px -8px var(--accent)' }}>
            {pr.done > 0 ? '继续学习 →' : '开始第一课 →'}
          </button>
          <span style={{ fontSize: '14px', color: '#8A8071' }}>{course.modules.length} 个模块 · {totalLessons(course)} 节课</span>
        </div>
        {course.publicNote && (
          <div style={{ padding: '13px 16px', border: '1px solid #CFE0EC', background: '#EEF3F7', borderRadius: '13px', marginBottom: '34px', fontSize: '13.5px', lineHeight: 1.6, color: '#4A5560' }}>
            说明：本课程的讲解内容由我们根据 {course.academy === 'openai' ? 'OpenAI Academy' : 'Anthropic'} 公开课程资料整理撰写，细节与接口请以官方文档为准。
          </div>
        )}
        <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '.1em', color: '#A59A8C', marginBottom: '16px' }}>课程大纲</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {course.modules.map((m, mi) => {
            const locked = !!m.locked;
            const numBase = { flex: 'none', width: '38px', height: '38px', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700 };
            const cardBase = { display: 'flex', alignItems: 'center', gap: '15px', width: '100%', padding: '16px 18px', borderRadius: '15px', border: '1px solid #ECE5DB', background: '#fff', cursor: locked ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'left' };
            return (
              <button key={m.id} onClick={locked ? undefined : () => go(m.lessons[0].id)} style={locked ? { ...cardBase, opacity: 0.62 } : cardBase}>
                <span style={locked ? { ...numBase, background: '#F1ECE3', color: '#B6AC9D' } : { ...numBase, background: 'var(--accent-soft)', color: 'var(--accent-deep)' }}>{CN[mi]}</span>
                <span style={{ flex: 1, textAlign: 'left' }}>
                  <span style={{ display: 'block', fontSize: '16.5px', fontWeight: 600, color: '#241E18', marginBottom: '3px' }}>{m.title}</span>
                  <span style={{ display: 'block', fontSize: '13px', color: '#9A9082' }}>{m.en ? m.en + ' · ' : ''}共 {m.lessons.length} 节</span>
                </span>
                <span style={locked ? { fontSize: '12px', fontWeight: 600, color: '#B6AC9D', flex: 'none' } : { fontSize: '13.5px', fontWeight: 700, color: 'var(--accent-deep)', flex: 'none' }}>
                  {locked ? '即将推出' : '开始 →'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function renderLesson(found) {
    const avail = availLessons(course);
    const idx = avail.findIndex(l => l.id === found.lesson.id);
    const hasPrev = idx > 0, hasNext = idx < avail.length - 1;
    const gk = course.id + '::' + found.lesson.id;
    const isDone = !!st.done[gk];
    const navBase = { padding: '10px 16px', borderRadius: '11px', border: '1px solid #E2DACE', background: '#fff', color: '#473F38', cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit', fontWeight: 500 };

    return (
      <div>
        <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--accent-deep)', marginBottom: '12px' }}>
          {course.title} · 模块{CN[found.mi]} {found.mod.title}
        </div>
        <h1 style={{ fontSize: isMobile ? '24px' : '33px', lineHeight: 1.2, fontWeight: 700, margin: '0 0 10px', letterSpacing: '-0.02em', color: '#1F1A14' }}>{found.lesson.title}</h1>
        <div style={{ fontSize: '13.5px', color: '#9A9082', marginBottom: '30px', paddingBottom: '22px', borderBottom: '1px solid #ECE5DB' }}>
          第 {idx + 1} 课 / 共 {avail.length} 课 · 阅读约 {Math.max(3, Math.round((found.lesson.blocks || []).length * 0.9))} 分钟
        </div>

        {(found.lesson.blocks || []).map((b, i) => {
          const key = gk + ':' + i;
          if (b.t === 'lead') return <p key={i} style={{ fontSize: '19px', lineHeight: 1.75, color: '#39322B', margin: '0 0 24px', fontWeight: 500 }}>{b.text}</p>;
          if (b.t === 'h') return <h2 key={i} style={{ fontSize: '22px', fontWeight: 700, margin: '36px 0 14px', color: '#241E18', letterSpacing: '-0.01em' }}>{b.text}</h2>;
          if (b.t === 'p') return <p key={i} style={{ fontSize: '16.5px', lineHeight: 1.85, color: '#473F38', margin: '0 0 17px' }}>{b.text}</p>;
          if (b.t === 'list') return (
            <ul key={i} style={{ margin: '0 0 20px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '11px' }}>
              {b.items.map((it, j) => (
                <li key={j} style={{ display: 'flex', gap: '13px', alignItems: 'flex-start', fontSize: '16.5px', lineHeight: 1.7, color: '#473F38' }}>
                  <span style={{ flex: 'none', width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent)', marginTop: '11px' }} />
                  <span style={{ flex: 1 }}>{it}</span>
                </li>
              ))}
            </ul>
          );
          if (b.t === 'callout') return <CalloutBox key={i} b={b} />;
          if (b.t === 'prompt') return <PromptBox key={i} b={b} copied={st.copied === key} onCopy={() => copyPrompt(key, b.text)} />;
          if (b.t === 'quiz') return <QuizBlock key={i} b={b} blockKey={key} selected={st.quiz[key] ?? null} onSelect={(idx) => selectQuiz(key, idx)} />;
          if (b.t === 'task') return <TaskBlock key={i} b={b} />;
          return null;
        })}

        <div style={{ marginTop: '42px', paddingTop: '26px', borderTop: '1px solid #ECE5DB', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button onClick={hasPrev ? () => go(avail[idx - 1].id) : undefined} style={hasPrev ? navBase : { ...navBase, opacity: 0.38, cursor: 'default' }}>← 上一课</button>
          <button onClick={() => toggleDone(gk)} style={isDone
            ? { flex: 1, padding: '11px 18px', borderRadius: '11px', border: '1px solid #BFE0CC', background: '#EAF4EE', color: '#2C6B4F', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: '14.5px' }
            : { flex: 1, padding: '11px 18px', borderRadius: '11px', border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: '14.5px' }}>
            {isDone ? '已完成 ✓  点击取消' : '标记为已完成'}
          </button>
          <button onClick={() => hasNext ? go(avail[idx + 1].id) : go('home')} style={hasNext ? navBase : { ...navBase, color: 'var(--accent-deep)', borderColor: 'var(--accent)' }}>
            {hasNext ? '下一课 →' : '完成本模块 ✓'}
          </button>
        </div>
      </div>
    );
  }

  function renderMain() {
    if (st.atCatalog) return renderCatalog();
    if (!course) return renderCatalog();
    if (st.current === 'home') return renderCourseHome();
    const found = findLesson(course, st.current);
    if (!found) return renderCourseHome();
    return renderLesson(found);
  }

  // ── Root ───────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: '#FBF9F5', ...acCss }}>
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 99 }} />
      )}
      {renderSidebar()}
      <main ref={mainRef} style={{ flex: 1, height: '100dvh', overflowY: 'auto' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto', padding: isMobile ? '0 18px 80px' : '52px 40px 110px' }}>
          {isMobile && (
            <div style={{ position: 'sticky', top: 0, zIndex: 50, background: '#FBF9F5', borderBottom: '1px solid #ECE5DB', padding: '10px 0', marginLeft: '-18px', marginRight: '-18px', paddingLeft: '18px', paddingRight: '18px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <button onClick={() => setSidebarOpen(s => !s)} style={{ width: '38px', height: '38px', border: '1px solid #ECE5DB', borderRadius: '10px', background: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px', flex: 'none' }}>
                {[0, 1, 2].map(i => <span key={i} style={{ width: '16px', height: '2px', background: '#473F38', borderRadius: '1px', display: 'block' }} />)}
              </button>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#241E18', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{academy.name}</span>
            </div>
          )}
          {renderMain()}
        </div>
      </main>
    </div>
  );
}

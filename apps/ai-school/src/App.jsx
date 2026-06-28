import { useState, useCallback, useRef, useMemo } from 'react';

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
        { id: 'm3', title: '拓展 Claude 的能力', en: "Expanding Claude's reach", locked: true, lessons: [{id:'l8',title:'连接你的工具'},{id:'l9',title:'企业搜索'},{id:'l10',title:'深度研究模式'}] },
        { id: 'm4', title: '融会贯通', en: 'Putting it all together', locked: true, lessons: [{id:'l11',title:'各职业的实战用例'},{id:'l12',title:'其他协作方式'}] },
        { id: 'm5', title: '结业与证书', en: 'Conclusion & certificate', locked: true, lessons: [{id:'l13',title:'接下来学什么'},{id:'l14',title:'结业证书'}] },
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
        { id: 'm2', title: '你的第一个 prompt', en: 'Your first prompt', locked: true, lessons: [{id:'l3',title:'安装 Claude Code'},{id:'l4',title:'你的第一个 prompt'}] },
        { id: 'm3', title: '日常工作流', en: 'Daily workflows', locked: true, lessons: [{id:'l5',title:'探索 → 规划 → 编码 → 提交'},{id:'l6',title:'上下文管理'},{id:'l7',title:'代码评审'}] },
        { id: 'm4', title: '定制 Claude Code', en: 'Customizing', locked: true, lessons: [{id:'l8',title:'CLAUDE.md 文件'},{id:'l9',title:'Subagents'},{id:'l10',title:'Skills'},{id:'l11',title:'MCP'},{id:'l12',title:'Hooks'}] },
        { id: 'm5', title: '测验', en: 'Quiz', locked: true, lessons: [{id:'l13',title:'课程测验'}] },
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
        { id: 'm2', title: '动手构建 MCP 服务器', en: 'Hands-on with MCP servers', locked: true, lessons: [{id:'l4',title:'项目搭建'},{id:'l5',title:'用 MCP 定义工具'},{id:'l6',title:'服务器 Inspector'}] },
        { id: 'm3', title: '连接 MCP 客户端', en: 'Connecting with clients', locked: true, lessons: [{id:'l7',title:'实现一个客户端'},{id:'l8',title:'定义资源'},{id:'l9',title:'访问资源'},{id:'l10',title:'定义 prompts'},{id:'l11',title:'客户端中的 prompts'}] },
        { id: 'm4', title: '评估与总结', en: 'Assessment & wrap up', locked: true, lessons: [{id:'l12',title:'MCP 期末测评'},{id:'l13',title:'MCP 回顾'}] },
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
        { id: 'm2', title: '核心特性', en: 'Core MCP features', locked: true, lessons: [{id:'l2',title:'Sampling'},{id:'l3',title:'Sampling 实战'},{id:'l4',title:'日志与进度通知'},{id:'l5',title:'通知实战'},{id:'l6',title:'Roots'},{id:'l7',title:'Roots 实战'}] },
        { id: 'm3', title: '传输与通信', en: 'Transports & communication', locked: true, lessons: [{id:'l8',title:'JSON 消息类型'},{id:'l9',title:'STDIO 传输'},{id:'l10',title:'StreamableHTTP 传输'},{id:'l11',title:'StreamableHTTP 深入'},{id:'l12',title:'状态与 StreamableHTTP'}] },
        { id: 'm4', title: '评估与下一步', en: 'Assessment & next steps', locked: true, lessons: [{id:'l13',title:'MCP 概念测评'},{id:'l14',title:'课程总结'}] },
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
        { id: 'm2', title: '构建你的第一个 Skill', en: 'Build your first Skill', locked: true, lessons: [{id:'l3',title:'SKILL.md 的结构'},{id:'l4',title:'编写说明与示例'},{id:'l5',title:'打包资源与脚本'}] },
        { id: 'm3', title: '最佳实践', en: 'Best practices', locked: true, lessons: [{id:'l6',title:'何时使用 Skill'},{id:'l7',title:'常见误区'}] },
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
        { id: 'm2', title: '进阶用法', en: 'Going further', locked: true, lessons: [{id:'l3',title:'多子代理协作'},{id:'l4',title:'工具与权限范围'}] },
        { id: 'm3', title: '最佳实践', en: 'Best practices', locked: true, lessons: [{id:'l5',title:'何时该委派'},{id:'l6',title:'常见误区'}] },
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
        { id: 'm2', title: '能力与局限', en: 'Capabilities & limits', locked: true, lessons: [{id:'l4',title:'它擅长什么'},{id:'l5',title:'幻觉与事实核查'},{id:'l6',title:'负责任地使用'}] },
        { id: 'm3', title: '动手实践', en: 'Hands-on', locked: true, lessons: [{id:'l7',title:'你的第一次对话'},{id:'l8',title:'迭代与改进'}] },
        { id: 'm4', title: '测验', en: 'Quiz', locked: true, lessons: [{id:'l9',title:'课程测验'}] },
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
        { id: 'm2', title: '定制你的 AI', en: 'Customizing your AI', locked: true, lessons: [{id:'l4',title:'自定义 GPT 入门'},{id:'l5',title:'给它上传你的知识'},{id:'l6',title:'写好指令'}] },
        { id: 'm3', title: '协作与安全', en: 'Collaboration & safety', locked: true, lessons: [{id:'l7',title:'团队里的 AI'},{id:'l8',title:'数据与隐私'}] },
        { id: 'm4', title: '测验', en: 'Quiz', locked: true, lessons: [{id:'l9',title:'课程测验'}] },
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
        { id: 'm2', title: '构建工作流', en: 'Building workflows', locked: true, lessons: [{id:'l4',title:'自动化一个流程'},{id:'l5',title:'连接工具与数据'},{id:'l6',title:'编排多个步骤'}] },
        { id: 'm3', title: '可靠与安全', en: 'Reliability & safety', locked: true, lessons: [{id:'l7',title:'让 Agent 可控'},{id:'l8',title:'评估与监控'}] },
        { id: 'm4', title: '测验', en: 'Quiz', locked: true, lessons: [{id:'l9',title:'课程测验'}] },
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

  const save = useCallback((s) => {
    try { localStorage.setItem('academy_v1', JSON.stringify({ academy: s.academy, atCatalog: s.atCatalog, courseId: s.courseId, current: s.current, done: s.done })); } catch (e) {}
  }, []);

  const scrollTop = useCallback(() => { if (mainRef.current) mainRef.current.scrollTop = 0; }, []);

  const openCatalog = useCallback(() => {
    setSt(s => { const ns = { ...s, atCatalog: true }; save(ns); return ns; });
    scrollTop();
  }, [save, scrollTop]);

  const openCourse = useCallback((id) => {
    const c = CATALOG.find(x => x.id === id);
    setSt(s => { const ns = { ...s, atCatalog: false, courseId: id, current: 'home', academy: c ? c.academy : s.academy }; save(ns); return ns; });
    scrollTop();
  }, [save, scrollTop]);

  const go = useCallback((id) => {
    setSt(s => { const ns = { ...s, atCatalog: false, current: id }; save(ns); return ns; });
    scrollTop();
  }, [save, scrollTop]);

  const switchAcademy = useCallback((id) => {
    setSt(s => { if (s.academy === id) return s; const ns = { ...s, academy: id, atCatalog: true }; save(ns); return ns; });
    scrollTop();
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

  const sidebarStyle = { width: '322px', flex: 'none', height: '100vh', overflowY: 'auto', background: '#FFFFFF', borderRight: '1px solid #ECE5DB', padding: '24px 16px 60px' };

  const brandMarkStyle = { width: '30px', height: '30px', flex: 'none', borderRadius: '9px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '15px' };

  function renderSidebar() {
    return (
      <aside style={sidebarStyle}>
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
        <h1 style={{ fontSize: '44px', lineHeight: 1.12, fontWeight: 700, margin: '0 0 18px', letterSpacing: '-0.025em', color: '#1F1A14' }}>{academy.headline}</h1>
        <p style={{ fontSize: '18px', lineHeight: 1.75, color: '#5A5047', maxWidth: '600px', margin: '0 0 30px' }}>{academy.intro}</p>
        <div style={{ fontSize: '14px', color: '#8A8071', marginBottom: '40px' }}>{academyCourses.length} 门课程 · {academyCourses.reduce((s, c) => s + totalLessons(c), 0)} 节课 · 完全免费</div>
        <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '.1em', color: '#A59A8C', marginBottom: '16px' }}>浏览课程</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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
        <h1 style={{ fontSize: '40px', lineHeight: 1.14, fontWeight: 700, margin: '0 0 16px', letterSpacing: '-0.025em', color: '#1F1A14' }}>{course.title}</h1>
        <p style={{ fontSize: '18px', lineHeight: 1.75, color: '#5A5047', maxWidth: '600px', margin: '0 0 28px' }}>{course.longDesc || course.desc}</p>
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
        <h1 style={{ fontSize: '33px', lineHeight: 1.2, fontWeight: 700, margin: '0 0 10px', letterSpacing: '-0.02em', color: '#1F1A14' }}>{found.lesson.title}</h1>
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

        <div style={{ marginTop: '42px', paddingTop: '26px', borderTop: '1px solid #ECE5DB', display: 'flex', alignItems: 'center', gap: '14px' }}>
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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#FBF9F5', ...acCss }}>
      {renderSidebar()}
      <main ref={mainRef} style={{ flex: 1, height: '100vh', overflowY: 'auto' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto', padding: '52px 40px 110px' }}>
          {renderMain()}
        </div>
      </main>
    </div>
  );
}

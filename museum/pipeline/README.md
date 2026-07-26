# 采集 Pipeline — 让新展品持续入馆

把官方一手信源加工成博物馆展品的半自动流水线。对应 [PRD.md](../PRD.md) 的核心 DNA：**仅官方一手信源 · 强制溯源 · 自动去重 · 术语保留英文**。

## 为什么是「半自动」

展品的事实字段（英文名、年份、出处、原文引用）可以从信源确证并自动化；但**困境 / 突破 / 洞察 / 策展长文是编辑综合**——它们是这座博物馆区别于"论文列表"的价值所在，无法靠爬取得到。

所以 pipeline 只做两件事，且泾渭分明：
1. **自动确证能确证的**——并把原文完整留下作溯源材料；
2. **给不能确证的留明确的 `TODO(editorial)`**——绝不编造，由人 / LLM 依据原文补全。

这也把上一轮定下的自律规则「引文只收录能确证的原句」变成了**代码强制**（`--verify-quote`）。

## 五个阶段

```
① 采集 ──▶ ② 去重 ──▶ ③ 结构化 ──▶ ④ 溯源校验 ──▶ ⑤ 入库
 arXiv API   manifest   自动填事实   引文核对原文    展品草稿 .js
             台账对照    编辑留 TODO   （代码强制）    → 粘进 index.html
```

| 阶段 | 做什么 | 实现 |
|---|---|---|
| ① 采集 | 从 arXiv API 拉权威元数据（标题/摘要/日期/作者） | `ingest.py fetch_arxiv` |
| ② 去重 | 对照馆藏台账，命中 arXiv id 或标题即拒绝 | `ingest.py dedup` + `manifest.json` |
| ③ 结构化 | 自动填 year/en/src；编辑字段留 `TODO(editorial)` | `ingest.py scaffold` |
| ④ 溯源校验 | 校验引文确为原文摘要中的原句 | `ingest.py verify_quote` |
| ⑤ 入库 | 输出可粘贴进 `index.html` 的展品 + DETAILS 草稿 | `pipeline/drafts/*.js` |

## 组成

| 文件 | 作用 |
|---|---|
| `sources.json` | 官方一手信源白名单（arXiv 机构/查询 + 官方博客），落实"不做全网爬取" |
| `build_manifest.py` | 从 `index.html` 提取当前馆藏台账（19 个 arXiv 主键 + 标题），供去重 |
| `manifest.json` | 上者的产物；**每次馆藏更新后重跑** |
| `ingest.py` | 主工具：采集→去重→结构化→溯源→草稿 |
| `drafts/` | 生成的展品草稿（示例：`2021-06_lora-*.js`） |

## 用法

```bash
# 每次馆藏变更后，先刷新台账
python3 pipeline/build_manifest.py

# 采集一篇 arXiv 论文，生成入库草稿
python3 pipeline/ingest.py 2106.09685
python3 pipeline/ingest.py https://arxiv.org/abs/2501.12948   # URL 亦可

# 已入馆的会被去重拒绝（退出码 3）
python3 pipeline/ingest.py 2203.02155

# 溯源校验：确认一句引文是论文原文（通过=0，未命中=2）
python3 pipeline/ingest.py 1706.03762 --verify-quote "dispensing with recurrence"
```

**退出码**：`0` 成功 / `2` 引文核对未通过 / `3` 重复拒绝。可用于 CI 或批处理。

## 编辑闭环（人 / LLM 补全草稿后）

1. 打开 `drafts/*.js`，按原文摘要撰写 `困境/突破/洞察/影响` 与两段策展文；
2. 从摘要截一句最精炼的作引文，`--verify-quote` 跑一遍确认逐字无误；
3. 补 `title`（中文展名）、`org`（机构）、`facts`（关键数据）、`before/after`（因果链）；
4. 粘进 `index.html` 的对应展厅 `ERAS[].exhibits` 与 `DETAILS`（可选：加 `FIGS` 示意图）；
5. 重跑 `build_manifest.py` 刷新台账。馆藏号与展厅序号会自动连续，无需手工重排。

## 边界与后续

- **arXiv 无隶属信息** → `org`（机构）留 TODO，附作者名提示，需人工确认。
- **官方博客采集** → 当前 `sources.json` 已列白名单，但博客无统一 API；接入需按站点写 RSS / HTML 解析器，或人工提供 URL 后复用 ③④⑤ 阶段。这是最自然的下一步扩展。
- **规模化** → `sources.json` 的 `scan_queries` 已备好，可扩展 `ingest.py` 支持 `--scan` 批量拉取候选、去重后排队待编辑。

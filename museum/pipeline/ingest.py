#!/usr/bin/env python3
"""ingest.py — 生成式 AI 演进博物馆 · 采集 pipeline

把一篇官方一手信源（当前支持 arXiv）加工成博物馆展品草稿。五个阶段：

  ① 采集   从 arXiv API 拉取权威元数据（标题 / 摘要 / 日期 / 作者）
  ② 去重   对照 manifest.json，命中 arXiv id 或标题则拒绝入库
  ③ 结构化 自动填充可确证字段，编辑性字段留 TODO（绝不编造）
  ④ 溯源   摘要原文附上，供截取逐字引用；--verify-quote 可校验引文确为原文
  ⑤ 入库   输出一份可粘贴进 museum.html 的展品草稿 .js

用法：
  python3 pipeline/ingest.py 2106.09685              # 采集并生成草稿
  python3 pipeline/ingest.py https://arxiv.org/abs/2501.12948   # URL 亦可
  python3 pipeline/ingest.py 2203.02155              # 已入馆 → 报告重复
  python3 pipeline/ingest.py 1706.03762 --verify-quote "dispensing with recurrence"

设计原则：只自动化「能确证的事实」，编辑综合（困境/突破/洞察/策展文）留在人/LLM 环节。
仅依赖 Python 标准库。
"""
import sys
import os
import re
import json
import argparse
import pathlib
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

ROOT = pathlib.Path(__file__).resolve().parent.parent
PIPE = ROOT / "pipeline"
MANIFEST = PIPE / "manifest.json"
DRAFTS = PIPE / "drafts"
ARXIV_API = "https://export.arxiv.org/api/query"
ATOM = "{http://www.w3.org/2005/Atom}"

C = {"g": "\033[32m", "y": "\033[33m", "r": "\033[31m", "b": "\033[34m",
     "d": "\033[2m", "x": "\033[0m"}


def color(t, c):
    return f"{C.get(c,'')}{t}{C['x']}" if sys.stdout.isatty() else t


# ---------- ① 采集 ----------
def parse_arxiv_id(s):
    s = s.strip()
    m = re.search(r"(\d{4}\.\d{4,5})", s)
    if not m:
        raise ValueError(f"无法从 “{s}” 解析 arXiv 编号")
    return m.group(1)


def fetch_arxiv(arxiv_id):
    url = f"{ARXIV_API}?id_list={arxiv_id}&max_results=1"
    req = urllib.request.Request(url, headers={"User-Agent": "verum-museum-pipeline/1.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        xml = resp.read().decode("utf-8")
    root = ET.fromstring(xml)
    entry = root.find(f"{ATOM}entry")
    if entry is None or entry.find(f"{ATOM}title") is None:
        raise LookupError(f"arXiv 未找到 {arxiv_id}")

    def txt(tag):
        el = entry.find(f"{ATOM}{tag}")
        return re.sub(r"\s+", " ", el.text).strip() if el is not None and el.text else ""

    published = txt("published")
    year = published[:4]
    month = published[5:7]
    authors = [a.find(f"{ATOM}name").text for a in entry.findall(f"{ATOM}author")
               if a.find(f"{ATOM}name") is not None]
    return {
        "arxiv_id": arxiv_id,
        "title_en": txt("title"),
        "abstract": txt("summary"),
        "published": published,
        "year_month": f"{year}.{month}" if year and month else year,
        "authors": authors,
        "url": f"https://arxiv.org/abs/{arxiv_id}",
    }


# ---------- ② 去重 ----------
def load_manifest():
    if not MANIFEST.exists():
        raise SystemExit("缺少 manifest.json，请先运行 build_manifest.py")
    return json.loads(MANIFEST.read_text(encoding="utf-8"))


def norm(s):
    return re.sub(r"[^a-z0-9一-鿿]", "", s.lower())


def dedup(meta, manifest):
    if meta["arxiv_id"] in manifest["arxiv_ids"]:
        return f"arXiv:{meta['arxiv_id']} 已在馆藏"
    nt = norm(meta["title_en"])
    for t in manifest["titles"]:
        if nt and (nt == norm(t) or nt in norm(t) or norm(t) in nt and len(norm(t)) > 6):
            return f"标题疑似重复：馆藏《{t}》"
    return None


# ---------- ④ 溯源校验 ----------
def verify_quote(quote, meta):
    q = re.sub(r"\s+", " ", quote.strip().strip('“”"')).lower()
    src = re.sub(r"\s+", " ", meta["abstract"]).lower()
    return q in src


# ---------- ③ + ⑤ 结构化并生成入库草稿 ----------
def slug(meta):
    base = re.sub(r"[^a-zA-Z0-9]+", "-", meta["title_en"].lower()).strip("-")
    return base[:40] or meta["arxiv_id"]


TODO = "TODO(editorial)"


def scaffold(meta):
    authors = meta["authors"]
    author_hint = (authors[0] + (" et al." if len(authors) > 1 else "")) if authors else TODO
    q = json.dumps  # 安全转义

    exhibit = f"""// ===== 展品草稿 · 由 pipeline/ingest.py 生成 =====
// arXiv:{meta['arxiv_id']} · {meta['published'][:10]} · 采集于 {datetime.now(timezone.utc).date()}
// 【自动填充】年份 / 英文名 / 出处 已从 arXiv 确证
// 【需编辑】title(中文展名) / org(机构) / 困境-突破-洞察-影响 / DETAILS 策展文 —— 不得编造，须依据原文撰写
{{
  year: "{meta['year_month']}",
  title: {q(TODO + ' 中文展名，如模型名', ensure_ascii=False)},
  org: {q(TODO + f' 机构（arXiv 元数据无隶属，作者：{author_hint}）', ensure_ascii=False)},
  en: {q(meta['title_en'], ensure_ascii=False)},
  problem: {q(TODO + ' 当时的困境：这项技术出现前卡在哪', ensure_ascii=False)},
  brk:     {q(TODO + ' 突破：它做了什么（<b>关键词</b> 可加粗）', ensure_ascii=False)},
  insight: {q(TODO + ' 关键洞察：为什么这个办法可行', ensure_ascii=False)},
  impact:  {q(TODO + ' 影响与遗产：它让什么成为可能', ensure_ascii=False)},
  src: [{{ t: "arXiv:{meta['arxiv_id']}", u: {q(meta['url'])} }}]
}}"""

    # 取摘要首句作为引文候选（仍需人工确认截取合适）
    first_sentence = re.split(r"(?<=[.!?])\s+", meta["abstract"].strip())
    cand = first_sentence[0] if first_sentence else meta["abstract"]

    detail = f"""// ===== DETAILS['{TODO}中文展名'] 深度解读草稿 =====
{{
  essay: [
    "{TODO} 策展长文第一段：讲清当时的处境与这项工作的动机。",
    "{TODO} 策展长文第二段：讲清它的做法、意义，以及留给下一步的问题。"
  ],
  // 引文候选（摘自 arXiv 摘要，逐字，可直接用或另截一句更精炼的）：
  quote: {{
    en: {q(cand, ensure_ascii=False)},
    zh: {q(TODO + ' 上句的中文翻译（术语保留英文）', ensure_ascii=False)},
    from: "arXiv:{meta['arxiv_id']} · Abstract"
  }},
  facts: [
    {{ v: "{TODO}", k: "{TODO} 关键数据 1" }},
    {{ v: "{TODO}", k: "{TODO} 关键数据 2" }},
    {{ v: "{meta['year_month']}", k: "发表时间" }}
  ],
  before: "{TODO} ← 承接自哪件展品 / 哪个困境",
  after:  "{TODO} 启发了 → 什么"
}}

/* --- 原文摘要全文（溯源材料，供截取逐字引文，勿改动一字）---
{meta['abstract']}
--- */"""
    return exhibit + "\n\n" + detail


def main():
    ap = argparse.ArgumentParser(description="生成式 AI 博物馆 · arXiv 采集入库")
    ap.add_argument("source", help="arXiv 编号或 URL，如 2106.09685 或 https://arxiv.org/abs/...")
    ap.add_argument("--verify-quote", metavar="TEXT",
                    help="校验一段引文是否为该论文摘要的原文")
    ap.add_argument("--stdout", action="store_true", help="草稿打印到终端而非写文件")
    args = ap.parse_args()

    print(color("① 采集", "b"), "· 连接 arXiv …")
    arxiv_id = parse_arxiv_id(args.source)
    try:
        meta = fetch_arxiv(arxiv_id)
    except Exception as e:
        raise SystemExit(color(f"✗ 采集失败：{e}", "r"))
    print(f"  《{meta['title_en']}》 · {meta['published'][:10]} · {len(meta['authors'])} 作者")

    if args.verify_quote:
        ok = verify_quote(args.verify_quote, meta)
        tag = color("✓ 原文核对通过", "g") if ok else color("✗ 未在摘要中找到该引文", "r")
        print(color("④ 溯源", "b"), "·", tag)
        raise SystemExit(0 if ok else 2)

    print(color("② 去重", "b"), "· 对照馆藏台账 …")
    hit = dedup(meta, load_manifest())
    if hit:
        print(color(f"  ⤵ 拒绝入库：{hit}", "y"))
        raise SystemExit(3)
    print(color("  ✓ 新展品，可入库", "g"))

    print(color("③ 结构化", "b"), "· 自动填充事实字段，编辑字段留 TODO …")
    draft = scaffold(meta)

    if args.stdout:
        print("\n" + draft)
    else:
        DRAFTS.mkdir(exist_ok=True)
        out = DRAFTS / f"{meta['year_month'].replace('.', '-')}_{slug(meta)}.js"
        out.write_text(draft, encoding="utf-8")
        print(color("⑤ 入库", "b"), f"· 草稿已写入 {out.relative_to(ROOT)}")
        n = draft.count(TODO)
        print(color(f"  待编辑字段 {n} 处（含策展文与机构；引文候选已就位，需逐字确认）", "d"))


if __name__ == "__main__":
    main()

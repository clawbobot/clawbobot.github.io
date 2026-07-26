#!/usr/bin/env python3
"""build_manifest.py — 从 museum.html 提取当前馆藏台账，供采集去重使用。

去重的权威主键是 arXiv id（正则极稳）；标题为辅助模糊匹配键。
用法：  python3 pipeline/build_manifest.py
输出：  pipeline/manifest.json
"""
import re
import json
import pathlib
import datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
MUSEUM = ROOT / "index.html"
OUT = ROOT / "pipeline" / "manifest.json"


def build():
    html = MUSEUM.read_text(encoding="utf-8")

    # 权威主键：所有 arXiv 编号（含 4~5 位序号）
    arxiv_ids = sorted(set(re.findall(r"arXiv:(\d{4}\.\d{4,5})", html)))

    # 辅助键：展厅与展品的 title:"..."（含中文名 / 模型名）
    titles = []
    for m in re.findall(r'\btitle:\s*"([^"]+)"', html):
        if m not in titles:
            titles.append(m)

    manifest = {
        "generated_at": datetime.datetime.now(datetime.timezone.utc)
        .isoformat(timespec="seconds"),
        "source_file": MUSEUM.name,
        "count_arxiv": len(arxiv_ids),
        "count_titles": len(titles),
        "arxiv_ids": arxiv_ids,
        "titles": titles,
    }
    OUT.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"✓ 台账已生成：{OUT.relative_to(ROOT)}")
    print(f"  arXiv 主键 {len(arxiv_ids)} 个 · 标题 {len(titles)} 条")
    return manifest


if __name__ == "__main__":
    build()

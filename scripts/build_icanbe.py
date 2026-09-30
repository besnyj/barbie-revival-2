#!/usr/bin/env python3
"""Copy recovered I Can Be archive files into their replay paths.

Usage: scripts/build_icanbe.py /path/to/recovered/icanbe.barbie.com
"""
from pathlib import Path
import shutil
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: build_icanbe.py RECOVERED_ARCHIVE_DIRECTORY')
source = Path(sys.argv[1]).expanduser().resolve()
target = Path(__file__).resolve().parents[1] / 'public/_original/icanbe.barbie.com'
if not source.is_dir():
    raise SystemExit(f'not a directory: {source}')
for item in source.rglob('*'):
    if item.is_file():
        destination = target / item.relative_to(source)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(item, destination)
print(f'copied recovered files to {target}')

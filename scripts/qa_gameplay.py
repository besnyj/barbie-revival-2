"""Interactive gameplay QA helper for the restored Flash games (Ruffle).

Usage: python3 scripts/qa_gameplay.py <route> [--shot NAME] [--click X Y] [--drag X1 Y1 X2 Y2]
Each invocation opens the route, waits, optionally clicks/drags, and saves a
screenshot to /tmp. Kept separate from qa_pages.py (page-level checks).
"""
import asyncio, sys
from playwright.async_api import async_playwright

ROUTE = sys.argv[1]

def arg(name):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else None

async def main():
    shot = arg("--shot")
    click = arg("--click")
    drag = arg("--drag")
    wait = int(arg("--wait") or 9000)
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1100, "height": 950})
        failed, errors = [], []
        page.on("requestfailed", lambda r: failed.append(f"{r.url} :: {r.failure}"))
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        await page.goto(f"http://127.0.0.1:4173{ROUTE}", wait_until="networkidle")
        await page.wait_for_timeout(6000)
        if click:
            x, y = map(int, click.split())
            await page.mouse.click(x, y)
            await page.wait_for_timeout(wait)
        if drag:
            x1, y1, x2, y2 = map(int, drag.split())
            await page.mouse.move(x1, y1)
            await page.mouse.down()
            await page.mouse.move(x2, y2, steps=20)
            await page.mouse.up()
            await page.wait_for_timeout(wait)
        if shot:
            await page.screenshot(path=f"/tmp/{shot}")
        print("SHOT:", shot)
        print("FAILED_REQUESTS:", failed)
        print("CONSOLE_ERRORS:", errors[:20])
        await browser.close()

asyncio.run(main())

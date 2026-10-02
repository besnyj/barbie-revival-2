"""Drive the Puzzle Party route with Ruffle trace logging and save filtered console
output to /tmp/puzzle-trace.log plus stage geometry to stdout.
Uses os._exit to avoid Playwright teardown stalls under trace flood.
Usage: python3 scripts/qa_puzzle_trace.py [clickX clickY] [waitMs]
"""
import asyncio, os, re, sys
from playwright.async_api import async_playwright

async def main():
    click = [int(a) for a in sys.argv[1:3]] if len(sys.argv) > 2 else None
    wait_ms = int(sys.argv[3]) if len(sys.argv) > 3 else 15000
    keep = re.compile(r'')
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1100, "height": 950})
        msgs, limit = [], 6000
        def on_console(m):
            msgs.append(f"[{m.type}] {m.text}")
            if len(msgs) > limit:
                page.remove_listener("console", on_console)
        page.on("console", on_console)
        await page.goto("http://127.0.0.1:4173/dreamhouse/puzzle-party/?ruffletrace=1", wait_until="commit")
        await page.wait_for_timeout(25000)
        if click:
            await page.mouse.click(click[0], click[1])
            await page.wait_for_timeout(wait_ms)
        info = await page.evaluate("""() => {
          const p = document.querySelector('ruffle-player');
          if(!p) return null;
          const r = p.getBoundingClientRect();
          return {x:r.x, y:r.y, w:r.width, h:r.height};
        }""")
        print("STAGE:", info)
        with open("/tmp/puzzle-trace.log", "w") as f:
            f.write("\n".join(msgs))
        print("kept msgs:", len(msgs))
        os._exit(0)

asyncio.run(main())

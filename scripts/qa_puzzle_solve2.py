"""Blind drag-solver QA for Dreamhouse Puzzle Party, Easy mode, on the
instrumented (auto-start) QA copy. Uses clipped screenshots (light) and
pixel-diff to detect tile placements. Progress is printed with flush.

Usage: python3 scripts/qa_puzzle_solve2.py
"""
import asyncio, io, json, sys, time
from playwright.async_api import async_playwright
from PIL import Image

BASE = "http://127.0.0.1:4173/dreamhouse/puzzle-party/"
HOLES = [(93.0 + (c - 1) * 95.0, 179.8 + (r - 1) * 95.0) for r in range(1, 5) for c in range(1, 5)]
SLOTS = {
    1: (698.5, 223.0), 2: (485.7, 416.0), 3: (485.7, 127.0), 4: (485.7, 223.0),
    5: (698.5, 318.7), 6: (805.0, 128.9), 7: (592.1, 128.9), 8: (698.5, 128.9),
    9: (592.1, 223.0), 10: (805.0, 318.7), 11: (485.7, 318.7), 12: (698.5, 416.0),
    13: (805.0, 223.0), 14: (592.1, 416.0), 15: (805.0, 416.0), 16: (592.1, 318.7),
}
HIDDEN_EASY = [3, 5, 6, 9, 11]
TITLE_PLAY = (828.0, 474.9)
HINT_BTN = (918.1, 69.0)
PLAYAGAIN = (795.95, 410.1)

def region_diff(a: bytes, b: bytes):
    ia = Image.open(io.BytesIO(a)).convert("RGB")
    ib = Image.open(io.BytesIO(b)).convert("RGB")
    if ia.size != ib.size:
        return 1.0
    pa, pb = ia.load(), ib.load()
    w, h = ia.size
    n = 0
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            if sum(abs(pa[x, y][i] - pb[x, y][i]) for i in range(3)) > 45:
                n += 1
    return n / ((w // 2) * (h // 2))

async def main():
    log = []
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1100, "height": 950})
        requests, failed, errors = [], [], []
        page.on("request", lambda r: requests.append(r.url))
        page.on("requestfailed", lambda r: failed.append(r.url))
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)

        def out(*a):
            print(*a, flush=True)
            with open("/tmp/pp-solve-partial.json", "w") as f:
                json.dump(log, f, indent=2)

        out("loading...")
        await page.goto(BASE, wait_until="domcontentloaded")

        async def box():
            return await page.evaluate("""() => { const p=document.querySelector('.dreamhouse-game ruffle-player');
                if(!p) return null; const r=p.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}; }""")

        def clip(x, y, half=40):
            return {"x": x - half, "y": y - half, "width": half * 2, "height": half * 2}

        async def rgn(sx, sy, half=40):
            return await page.screenshot(clip=clip(bx + sx, by + sy, half))

        # wait for title
        bx = by = 0
        for i in range(24):
            b = await box()
            if b:
                png = await page.screenshot(clip=clip(b["x"] + 798, b["y"] + 455, 60))
                img = Image.open(io.BytesIO(png)).convert("RGB")
                px = img.load()
                colored = sum(1 for y in range(0, img.size[1], 4) for x in range(0, img.size[0], 4)
                              if sum(px[x, y]) < 700)
                if colored > 3:
                    bx, by = b["x"], b["y"]
                    break
            await page.wait_for_timeout(3000)
        out(f"title ready at ({bx},{by})")

        # click title play
        await page.mouse.click(bx + TITLE_PLAY[0] - 30, by + TITLE_PLAY[1])
        out("play clicked; waiting for auto-start easy")
        await page.wait_for_timeout(9000)  # diff intro + autoEasy + fade + begin

        # hint check
        b4 = await rgn(HINT_BTN[0], HINT_BTN[1], 60)
        await page.mouse.click(bx + HINT_BTN[0], by + HINT_BTN[1])
        await page.wait_for_timeout(700)
        af = await rgn(HINT_BTN[0], HINT_BTN[1], 60)
        log.append(f"hint click diff {region_diff(b4, af):.3f}")
        await page.wait_for_timeout(1500)

        # solve levels
        for level in range(1, 6):
            hidden = HIDDEN_EASY[level - 1]
            remaining = list(HOLES)
            log.append(f"--- level {level}: {hidden} tiles")
            placements = []
            for k in range(1, hidden + 1):
                sx, sy = SLOTS[k]
                placed = False
                for hx, hy in remaining:
                    tb = await rgn(sx + 47.5, sy + 47.5)
                    hb = await rgn(hx, hy)
                    await page.mouse.move(bx + sx + 47.5, by + sy + 47.5)
                    await page.mouse.down()
                    await page.mouse.move(bx + hx, by + hy, steps=12)
                    await page.mouse.up()
                    await page.wait_for_timeout(800)
                    ta = await rgn(sx + 47.5, sy + 47.5)
                    ha = await rgn(hx, hy)
                    hd = region_diff(hb, ha)
                    td = region_diff(tb, ta)
                    log.append(f"  slot{k}->({hx:.0f},{hy:.0f}) hole {hd:.2f} tray {td:.2f}")
                    out(log[-1])
                    if hd > 0.02 and td > 0.02:
                        placements.append((k, (round(hx), round(hy))))
                        remaining.remove((hx, hy))
                        placed = True
                        break
                if not placed:
                    log.append(f"  slot{k}: NO HOLE ACCEPTED")
                    out(log[-1])
            log.append(f"level {level} placements: {placements}")
            out(log[-1])
            if level < 5:
                await page.wait_for_timeout(7500)
                await page.screenshot(path=f"/tmp/pp-lvl{level+1}.png")
            else:
                await page.wait_for_timeout(6000)
                await page.screenshot(path="/tmp/pp-end.png")
                log.append("end screen captured")
                out(log[-1])

        # replay: PLAY AGAIN -> title
        before = await page.screenshot(clip=clip(bx + PLAYAGAIN[0], by + PLAYAGAIN[1], 60))
        await page.mouse.click(bx + PLAYAGAIN[0], by + PLAYAGAIN[1])
        await page.wait_for_timeout(3000)
        after = await page.screenshot(clip=clip(bx + PLAYAGAIN[0], by + PLAYAGAIN[1], 60))
        log.append(f"play again area diff {region_diff(before, after):.3f}")
        await page.screenshot(path="/tmp/pp-replay.png")
        log.append(f"pics requested: {len([u for u in requests if '/pics/' in u])}")
        log.append(f"failed: {failed}")
        log.append(f"console errors: {errors[:10]}")
        out(json.dumps(log, indent=2))

asyncio.run(main())

"""Blind solver QA for Dreamhouse Puzzle Party (Easy mode).

Drives the real game through Ruffle without vision:
- clicks are verified via pixel-diff or network signals,
- puzzle tiles are dragged tray->hole and placement is detected by pixel diff
  of the hole and tray regions (a placed tile changes both).

Usage: python3 scripts/qa_puzzle_solve.py [--levels 5] [--shotdir /tmp]
"""
import asyncio, io, json, sys, time
from playwright.async_api import async_playwright
from PIL import Image

BASE = "http://127.0.0.1:4173/dreamhouse/puzzle-party/"

# Stage geometry (decompiled from dhpuzzlegame.swf, twips/20)
HOLES = {(r, c): (93.0 + (c - 1) * 95.0, 179.8 + (r - 1) * 95.0) for r in range(1, 5) for c in range(1, 5)}
SLOTS = {
    1: (698.5, 223.0), 2: (485.7, 416.0), 3: (485.7, 127.0), 4: (485.7, 223.0),
    5: (698.5, 318.7), 6: (805.0, 128.9), 7: (592.1, 128.9), 8: (698.5, 128.9),
    9: (592.1, 223.0), 10: (805.0, 318.7), 11: (485.7, 318.7), 12: (698.5, 416.0),
    13: (805.0, 223.0), 14: (592.1, 416.0), 15: (805.0, 416.0), 16: (592.1, 318.7),
}
HIDDEN_EASY = [3, 5, 6, 9, 11]
TITLE_PLAY = (828.0, 474.9)
HINT_BTN = (918.1, 69.0)
PLAYAGAIN_BTN = (795.95, 410.1)
TILE_HALF = 47.5

def diff_fraction(before: bytes, after: bytes, clip):
    a = Image.open(io.BytesIO(before)).convert("RGB").crop(clip)
    b = Image.open(io.BytesIO(after)).convert("RGB").crop(clip)
    if a.size != b.size:
        return 1.0
    pa, pb = a.load(), b.load()
    w, h = a.size
    total = w * h
    changed = 0
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            d = sum(abs(pa[x, y][i] - pb[x, y][i]) for i in range(3))
            if d > 45:
                changed += 1
    return changed / (total / 4)

def clip_around(cx, cy, half=40):
    return (int(cx - half), int(cy - half), int(cx + half), int(cy + half))

async def main():
    shotdir = "/tmp"
    log = []
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1100, "height": 950})
        requests, failed, errors = [], [], []
        page.on("request", lambda r: requests.append(r.url))
        page.on("requestfailed", lambda r: failed.append(f"{r.url} :: {r.failure}"))
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)

        await page.goto(BASE, wait_until="domcontentloaded")

        # wait until the title screen renders (play button area turns non-white)
        def play_area_colored(png, box):
            img = Image.open(io.BytesIO(png)).convert("RGB")
            px = img.load()
            ox, oy = box["x"], box["y"]
            colored = sum(
                1 for dx in range(0, 60, 6) for dy in range(0, 44, 5)
                if sum(px[ox + 798 + dx, oy + 455 + dy]) < 700
            )
            return colored

        async def stage_box():
            return await page.evaluate("""() => {
              const p = document.querySelector('.dreamhouse-game ruffle-player');
              if(!p) return null;
              const r = p.getBoundingClientRect();
              return {x: r.x, y: r.y, w: r.width, h: r.height};
            }""")

        box = None
        for _ in range(24):
            box = await stage_box()
            if box:
                png = await page.screenshot()
                if play_area_colored(png, box) > 3:
                    break
            await page.wait_for_timeout(3000)
        assert box, "game player not found"
        log.append(f"title ready, stage box {box}")
        ox, oy = box["x"], box["y"]

        def pg(sx, sy):
            return (ox + sx, oy + sy)

        async def shot():
            return await page.screenshot()

        async def region_diff(before, after, sx, sy, half=40):
            c = clip_around(ox + sx, oy + sy, half)
            return diff_fraction(before, after, c)

        # --- Title -> difficulty screen: click Play, verify big change ---
        before = await shot()
        clicked = False
        for dx, dy in [(0, 0), (-30, 0), (30, 0), (0, -30), (0, 30)]:
            await page.mouse.click(*pg(TITLE_PLAY[0] + dx, TITLE_PLAY[1] + dy))
            await page.wait_for_timeout(3000)
            after = await shot()
            f = diff_fraction(before, after, (int(ox), int(oy), int(ox + 990), int(oy + 550)))
            log.append(f"title click offset ({dx},{dy}) diff {f:.3f}")
            if f > 0.05:
                clicked = True
                break
            before = after
        if not clicked:
            log.append("FAILED to leave title screen")
            print(json.dumps(log, indent=2)); return
        log.append("title -> difficulty OK")
        await page.wait_for_timeout(1500)  # let the intro settle
        diff_ref = await shot()
        await page.screenshot(path=f"{shotdir}/pp-diff-screen.png")

        # --- Difficulty: grid-spray candidates, verify by tray tile count (Easy=3, Hard=7) ---
        def tray_count(png):
            """Count tray slots holding a tile: photo tiles have high color variance,
            the empty panel behind them is much smoother."""
            img = Image.open(io.BytesIO(png)).convert("RGB")
            px = img.load()
            n = 0
            for k in range(1, 17):
                sx, sy = SLOTS[k]
                cx, cy = int(ox + sx + TILE_HALF), int(oy + sy + TILE_HALF)
                vals = [px[cx + dx, cy + dy] for dx in range(-22, 23, 6) for dy in range(-22, 23, 6)]
                var = 0.0
                mean = tuple(sum(v[i] for v in vals) / len(vals) for i in range(3))
                for v in vals:
                    var += sum((v[i] - mean[i]) ** 2 for i in range(3))
                var /= len(vals)
                if var > 900:
                    n += 1
            return n

        async def goto_diff_screen():
            for _ in range(24):
                bx = await stage_box()
                png = await page.screenshot()
                if bx and play_area_colored(png, bx) > 3:
                    break
                await page.wait_for_timeout(3000)
            prev = await shot()
            for dx, dy in [(0, 0), (-30, 0), (30, 0), (0, -30), (0, 30)]:
                await page.mouse.click(*pg(TITLE_PLAY[0] + dx, TITLE_PLAY[1] + dy))
                await page.wait_for_timeout(3000)
                after = await shot()
                f = diff_fraction(prev, after, (int(ox), int(oy), int(ox + 990), int(oy + 550)))
                if f > 0.05:
                    break
                prev = after
            await page.wait_for_timeout(1500)

        grid = [(x, y) for y in (150, 250, 350, 450) for x in (150, 250, 350, 450, 550, 650, 750, 850)]
        hard_positions = []
        mode = None
        attempts = 0
        if "--autostart" in sys.argv:
            # instrumented QA copy: the game auto-starts Easy ~2.5s after the diff screen
            await page.wait_for_timeout(7000)
            mode = "easy"
        def plog():
            with open("/tmp/pp-solve-partial.json", "w") as f:
                json.dump(log, f, indent=2)
            print(json.dumps(log[-1]), flush=True)
        while mode is None and attempts < 6:
            attempts += 1
            diff_ref = await shot()
            for cx, cy in grid:
                if (cx, cy) in hard_positions:
                    continue
                await page.mouse.click(*pg(cx, cy))
                await page.wait_for_timeout(3800)
                after = await shot()
                f = diff_fraction(diff_ref, after, (int(ox), int(oy), int(ox + 990), int(oy + 550)))
                tc = tray_count(after) if f > 0.05 else 0
                log.append(f"difficulty click ({cx},{cy}): diff {f:.3f} tray {tc}")
                plog()
                if f > 0.05 and tc == 3:
                    mode = "easy"
                    break
                if f > 0.05 and tc > 5:
                    log.append(f"({cx},{cy}) started HARD; reloading")
                    hard_positions.append((cx, cy))
                    await page.goto(BASE, wait_until="domcontentloaded")
                    await goto_diff_screen()
                    break
            if mode is None and attempts == 1:
                # after first full pass, log per-slot variances for calibration
                await page.screenshot(path=f"{shotdir}/pp-diff-analyze.png")
        if mode != "easy":
            log.append("FAILED to select easy difficulty")
            print(json.dumps(log, indent=2)); return
        log.append("easy selected")
        await page.screenshot(path=f"{shotdir}/pp-level1-start.png")

        # --- hint button check during level 1 ---
        before = await shot()
        await page.mouse.click(*pg(HINT_BTN[0], HINT_BTN[1]))
        await page.wait_for_timeout(700)
        after = await shot()
        f = diff_fraction(before, after, (int(ox) + 45, int(oy) + 132, int(ox) + 425, int(oy) + 512))
        log.append(f"hint overlay diff {f:.3f} (expect >0, fades after 1s)")
        await page.wait_for_timeout(1500)

        # --- solve levels ---
        for level in range(1, 6):
            hidden = HIDDEN_EASY[level - 1]
            remaining = list(HOLES.values())
            log.append(f"--- level {level}: {hidden} tiles")
            placements = []
            for k in range(1, hidden + 1):
                sx, sy = SLOTS[k]
                placed = False
                for hx, hy in remaining:
                    before = await shot()
                    await page.mouse.move(*(pg(sx + TILE_HALF, sy + TILE_HALF)))
                    await page.mouse.down()
                    await page.mouse.move(*(pg(hx, hy)), steps=15)
                    await page.mouse.up()
                    await page.wait_for_timeout(900)
                    after = await shot()
                    hd = await region_diff(before, after, hx, hy)
                    td = await region_diff(before, after, sx + TILE_HALF, sy + TILE_HALF)
                    log.append(f"  slot{k} -> hole({hx:.0f},{hy:.0f}): holeDiff {hd:.3f} trayDiff {td:.3f}")
                    if hd > 0.02 and td > 0.02:
                        placements.append((k, (hx, hy)))
                        remaining.remove((hx, hy))
                        placed = True
                        break
                if not placed:
                    log.append(f"  slot{k}: no hole accepted the tile")
                with open("/tmp/pp-solve-partial.json", "w") as f:
                    json.dump(log, f, indent=2)
            log.append(f"level {level} placements: {placements}")
            if level < 5:
                await page.wait_for_timeout(7500)  # transition + next level setup
                await page.screenshot(path=f"{shotdir}/pp-level{level+1}-start.png")
            else:
                await page.wait_for_timeout(6000)
                await page.screenshot(path=f"{shotdir}/pp-end-screen.png")
                log.append("end screen captured")

        # --- hint check on the end screen is N/A; verify replay: PLAY AGAIN -> title ---
        before = await shot()
        await page.mouse.click(*pg(PLAYAGAIN_BTN[0], PLAYAGAIN_BTN[1]))
        await page.wait_for_timeout(3000)
        after = await shot()
        f = diff_fraction(before, after, (int(ox), int(oy), int(ox + 990), int(oy + 550)))
        log.append(f"play again diff {f:.3f}")
        await page.screenshot(path=f"{shotdir}/pp-replay-title.png")

        # network summary
        bad = [u for u in requests if "/pics/" in u]
        errs = [u for u in failed]
        log.append(f"pic requests: {len(bad)}; failed: {errs}")
        log.append(f"console errors: {errors[:10]}")
        print(json.dumps(log, indent=2))

asyncio.run(main())

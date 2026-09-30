"""Visual/behavioral QA for restored pages. Usage: python3 scripts/qa_pages.py"""
import asyncio, json, sys
from playwright.async_api import async_playwright

PAGES = [
    ("/", "home"),
    ("/activities/fun_games/", "games"),
    ("/activities/fantasy/", "fantasy"),
    ("/_original/icanbe.barbie.com/en_US/index.html", "icanbe"),
]

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1100, "height": 900})
        failed, errors = [], []
        page.on("requestfailed", lambda r: failed.append(f"{r.url} :: {r.failure}"))
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        for path, name in PAGES:
            errors.clear()
            failed.clear()
            await page.goto(f"http://127.0.0.1:4173{path}", wait_until="networkidle")
            await page.wait_for_timeout(4500)
            info = await page.evaluate("""() => ({
                title: document.title,
                players: Array.from(document.querySelectorAll('ruffle-player')).map(p => ({w: p.getBoundingClientRect().width, h: p.getBoundingClientRect().height})),
                bodyWidth: document.body.scrollWidth,
                stage: (() => { const s = document.querySelector('.catalog-stage'); return s ? {w: s.getBoundingClientRect().width, h: s.getBoundingClientRect().height} : null; })(),
                thumbs: document.querySelectorAll('.itemthumb').length,
                tabs: document.querySelectorAll('#categoryWrapper input').length,
                selectedTabImg: (document.querySelector('#gameslist_imgSelectedCategory')||{}).src || null,
                flcontent: (() => { const e = document.getElementById('flcontent'); return e ? {w: e.getBoundingClientRect().width, h: e.getBoundingClientRect().height} : null; })(),
                promoSlides: document.querySelectorAll('.promo_holder').length,
                promoControls: document.querySelectorAll('#promo_controls img').length,
                careerThumbs: document.querySelectorAll('#promoArea .holder img').length,
                navButtons: document.querySelectorAll('nav ul li').length,
                footerCols: document.querySelectorAll('footer .ft-list-container').length,
            })""")
            await page.screenshot(path=f"/tmp/qa-{name}.png", full_page=False)
            print(json.dumps({name: info, "console_errors": errors[:6], "failed_requests": failed[:6]}, indent=1))
        await browser.close()

asyncio.run(main())

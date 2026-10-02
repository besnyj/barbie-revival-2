"""Visual/behavioral QA for the restored I Can Be pages.
Usage: python3 scripts/qa_icanbe.py"""
import asyncio, json
from playwright.async_api import async_playwright

BASE = "http://127.0.0.1:4173"
ROOT = "/_original/icanbe.barbie.com/en_US"

RECOVERED_GAMES = {
    "amazing-architect", "data-diva", "disco-ballroom", "fantastic-concert",
    "good-morning-barbie", "halfpipe-pixie", "little-critter-clinic", "pom-pom-squad",
    "potty-race", "presto-pizza", "ready-set-check-up", "splashin-bash",
    "super-wedding-stylist",
}
MISSING_GAMES = {
    "art-teacher", "cakery-bakery", "kiddie-classroom", "race-car-cutie",
    "sugar-bug-blast", "tutu-star", "years-of-careers",
}
VIDEOS = ["babysitter", "ballerina", "dentist", "kiddoctor", "petvet", "rockstar", "trapeze"]

PAGES = []
PAGES.append((f"{ROOT}/careers/index.html", "icanbe-careers"))
PAGES.append((f"{ROOT}/games/index.html", "icanbe-games"))
PAGES += [(f"{ROOT}/games/category/{c}.html", f"icanbe-games-{c}") for c in ("professional", "artsy", "nurturing", "sporty")]
PAGES += [(f"{ROOT}/games/{g}.html", f"icanbe-game-{g}") for g in sorted(RECOVERED_GAMES | MISSING_GAMES)]
PAGES.append((f"{ROOT}/videos/index.html", "icanbe-videos"))
PAGES += [(f"{ROOT}/videos/{v}.html", f"icanbe-video-{v}") for v in VIDEOS]
PAGES += [(f"{ROOT}/dolls/team_barbie.html", "icanbe-dolls-team"), (f"{ROOT}/dolls/president.html", "icanbe-dolls-president")]
PAGES += [
    (f"{ROOT}/games.html", "icanbe-redir-games"),
    (f"{ROOT}/Dolls/index.html", "icanbe-redir-dolls"),
]

SNAPSHOT = """() => ({
    title: document.title,
    url: location.pathname,
    navImgs: document.querySelectorAll('nav ul li a img').length,
    notices: document.querySelectorAll('.restoration-missing').length,
    missingArt: Array.from(document.querySelectorAll('.restoration-missing strong')).map(e => e.textContent.trim()),
    ruffle: Array.from(document.querySelectorAll('ruffle-player')).map(p => p.getBoundingClientRect().width + 'x' + p.getBoundingClientRect().height),
    tabs: document.querySelectorAll('.aggregator .main-nav li').length,
    selectedTab: (document.querySelector('.aggregator .main-nav li.selected span') || {}).textContent || null,
    cards: document.querySelectorAll('.content-inner a.holder, .content-inner .holder').length,
    careerHolders: document.querySelectorAll('.holder.careers').length,
    primaryImg: (document.querySelector('img.primary') || {}).src || null,
    primaryEl: document.querySelector('.primary') ? 'present' : 'absent',
    promos: document.querySelectorAll('.promo-tile').length,
    videoThumbs: document.querySelectorAll('#assoc-videos .holder').length,
    videoPlayer: document.getElementById('video-player') ? 'present' : 'absent',
    dollLayers: document.querySelectorAll('#dolls-container .imgPos').length,
    dollImgs: document.querySelectorAll('#dolls-container img').length,
    bodyScrollW: document.body.scrollWidth,
    jquery: window.jQuery ? jQuery.fn.jquery : 'none',
})"""


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1100, "height": 900})
        failed, errors = [], []
        page.on("requestfailed", lambda r: failed.append(f"{r.url} :: {r.failure}"))
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        results = {}
        for path, name in PAGES:
            errors.clear()
            failed.clear()
            try:
                resp = await page.goto(f"{BASE}{path}", wait_until="networkidle")
                status = resp.status if resp else "?"
            except Exception as exc:  # noqa: BLE001
                results[name] = {"error": str(exc)}
                print(json.dumps({name: results[name]}))
                continue
            await page.wait_for_timeout(4500)
            info = await page.evaluate(SNAPSHOT)
            results[name] = {"status": status, **info, "console_errors": errors[:6], "failed_requests": failed[:6]}
            print(json.dumps({name: results[name]}, default=str))
        await browser.close()


asyncio.run(main())

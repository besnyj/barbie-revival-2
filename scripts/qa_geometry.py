"""Assert restoration geometry matches the original June 2013 CSS values.
Usage: python3 scripts/qa_geometry.py"""
import asyncio, json
from playwright.async_api import async_playwright

async def check(path, assertions, wait=9000):
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1100, "height": 900})
        await page.goto(f"http://127.0.0.1:4173{path}", wait_until="networkidle")
        await page.wait_for_timeout(wait)
        results = await page.evaluate("""(checks) => checks.map(([label, expr]) => {
            try { return [label, String(eval(expr))]; } catch (e) { return [label, 'ERR ' + e.message]; }
        })""", assertions)
        for label, value in results:
            print(f"{path} | {label}: {value}")
        await browser.close()

async def main():
    await check("/activities/fun_games/", [
        ["stage width", "document.querySelector('.catalog-stage').getBoundingClientRect().width"],
        ["#flcontent w/h", "const e=document.getElementById('flcontent'); e.getBoundingClientRect().width+'x'+e.getBoundingClientRect().height"],
        ["hero player w/h", "const e=document.querySelector('.catalog-hero ruffle-player'); e?e.getBoundingClientRect().width+'x'+e.getBoundingClientRect().height:'none'"],
        ["header art size", "const e=document.querySelector('.catalog-header-art img'); e.naturalWidth+'x'+e.naturalHeight"],
        ["listing margin-top (computed)", "getComputedStyle(document.getElementById('gameslist_UpdPnlListing')).marginTop"],
        ["selected tab left", "document.getElementById('gameslist_divSelectedCat').getBoundingClientRect().left - document.querySelector('.catalog-stage').getBoundingClientRect().left"],
        ["selected tab img src", "document.getElementById('gameslist_imgSelectedCategory').getAttribute('src')"],
        ["categoryWrapper marginLeft", "getComputedStyle(document.getElementById('categoryWrapper')).marginLeft"],
        ["tab count", "document.querySelectorAll('#categoryWrapper input').length"],
        ["tab0 visible?", "getComputedStyle(document.querySelectorAll('#categoryWrapper > div')[0]).visibility"],
        ["tab1 z-index", "document.querySelectorAll('#categoryWrapper > div')[1].style.zIndex"],
        ["containerTop left", "document.getElementById('containerTop').getBoundingClientRect().left - document.querySelector('.catalog-stage').getBoundingClientRect().left"],
        ["containerTop w/h", "document.getElementById('containerTop').getBoundingClientRect().width+'x'+document.getElementById('containerTop').getBoundingClientRect().height"],
        ["itemslistContainer w", "document.getElementById('itemslistContainer').getBoundingClientRect().width"],
        ["itemslistContainer bg", "getComputedStyle(document.getElementById('itemslistContainer')).backgroundImage.slice(0,70)"],
        ["first card left", "document.querySelector('.itemthumb').getBoundingClientRect().left - document.querySelector('.catalog-stage').getBoundingClientRect().left"],
        ["card size", "const e=document.querySelector('.itemthumb'); e.getBoundingClientRect().width+'x'+e.getBoundingClientRect().height"],
        ["card marginLeft/bottom", "const s=getComputedStyle(document.querySelector('.itemthumb')); s.marginLeft+'/'+s.marginBottom"],
        ["card count", "document.querySelectorAll('.itemthumb').length"],
        ["cards per row", "(function(){const cards=[...document.querySelectorAll('.itemthumb')];const tops=new Set(cards.map(c=>Math.round(c.getBoundingClientRect().top)));return cards.length/tops.size})()"],
        ["thumb title font", "getComputedStyle(document.querySelector('.thumbitemname')).fontSize+' '+getComputedStyle(document.querySelector('.thumbitemname')).fontWeight"],
        ["containerBottom h", "document.getElementById('containerBottom').getBoundingClientRect().height"],
        ["footer_links marginTop", "getComputedStyle(document.getElementById('footer_links')).marginTop"],
        ["footer_links color", "getComputedStyle(document.getElementById('footer_links')).color"],
        ["footer_bg marginTop", "getComputedStyle(document.getElementById('footer_bg')).marginTop"],
        ["footer img size", "const e=document.querySelector('#footer_bg img'); e.naturalWidth+'x'+e.naturalHeight"],
        ["shell footer hidden", "document.querySelector('.site>footer').hidden"],
        ["body bg image", "getComputedStyle(document.getElementById('background')).backgroundImage.slice(0,60)"],
    ])
    await check("/activities/fantasy/", [
        ["listing margin-top", "getComputedStyle(document.getElementById('gameslist_UpdPnlListing')).marginTop"],
        ["selected tab left", "document.getElementById('gameslist_divSelectedCat').getBoundingClientRect().left - document.querySelector('.catalog-stage').getBoundingClientRect().left"],
        ["tab count", "document.querySelectorAll('#categoryWrapper input').length"],
        ["card count", "document.querySelectorAll('.itemthumb').length"],
        ["footer_bg marginTop", "getComputedStyle(document.getElementById('footer_bg')).marginTop"],
        ["footer img size", "const e=document.querySelector('#footer_bg img'); e.naturalWidth+'x'+e.naturalHeight"],
        ["header art size", "const e=document.querySelector('.catalog-header-art img'); e.naturalWidth+'x'+e.naturalHeight"],
    ])
    await check("/_original/icanbe.barbie.com/en_US/index.html", [
        ["title", "document.title"],
        ["container w", "document.getElementById('container').getBoundingClientRect().width"],
        ["header-top h", "document.getElementById('header-top').getBoundingClientRect().height"],
        ["nav imgs appended", "document.querySelectorAll('nav ul li a img').length"],
        ["games btn img size", "(function(){const i=document.querySelector('#btn-games img');return i?i.width+'x'+i.height:'none'})()"],
        ["careers btn img size", "(function(){const i=document.querySelector('#btn-careers img');return i?i.width+'x'+i.height:'none'})()"],
        ["promo holders", "document.querySelectorAll('.promo_holder').length"],
        ["slides left (after init)", "document.getElementById('slides').style.left"],
        ["visible promo", "(function(){const s=document.getElementById('slides');const l=parseFloat(s.style.left)||0;const i=Math.round(-l/990);return '#promo'+i})()"],
        ["arrows visibility", "getComputedStyle(document.querySelector('#promo_controls .left')).visibility+'/'+getComputedStyle(document.querySelector('#promo_controls .right')).visibility"],
        ["messageArea text", "document.getElementById('messageArea').textContent.trim()"],
        ["career thumbs", "document.querySelectorAll('#promoArea .holder img').length"],
        ["career title element", "(function(){const t=document.querySelector('#promoArea .promo .title');return t?t.textContent.trim():'missing'})()"],
        ["btn-med hover class", "(function(){const b=document.querySelector('#promoArea .btn-med');return b?b.className:'missing'})()"],
        ["footer columns", "document.querySelectorAll('footer .ft-list-container').length"],
        ["body bg", "getComputedStyle(document.body).backgroundColor"],
        ["jquery version", "window.jQuery ? jQuery.fn.jquery : 'none'"],
        ["ad space w", "document.getElementById('ad').getBoundingClientRect().width"],
    ])

asyncio.run(main())

# Barbie.com restoration — checkpoint

## Scope agreed — 2026-09-30
- Restore US English June 2013 site, baseline capture 20130628161553.
- Original desktop dimensions; home, menu sections and individual content presentation pages.
- Restore original visual assets and interactive states as faithfully as evidence allows.
- No mobile adaptation, music or sound effects in this phase.
- Remove advertising and its frames, preserving positions and original background.
- Unavailable games/content and external shop/world destinations: “Under restoration”.
- GitHub + Cloudflare; deployment configuration deferred by user.

## Research log
- Initial user URL was May 2010; user corrected target to June 2013. Discard 2010 as visual reference.
- Opened June 2013 Wayback URL; archive selected 28 June 2013 16:15:53.
- Browser confirms original navigation, pink patterned background and loading carousel.
- Inspected original DOM: header 990×210; navigation `global/barbie_nav_new.swf` 820×100; shop button SWF 131×140; hero `global/homepageCDARotation/HomeCDA.swf` 910×520; grownups promo SWF 725×180.
- Header original assets include `images/header/nav_background_new.jpg`, `images/header/01BG.jpg`, language dropdown assets. Advertising top frame is `images/shared/top_banner.gif`.
- Home main artwork not yet validated: archive replay shows loading spinner. No claim that this is the complete intended home.
- Verified Cloudflare Pages GitHub integration and 25 MiB per-file limit; larger media may use R2. Blogger rejected by user.
- Workspace initially empty except `.git`. No Node executable on default PATH; bundled Node runtime discovered.
- Network curl initially failed sandbox DNS; approved escalated curl successfully retrieved HTTP 200 archive headers for original homepage.
- Delegated read-only route/section research to isolated smaller-model subagent `archive_routes`.

## Sources
- https://web.archive.org/web/20130628161553/http://www.barbie.com/
- https://developers.cloudflare.com/pages/get-started/git-integration/
- https://developers.cloudflare.com/pages/platform/limits/
- https://developers.cloudflare.com/r2/buckets/public-buckets/

## Status
Recovery and implementation in progress. Not published. Home, Games/Fairytale catalogs, Fashion/Friends rooms and BTV shell run locally with original assets; I Can Be home restored as a standalone page; all menu navigation verified. Preview serves on all interfaces (LAN accessible). Inner detail pages and full visual review remain pending.
## Implementation and recovery log — session 1
- Added `scripts/recover.py`: explicit archive recovery, file validation, SHA-256 and resolved-capture provenance in `research/asset-manifest.json`.
- Added `scripts/inspect_swf.py`: decompresses SWF data and extracts printable strings without executing Flash.
- Preserved original HTML/CSS and SWFs under `research/`; runtime assets use original paths in `public/`.
- Recovered home navigation, shop button, carousel controller, its XML, and all three content SWFs. Actual XML differs from background JS labels: Dreamhouse Puzzle Party, BLID Profile, My Dreamhouse. XML is June 13; slide SWFs June 4; controller nearest capture July 4. All resolved dates recorded in manifest. This is a documented nearby-capture restoration, not a claim all files were captured June 28.
- Vendored official `@ruffle-rs/ruffle` 0.6.0 from npm with MIT/Apache licenses. Original Flash timelines run in modern browsers; no Flash browser plugin needed. This replaces the earlier tentative plan to redraw all animation in JS.
- Implemented static local shell, original 990×210 header geometry, 820×100 nav, 910×520 carousel, footer, local routing and muted playback.
- Created `scripts/serve.py` preview at http://127.0.0.1:4173/; file:// preview does not support this app properly.
- First browser QA caught URL rewrite erroneously rewriting localhost; fixed. Then confirmed original carousel slides, menu hover glitter, transitions and background changes display locally. Runtime dimensions verified via DOM.
- Added classic room section integration for Fashion and Friends, with original 641×326 SWFs, x=84/y=22 positioning inside 810px content, 640px reserved page height.
- Recovered BTV 990×390 scene, background and catalogue framing. Added BTV presentation with “Under restoration” inside the original 480×360 player position. Playlist service data is NOT recovered; catalogue remains incomplete.
- Recovered original language title/globe/go art, header backgrounds, and three grownup promo SWFs.
- Advertising frame removal uses a reconstructed gradient only in the former ad rectangle because the original header bitmap itself contains a solid pink cutout. Adjacent original art retained; this patch is not recovered original artwork.
- Isolated Luna research agent retrieved primary section files then hit its model usage limit before implementation. Parent took over classic rooms. Separate Terra agents assigned Games/Fairytale catalog and I Can Be homepage, owning isolated modules.
- Primary sitemap confirms `/activities/games/` redirects to `/activities/fun_games/`. Verified other section routes: `/activities/btv/`, `/activities/fashion/`, `/activities/friends/`, `/activities/fantasy/`, I Can Be subdomain.
- Third-party overview from initial agent mixed older menus with 2013; discarded as exact layout evidence in favor of primary archived HTML/SWF.

## Implementation and recovery log — session 2 (catalog + I Can Be integration)
- Retried the 21 previously missing catalog assets: 9 recovered from June 28 replay; 9 from nearest 2013 captures via new `scripts/recover_cdx.py` (Jan–Mar 2013, closest to June 28); 2 (`PF_mariposa_dressup_game.jpg`, `PF_sparklechain_game.jpg`) only exist in Feb 2012 captures — used as the sole available copies of the exact files referenced by the June 2013 page; dates recorded in manifest.
- Recovered section chrome: games `cord_top.png` (990×102) + `footer.png` (990×198); fantasy `fairytale_header.jpg` (990×203) + `fairytale_footer.jpg` (989×303); per-section `agg_center.png`; games tab `_dn.png` hover images.
- Recovered the heroes' runtime dependencies: `data/config.xml` for both, games `promo_main.swf`, `gamesiconbox.swf`, `popup.swf`, overlay/fonts SWFs, 6 promo SWFs from `promo.xml` (one, `Promo_DOW_China.swf`, from Dec 2012 — recorded). `data/popup.xml` was never archived (only a 2024 redirect capture); the popup feed is a documented gap.
- Rewrote `public/sections/catalog.js`/`catalog.css` to reproduce the original archived DOM: original ids/classes from BarbieRefresh.css, hero SWF 990×390, header art, floating selected tab, category buttons with original z-index layering and `_up`/`_dn` hover, containerTop/itemslistContainer/containerBottom, 152×135 thumbs whose title swaps to the hover blurb, per-page listing margins (−89/−170px) and footer art (−177/−214px), white footer links, page background `barbiebg.jpg`. Only the initially archived category listing is shown; clicking other tabs keeps it and displays an honest notice (server postback results were never archived).
- Extended `scripts/build_catalog.py` to emit tab hover images and per-kind chrome into `catalog-data.js` and to recover all referenced assets.
- Rebuilt I Can Be as a faithful standalone page at `_original/icanbe.barbie.com/en_US/index.html`: original DOM, original `style.css`, fonts, all recovered images, and the original JS stack (jQuery 1.6.2 vendored from official CDN, MIT; modernizr, swfobject, SimpleAnimation libs, plugins.js, script.js). Parallax promo carousel, nav twinkle sparkles (`blit/sparkle.png`, `sparkle.json`), 3D careers carousel and help/gotacode overlays all run the original code.
- I Can Be adaptations (documented): ads/trackers removed with slot space preserved; external links (shop.mattel.com etc.) show a local “Under restoration” overlay; barbie.com/icanbe links rewrite to local routes; absolute resource paths re-pointed under `/_original/icanbe.barbie.com/` (base-tag approach cannot work for absolute-path URLs); `btn-dolls.png`/`btn-dolls-shadow.png` were never archived and are never requested (script.js initializes only games/videos/careers); fonts fixed to relative paths.
- Deleted the superseded subagent `icanbe.js`/`icanbe.css` (visual-substitute approximation).
- QA: added `scripts/qa_pages.py` (console errors + failed requests) and `scripts/qa_geometry.py` (geometry vs original CSS values). All pass: 0 console errors, 0 failed requests; tab/card/footer geometry matches original values; interactions verified (card hover text swap, tab hover `_up`→`_dn`, tab click notice, external card → restoration dialog, I Can Be arrows, career title hover, help overlay open/close, footer link rewrites). Headless-shell shows a Ruffle wgpu glow-filter panic on the home carousel (pre-existing, headless GPU limitation; real Chrome renders normally).
- Screenshots for visual review: `/tmp/qa-games-full.png`, `/tmp/qa-fantasy-full.png`, `/tmp/qa-icanbe-full.png`; live preview at http://127.0.0.1:4173/.
- Fixed routing bug reported by user: the Flash nav (and its Ruffle rewrite) navigates to section URLs without the trailing slash (`/activities/fun_games`), which fell to the “Under restoration” fallback because the router compared exact paths. `app.js` now normalizes paths (strip trailing slashes) before matching sections; `/activities/btv`, `/activities/fashion`, `/activities/friends`, `/activities/fun_games`, `/activities/fantasy` verified again without slashes. The nav’s “I Can Be” target is the subdomain root (`icanbe.barbie.com/`), which had no route: `serve.py` now 302s `/_original/icanbe.barbie.com(/)?` to the restored home, mirrored in `_redirects` for Cloudflare.
- Recovered the friends bedroom dynamic pet dependencies `friendsbedroom_PetAnim1_1.swf` and `friendsbedroom_PetAnim1_2.swf` (both 404’d at runtime). Other PetAnim variants (`PetAnim2_1`, `PetAnim3_2`, `petAnim2/3`) exist in the CDX but are not yet recovered — the user asked to defer those.
- Full log sweep + fresh page sweep after the routing fix: server log shows only the two PetAnim1_1 404s (now recovered); all pages report 0 console errors, 0 failed requests, no 4xx/5xx. The only remaining absence-related notes are the documented unrecovered gaps (popup.xml, btn-dolls.png, video playlist) — nothing that was “already restored” is erroring.
- `serve.py` now binds `0.0.0.0` so the preview can be opened from other machines on the same Wi-Fi (`http://192.168.10.37:4173/`); loopback unchanged.

## Open fidelity / functionality gaps
- Need finish/test all section modules and every recovered navigation target.
- Closet and bedroom character SWFs referenced dynamically need recovery and playback QA.
- Video JSON playlist `mediaservice.mirror-image.com/playlists/lafc94ec2f404.json` unavailable at initial replay URL; CDX attempted, connection failed. Do not invent historical video list.
- Individual detail pages not yet restored; generic “Under restoration” exists as a temporary route fallback, not completion of their promised visual frames.
- Games/Fairytale: only the default category listings are preserved; other tab categories and the games hero `data/popup.xml` feed were never archived. Honest notices show where content is missing.
- I Can Be: home restored; its games/videos/careers/dolls inner pages are not yet restored (fallback “Under restoration”). `btn-dolls.png`/shadow never archived (unused by original JS).
- Internet Archive downloads have intermittent immediate connection failures; preserve successful files, retry exact URLs and document failures.
- No deployment, remote repository changes, audio, mobile support, or complete game implementation performed.

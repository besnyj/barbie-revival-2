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
Recovery and implementation in progress. Not published. Asset availability and inner-page scope are being inventoried.

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

## Open fidelity / functionality gaps
- Need finish/test all section modules and every recovered navigation target.
- Closet and bedroom character SWFs referenced dynamically need recovery and playback QA.
- Video JSON playlist `mediaservice.mirror-image.com/playlists/lafc94ec2f404.json` unavailable at initial replay URL; CDX attempted, connection failed. Do not invent historical video list.
- Individual detail pages not yet restored; generic “Under restoration” exists as a temporary route fallback, not completion of their promised visual frames.
- Internet Archive downloads have intermittent immediate connection failures; preserve successful files, retry exact URLs and document failures.
- No deployment, remote repository changes, audio, mobile support, or complete game implementation performed.

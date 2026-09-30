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

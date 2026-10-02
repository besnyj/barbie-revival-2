#!/usr/bin/env python3
"""Build the 40 missing I Can Be pages from the archived HTMLs.

Usage: python3 scripts/build_icanbe_pages.py

Reads research/sections/icanbe-pages/ (archived page HTMLs + inventory.json),
applies the documented fidelity adaptations and writes the pages under
public/_original/icanbe.barbie.com/en_US/.

Adaptations (all documented in the project log):
  * original DOM/CSS kept; absolute site paths repointed under /_original/icanbe.barbie.com/
  * ads, trackers and legacy-IE/external scripts removed with slot space preserved
  * recovered game pages embed the original SWF via Ruffle (muted); unrecovered
    games keep their original fallback text with an "Under restoration" notice
  * video pages keep the restored frame; the player area carries a notice
    (the historical streaming service was never archived)
  * missing artwork (never captured anywhere) is replaced by honest notices
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = ROOT / "research" / "sections" / "icanbe-pages"
OUT = ROOT / "public" / "_original" / "icanbe.barbie.com"
ORIG = "/_original/icanbe.barbie.com"

RUFFLE_HEAD = f"""<script src="/vendor/ruffle/ruffle.js" defer></script>
<script>
window.RufflePlayer = {{ config: {{autoplay:'on', unmuteOverlay:'hidden', splashScreen:false, contextMenu:'off', warnOnUnsupportedContent:false, logLevel:'warn', wmode:'transparent', allowScriptAccess:true, openUrlMode:'allow', publicPath:'/vendor/ruffle/', urlRewriteRules:[
  [/^https?:\\/\\/(?:www\\.)?barbie\\.com(?::80)?\\//i, location.origin + '/'],
  [/^https?:\\/\\/icanbe\\.barbie\\.com\\//i, location.origin + '{ORIG}/'],
  [/^https?:\\/\\/dreamhouse\\.barbie\\.com\\/en-US\\/games\\/puzzle-party\\/?$/i, location.origin + '/dreamhouse/puzzle-party/'],
  [new RegExp('^https?://((?!'+location.host.replace(/[.*+?^${{}}()|[\\]\\\\]/g,'\\\\$&')+'(?:/|$))[^/]+)/','i'), location.origin + '/_external/$1/']
] }}}};
</script>"""

HEAD_STYLE = """
<style>
    /* Advertising removed; the original slot keeps its space over the page background. */
    #ad { background: none; }
    .restoration-missing { background:#fff; border:2px solid #f6d1e3; color:#d60986; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:6px; box-sizing:border-box; font-family:Arial,sans-serif; padding:12px; }
    .restoration-missing strong { font-size:14px; font-weight:bold; }
    .restoration-missing span { font-size:11px; line-height:1.35; }
    .restoration-missing.small strong { font-size:11px; }
    .restoration-missing.small span { font-size:9px; }
</style>"""

TAIL_SCRIPTS = """
<script>
    /* Original trackers are not loaded in this restoration. This stub keeps the
       original page scripts and click handlers running without tracking. */
    window.MATTEL = window.MATTEL || {};
    window.MATTEL.tracker = {
        CHANNEL: { NONE: "" }, CAMPAIGN: { NONE: "" }, ACTION: { NONE: "" }, CONTENTTYPE: { NONE: "" },
        Tracker: { track: function(){}, enableShortCuts: function(){}, name: "", contenttype: "", campaign: "", channel: "", action: "" }
    };
    window.MATTEL.modules = { analytics: {
        AddClickTracking: function(){}, setCookie: function(){}, getCookie: function(){ return null; },
        initateExternalLink: function(){ return true; }, initateExternalLinkWithILink: function(){ return true; },
        initatePopUp: function(){ return true; }
    }};
</script>
<script>
    /* Keep restored destinations inside this restoration; other original
       external destinations go through the recovered partner interstitial. */
    document.addEventListener('click', function (event) {
        var link = event.target && event.target.closest ? event.target.closest('a') : null;
        if (!link) return;
        var href = link.getAttribute('href') || '';
        if (!/^https?:/i.test(href)) return;
        var a = document.createElement('a');
        a.href = href;
        if (a.host === location.host) return;
        event.preventDefault();
        event.stopPropagation();
        if (a.host === 'www.barbie.com' || a.host === 'barbie.com') {
            location.href = a.pathname + a.search + a.hash;
        } else if (a.host === 'icanbe.barbie.com') {
            location.href = '""" + ORIG + """' + a.pathname + a.search + a.hash;
        } else if (a.hostname === 'dreamhouse.barbie.com' && a.pathname.toLowerCase() === '/en-us/games/puzzle-party') {
            location.href = '/dreamhouse/puzzle-party/';
        } else {
            location.href = '/includes/partner-interstitial.aspx?redirect=' + encodeURIComponent(a.href);
        }
    }, true);
</script>"""

REMOVALS = [
    r'<script[^>]*src="http://tracker\.mattel\.com[^"]*"[^>]*>\s*</script>',
    r'<script[^>]*>\s*var track\s*=\s*\{[^}]*\}\s*;\s*</script>',
    r'<script[^>]*language="javascript"[^>]*>\s*var utag_data\s*=\s*\{[^}]*\}\s*;\s*</script>',
    r'<input[^>]*id="hdnpageId"[^>]*/?>',
    r'<script[^>]*>\s*//<!\[CDATA\[.*?//\]\]>\s*</script>\s*<noscript>.*?</noscript>\s*(?:<span>AD</span>)?',
    r'<link[^>]*href="http://corporate\.mattel\.com/mdn/css/header-25px\.css"[^>]*\s*/?>',
    r'<!--\[if IE 6\]>.*?<!\[endif\]-->',
    r'<script[^>]*src="http://corporate\.mattel\.com/mdn/js/header-fixie\.js"></script>\s*<script[^>]*>\s*\$\(document\)\.ready\(function\s*\(\)\s*\{\s*\$\.getScript\([^)]*gnav-25px\.js[^)]*\);\s*\}\);\s*</script>',
    r'<!--\[if lt IE 7 \]>.*?<!\[endif\]-->',
    r'<script[^>]*>\s*\(function \(a, b, c, d\) \{.*?\}\)\(\);\s*</script>',
    r'<script[^>]*src="http://mediaportal\.mirror-image\.com[^"]*"[^>]*>\s*</script>',
]

ATTR_RE = re.compile(
    r"""(src|href|action|data-img-src|data-img-shadow-src|data-video-player|data-video-install)\s*=\s*(["'])(/[^"']+)\2""",
    re.I,
)

LOCALE_RE = re.compile(r'(<option value=)(["\']?)/([a-z]{2}[a-z_]*/index\.html)', re.I)

SWF_BLOCK_RE = re.compile(
    r"<script type=\"text/javascript\">\s*//\s*<!\[CDATA\[\s*"
    r"var flashvars\s*=\s*\{(?P<fv>.*?)\};\s*"
    r"var params\s*=\s*\{(?P<pp>.*?)\};\s*"
    r"var attributes\s*=\s*\{(?P<at>.*?)\};\s*"
    r"swfobject\.embedSWF\(\s*(?P<q>[\"'])(?P<swf>[^\"']+)(?P=q)\s*,.*?\);\s*"
    r"//\s*\]\]>\s*</script>",
    re.DOTALL,
)

PATH_FLASHVAR_RE = re.compile(r'path:\s*["\']([^"\']+)["\']')
VIDEO_RE = re.compile(r"<video[^>]*id=[\"']html5video[\"'][^>]*>.*?</video>", re.DOTALL)


def rewrite_paths(html: str) -> str:
    def sub(m):
        attr, quote, path = m.group(1), m.group(2), m.group(3)
        if path.startswith("//") or path.startswith("/_original") or "://" in path:
            return m.group(0)
        return f'{attr}={quote}{ORIG}{path}{quote}'
    html = ATTR_RE.sub(sub, html)
    html = LOCALE_RE.sub(rf"\1\2{ORIG}/\3", html)
    return html


def local_exists(src_path: str) -> bool:
    p = OUT / src_path.split(ORIG, 1)[-1].lstrip("/")
    return p.is_file() and p.stat().st_size > 0


def image_missing_srcs(html: str):
    """Yield (match_obj) for local img tags whose src file is missing."""
    for m in re.finditer(r'<img\b[^>]*\bsrc=(["\'])([^"\']+)\1[^>]*>', html, re.I):
        if ORIG in m.group(2) and not local_exists(m.group(2)):
            yield m


def replace_missing_artwork(html: str) -> str:
    """Replace imgs whose artwork was never archived with honest notices."""
    for m in list(image_missing_srcs(html)):
        tag = m.group(0)
        w = re.search(r'\bwidth=(["\']?)(\d+)\1', tag, re.I)
        h = re.search(r'\bheight=(["\']?)(\d+)\1', tag, re.I)
        width = int(w.group(2)) if w else 138
        height = int(h.group(2)) if h else 173
        if re.search(r'class\s*=\s*(["\'])primary\1', tag, re.I):
            repl = (
                '<div class="primary restoration-missing" style="width:197px;height:484px;'
                'position:absolute;left:-90px;top:25px;z-index:1;">'
                "<strong>Under restoration</strong><span>This career artwork was not preserved in the archive.</span></div>"
            )
        elif re.search(r'-sm[_\w-]*\.(?:png|gif|jpg|jpeg)', m.group(2), re.I) or width < 90:
            repl = ""  # small "see the doll" icons: the sprite button keeps its label
        else:
            repl = (
                f'<div class="restoration-missing small" style="width:{width}px;height:{height}px;">'
                "<strong>Under restoration</strong><span>Artwork not preserved in the archive.</span></div>"
            )
        html = html.replace(tag, repl, 1)
    return html


def build_game_area(html: str) -> str:
    """Replace the swfobject embed block with a Ruffle loader or a notice."""
    m = SWF_BLOCK_RE.search(html)
    if not m:
        return html
    swf_path = m.group("swf")
    fv_match = PATH_FLASHVAR_RE.search(m.group("fv"))
    game_path = fv_match.group(1) if fv_match else ""
    local_swf = OUT / swf_path.lower().lstrip("/")
    if local_swf.is_file() and local_swf.stat().st_size > 0:
        params = {
            "uid": "153",
            "oauthKey": "normal",
            "oauthSecret": "user",
            "language": "en_US",
            "path": f"{ORIG}{game_path}".lower(),
        }
        cfg_local = OUT / f"{game_path}/data/config.xmlx".lower().lstrip("/")
        if cfg_local.is_file():
            params["config"] = f"{ORIG}{game_path}/data/config.xmlx".lower()
        params_js = "{" + ",".join(f"{k}:{json.dumps(v)}" for k, v in params.items()) + "}"
        swf_url = f"{ORIG}{swf_path}".lower()
        loader = f"""
<script>
(function(){{
    var container = null;
    var params = {params_js};
    var url = '{swf_url}';
    function boot(){{
        if (!container) {{ container = document.getElementById('flashgame'); }}
        if (!container || !window.RufflePlayer || typeof window.RufflePlayer.newest !== 'function') {{ setTimeout(boot, 100); return; }}
        container.innerHTML = '';
        var p = window.RufflePlayer.newest().createPlayer();
        p.style.width = '760px'; p.style.height = '480px';
        container.appendChild(p);
        var api = p.ruffle();
        try {{ api.volume = 0; }} catch (e) {{}}
        api.load({{ url: url, parameters: params, base: location.origin + '/' }}).then(function() {{
            try {{ api.volume = 0; }} catch (e) {{}}
        }});
    }}
    boot();
}})();
</script>"""
        html = html.replace(m.group(0), loader, 1)
        # ruffle runtime + config into <head>
        html = html.replace("</head>", RUFFLE_HEAD + "\n\t</head>", 1)
    else:
        notice = """
<script>
(function(){
    var container = null;
    function boot(){
        if (!container) { container = document.getElementById('flashgame'); }
        if (!container) { setTimeout(boot, 100); return; }
        var d = document.createElement('div');
        d.className = 'restoration-missing';
        d.style.height = '380px';
        d.innerHTML = '<strong>This game is under restoration</strong><span>The original game files were not preserved in the Internet Archive. The game area keeps its original size.</span>';
        container.insertBefore(d, container.firstChild);
    }
    boot();
})();
</script>"""
        html = html.replace(m.group(0), notice, 1)
    return html


def build_video_area(html: str) -> str:
    notice = ('<div class="restoration-missing" style="width:320px;height:240px;">'
              "<strong>Video under restoration</strong>"
              "<span>The original videos were streamed by a service that was never archived.</span></div>")
    return VIDEO_RE.sub(notice, html, count=1)


def build_dolls_area(html: str, page_slug: str) -> str:
    """Dolls pages: fill image slots whose artwork was never archived."""
    missing = list(image_missing_srcs(html))
    if not missing:
        return html
    if page_slug == "en_us-dolls-president" or page_slug == "en_us-dolls-president.html":
        # every artwork layer is missing: one notice panel in the container
        for m in missing:
            html = html.replace(m.group(0), "", 1)
        notice = (
            '<div class="imgPos" style="width:990px;height:600px;">'
            '<div class="restoration-missing" style="width:956px;height:500px;margin:20px auto;">'
            "<strong>This doll page is under restoration</strong>"
            "<span>The original artwork for the President page was not preserved in the archive.</span></div></div>"
        )
        html = re.sub(r'(<div id="dolls-container">.*?)(<div id="doll-buttons")', r"\1" + notice + r"\2", html, flags=re.DOTALL)
        return html
    # team page: backdrop missing, doll layers present
    for m in missing:
        tag = m.group(0)
        if "Team_landing_BG" in tag:
            repl = (
                '<div class="restoration-missing" style="width:990px;height:600px;">'
                "<strong>Under restoration</strong>"
                "<span>The original Team Barbie backdrop image was not preserved in the archive.</span></div>"
            )
            html = html.replace(tag, repl, 1)
    return html


def build_page(slug: str, source: Path, target: Path) -> None:
    html = source.read_text(encoding="utf-8", errors="replace")
    for pattern in REMOVALS:
        html = re.sub(pattern, "", html, flags=re.DOTALL)
    # local jQuery instead of the Google CDN copy
    html = re.sub(
        r'<script[^>]*src="//ajax\.googleapis\.com/ajax/libs/jquery/1\.6\.2/jquery\.min\.js"></script>\s*<script>\s*window\.jQuery \|\| document\.write\([^)]*\)\s*</script>',
        f'<script type="text/javascript" src="{ORIG}/resources/js/libs/jquery-1.6.2.min.js"></script>',
        html, flags=re.DOTALL,
    )
    html = rewrite_paths(html)

    kind = ""
    if slug.startswith("en_us-games-") and not slug.startswith(("en_us-games-index", "en_us-games-category")):
        kind = "game"
    elif slug.startswith(("en_us-videos-", "en_us-videos-")):
        kind = "video"
    elif slug.startswith("en_us-dolls-"):
        kind = "dolls"

    if kind == "game":
        html = build_game_area(html)
        html = replace_missing_artwork(html)  # assoc-games thumbs with unrecovered art
    elif kind == "video":
        html = build_video_area(html)
    elif kind == "dolls":
        html = build_dolls_area(html, slug)
    else:
        html = replace_missing_artwork(html)

    html = html.replace("</head>", HEAD_STYLE + "\n\t</head>", 1)
    html = html.replace("</body>", TAIL_SCRIPTS + "\n\t</body>", 1)

    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(html, encoding="utf-8")
    print(f"built {target.relative_to(OUT)}  ({kind or 'static'})")


def main() -> None:
    inventory = json.loads((PAGES / "inventory.json").read_text())
    skip = {"en_us-index.html", "en_us-help.html", "en_us-gotacode.html"}
    built = 0
    for item in inventory:
        path = item["path"]
        slug = path.strip("/").lower().replace(".html", "").replace(".aspx", "").replace("/", "-") + ".html"
        if slug in skip:
            continue
        source = PAGES / slug
        if not source.is_file():
            print(f"MISSING source for {path} ({slug})")
            continue
        # canonical lowercase output path (matches the June 2013 lowercase links)
        out_rel = path.strip("/").lower()
        if out_rel.endswith("/"):
            out_rel += "index.html"
        target = OUT / out_rel
        build_page(slug, source, target)
        built += 1
    print(f"\n{built} pages built under public/_original/icanbe.barbie.com/")


if __name__ == "__main__":
    main()

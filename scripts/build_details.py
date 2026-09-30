"""Recover and inventory presentation frames for linked original detail pages."""
import concurrent.futures, hashlib, html, json, pathlib, re, subprocess, urllib.parse
ROOT=pathlib.Path(__file__).resolve().parent.parent
catalog=(ROOT/'public/sections/catalog-data.js').read_text()
catalog=json.loads(catalog[catalog.index('{'):].rstrip().rstrip(';'))
urls={}
for section in catalog.values():
    for card in section['cards']:
        u=urllib.parse.urlsplit(card['href'])
        if not u.netloc or u.netloc=='www.barbie.com':
            urls.setdefault(u.path,card['title'])
for path,title in [('/activities/fashion/hair/','Snip ’n Style Salon'),('/activities/fashion/fashionistas/','Fashionistas'),('/activities/fashion/makeover/makeover.aspx','Superstar Makeovers'),('/activities/friends/sisters-and-pets/','Sisters & Pets'),('/activities/friends/bmail/','Barbie Email'),('/activities/friends/soinstyle/index.aspx','So In Style')]: urls[path]=title
out=ROOT/'research/details';out.mkdir(parents=True,exist_ok=True)

def inspect(item):
    path,title=item
    dest=out/(hashlib.sha1(path.encode()).hexdigest()[:12]+'.html')
    url='https://web.archive.org/web/20130628161553id_/http://www.barbie.com'+path
    result=subprocess.run(['curl','-L','--retry','2','--retry-all-errors','--max-time','35','-sS','-w','%{http_code}\n%{url_effective}',url,'-o',str(dest)],capture_output=True,text=True)
    text=dest.read_text(errors='replace') if dest.exists() else ''
    ok=result.returncode==0 and result.stdout.startswith('200') and 'swfobject' in text
    record={'path':path,'title':title,'source':url,'resolved':result.stdout.splitlines()[-1] if result.stdout else '', 'research':str(dest.relative_to(ROOT)),'recovered':ok}
    if ok:
        text=re.sub(r'<!--.*?-->','',text,flags=re.S)
        embeds=re.findall(r'''embedSWF\(\s*['"]([^'"]+)['"]\s*,\s*['"][^'"]+['"]\s*,\s*['"]?(\d+)['"]?\s*,\s*['"]?(\d+)''',text)
        embeds=[e for e in embeds if not e[0].startswith('/global/')]
        if embeds:
            swf,w,h=embeds[0];record.update(swf=urllib.parse.urljoin(path,swf),width=int(w),height=int(h))
        record['classic']='bgrnd_activities.gif' in text
        record['section']=next(iter(re.findall(r'barbie_nav_new.swf\?cat=([^"\s]+)',text)),'fun_games')
        record['background']=next(iter(re.findall(r'background:\s*url\((/images/header/[^)]+)\)',text)),'/images/header/barbiebg.jpg')
    print(('OK ' if ok else 'MISSING ')+path,flush=True)
    return record

if __name__=='__main__':
    results=list(concurrent.futures.ThreadPoolExecutor(max_workers=2).map(inspect,urls.items()))
    (ROOT/'public/sections/detail-data.json').write_text(json.dumps(results,indent=2)+'\n')

// Scene data stays separate from the carousel controller. Positions are measured
// against the 1920 x 1080 reference supplied in carrossel/Welcome/reference.png.
const welcome = {
  id: 'welcome',
  enabled: true,
  duration: 10000,
  background: '/carousel/welcome/background.png',
  elements: [
    {id:'character', type:'image', file:'element 3.png', x:-5,y:-4,w:900,z:2,delay:0,entrance:'from-left'},
    {id:'pink-heart-top', type:'image', file:'element 5.png', x:177,y:30,w:166,z:3,delay:180},
    {id:'silver-heart-left', type:'image', file:'element 11.png', x:88,y:101,w:72,z:3,delay:220},
    {id:'silver-star-top', type:'image', file:'element 12.png', x:526,y:51,w:100,z:3,delay:250},
    {id:'purple-star-top', type:'image', file:'element 8.png', x:880,y:110,w:108,z:3,delay:280},
    {id:'purple-star-corner', type:'image', file:'element 8.png', x:1270,y:0,w:116,z:3,delay:340},
    {id:'purple-star-right', type:'image', file:'element 8.png', x:1740,y:54,w:100,z:3,delay:400},
    {id:'pink-heart-left', type:'image', file:'element 4.png', x:75,y:930,w:106,z:3,delay:470},
    {id:'purple-star-left', type:'image', file:'element 8.png', x:66,y:640,w:130,z:3,delay:510},
    {id:'silver-star-left', type:'image', file:'element 12.png', x:28,y:548,w:83,z:3,delay:550},
    {id:'pink-heart-middle', type:'image', file:'element 4.png', x:675,y:789,w:110,z:3,delay:600},
    {id:'silver-heart-middle', type:'image', file:'element 11.png', x:870,y:781,w:172,z:3,delay:640},
    {id:'pink-heart-right', type:'image', file:'element 4.png', x:1590,y:294,w:106,z:7,delay:680},
    {id:'pink-star-right', type:'image', file:'element 10.png', x:1743,y:255,w:187,z:7,delay:720},
    {id:'window', type:'image', file:'element 2.png', x:1245,y:523,w:645,z:4,delay:900,entrance:'zoom',tilt:2},
    {id:'question', type:'text', text:'Remember spending hours\nplaying Barbie games after school?', className:'welcome-question', x:970,y:104,w:900,z:5,delay:450,entrance:'from-top',tilt:-1},
    {id:'title', type:'text', text:'Welcome back', className:'welcome-title', x:652,y:269,w:1270,z:5,delay:1100,entrance:'glitter-reveal',tilt:4},
    {id:'subtitle', type:'text', text:'to old and\nnostalgic', className:'welcome-subtitle', x:800,y:475,w:465,z:5,delay:1650,entrance:'glitter-reveal',tilt:-4},
    {id:'barbiecom', type:'text', text:'Barbie.com!', className:'welcome-barbiecom', x:744,y:657,w:590,z:5,delay:2200,entrance:'glitter-reveal',tilt:1},
    {id:'credit', type:'text', text:'A fan-made revival of the classic Barbie.com experience.', className:'welcome-credit', x:741,y:960,w:1170,z:6,delay:2100,entrance:'from-bottom',tilt:-1}
  ]
};

export default welcome;

export function renderWelcome(host) {
  host.classList.add('scene-carousel');
  const frame = document.createElement('div');
  frame.className = 'scene-frame';
  frame.setAttribute('aria-label', 'Welcome to the Barbie.com revival');
  const stage = document.createElement('div');
  stage.className = 'scene-stage';
  const paint = () => {
    stage.replaceChildren();
    for (const item of welcome.elements) {
      const element = document.createElement(item.type === 'image' ? 'img' : 'div');
      element.className = `scene-element entry-${item.entrance || 'pop'} ${item.type === 'image' && !item.entrance ? 'welcome-sticker' : ''} ${item.className || ''}`;
      element.style.cssText = `left:${item.x}px;top:${item.y}px;width:${item.w}px;z-index:${item.z};--entry-delay:${item.delay}ms;rotate:${item.tilt || 0}deg`;
      if (item.type === 'image') {
        element.src = `/carousel/welcome/${encodeURIComponent(item.file)}`;
        element.alt = '';
        element.draggable = false;
      } else if (item.entrance === 'glitter-reveal') {
        const line = document.createElement('span');
        line.className = 'welcome-glitter-line';
        line.style.setProperty('--line-delay', `${item.delay}ms`);
        const ink = document.createElement('span');
        ink.className = 'welcome-glitter-ink';
        ink.textContent = item.text;
        const sparkles = document.createElement('span');
        sparkles.className = 'welcome-glitter-sparkles';
        sparkles.setAttribute('aria-hidden', 'true');
        let seed = 1409 + item.delay;
        const random = () => {
          seed = (seed * 1664525 + 1013904223) >>> 0;
          return seed / 4294967296;
        };
        for (let particleIndex = 0; particleIndex < 44; particleIndex++) {
          const particle = document.createElement('i');
          const star = particleIndex % 4 === 0;
          particle.className = `welcome-glitter-particle ${star ? 'is-star' : 'is-dot'}`;
          particle.style.cssText = `--particle-x:${(random() * 100).toFixed(1)}%;--particle-y:${(random() * 100).toFixed(1)}%;--particle-size:${Math.round(star ? 20 + random() * 18 : 8 + random() * 13)}px;--particle-delay:${Math.round(-random() * 1000)}ms;--particle-duration:${Math.round(550 + random() * 550)}ms;--particle-drift:${Math.round(5 + random() * 12)}px`;
          sparkles.append(particle);
        }
        line.append(ink, sparkles);
        element.append(line);
      } else {
        element.textContent = item.text;
      }
      stage.append(element);
    }
  };
  paint();
  frame.append(stage);
  host.append(frame);
  const resize = () => {
    const scale = Math.min(frame.clientWidth / 1920, frame.clientHeight / 1080);
    stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
  };
  new ResizeObserver(resize).observe(frame);
  resize();
  return () => { stage.replaceChildren(); frame.remove(); };
}

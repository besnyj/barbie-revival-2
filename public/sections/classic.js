import { attachGameFullscreen } from '../components/game-fullscreen.js';

export async function renderClassic(main, kind, movie) {
  document.body.classList.add('classic-page');
  document.body.classList.toggle('fashion-page',kind==='fashion');
  document.body.classList.toggle('friends-page',kind==='friends');
  document.getElementById('background').style.backgroundImage="url('/images/header/barbiebg.jpg')";
  const stage=document.createElement('div');stage.className='classic-stage';
  const room=document.createElement('div');room.className='classic-room';
  stage.append(room);main.append(stage);
  window.topModelPopup=()=>document.getElementById('restoration').showModal();
  const file=kind==='fashion'?'fashioncloset_landing.swf':'friendsbedroom_landing.swf';
  const player=await movie(room,`/activities/${kind}/${file}`,950,950*326/641,{domain:'*'});
  player.style.width='100%';
  player.style.height='100%';
  attachGameFullscreen(stage,room,{width:641,height:326});
}

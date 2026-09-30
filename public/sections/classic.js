export async function renderClassic(main, kind, movie) {
  document.body.classList.add('classic-page');
  document.getElementById('background').style.backgroundImage="url('/images/header/barbiebg.jpg')";
  const stage=document.createElement('div');stage.className='classic-stage';
  const room=document.createElement('div');room.className='classic-room';
  stage.append(room);main.append(stage);
  window.topModelPopup=()=>document.getElementById('restoration').showModal();
  const file=kind==='fashion'?'fashioncloset_landing.swf':'friendsbedroom_landing.swf';
  await movie(room,`/activities/${kind}/${file}`,641,326,{domain:'*'});
}

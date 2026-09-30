export async function renderVideos(main,movie){
  document.getElementById('background').style.backgroundImage="url('/images/header/bgrnd-btv.jpg')";
  main.classList.add('videos-page');
  main.innerHTML='<div class="video-stage"><div class="video-scenery"></div><div class="video-screen"><div><h1>Under restoration</h1><p>Barbie TV will be back soon!</p></div></div></div><div class="video-catalog"><img class="video-tab" src="/activities/btv/images/videos_tab.png" alt="Videos"><div class="video-catalog-top"></div><div class="video-catalog-content"><p>Under restoration</p></div><div class="video-catalog-bottom"></div></div>';
  await movie(main.querySelector('.video-scenery'),'/activities/btv/video_bg.swf',990,390,{domain:'*'});
}

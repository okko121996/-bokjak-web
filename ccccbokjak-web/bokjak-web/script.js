// 이미지 파일명은 한글·특수문자가 포함되어도 안전하게 경로로 변환합니다.
const asset = (name) => `assets/${encodeURIComponent(name)}`;
const cloudsRoot=document.querySelector('#clouds');
const starsRoot=document.querySelector('#stars');
const petalsRoot=document.querySelector('#petals');
const stage=document.querySelector('#stage');

// 구름은 시작 위치와 투명도를 데이터로 관리해 화면 크기에 맞춰 이동시킵니다.
const cloudData=[
 ['img_39.png','left',-3,58,0.56],['img_09.png','left',-4,54,0.64],['img_12.png','left',-2,38,0.72],['img_07.png','left',-2,23,0.82],
 ['img_14.png','right',-4,32,0.57],['img_11.png','right',-4,52,0.62],['img_13.png','right',-3,47,0.69],['img_25.png','right',-4,25,0.78],['img_30.png','right',-3,65,0.88]
];
const cloudEls=[];
cloudData.forEach(([file,side,offset,top,opacity])=>{
 const img=document.createElement('img');
 const persistent=file==='img_07.png'||file==='img_30.png';
 img.className=persistent?'cloud color-mist':'cloud';
 img.src=asset(file);img.alt='';img.dataset.side=side;img.dataset.baseOpacity=opacity;
 img.dataset.persistent=String(persistent);
 img.style.top=top+'%';
 img.style.width=({'img_39.png':'60.6vw','img_09.png':'60.6vw','img_12.png':'39.2vw','img_07.png':'23.3vw','img_14.png':'65.1vw','img_11.png':'65.1vw','img_13.png':'60.6vw','img_25.png':'69.6vw','img_30.png':'25.1vw'})[file];
 img.style[side]=offset+'vw';img.style.opacity=opacity;
 cloudsRoot.appendChild(img);cloudEls.push(img)
});

// 별의 좌표와 크기를 고정해 밤하늘에 자연스러운 깊이를 만듭니다.
const starData=[['img_24.png',8,22],['img_10.png',22,17],['img_20.png',35,31],['img_21.png',15,44],['img_24.png',29,76],['img_20.png',42,19],['img_02.png',76,18],['img_37.png',88,30],['img_01.png',70,42],['img_02.png',82,72],['img_37.png',94,57],['img_01.png',61,24],['img_10.png',37,61],['img_37.png',65,82]];
starData.forEach(([file,x,y],i)=>{const img=document.createElement('img');img.className='star';img.src=asset(file);img.alt='';img.style.left=x+'%';img.style.top=y+'%';img.style.width=(7+(i%3)*2)+'px';img.style.animationDelay=i*.29+'s';starsRoot.appendChild(img)});

// 꽃은 각 나무 요소 내부에 배치해 가지의 흔들림을 함께 따라가게 합니다.
const flowerData=[
 ['img_35.png','left',42,60,6.0],['img_28.png','left',68,35,9.5],['img_19.png','left',63,70,7.0],['img_31.png','left',95,57,9.0],
 ['img_15.png','left',77,81,4.5],['img_36.png','left',56,92,4.0],['img_05.png','left',93,97,4.2],['img_40.png','left',92,20,10.0],
 ['img_33.png','left',76,62,4.0],
 ['img_26.png','right',31,44,8.0],['img_29.png','right',49,35,7.0],['img_18.png','right',40,65,3.6],
 ['img_32.png','right',50,75,4.5],['img_06.png','right',62,98,7.0],['img_34.png','right',17,52,5.0],
 ['img_22.png','right',15,88,7.5],['img_33.png','right',42,94,4.0],['img_04.png','right',63,65,10.0],
 ['img_36.png','right',78,67,4.4],['img_05.png','right',82,37,4.0]
];
flowerData.forEach(([file,side,x,y,w],i)=>{
 const anchor=document.createElement('div');anchor.className='flower-anchor';
 anchor.style.left=x+'%';anchor.style.top=y+'%';anchor.style.setProperty('--branch-delay', side==='left'?'0s':'-2s');
 const img=document.createElement('img');img.className='flower';img.src=asset(file);img.alt='';
 img.style.width=w+'vw';img.dataset.side=side;
 img.style.setProperty('--sway-delay',`${i*.13}s`);
 anchor.appendChild(img);
 document.querySelector(`.tree-${side}`).appendChild(anchor);
});
const petalFiles=['img_23.png','img_08.png','img_44.png'];

const petalCount=13;
const petalCycle=8.4;
const petalZones=[5,14,23,31,40,48,57,66,74,83,92];
const petalEls=[];
const petalResetters=new WeakMap();
const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,v));

// 꽃잎을 한곳에서 생성해 낙하·클릭·던지기 후에도 같은 수를 유지합니다.
function createPetal(i,delay=-(i*petalCycle/petalCount)){
 const img=document.createElement('img');
 img.className='petal';img.src=asset(petalFiles[i%petalFiles.length]);img.alt='';
 img.draggable=false;
 img.dataset.petalIndex=String(i);
 img.style.width='clamp(14px,1.6vw,26px)';
 const zoneIndex=(i*7)%petalZones.length;
 img.style.left=(petalZones[zoneIndex]+((i*11)%5)-2)+'%';
 const duration=6.4+(i%6)*1.15;
 img.style.setProperty('--duration',duration+'s');
 img.style.setProperty('--delay',`${delay}s`);
 const baseDrift=(i%2?1:-1)*(28+(i%5)*13);
 img.dataset.baseDrift=String(baseDrift);
 img.style.setProperty('--wind','0px');
 img.style.setProperty('--drift',baseDrift+'px');
 img.style.setProperty('--spin',(i%2?1:-1)*(180+(i%4)*90)+'deg');
 let replaced=false;
 const replacePetal=()=>{
  if(replaced||!img.isConnected) return;
  replaced=true;
  const replacement=createPetal(i,0);
  img.replaceWith(replacement);
  petalEls[i]=replacement;
 };
 petalResetters.set(img,replacePetal);
 img.addEventListener('animationend',event=>{
  if(event.animationName!=='petal-pop'&&event.animationName!=='petal-toss') return;
  replacePetal();
 });
 petalsRoot.appendChild(img);
 return img;
}
for(let i=0;i<petalCount;i++) petalEls.push(createPetal(i));

// 포인터가 실제로 닿은 꽃잎에만 낮은 감도의 바람을 적용합니다.
let previousPointerX=null;
stage.addEventListener('pointermove',event=>{
 const deltaX=previousPointerX===null?0:event.clientX-previousPointerX;
 previousPointerX=event.clientX;
 const touchedElement=document.elementFromPoint(event.clientX,event.clientY);
 const touchedPetal=touchedElement instanceof Element?touchedElement.closest('.petal'):null;
 for(const petal of petalEls){
  const wind=petal===touchedPetal&&!petal.classList.contains('dragging')?clamp(deltaX*.18,-12,12):0;
  petal.style.setProperty('--wind',`${wind}px`);
 }
});
stage.addEventListener('pointerleave',()=>{
 previousPointerX=null;
 for(const petal of petalEls) petal.style.setProperty('--wind','0px');
});

// 짧은 좌클릭은 기존 팡 효과로, 길게 누른 제스처는 꽃잎 던지기로 분리합니다.
const longPressDelay=240;
const dragStartTolerance=9;
let activePetalGesture=null;
petalsRoot.addEventListener('pointerdown',event=>{
 if(event.button!==0||!(event.target instanceof Element)) return;
 const petal=event.target.closest('.petal');
 if(!petal||petal.classList.contains('popping')||petal.classList.contains('tossing')) return;

 const gesture={
  petal,
  pointerId:event.pointerId,
  startX:event.clientX,
  startY:event.clientY,
  x:event.clientX,
  y:event.clientY,
  lastX:event.clientX,
  lastY:event.clientY,
  lastTime:performance.now(),
  velocityX:0,
  velocityY:0,
  dragging:false,
  timer:0
 };
 activePetalGesture=gesture;
 gesture.timer=window.setTimeout(()=>{
  if(activePetalGesture!==gesture||!petal.isConnected) return;
  gesture.dragging=true;
  petal.classList.add('dragging');
  petal.style.animationDelay='0s';
  petal.style.left=`${gesture.x-petalsRoot.getBoundingClientRect().left}px`;
  petal.style.top=`${gesture.y-petalsRoot.getBoundingClientRect().top}px`;
 },longPressDelay);
});

window.addEventListener('pointermove',event=>{
 const gesture=activePetalGesture;
 if(!gesture||event.pointerId!==gesture.pointerId) return;
 gesture.x=event.clientX;
 gesture.y=event.clientY;
 const moved=Math.hypot(gesture.x-gesture.startX,gesture.y-gesture.startY);
 if(!gesture.dragging&&moved>dragStartTolerance){
  window.clearTimeout(gesture.timer);
  activePetalGesture=null;
  return;
 }
 if(!gesture.dragging) return;

 const now=performance.now();
 const elapsed=Math.max(1,now-gesture.lastTime);
 gesture.velocityX=clamp((gesture.x-gesture.lastX)/elapsed,-1.8,1.8);
 gesture.velocityY=clamp((gesture.y-gesture.lastY)/elapsed,-1.8,1.8);
 gesture.lastX=gesture.x;
 gesture.lastY=gesture.y;
 gesture.lastTime=now;
 gesture.petal.style.left=`${gesture.x-petalsRoot.getBoundingClientRect().left}px`;
 gesture.petal.style.top=`${gesture.y-petalsRoot.getBoundingClientRect().top}px`;
});

window.addEventListener('pointerup',event=>{
 const gesture=activePetalGesture;
 if(!gesture||event.pointerId!==gesture.pointerId) return;
 window.clearTimeout(gesture.timer);
 activePetalGesture=null;
 if(!gesture.dragging) return;

 const petal=gesture.petal;
 petal.dataset.suppressClick='true';
 window.setTimeout(()=>delete petal.dataset.suppressClick,500);
 petal.classList.remove('dragging');
 petal.classList.add('tossing');
 petal.style.setProperty('--throw-x',`${clamp(gesture.velocityX*150,-220,220)}px`);
 petal.style.setProperty('--throw-y',`${clamp(gesture.velocityY*150-55,-220,180)}px`);
 window.setTimeout(()=>{
  const resetPetal=petalResetters.get(petal);
  if(resetPetal) resetPetal();
 },900);
});

window.addEventListener('pointercancel',event=>{
 const gesture=activePetalGesture;
 if(!gesture||event.pointerId!==gesture.pointerId) return;
 window.clearTimeout(gesture.timer);
 if(gesture.dragging){
  const resetPetal=petalResetters.get(gesture.petal);
  if(resetPetal) resetPetal();
 }
 activePetalGesture=null;
});

// 짧은 클릭은 꽃잎을 터뜨리고 입자와 원형 빛을 만든 뒤 다시 낙하에 합류시킵니다.
petalsRoot.addEventListener('click',event=>{
 const target=event.target;
 if(!(target instanceof Element)) return;
 const petal=target.closest('.petal');
 if(petal?.dataset.suppressClick){
  delete petal.dataset.suppressClick;
  event.preventDefault();
  return;
 }
 if(!petal||petal.classList.contains('popping')) return;
 event.preventDefault();
 const transform=getComputedStyle(petal).transform;
 petal.style.setProperty('--pop-from',transform==='none'?'translate3d(0,0,0)':transform);
 petal.classList.add('popping');
 window.setTimeout(()=>{
  const resetPetal=petalResetters.get(petal);
  if(resetPetal) resetPetal();
 },700);

 const stageBounds=stage.getBoundingClientRect();
 const burst=document.createElement('span');
 burst.className='petal-burst';
 burst.style.left=`${event.clientX-stageBounds.left}px`;
 burst.style.top=`${event.clientY-stageBounds.top}px`;
 for(let i=0;i<8;i++){
  const particle=document.createElement('span');
  const angle=(Math.PI*2*i)/8;
  particle.className='petal-burst-particle';
  particle.style.setProperty('--burst-x',`${Math.cos(angle)*34}px`);
  particle.style.setProperty('--burst-y',`${Math.sin(angle)*34}px`);
  burst.appendChild(particle);
 }
 petalsRoot.appendChild(burst);
 let burstRemoved=false;
 const removeBurst=()=>{
  if(burstRemoved) return;
  burstRemoved=true;
  burst.remove();
 };
 burst.addEventListener('animationend',removeBurst,{once:true});
 window.setTimeout(removeBurst,700);
});

// 애니메이션 프레임마다 구름 이동과 안개처럼 사라지는 효과를 갱신합니다.
let cloudProgress=0;
let cloudStartTime=null;
// 투명도가 높은 구름부터 짧은 간격으로 연속해서 이동하고 페이드아웃합니다.
const cloudDuration=4000;
const sortedClouds=[...cloudEls].sort((a,b)=>Number(a.dataset.baseOpacity)-Number(b.dataset.baseOpacity));
const cloudOrder=new Map(sortedClouds.map((el,i)=>[el,i]));
function paintClouds(){
 cloudEls.forEach((el,i)=>{
  const order=cloudOrder.get(el) ?? i;
  const delay=order*0.085;
  const local=clamp((cloudProgress-delay)/(0.96-delay));
  const side=el.dataset.side==='left'?-1:1;
  if(el.dataset.persistent==='true'){
   el.style.opacity=String(Number(el.dataset.baseOpacity));
   el.style.filter='blur(3px)';
   return;
  }
  const width=el.getBoundingClientRect().width||window.innerWidth*.4;
  const eased=local*local*(3-2*local);
  const distance=(window.innerWidth*1.12+width)*eased;
  const lift=Math.sin(local*Math.PI)*window.innerHeight*.018;
  el.style.transform=`translate3d(${side*distance}px,${(i%2?1:-1)*lift}px,0)`;
  const fade=clamp(local/0.72);
  const fadeEase=fade*fade*(3-2*fade);
  el.style.opacity=String(Number(el.dataset.baseOpacity)*(1-fadeEase));
  el.style.filter=`blur(${fadeEase*5}px)`;
 });
 stage.querySelector('.scene-camera').style.setProperty('--camera-zoom',String(1+cloudProgress*.116));
 stage.querySelector('.moon').style.setProperty('--reveal-scale',String(.86+cloudProgress*.1150));
 stage.querySelectorAll('.tree').forEach(tree=>{
  tree.style.setProperty('--reveal-scale',String(.91+cloudProgress*.138));
 });
 stage.classList.toggle('clouds-cleared',cloudProgress>=1);
}

let transitionInProgress=false;
function runDoorTransition(showHome){
 if(transitionInProgress) return;
 transitionInProgress=true;
 if(showHome) navigateHome('home');
 document.body.classList.add('transition-started');
 stage.classList.remove('doors-closing','doors-closed','doors-opening');
 stage.classList.add('doors-visible');

 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  stage.classList.add('doors-closing');
 }));
 window.setTimeout(()=>{
  stage.classList.add('doors-closed');
  stage.classList.toggle('main-screen-shown',showHome);
  document.body.classList.toggle('main-screen-shown',showHome);
 },1200);
 window.setTimeout(()=>{
  if(!showHome) restartCloudReveal();
  stage.classList.add('doors-opening');
 },1900);
 window.setTimeout(()=>{
  stage.classList.remove('doors-visible','doors-closing','doors-closed','doors-opening');
  document.body.classList.remove('transition-started');
  transitionInProgress=false;
 },3100);
}

document.querySelector('#moon').addEventListener('click',()=>runDoorTransition(true));
document.querySelector('#homeLogoButton').addEventListener('click',()=>runDoorTransition(false));
document.querySelector('#introHomeButton').addEventListener('click',()=>{
 if(stage.classList.contains('main-screen-shown')) runDoorTransition(false);
});

const homeScreen=document.querySelector('#homeScreen');
const homeBrandImage=document.querySelector('.home-brand img');
const homeHeader=document.querySelector('.home-header');
const pageViews={
 home:document.querySelector('.home-hero'),
 characters:document.querySelector('.characters-view'),
 rabbit:document.querySelector('.rabbit-view'),
 best:document.querySelector('.coming-view'),
 new:document.querySelector('.coming-view'),
 category:document.querySelector('.coming-view')
};
function navigateHome(view){
 const theme=view==='characters'?'dark':'light';
 homeScreen.dataset.view=view;
 homeScreen.dataset.theme=theme;
 homeBrandImage.src=theme==='dark'?'assets/img_27.png':'assets/img_47.png';
 const showsCharacterPage=['home','characters'].includes(view);
 pageViews.home.hidden=!showsCharacterPage;
 pageViews.characters.hidden=!showsCharacterPage;
 pageViews.rabbit.hidden=view!=='rabbit';
 pageViews.best.hidden=!['best','new','category'].includes(view);
 const comingTitle=document.querySelector('.coming-view h1');
 comingTitle.textContent={best:'베스트',new:'NEW',category:'카테고리'}[view]||'';
 document.querySelectorAll('.home-menu a[data-view-link]').forEach(link=>{
  const active=link.dataset.viewLink===view;
  link.classList.toggle('active',active);
  if(active) link.setAttribute('aria-current','page');
  else link.removeAttribute('aria-current');
 });
 if(showsCharacterPage){
  const target=view==='characters'?pageViews.characters:homeScreen;
  const top=view==='characters'?target.offsetTop-homeHeader.offsetHeight:0;
  homeScreen.scrollTo({top,behavior:'smooth'});
 }else{
  homeScreen.scrollTo({top:0,behavior:'auto'});
 }
 if(view==='rabbit'){
  const rabbitView=pageViews.rabbit;
  rabbitView.classList.remove('carrots-falling');
  void rabbitView.offsetWidth;
  rabbitView.classList.add('carrots-falling');
 }
}
homeScreen.addEventListener('scroll',()=>{
 if(!['home','characters'].includes(homeScreen.dataset.view)) return;
 const atCharacters=pageViews.characters.getBoundingClientRect().top<=homeHeader.offsetHeight+homeScreen.clientHeight*.15;
 const view=atCharacters?'characters':'home';
 if(homeScreen.dataset.view===view) return;
 const theme=atCharacters?'dark':'light';
 homeScreen.dataset.view=view;
 homeScreen.dataset.theme=theme;
 homeBrandImage.src=theme==='dark'?'assets/img_27.png':'assets/img_47.png';
 document.querySelectorAll('.home-menu a[data-view-link]').forEach(link=>{
  const active=link.dataset.viewLink===view;
  link.classList.toggle('active',active);
  if(active) link.setAttribute('aria-current','page');
  else link.removeAttribute('aria-current');
 });
});
document.querySelectorAll('.home-menu a[data-view-link], .friend-card[data-view-link]').forEach(link=>{
 link.addEventListener('click',event=>{
  event.preventDefault();
  navigateHome(link.dataset.viewLink);
 });
});
document.querySelector('#rabbitShare').addEventListener('click',async()=>{
 const shareUrl=new URL(window.location.href);
 shareUrl.hash='rabbit';
 const status=document.querySelector('#rabbitShareStatus');
 try{
  if(navigator.clipboard?.writeText){
   await navigator.clipboard.writeText(shareUrl.href);
  }else{
   const input=document.createElement('textarea');
   input.value=shareUrl.href;
   input.setAttribute('readonly','');
   input.style.position='fixed';
   input.style.opacity='0';
   document.body.append(input);
   input.select();
   const copied=document.execCommand('copy');
   input.remove();
   if(!copied) throw new Error('링크 복사를 사용할 수 없습니다.');
  }
  status.textContent='토끼 프로필 링크를 복사했습니다.';
 }catch(error){
  status.textContent='프로필을 공유하지 못했습니다. 다시 시도해 주세요.';
 }
});

if(window.location.hash==='#rabbit'){
 stage.classList.add('main-screen-shown');
 document.body.classList.add('main-screen-shown');
 navigateHome('rabbit');
}

 let cloudAnimationFrame=null;
 function animateClouds(timestamp){
  if(cloudStartTime===null) cloudStartTime=timestamp;
  cloudProgress=clamp((timestamp-cloudStartTime)/cloudDuration);
  paintClouds();
  if(cloudProgress<1) cloudAnimationFrame=requestAnimationFrame(animateClouds);
  else cloudAnimationFrame=null;
 }
 function restartCloudReveal(){
  if(cloudAnimationFrame!==null) cancelAnimationFrame(cloudAnimationFrame);
  cloudProgress=0;
  cloudStartTime=null;
  paintClouds();
  cloudAnimationFrame=requestAnimationFrame(animateClouds);
 }
 window.addEventListener('resize',paintClouds);
 paintClouds();
 cloudAnimationFrame=requestAnimationFrame(animateClouds);

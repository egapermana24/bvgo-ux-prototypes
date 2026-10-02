// Reconstruction of the existing card feed, using sample content and local state only.
const samples=[
 {id:'ac',author:'Tim BV',role:'Operations',time:'15m ago',tag:'Property Maintenance',title:'Perbaikan AC kamar 2',body:['Halo Bapak/Ibu, AC di kamar 2 Villa Contoh tidak dingin. Tamu berikutnya akan check-in pukul 15.00.','Teknisi tersedia pukul 13.00 dengan estimasi biaya Rp350.000. Mohon tanggapannya agar perbaikan dapat segera dijadwalkan.'],positive:'Setuju',negative:'Diskusi',comments:[{id:'ac-comment',name:'Tim BV',avatar:'team',employee:true,text:'Kami menunggu konfirmasi untuk menjadwalkan teknisi.',time:'15min',likes:0,replies:[]}]},
 {id:'review',author:'Tim BV',role:'Guest Experience',time:'1h ago',tag:'Guest Review',title:'Ulasan tamu untuk Villa Contoh',body:['Villa Contoh menerima ulasan 1 bintang. Tamu menyampaikan bahwa kebersihan kamar mandi perlu ditingkatkan.','Kami menyarankan pemeriksaan bersama housekeeping. Silakan berikan tanggapan atau diskusikan dengan tim melalui komentar.'],comments:[]},
 {id:'options',author:'Tim BV',role:'Operations',time:'2h ago',tag:'Property Maintenance',title:'Jadwal pemeriksaan properti',body:['Halo Bapak/Ibu, kami ingin menjadwalkan pemeriksaan rutin Villa Contoh. Silakan pilih waktu yang sesuai.'],options:['Senin, pukul 10.00','Selasa, pukul 14.00'],comments:[]}
];
const model={index:0,detail:false,likes:{},selections:{},comments:{},optout:{}};
const main=document.getElementById('existing-content'),header=document.getElementById('existing-header'),nav=document.getElementById('existing-nav'),dialog=document.getElementById('existing-sheet'),status=document.getElementById('existing-status');
let navAnimations=[],pointer=null,ignoreClickUntil=0,lastWheel=0,modalFocus=null;
// Mirrors the vertical Flutter CardSwiper: 500ms linear settle, 0.9 scale,
// 40px back offset, 50px threshold, and a separate previous-card reveal.
const motion={mode:'idle',top:0,reveal:0,backScale:.9,backY:40,busy:false,frame:0};
const current=()=>samples[model.index];
let commentReply=null,commentAttachments=[],sheetGesture=null;
const expandedReplies=new Set();
const commentsFor=()=>model.comments[current().id]||current().comments;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const img=name=>`<img src="${name}.svg" alt="">`;
const glyph=name=>`<span class="existing-glyph" aria-hidden="true" style="--glyph:url('${name}.svg')"></span>`;
function avatar(name,key='team',extra=''){return `<span class="profile-photo ${extra}" role="img" aria-label="Foto profil ${esc(name)}"><span aria-hidden="true">${esc(name.split(/\s+/).slice(0,2).map(n=>n[0]).join(''))}</span><img src="${key}.jpg" alt="" onerror="this.hidden=true"></span>`;}
function authors(item){return `<div class="existing-author">${avatar(item.author)}<div class="author-copy"><strong>${item.author}<span class="role"> • ${item.role}</span></strong><small>${item.time}</small></div><button class="icon-button" data-do="options" aria-label="Opsi Action">${img('option')}</button></div><div class="existing-tag">${item.tag}</div>`;}
function responses(item){const like=model.likes[item.id],comments=(model.comments[item.id]||item.comments).reduce((n,c)=>n+1+(c.replies?.length||0),0);const up=like==='up'?'thumb_up_fill':'thumb_up',down=like==='down'?'thumb_down_fill':'thumb_down';return `<div class="existing-response">${item.positive?`<div class="toggle-row"><button class="existing-toggle positive" data-do="up" aria-pressed="${like==='up'}" style="--label-length:${item.positive.length}">${glyph(up)}${item.positive}</button><button class="existing-toggle" data-do="down" aria-pressed="${like==='down'}" style="--label-length:${item.negative.length}">${glyph(down)}${item.negative}</button></div><button class="existing-comments" data-do="comments">${glyph('comment_icon')}Comments • ${comments}</button>`:`<div class="existing-icons"><button data-do="up" aria-label="Suka" aria-pressed="${like==='up'}">${glyph(up)}<span>${like==='up'?1:0}</span></button><button data-do="down" aria-label="Tidak suka" aria-pressed="${like==='down'}">${glyph(down)}<span>${like==='down'?1:0}</span></button><button data-do="comments" aria-label="Komentar">${glyph('comment_icon')}<span>${comments}</span></button></div>`}</div>`;}
function widget(item){return item.options?`<div class="existing-widget"><h3>Pilih jadwal pemeriksaan</h3>${item.options.map((v,i)=>`<button class="option" data-selection="${i}" aria-pressed="${model.selections[item.id]===i}">${v}${model.selections[item.id]===i?' ✓':''}</button>`).join('')}</div>`:'';}
function cardContents(item){return `<div>${authors(item)}</div><h2 class="existing-title">${item.title}</h2><div class="existing-copy">${item.body.map(p=>`<p>${p}</p>`).join('')}</div>${widget(item)}${responses(item)}`;}
function fitDeck(){const deck=main.querySelector('.deck');if(!deck)return;const width=Math.min(main.clientWidth-32,Math.max(0,main.clientHeight-40)*9/16);deck.style.setProperty('--deck-width',width+'px');deck.style.setProperty('--deck-height',width*16/9+'px');}
function drawNav(){navAnimations.forEach(a=>a.destroy());navAnimations=[];nav.hidden=model.detail;if(model.detail){nav.innerHTML='';return;}nav.innerHTML=[['action_active','Actions'],['calendar','Calendar'],['home','My Property'],['inbox','Inbox'],['menu','Partner']].map(([name,label])=>`<button class="nav-item" ${name==='action_active'?'aria-current="page" data-do="home"':'disabled title="Di luar cakupan prototype"'}><span class="nav-icon" data-animation="${name}">${name==='menu'?avatar('Anda','partner','nav-profile'):''}</span><span>${label}</span></button>`).join('');nav.querySelectorAll('[data-animation]').forEach(el=>{const name=el.dataset.animation;if(name==='menu')return;const a=lottie.loadAnimation({container:el,renderer:'svg',loop:false,autoplay:false,animationData:structuredClone(window.BVNavigation[name])});a.goToAndStop(name==='action_active'?a.totalFrames-1:0,true);navAnimations.push(a);});}
function cardLayer(item,layer){return `<article class="existing-card" data-layer="${layer}" ${layer==='front'?`aria-label="${item.title}"`:'aria-hidden="true" inert'}>${!model.likes[item.id]?'<span class="unanswered-dot" aria-hidden="true"></span>':''}${cardContents(item)}</article>`;}
function syncControls(){
  document.getElementById('previous').disabled=model.detail||motion.busy||model.index===0;
  document.getElementById('next').disabled=model.detail||motion.busy||model.index===samples.length-1;
}
function render(){
  const item=current();
  header.innerHTML=model.detail?`<div class="subheader"><button class="icon-button back" data-do="back" aria-label="Kembali ke feed">${img('left-arrow')}</button></div>`:'<div class="brand-row"><img class="logo" src="bvgo.png" alt="BVGO"></div>';
  main.className=model.detail?'detail-mode':'feed-mode';
  main.innerHTML=model.detail?cardContents(item):`<div class="deck" tabindex="0" role="group" aria-label="Action ${model.index+1} dari ${samples.length}. Geser ke atas atau bawah, atau gunakan tombol panah.">${samples[model.index+1]?cardLayer(samples[model.index+1],'back'):''}${cardLayer(item,'front')}${samples[model.index-1]?cardLayer(samples[model.index-1],'previous'):''}</div>`;
  drawNav();fitDeck();paintMotion();syncControls();
  document.getElementById('position').textContent=`${model.index+1} / ${samples.length}`;
}
function paintMotion(){
  const deck=main.querySelector('.deck');if(!deck)return;
  const height=deck.clientHeight;
  const progress=height?Math.min(1,motion.reveal/height):0;
  const down=motion.mode==='down';
  deck.dataset.motion=motion.busy?'settling':motion.mode;
  deck.querySelector('[data-layer="front"]').style.transform=down?`translateY(${40*progress}px) scale(${1-.1*progress})`:`translateY(${motion.top}px)`;
  const back=deck.querySelector('[data-layer="back"]');
  if(back)back.style.transform=`translateY(${motion.backY}px) scale(${motion.backScale})`;
  const previous=deck.querySelector('[data-layer="previous"]');
  if(previous){previous.style.visibility=down?'visible':'hidden';previous.style.transform=`translateY(${-height+motion.reveal}px)`;}
}
function resetMotion(){
  cancelAnimationFrame(motion.frame);
  Object.assign(motion,{mode:'idle',top:0,reveal:0,backScale:.9,backY:40,busy:false,frame:0});
  paintMotion();syncControls();
}
function moveCard(dy){
  const height=main.querySelector('.deck').clientHeight;
  if(motion.mode==='down'||(dy>0&&model.index>0&&Math.abs(motion.top)<1)){
    motion.mode='down';motion.reveal=Math.max(0,Math.min(height,motion.reveal+dy));
    if(motion.reveal===0&&dy<0){motion.mode='up';motion.top=dy;}
  }else{
    // No previous card at the beginning; no wrapping at either end of this demo.
    motion.mode='up';motion.top=Math.min(0,motion.top+dy);
  }
  motion.backScale=Math.min(1,.9+Math.abs(motion.top)/5000);
  motion.backY=40-Math.abs(motion.top)/10;
  paintMotion();
}
function settle(commit){
  const deck=main.querySelector('.deck');if(!deck)return;
  const down=motion.mode==='down';
  const delta=down?-1:1;
  commit=commit&&Boolean(samples[model.index+delta]);
  const from={top:motion.top,reveal:motion.reveal,backScale:motion.backScale,backY:motion.backY};
  const to=down?{...from,reveal:commit?deck.clientHeight:0}:{...from,top:commit?-document.getElementById('existing-app').clientHeight:0,backScale:commit?1:.9,backY:commit?0:40};
  const restoreFocus=deck.contains(document.activeElement);
  const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?0:500;
  const started=performance.now();motion.busy=true;syncControls();paintMotion();
  function frame(now){
    const progress=duration?Math.min(1,(now-started)/duration):1;
    for(const key of Object.keys(from))motion[key]=from[key]+(to[key]-from[key])*progress;
    paintMotion();
    if(progress<1){motion.frame=requestAnimationFrame(frame);return;}
    if(commit)model.index+=delta;
    resetMotion();
    if(commit){render();status.textContent=`Action ${model.index+1} dari ${samples.length}: ${current().title}`;if(restoreFocus)main.querySelector('.deck').focus({preventScroll:true});}
  }
  motion.frame=requestAnimationFrame(frame);
}
function advance(delta){
  if(model.detail||dialog.open||motion.busy||pointer||!samples[model.index+delta])return;
  motion.mode=delta>0?'up':'down';settle(true);
}
function openModal(title,body,comments=false){modalFocus=document.activeElement;dialog.className=comments?'comment-sheet':'';dialog.innerHTML=`<div class="sheet-body"><div class="sheet-handle"></div>${title?`<div class="sheet-heading"><h2 id="existing-sheet-title">${title}</h2><button class="icon-button" data-do="close" aria-label="Tutup">${img('close')}</button></div>`:'<span id="existing-sheet-title" class="sr-only">Opsi Action</span>'}${body}</div>`;dialog.showModal();}
function closeModal(){dialog.close();commentAttachments.forEach(a=>URL.revokeObjectURL(a.url));commentAttachments=[];commentReply=null;if(modalFocus?.isConnected)modalFocus.focus();}
function commentMarkup(c,parent=null){
  const replies=c.replies||[],expanded=expandedReplies.has(c.id);
  return `<div class="comment-thread"><article class="bv-comment ${parent?'is-reply':''}">${avatar(c.name,c.avatar||'partner')}<div class="comment-content"><div class="comment-meta"><div class="comment-name"><strong>${esc(c.name.split(' ')[0])}</strong>${c.employee?'<img class="author-badge" src="bv-badge.png" alt="Tim Bukit Vista">':''}</div><time>${esc(c.time)}</time></div><p>${c.replyTo?`<b class="reply-mention">${esc(c.replyTo.split(' ')[0])}</b> `:''}${esc(c.text)}</p>${c.attachments?.length?`<button class="comment-attachment" data-comment-preview="${c.id}" aria-label="Lihat ${c.attachments.length} foto lampiran"><img src="${c.attachments[0].url}" alt="Lampiran komentar">${c.attachments.length>1?`<span>+${c.attachments.length-1}</span>`:''}</button>`:''}<div class="comment-actions"><button data-comment-like="${c.id}" aria-label="Sukai komentar ${esc(c.name)}" aria-pressed="${!!c.liked}">${glyph(c.liked?'thumb_up_fill':'thumb_up')}<span>${(c.likes||0)+(c.liked?1:0)}</span></button><span class="reply-count">${glyph('comment_icon')}<span>${replies.length}</span></span><button class="reply-button" data-comment-reply="${c.id}" data-parent="${parent?.id||c.id}">Reply</button></div></div></article>${replies.length&&!parent?`${!expanded?`<button class="show-replies" data-show-replies="${c.id}">Show ${replies.length} more replies</button>`:replies.map(r=>commentMarkup(r,c)).join('')}`:''}</div>`;
}
function findComment(id){return commentsFor().flatMap(c=>[c,...(c.replies||[])]).find(c=>c.id===id);}
function drawComments(){
  const list=dialog.querySelector('.comments-list');
  list.innerHTML=commentsFor().length?commentsFor().map(c=>commentMarkup(c)).join(''):'<div class="empty-comments">No Comments Yet</div>';
}
function fitCommentSheet(){
  if(!dialog.classList.contains('comment-sheet'))return;
  const app=document.getElementById('existing-app'),r=app.getBoundingClientRect();
  dialog.style.setProperty('--sheet-bottom',Math.max(0,innerHeight-r.bottom)+'px');
  dialog.style.setProperty('--sheet-width',r.width+'px');
  dialog.style.setProperty('--sheet-height',Math.min(app.clientHeight,innerHeight)*.8+'px');
}
function showComments(){
  modalFocus=document.activeElement;commentReply=null;commentAttachments=[];
  dialog.className='comment-sheet';
  dialog.innerHTML=`<div class="sheet-body"><div class="comment-sheet-header"><div class="sheet-handle"></div><h2 id="existing-sheet-title">Comments</h2><button class="sr-only" data-do="close" aria-label="Tutup komentar">Tutup</button></div><div class="comments-list"></div><form id="existing-comment-form"><input type="file" id="comment-files" accept="image/*" multiple hidden><button type="button" class="add-attachment" data-do="attach-comment" aria-label="Tambahkan foto"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="1" stroke="currentColor" stroke-width="2"/><path d="M12 7v10M7 12h10" stroke="currentColor" stroke-width="2"/></svg></button><div class="comment-editor"><div id="comment-attachments"></div><strong class="reply-mention" id="comment-reply-to" hidden></strong><textarea maxlength="1000" rows="1" id="existing-comment" aria-label="Tambahkan komentar" placeholder="Tambahkan komentar"></textarea></div><button class="send-comment" aria-label="Kirim komentar" type="submit">${img('send_button')}</button></form></div>`;
  drawComments();fitCommentSheet();dialog.showModal();
  // Opening the native sheet does not focus the composer or raise the keyboard.
  dialog.querySelector('.comments-list').setAttribute('tabindex','-1');dialog.querySelector('.comments-list').focus();
}
function drawAttachments(){
  dialog.querySelector('#comment-attachments').innerHTML=commentAttachments.map((a,i)=>`<div class="attachment-thumb"><img src="${a.url}" alt="Foto terpilih"><button type="button" data-remove-attachment="${i}" aria-label="Hapus foto ${i+1}">×</button></div>`).join('');
}
document.addEventListener('click',event=>{if(performance.now()<ignoreClickUntil||motion.busy||pointer?.dragging)return;const b=event.target.closest('button');if(b){if(b.disabled)return;if(b.dataset.commentLike){const c=findComment(b.dataset.commentLike);c.liked=!c.liked;drawComments();return;}
if(b.dataset.commentReply){const c=findComment(b.dataset.commentReply);commentReply={parent:b.dataset.parent,name:c.name};const label=dialog.querySelector('#comment-reply-to');label.textContent=c.name;label.hidden=false;dialog.querySelector('#existing-comment').focus();return;}
if(b.dataset.showReplies){expandedReplies.add(b.dataset.showReplies);drawComments();return;}
if(b.dataset.removeAttachment!==undefined){const [a]=commentAttachments.splice(Number(b.dataset.removeAttachment),1);URL.revokeObjectURL(a.url);drawAttachments();return;}
if(b.dataset.commentPreview){const c=findComment(b.dataset.commentPreview);const viewer=document.createElement('div');viewer.className='attachment-viewer';viewer.innerHTML=`<button data-do="close-photo" aria-label="Tutup foto">${img('close')}</button><div>${c.attachments.map(a=>`<img src="${a.url}" alt="Lampiran komentar">`).join('')}</div>`;dialog.append(viewer);return;}
if(b.id==='previous'){advance(-1);return;}if(b.id==='next'){advance(1);return;}if(b.dataset.selection!==undefined){const selected=Number(b.dataset.selection);model.selections[current().id]=model.selections[current().id]===selected?null:selected;render();status.textContent='Pilihan disimpan dalam demo.';return;}switch(b.dataset.do){case 'attach-comment':dialog.querySelector('#comment-files').click();break;case 'close-photo':dialog.querySelector('.attachment-viewer').remove();break;case 'up':case 'down':model.likes[current().id]=model.likes[current().id]===b.dataset.do?null:b.dataset.do;render();status.textContent='Respons diperbarui dalam demo.';break;case 'comments':showComments();break;case 'options':openModal('',`<button class="button optout-button" data-do="optout">Tidak tertarik</button>`);break;case 'optout':model.optout[current().id]=true;closeModal();if(model.detail){model.detail=false;render();}status.textContent='Tidak tertarik dicatat dalam demo.';break;case 'close':closeModal();break;case 'back':model.detail=false;render();break;case 'home':model.detail=false;render();break;}return;}if(!model.detail&&event.target.closest('.existing-card')){model.detail=true;render();main.scrollTop=0;main.focus();}});
main.addEventListener('pointerdown',event=>{
  if(model.detail||dialog.open||pointer||event.isPrimary===false||event.button!==0||!event.target.closest('.deck')||(motion.busy&&motion.mode!=='down'))return;
  pointer={x:event.clientX,y:event.clientY,lastY:event.clientY,id:event.pointerId,dragging:false,history:[{y:event.clientY,t:performance.now()}]};
});
main.addEventListener('pointermove',event=>{
  if(!pointer||pointer.id!==event.pointerId)return;
  const now=performance.now(),dy=event.clientY-pointer.lastY;
  if(!pointer.dragging){
    const vertical=Math.abs(event.clientY-pointer.y),horizontal=Math.abs(event.clientX-pointer.x);
    if(Math.max(vertical,horizontal)<4)return;
    if(horizontal>vertical){pointer=null;return;}
    if(motion.busy){cancelAnimationFrame(motion.frame);motion.busy=false;syncControls();}
    pointer.dragging=true;main.setPointerCapture(event.pointerId);
  }
  event.preventDefault();pointer.lastY=event.clientY;
  pointer.history.push({y:event.clientY,t:now});
  pointer.history=pointer.history.filter(p=>now-p.t<100);
  moveCard(dy);
});
function endGesture(event,cancelled=false){
  if(!pointer||pointer.id!==event.pointerId)return;
  const gesture=pointer;pointer=null;
  if(main.hasPointerCapture(event.pointerId))main.releasePointerCapture(event.pointerId);
  if(!gesture.dragging)return;
  ignoreClickUntil=performance.now()+400;
  const now=performance.now(),first=gesture.history[0];
  const velocity=first&&now-first.t>0?(event.clientY-first.y)/(now-first.t)*1000:0;
  const commit=motion.mode==='down'?(motion.reveal>50||velocity>800):motion.top < -50;
  settle(!cancelled&&commit);
}
main.addEventListener('pointerup',event=>endGesture(event));
main.addEventListener('pointercancel',event=>endGesture(event,true));
main.addEventListener('lostpointercapture',event=>endGesture(event,true));
main.addEventListener('wheel',event=>{if(model.detail||dialog.open||Math.abs(event.deltaY)<12)return;event.preventDefault();if(performance.now()-lastWheel<650)return;lastWheel=performance.now();advance(event.deltaY>0?1:-1);},{passive:false});
document.addEventListener('keydown',event=>{if(model.detail||dialog.open||motion.busy||pointer||event.target.matches('textarea,input,button'))return;if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();advance(event.key==='ArrowDown'?1:-1);}else if(event.key==='Enter'&&event.target.closest('.deck')){model.detail=true;render();main.focus();}});
document.addEventListener('submit',event=>{
  if(event.target.id!=='existing-comment-form')return;event.preventDefault();
  const input=document.getElementById('existing-comment'),text=input.value.trim();if(!text&&!commentAttachments.length)return;
  const c={id:'comment-'+Date.now(),name:'Anda',avatar:'partner',text,time:'now',likes:0,replies:[],attachments:commentAttachments,replyTo:commentReply?.name};
  const list=model.comments[current().id]||structuredClone(current().comments);
  if(commentReply){const parent=list.find(c=>c.id===commentReply.parent);parent.replies.push(c);expandedReplies.add(parent.id);}else list.unshift(c);
  model.comments[current().id]=list;commentAttachments=[];commentReply=null;
  input.value='';input.style.height='auto';dialog.querySelector('#comment-reply-to').hidden=true;drawAttachments();drawComments();render();
  status.textContent='Komentar tersimpan dalam demo.';
});
dialog.addEventListener('input',event=>{if(event.target.id==='existing-comment'){event.target.style.height='auto';event.target.style.height=Math.min(120,event.target.scrollHeight)+'px';}});
dialog.addEventListener('change',event=>{if(event.target.id!=='comment-files')return;for(const file of event.target.files){if(file.type.startsWith('image/'))commentAttachments.push({url:URL.createObjectURL(file)});}drawAttachments();event.target.value='';});
dialog.addEventListener('pointerdown',event=>{
  if(!event.target.closest('.comment-sheet-header')||event.target.closest('button'))return;
  sheetGesture={id:event.pointerId,y:event.clientY,height:dialog.clientHeight};dialog.setPointerCapture(event.pointerId);
});
dialog.addEventListener('pointermove',event=>{
  if(!sheetGesture||sheetGesture.id!==event.pointerId)return;
  const available=Math.min(document.getElementById('existing-app').clientHeight,innerHeight);
  const height=Math.max(available*.25,Math.min(available*.9,sheetGesture.height+sheetGesture.y-event.clientY));
  dialog.style.setProperty('--sheet-height',height+'px');
});
function endSheetDrag(event){if(!sheetGesture||sheetGesture.id!==event.pointerId)return;sheetGesture=null;dialog.releasePointerCapture(event.pointerId);const available=Math.min(document.getElementById('existing-app').clientHeight,innerHeight);if(dialog.clientHeight<available*.35)closeModal();else if(dialog.clientHeight<available*.4)dialog.style.setProperty('--sheet-height',available*.4+'px');}
dialog.addEventListener('cancel',event=>{event.preventDefault();closeModal();});
dialog.addEventListener('pointerup',endSheetDrag);dialog.addEventListener('pointercancel',endSheetDrag);
window.addEventListener('resize',fitCommentSheet);
dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientY<r.top||event.clientY>r.bottom||event.clientX<r.left||event.clientX>r.right)closeModal();});
new ResizeObserver(()=>{fitDeck();paintMotion();}).observe(main);render();

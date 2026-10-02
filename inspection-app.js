// Reconstruction of the existing card feed, using sample content and local state only.
const samples=[
  {
    "id": "inspection",
    "author": "Dina",
    "role": "Property Manager",
    "time": "12.00 · Hari ini",
    "tag": "Inspection · Villa Contoh",
    "title": "Tentukan tindak lanjut untuk 2 temuan",
    "body": [
      "Ada 3 temuan inspection. Dua membutuhkan respons Anda; satu ditangani tim BV.",
      "Pilih penanggung jawab dan target perbaikan, laporkan pekerjaan selesai, atau minta bantuan."
    ],
    "comments": []
  },
  {
    "id": "pricing",
    "author": "Raka",
    "role": "Revenue",
    "time": "11.30 · Hari ini",
    "tag": "Pricing Recap",
    "title": "Harga minggu ini dan hasilnya",
    "body": [
      "Villa Contoh mendapat 4 pemesanan untuk 12 malam, dengan rata-rata harga Rp850.000 per malam.",
      "Harga akhir pekan dipertahankan. Tarif hari kerja akan ditinjau pada 5 Oktober. Informasi ini tidak memerlukan keputusan Anda."
    ],
    "comments": []
  },
  {
    "id": "bad-review",
    "author": "Nadia",
    "role": "Guest Experience",
    "time": "11.00 · Hari ini",
    "tag": "Extreme Bad Review",
    "title": "Ulasan 1 bintang: kebersihan kamar mandi",
    "body": [
      "Tamu melaporkan kamar mandi kurang bersih. Tim housekeeping menjadwalkan pemeriksaan ulang hari ini pukul 14.00.",
      "Tim BV menangani tindak lanjut ulasan dan pengecekan. Dina akan mengirim hasilnya pukul 16.00. Belum ada keputusan owner yang diminta."
    ],
    "comments": []
  },
  {
    "id": "payout",
    "author": "Ayu",
    "role": "Finance",
    "time": "10.30 · Hari ini",
    "tag": "Payout Update",
    "title": "Pembayaran booking 28 September",
    "body": [
      "Booking VC-1028 masuk periode payout Oktober karena tamu check-out pada 1 Oktober. Estimasi pembayaran: 7 Oktober.",
      "Nilai bersih sementara Rp2.450.000 setelah biaya yang tercatat. Ini jadwal perkiraan, bukan konfirmasi dana sudah diterima."
    ],
    "comments": []
  },
  {
    "id": "expense",
    "author": "Dina",
    "role": "Property Manager",
    "time": "10.00 · Hari ini",
    "tag": "Expense Explanation",
    "title": "Rincian biaya perawatan kolam",
    "body": [
      "Perawatan kolam pada 30 September tercatat Rp420.000: jasa Rp250.000 dan bahan Rp170.000.",
      "Finance sedang mencocokkan catatan pekerjaan dan persetujuannya. Pembaruan diberikan 3 Oktober pukul 12.00; biaya ini belum dinyatakan final."
    ],
    "comments": []
  },
  {
    "id": "repair-progress",
    "author": "Dina",
    "role": "Property Manager",
    "time": "09.30 · Hari ini",
    "tag": "Maintenance Progress",
    "title": "Perbaikan AC: teknisi sudah dijadwalkan",
    "body": [
      "Teknisi dijadwalkan memeriksa AC kamar 1 pada 3 Oktober pukul 10.00 sesuai rencana yang telah disepakati.",
      "Dina akan mendampingi pemeriksaan dan memberi pembaruan pukul 12.00. Jika ada usulan biaya tambahan, tim akan meminta keputusan terpisah."
    ],
    "comments": []
  },
  {
    "id": "booking",
    "author": "Nadia",
    "role": "Guest Experience",
    "time": "09.00 · Hari ini",
    "tag": "Booking Verification",
    "title": "Alokasi kamar tamu sudah diperiksa",
    "body": [
      "Booking VC-1032 untuk 4–6 Oktober tercatat di kamar 3. Tim telah mencocokkan kalender dan mengonfirmasi alokasi kepada tamu.",
      "Tidak ada perubahan yang perlu dilakukan owner. Tim Guest Experience tetap memantau kalender sebelum check-in."
    ],
    "comments": []
  },
  {
    "id": "performance",
    "author": "Raka",
    "role": "Revenue",
    "time": "Kemarin",
    "tag": "Property Performance",
    "title": "Rencana untuk tanggal yang masih kosong",
    "body": [
      "Masih ada 6 malam kosong pada 5–11 Oktober. Tim Revenue meninjau harga pembanding dan minimum lama menginap.",
      "Evaluasi berikutnya pada 5 Oktober. Targetnya meningkatkan pemesanan; hasil belum dapat dipastikan dan tidak ada perubahan biaya yang diminta dari Anda."
    ],
    "comments": []
  },
  {
    "id": "privacy",
    "author": "Nadia",
    "role": "Partner Relations",
    "time": "Kemarin",
    "tag": "BVGO Guide",
    "title": "Siapa yang bisa melihat komentar Anda?",
    "body": [
      "Diskusi pada kasus inspection privat di prototype ini ditujukan untuk owner terkait dan tim BV yang menangani.",
      "Periksa label audiens sebelum menulis detail properti. Jangan menaruh informasi pembayaran atau keluhan privat pada pengumuman bersama."
    ],
    "comments": []
  },
  {
    "id": "announcement",
    "author": "Tim BV",
    "role": "Operations",
    "time": "Kemarin",
    "tag": "Announcement",
    "title": "Jadwal pembaruan properti minggu depan",
    "body": [
      "Ringkasan properti akan dibagikan setiap Senin, mencakup booking, pekerjaan selesai, dan hal yang masih menunggu tindak lanjut.",
      "Kasus mendesak tetap dikirim terpisah dengan permintaan respons yang spesifik. Pengumuman ini hanya untuk informasi."
    ],
    "comments": []
  }
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
function cardContents(item){if(item.id==='inspection')return `${authors(item)}<h2 class="existing-title">${pendingCount()?`Tentukan tindak lanjut untuk ${pendingCount()} temuan`:findings.every(f=>f.state==='closed')?'Inspection terverifikasi selesai':'Pantau tindak lanjut inspection'}</h2><div class="existing-copy"><p>${pendingCount()?`Ada 3 temuan inspection. ${pendingCount()} masih membutuhkan respons Anda. Temuan lainnya ditangani sesuai statusnya.`:'Respons Anda sudah tercatat. Lihat jadwal dan tindak lanjut tiap temuan.'}</p><div class="inspection-due">${pendingCount()?`${pendingCount()} temuan perlu respons`:'Respons sudah tercatat'}<small>${pendingCount()?(simMinutes>750?'Tenggat respons terlewati · 2 Okt, 12.30 WITA':'Respons sebelum 2 Okt, 12.30 WITA'):'Tidak ada respons owner yang tertunda'}</small></div><p>${pendingCount()?item.body[1]:'Laporan pekerjaan selesai akan diperiksa tim BV sebelum temuan ditutup.'}</p></div><div class="inspection-card-footer"><button class="button" data-inspect="open">Lihat temuan & respons</button><small>Privat · Anda dan tim BV</small></div>`;return `<div>${authors(item)}</div><h2 class="existing-title">${item.title}</h2><div class="existing-copy">${item.body.map(p=>`<p>${p}</p>`).join('')}</div>${widget(item)}${responses(item)}`;}
function fitDeck(){const deck=main.querySelector('.deck');if(!deck)return;const width=Math.min(main.clientWidth-32,Math.max(0,main.clientHeight-40)*9/16);deck.style.setProperty('--deck-width',width+'px');deck.style.setProperty('--deck-height',width*16/9+'px');}
function drawNav(){navAnimations.forEach(a=>a.destroy());navAnimations=[];nav.hidden=model.detail;if(model.detail){nav.innerHTML='';return;}nav.innerHTML=[['action_active','Actions'],['calendar','Calendar'],['home','My Property'],['inbox','Inbox'],['menu','Partner']].map(([name,label])=>`<button class="nav-item" ${name==='action_active'?'aria-current="page" data-do="home"':'disabled title="Di luar cakupan prototype"'}><span class="nav-icon" data-animation="${name}">${name==='menu'?avatar('Anda','partner','nav-profile'):''}</span><span>${label}</span></button>`).join('');nav.querySelectorAll('[data-animation]').forEach(el=>{const name=el.dataset.animation;if(name==='menu')return;const a=lottie.loadAnimation({container:el,renderer:'svg',loop:false,autoplay:false,animationData:structuredClone(window.BVNavigation[name])});a.goToAndStop(name==='action_active'?a.totalFrames-1:0,true);navAnimations.push(a);});}
function cardLayer(item,layer){return `<article class="existing-card" data-layer="${layer}" ${layer==='front'?`aria-label="${item.title}"`:'aria-hidden="true" inert'}>${!model.likes[item.id]?'<span class="unanswered-dot" aria-hidden="true"></span>':''}${cardContents(item)}</article>`;}
function syncControls(){
  document.getElementById('previous').disabled=model.detail||motion.busy||model.index===0;
  document.getElementById('next').disabled=model.detail||motion.busy||model.index===samples.length-1;
}
function renderFeed(){
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
new ResizeObserver(()=>{fitDeck();paintMotion();}).observe(main);

const findings=[
{id:'water',title:'Tekanan air kamar mandi rendah',party:'Owner',verified:true,summary:'Pemeriksaan ulang pada 2 Okt, 10.15 menunjukkan aliran air shower kamar 2 lemah.',request:'Tentukan siapa yang mengatur perbaikan dan target waktunya.',evidence:'Catatan inspection: aliran shower kamar 2 lebih lemah dibanding kamar 1. Perlu pemeriksaan teknisi untuk memastikan penyebabnya.',state:'needs',response:null,notes:[]},
{id:'socket',title:'Stopkontak kamar 2 dilaporkan longgar',party:'Owner · perlu klarifikasi',verified:false,summary:'Laporan tamu belum diperiksa teknisi. Tanggung jawab biaya belum ditetapkan.',request:'Ajukan jadwal pemeriksaan, atau beri tahu kami jika Anda menyanggah temuan ini.',evidence:'Sumber: laporan tamu, 2 Okt, 09.30. Belum ada pemeriksaan teknis atau bukti foto dalam contoh ini.',state:'needs',response:null,notes:[]},
{id:'host',title:'Balasan pesan tamu terlambat',party:'Tim BV',verified:true,summary:'Tim Guest Experience memeriksa pembagian shift dan tindak lanjut percakapan tamu.',request:'Tidak memerlukan respons Anda.',evidence:'Catatan operasional contoh: pesan tamu belum dijawab sesuai target waktu tim.',state:'bv_work',response:null,notes:[]}
];
const labels={needs:'Menunggu respons Anda',scheduled:'Dijadwalkan',verify:'Menunggu verifikasi BV',help:'Menunggu jawaban BV',dispute:'Temuan disanggah · ditinjau BV',bv_work:'Ditangani BV',closed:'Terverifikasi selesai'};
let wasCase=false;
let activeFinding='water',simTime='12.00',simMinutes=720;
const pendingCount=()=>findings.filter(f=>f.state==='needs').length;
const parentOrigin=location.origin;
function emit(type,extra={}){if(parent!==window)parent.postMessage({source:'bvgo-inspection',type,...extra,pending:pendingCount(),findings:findings.map(f=>({id:f.id,state:f.state,title:f.title,response:!!f.response}))},parentOrigin);}
function findingView(f){return `<article class="finding" id="finding-${f.id}"><div class="finding-top"><span>${f.party}</span><span class="evidence-tag ${f.verified?'':'unverified'}">${f.verified?'Diverifikasi':'Dilaporkan'}</span></div><h3>${f.title}</h3><p><span class="initial-note">Catatan awal · </span>${f.summary}</p><details><summary>Lihat catatan & sumber</summary><p>${f.evidence}</p><small>Konten dan bukti dalam prototype ini ilustratif.</small></details><span class="finding-state ${f.state==='closed'?'closed':''}">${labels[f.state]}</span>${f.response?`<div class="response-record"><strong>Respons Anda</strong><p>${esc(f.response)}</p></div>`:''}${f.notes.map(n=>`<div class="bv-update"><strong>Dina · Tim BV</strong><p>${esc(n)}</p></div>`).join('')}${f.state==='needs'?`<p class="request-text">${f.request}</p><button class="button" data-inspect="plan" data-finding="${f.id}">Ajukan rencana ${f.id==='socket'?'pemeriksaan':'perbaikan'}</button><div class="finding-secondary"><button data-inspect="fixed" data-finding="${f.id}">Sudah diperbaiki</button><button data-inspect="question" data-finding="${f.id}">Butuh bantuan / Tidak setuju</button></div>`:f.state==='scheduled'?`<p class="request-text">Setelah pekerjaan selesai, kirim laporan agar tim BV dapat memverifikasi.</p><button class="button outline" data-inspect="fixed" data-finding="${f.id}">Laporkan pekerjaan selesai</button>`:f.state==='help'||f.state==='dispute'?`<p class="next-update">Penanggung jawab: Dina · Pembaruan berikutnya 2 Okt, 14.00 WITA. Pengingat respons owner dihentikan untuk temuan ini.</p>${f.notes.length?`<div class="finding-secondary"><button data-inspect="plan" data-finding="${f.id}">Ajukan rencana lanjutan</button><button data-inspect="fixed" data-finding="${f.id}">Laporkan pekerjaan selesai</button></div>`:''}`:f.state==='verify'?'<p class="next-update">Dina akan mengecek hasil pekerjaan. Target pembaruan: 3 Okt, 10.00 WITA.</p>':f.state==='bv_work'?'<p class="next-update">PIC: Tim Guest Experience · Pembaruan berikutnya 2 Okt, 14.00 WITA.</p>':''}</article>`;}
function render(){
 const isCase=model.detail&&model.index===0;if(isCase&&!wasCase)emit('opened');wasCase=isCase;
 if(!model.detail||model.index!==0){renderFeed();return;}
 header.innerHTML=`<div class="subheader"><button class="icon-button back" data-do="back" aria-label="Kembali ke Actions">${img('left-arrow')}</button><strong>Inspection</strong></div>`;
 main.className='detail-mode inspection-detail';
 main.innerHTML=`<div class="case-intro"><span class="case-privacy">Privat · Anda dan tim BV yang menangani</span><h1>Villa Contoh</h1><p>3 temuan · ${pendingCount()?pendingCount()+' perlu respons Anda':'Respons Anda sudah tercatat'}</p><div class="inspection-due">${pendingCount()?(simMinutes>750?'Tenggat respons terlewati':'Respons sebelum 2 Okt, 12.30 WITA'):(findings.every(f=>f.state==='closed')?'Semua temuan terverifikasi selesai':'Tindak lanjut sedang berjalan')}<small>Tenggat respons berbeda dari target perbaikan.</small></div><div class="case-contact"><img src="team.jpg" alt="Foto Dina"><div><strong>Dina · Property Manager</strong><small>Penanggung jawab kasus</small></div></div></div>${findings.map(findingView).join('')}<p class="case-disclaimer">Selesai setelah hasil pekerjaan diverifikasi, bukan setelah dibaca atau diberi like.</p>`;
 drawNav();syncControls();
 document.getElementById('inspection-sticky').hidden=false;
 document.getElementById('inspection-sticky').innerHTML=pendingCount()?`<span>${pendingCount()} temuan menunggu respons</span><button data-inspect="jump">Tanggapi temuan</button>`:'<span>Respons tercatat · Lihat status tiap temuan</span>';
}
function openCase(){model.index=0;model.detail=true;render();main.scrollTop=0;}
function inspectionSheet(kind,id){
 activeFinding=id;const f=findings.find(x=>x.id===id);let fields='';
 if(kind==='plan')fields=`<label for="person">Siapa yang mengatur pekerjaan?</label><select id="person" name="person" required><option value="">Pilih penanggung jawab</option><option>Saya / teknisi pilihan saya</option><option>Saya minta bantuan tim BV</option></select><label for="target">Target ${id==='socket'?'pemeriksaan':'perbaikan'}</label><input id="target" name="target" type="date" min="2026-10-02" required><label for="notes">Rencana singkat</label><textarea id="notes" name="notes" required maxlength="1000" placeholder="Contoh: Saya hubungi teknisi untuk memeriksa pompa."></textarea><p class="form-note">Permintaan bantuan BV belum mengonfirmasi jadwal atau menyetujui biaya.</p>`;
 if(kind==='fixed')fields=`<label for="completed">Tanggal pekerjaan selesai</label><input id="completed" name="completed" type="date" max="2026-10-02" required><label for="notes">Apa yang diperbaiki dan bagaimana hasilnya?</label><textarea id="notes" name="notes" required maxlength="1000" placeholder="Jelaskan pekerjaan dan hasil pemeriksaan Anda."></textarea><p class="form-note">Laporan ini akan diperiksa tim BV. Belum otomatis menutup temuan.</p>`;
 if(kind==='question')fields=`<label for="reason">Jenis tanggapan</label><select id="reason" name="reason" required><option value="help">Butuh bantuan / penjelasan</option><option value="dispute">Tidak setuju dengan temuan</option></select><label for="notes">Jelaskan pertanyaan atau keberatan Anda</label><textarea id="notes" name="notes" required maxlength="1000" placeholder="Tim BV akan meninjau sebelum meminta tindakan berikutnya."></textarea><p class="form-note">Dina bertanggung jawab menjawab. Anda tidak diminta menyetujui temuan atau biaya melalui formulir ini.</p>`;
 dialog.className='inspection-sheet';openModal(kind==='plan'?'Rencana tindak lanjut':kind==='fixed'?'Laporkan pekerjaan selesai':'Diskusikan temuan',`<p class="form-finding">${f.title}</p><form id="inspection-response" data-kind="${kind}">${fields}<button class="button" type="submit">Kirim respons</button></form>`);dialog.classList.add('inspection-sheet');
}
document.addEventListener('click',event=>{
 if(performance.now()<ignoreClickUntil||motion.busy||pointer?.dragging)return;
 const b=event.target.closest('[data-inspect]');if(!b)return;
 const action=b.dataset.inspect;
 if(action==='open'){openCase();return;}
 if(action==='jump'){document.getElementById('finding-'+findings.find(f=>f.state==='needs').id)?.scrollIntoView({behavior:'smooth',block:'start'});return;}
 if(['plan','fixed','question'].includes(action))inspectionSheet(action,b.dataset.finding);
});
document.addEventListener('submit',event=>{
 if(event.target.id!=='inspection-response')return;event.preventDefault();
 const data=new FormData(event.target),notes=String(data.get('notes')||'').trim();if(!notes){document.getElementById('notes').setCustomValidity('Isi tanggapan terlebih dahulu.');document.getElementById('notes').reportValidity();return;}
 const f=findings.find(x=>x.id===activeFinding),kind=event.target.dataset.kind,first=!f.response;
 if(kind==='plan'){const help=data.get('person')==='Saya minta bantuan tim BV';f.state=help?'help':'scheduled';f.response=`${data.get('person')} · Target ${data.get('target')}. ${notes}`;}
 if(kind==='fixed'){f.state='verify';f.response=`Pekerjaan dilaporkan selesai ${data.get('completed')}. ${notes}`;}
 if(kind==='question'){f.state=String(data.get('reason'));f.response=notes;}
 closeModal();render();document.getElementById('finding-'+f.id).scrollIntoView({block:'start'});status.textContent='Respons tersimpan dalam simulasi.';emit(first?'response':kind==='fixed'?'completion_reported':'response_updated',{finding:f.id,kind,state:f.state});
});
document.addEventListener('input',e=>{if(e.target.id==='notes')e.target.setCustomValidity('');});
window.addEventListener('message',event=>{
 if(event.origin!==parentOrigin||event.source!==parent||event.data?.source!=='inspection-controller')return;
 const command=event.data.command;
 if(command==='open')openCase();
 if(command==='feed'){model.detail=false;render();}
 if(command==='tick'){simTime=event.data.time;simMinutes=event.data.minutes;if(model.detail&&!dialog.open)render();}
 if(command==='bv-update'){
  let updated=false;
  for(const f of findings){if(f.state==='help'){f.notes.push('Permintaan bantuan diterima. Dina sedang mengecek ketersediaan teknisi; jadwal dan biaya belum disepakati. Pembaruan berikutnya pukul 14.00.');updated=true;}else if(f.state==='dispute'){f.notes.push('Keberatan diterima. Pemeriksaan ulang akan dilakukan bersama Anda. Tidak ada biaya yang disetujui melalui tanggapan ini. Pembaruan berikutnya pukul 14.00.');updated=true;}}
  if(updated){render();emit('bv_update');}
 }
 if(command==='verify'){
  const f=findings.find(f=>f.state==='verify');if(f){f.state='closed';f.verified=true;f.notes.push('Simulasi verifikasi: hasil pekerjaan diperiksa dan temuan ditutup.');render();emit('verified',{finding:f.id});}
 }
 if(command==='bv-complete'){const f=findings.find(f=>f.id==='host');if(f.state!=='closed'){f.state='closed';f.notes.push('Simulasi: pembagian shift diperbaiki dan hasil tindak lanjut percakapan diperiksa.');render();emit('bv_completed',{finding:'host'});}}
});
const originalRenderFeed=renderFeed;renderFeed=function(){document.getElementById('inspection-sticky').hidden=true;originalRenderFeed();};
render();emit('ready');

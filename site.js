(function(){
var C=window.SITE||{};
var b=document.querySelector('.burger'),n=document.getElementById('nav');
if(b&&n){b.addEventListener('click',function(){var o=n.classList.toggle('open');b.setAttribute('aria-expanded',o?'true':'false');});}
var t=new Date().toISOString().slice(0,10);
document.querySelectorAll('input[type=date]').forEach(function(d){if(d.hasAttribute('data-past'))d.max=t;else d.min=t;});
function fold(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
function isForeign(v){var s=fold(v);return !!s&&!/^(france|francais|francaise|fr\b|metropole|guadeloupe|martinique|reunion|guyane|mayotte|nouvelle.caledonie|polynesie)/.test(s);}
var natEl=document.getElementById('r-nat'),polEl=document.getElementById('bk-police');
if(natEl&&polEl){var tgPol=function(){polEl.hidden=!isForeign(natEl.value);};natEl.addEventListener('input',tgPol);natEl.addEventListener('change',tgPol);if(natEl.form)natEl.form.addEventListener('reset',function(){setTimeout(tgPol,0);});tgPol();}
function val(f,k){var e=f.elements[k];return e?String(e.value||'').trim():'';}
function say(f,msg,ok){var s=f.querySelector('.status');if(s){s.textContent=msg;s.className='status '+(ok?'ok':'err');}}
function fr(d){var p=d.split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:d;}
function showDone(mode,contact,recap,hasPolice){
 var box=document.getElementById('bk-done');
 if(!box)return;
 var mail=contact.indexOf('@')>0;
 box.innerHTML='';
 var h=document.createElement('p');h.className='bk-done-h';
 h.textContent=mode==='auto'?'✓ Votre réservation est enregistrée et confirmée.':'✓ Votre demande a bien été envoyée.';
 box.appendChild(h);
 var p=document.createElement('p');
 if(mode==='auto')p.textContent=mail?'Un e-mail de confirmation vient de vous être envoyé à '+contact+'. Pensez à vérifier vos courriers indésirables.':'Nous vous contacterons au '+contact+' pour confirmer les détails.';
 else p.textContent='Elle sera effective après validation de l’établissement. '+(mail?'Vous recevrez un e-mail à '+contact+' dès qu’elle sera acceptée (ou si nous ne pouvons pas y donner suite). Pensez à vérifier vos courriers indésirables.':'Nous vous contacterons au '+contact+'.');
 box.appendChild(p);
 if(hasPolice){var pp=document.createElement('p');pp.textContent='Votre fiche de police est bien enregistrée : il ne vous reste qu’à la signer à votre arrivée.';box.appendChild(pp);}
 if(recap){
  var ul=document.createElement('ul');ul.className='clean';
  recap.split(String.fromCharCode(10)).forEach(function(l){if(l){var li=document.createElement('li');li.textContent=l;ul.appendChild(li);}});
  box.appendChild(ul);
 }
 var b=document.createElement('button');b.type='button';b.className='btn ghost';b.textContent='Faire une autre demande';
 b.addEventListener('click',function(){box.hidden=true;var fm=document.getElementById('bk-form');if(fm&&fm.scrollIntoView)fm.scrollIntoView({behavior:'smooth',block:'start'});});
 box.appendChild(b);
 box.hidden=false;
 if(box.scrollIntoView)box.scrollIntoView({behavior:'smooth',block:'center'});
}document.querySelectorAll('form[data-site-form]').forEach(function(f){
 f.addEventListener('submit',function(e){
  e.preventDefault();
  var kind=f.getAttribute('data-site-form');
  var name=val(f,'name'),contact=val(f,'contact'),message=val(f,'message'),subject=val(f,'subject');
  var userMsg=message,rc='',nat='',police=null;
  var siteBody=function(){var pl={};try{pl=JSON.parse(val(f,'payload')||'{}');}catch(x){}return {action:'siteRequest',id:C.id,kind:val(f,'kind')||'stay',name:name,contact:contact,message:userMsg,recap:rc,roomId:val(f,'roomid'),arrival:val(f,'arrival'),departure:val(f,'departure'),adults:Number(val(f,'adults'))||0,children:Number(val(f,'children'))||0,payload:pl,nationality:nat,police:police,website:val(f,'website')};};
  if(!name||!contact){say(f,'Indiquez votre nom et un moyen de vous répondre (e-mail ou téléphone).',false);return;}
  if(kind==='request'){
   var a=val(f,'arrival'),d=val(f,'departure');
   if(!a||!d||d<a){say(f,'Choisissez vos dates dans le calendrier ou le formulaire.',false);return;}
   rc=val(f,'recap');
   if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact)){say(f,'Indiquez une adresse e-mail valide : c’est là que nous vous envoyons la confirmation.',false);return;}
   var phone=val(f,'phone');
   nat=val(f,'nationality');
   if(phone)rc=(rc?rc+String.fromCharCode(10):'')+'Téléphone : '+phone;
   if(isForeign(nat)){
    police={lastName:val(f,'pl_last'),firstNames:val(f,'pl_first'),birthDate:val(f,'pl_birth'),birthPlace:val(f,'pl_place'),nationality:nat,address:val(f,'pl_addr'),phone:phone||'non renseigné',email:contact,childrenText:val(f,'pl_kids')};
    if(!police.lastName||!police.firstNames||!police.birthDate||!police.birthPlace||!police.address){say(f,'Pour les voyageurs de nationalité étrangère, merci de compléter la fiche de police (tous les champs sont obligatoires, sauf les enfants).',false);return;}
   }
   if(nat)rc=(rc?rc+String.fromCharCode(10):'')+'Nationalité : '+nat+(police?' (fiche de police remplie)':'');
   var lines=rc?rc.split(String.fromCharCode(10)):['Demande de réservation','Hébergement : '+(val(f,'room')||'peu importe'),'Du '+fr(a)+' au '+fr(d),'Personnes : '+(val(f,'adults')||'1')+' adulte(s)'+(Number(val(f,'children'))>0?', '+val(f,'children')+' enfant(s)':'')];
   message=lines.join('\n')+(message?'\n\n'+message:'');
   subject='Réservation';
  } else if(!message){say(f,'Écrivez votre message.',false);return;}
  if(C.preview){say(f,'Aperçu : rien n\'a été envoyé. Sur le site publié, votre demande part à l\'établissement.',true);return;}
  var btn=f.querySelector('button[type=submit]');if(btn)btn.disabled=true;
  if(C.connector&&C.id){
   fetch(C.connector,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(kind==='request'?siteBody():{action:'livretMessage',id:C.id,kind:'contact',name:name,contact:contact,subject:subject.slice(0,60),message:message,website:val(f,'website')})})
   .then(function(r){return r.text();}).then(function(t){var j={};try{j=JSON.parse(t);}catch(x){}
     if(j.status==='success'){if(kind==='request'){showDone(j.mode,contact,rc,!!police);}else{say(f,'Merci, votre message est bien parti. Nous vous répondons rapidement.',true);}f.reset();}
     else{say(f,j.message||'Envoi impossible pour le moment : écrivez-nous directement par e-mail.',false);}})
   .catch(function(){say(f,'Envoi impossible pour le moment : écrivez-nous directement par e-mail.',false);})
   .then(function(){if(btn)btn.disabled=false;});
  } else if(C.email){
   location.href='mailto:'+C.email+'?subject='+encodeURIComponent(subject||'Message du site')+'&body='+encodeURIComponent(message+'\n\n'+name+'\n'+contact);
   say(f,'Votre messagerie s\'ouvre pour envoyer le message.',true);if(btn)btn.disabled=false;
  } else {say(f,'Envoi impossible : aucune adresse n\'est renseignée.',false);if(btn)btn.disabled=false;}
 });
});
(function(){
var DE=document.getElementById("bk-data"),F=document.getElementById("bk-form");
if(!DE||!F)return;
var D;try{D=JSON.parse(DE.textContent);}catch(x){return;}
var NL=String.fromCharCode(10);
var MON=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
function $(id){return document.getElementById(id);}
function pad(n){return n<10?"0"+n:""+n;}
function e(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function eur(x){return (Math.round(x*100)/100).toLocaleString("fr-FR")+" €";}
function dnum(s){var p=s.split("-");return Math.round(Date.UTC(+p[0],+p[1]-1,+p[2])/86400000);}
function ds(n){var d=new Date(n*86400000);return d.getUTCFullYear()+"-"+pad(d.getUTCMonth()+1)+"-"+pad(d.getUTCDate());}
function fr(n){var d=new Date(n*86400000);return d.getUTCDate()+" "+MON[d.getUTCMonth()]+" "+d.getUTCFullYear();}
var now=new Date(),T=dnum(now.getFullYear()+"-"+pad(now.getMonth()+1)+"-"+pad(now.getDate()));
var S=dnum(D.start);function setData(n){D=n;S=dnum(D.start);}
var rs=$("bk-room"),ad=$("bk-adults"),ch=$("bk-children"),cal=$("bk-cal"),sum=$("bk-sum"),sup=$("bk-sup"),supl=$("bk-suplist"),idn=$("bk-ident"),msg=$("bk-msg"),hint=$("bk-hint");
var supFor="";var st={room:null,from:null,to:null,month:0,sup:{}};
function say(t){msg.textContent=t||"";msg.className="bkmsg"+(t?" err":"");}
function roomOf(id){for(var i=0;i<D.rooms.length;i++)if(D.rooms[i].id===id)return D.rooms[i];return null;}
function guests(){return {a:+ad.value||0,c:+ch.value||0};}
function ready(){var g=guests();return !!st.room&&g.a>0&&(!st.room.mg||g.a+g.c<=st.room.mg);}
function idx(n){return n-S;}
function closed(n){var r=st.room,i=idx(n);if(!r||i<0||i>=r.p.length)return true;return r.cs[i]===1;}
function night(n){var r=st.room,g=guests(),i=idx(n);var extra=r.x>0?(Math.max(0,g.a-r.i)+g.c)*r.x:0;return r.p[i]+extra;}
function fill(sel,from,to,keep){var h="";for(var i=from;i<=to;i++)h+="<option value=\""+i+"\">"+i+"</option>";sel.innerHTML=(from>0&&sel===ad?"<option value=\"\">–</option>":"")+h;if(keep>=from&&keep<=to)sel.value=""+keep;}
var avail=null;
/* Nuits fermées par le paramétrage + nuits déjà prises (disponibilités lues auprès du connecteur, dates seulement) */
function buildClosed(r){
 r.cs={};var i,k;
 for(i=0;i<r.c.length;i++)r.cs[r.c[i]]=1;
 var list=avail&&avail[String(r.id).toLowerCase()];
 if(list)for(i=0;i<list.length;i++){
  var a=dnum(list[i][0])-S,b=dnum(list[i][1])-S;
  for(k=Math.max(0,a);k<b&&k<r.p.length;k++)r.cs[k]=1;
 }
}
function onRoom(){
 var r=roomOf(rs.value);st.room=r;st.from=st.to=null;
 if(r){buildClosed(r);
  var mg=r.mg||6,ma=r.ma>0?Math.min(r.ma,mg):mg,mc=r.mc>=0?Math.min(r.mc,mg-1):mg-1;
  fill(ad,1,ma,+ad.value);fill(ch,0,Math.max(0,mc),+ch.value);}
 else{ad.innerHTML="<option value=\"\">–</option>";ch.innerHTML="<option value=\"0\">0</option>";}
 refresh();
}
function refresh(){supFor="";
 say("");
 var g=guests();
 if(st.room&&st.room.mg&&g.a+g.c>st.room.mg)say("Ce logement accueille "+st.room.mg+" personnes au maximum.");
 hint.textContent=ready()?"Les prix du calendrier tiennent compte des voyageurs indiqués.":"Choisissez le logement et le nombre de voyageurs pour afficher les tarifs complets dans le calendrier.";
 st.from=st.to=null;draw();update();
}
function draw(){
 var first=new Date(now.getFullYear(),now.getMonth()+st.month,1),h="";
 for(var m=0;m<2;m++){
  var y=first.getFullYear(),mo=first.getMonth()+m;var d0=new Date(Date.UTC(y,mo,1));y=d0.getUTCFullYear();mo=d0.getUTCMonth();
  var lead=(d0.getUTCDay()+6)%7,len=new Date(Date.UTC(y,mo+1,0)).getUTCDate(),base=Math.round(d0.getTime()/86400000);
  h+="<div class=\"bk-m\"><div class=\"bk-mt\">"+MON[mo]+" "+y+"</div><div class=\"bk-g\">";
  ["L","M","M","J","V","S","D"].forEach(function(w){h+="<span class=\"bk-w\">"+w+"</span>";});
  for(var k=0;k<lead;k++)h+="<span></span>";
  for(var j=0;j<len;j++){
   var n=base+j,cls="bk-d",off=false,p="";
   if(n<T)off=true;
   else if(ready()){if(closed(n))off=true;else p="<small>"+Math.round(night(n))+" €</small>";}
   if(off)cls+=" off";
   if(st.from===n)cls+=" sel st";
   if(st.to===n)cls+=" sel en";
   if(st.from!==null&&st.to!==null&&n>st.from&&n<st.to)cls+=" sel mid";
   h+="<button type=\"button\" class=\""+cls+"\" data-n=\""+n+"\""+(n<T||!ready()?" disabled":"")+">"+(j+1)+p+"</button>";
  }
  h+="</div></div>";
 }
 cal.innerHTML=h;
 $("bk-prev").disabled=st.month<=0;
 $("bk-next").disabled=st.month>=16;
}
function pick(n){
 if(!ready()||n<T)return;say("");
 if(st.from===null||st.to!==null){if(closed(n))return;st.from=n;st.to=null;}
 else if(n<=st.from){if(closed(n))return;st.from=n;}
 else{
  for(var k=st.from;k<n;k++)if(closed(k)){say("Cette période comprend des nuits indisponibles ou fermées : choisissez d’autres dates.");st.from=closed(n)?null:n;st.to=null;draw();update();return;}
  st.to=n;
 }
 draw();update();
}
function calc(){
 var nights=st.to-st.from,sub=0,k,g=guests(),rm=st.room;
 for(k=st.from;k<st.to;k++)sub+=night(k);
 var pct=0;D.disc.forEach(function(x){if(nights>=x.n&&x.p>pct)pct=x.p;});
 var da=Math.round(sub*pct/100),kind=pct>0?"long":"";
 var until=st.from-T;
 if(D.lm&&D.lm.on&&until>=0&&until<=D.lm.days){
  var lmA=0;
  if(D.lm.mode==="percent")lmA=Math.round(sub*D.lm.pct/100);
  else if(rm.lt!==null&&rm.lt!==undefined){
   var ex=rm.x>0?(Math.max(0,g.a-rm.i)+g.c)*rm.x:0,low=0;
   for(k=st.from;k<st.to;k++)low+=Math.min(rm.p[idx(k)],rm.lt)+ex;
   lmA=Math.round((sub-low)*100)/100;
  }
  if(lmA>da){da=lmA;kind="lm";pct=sub>0?Math.round(lmA/sub*1000)/10:0;}
 }
 var room=sub-da,tot=room,lines=[],tx=0;
 if(D.tax&&D.tax.value>0){
  tx=D.tax.mode==="percent"?room*D.tax.value/100:D.tax.value*nights*(g.a+(D.tax.exChildren?0:g.c));
  tx=Math.round(tx*100)/100;
 }
 D.sup.forEach(function(s){
  var q=st.sup[s.id],pr=s.pr[rm.id];if(!q||!pr)return;
  var a=Math.round(pr*q*(s.u==="nuit"?nights:1)*100)/100;
  lines.push({n:s.n,q:q,a:a,u:s.u,l:s.l});tot+=a;
 });
 tot+=tx;
 return {nights:nights,sub:sub,pct:pct,da:da,kind:kind,lines:lines,tax:tx,total:tot};
}function update(){
 if(mode!=="stay")return;
 var ok=ready()&&st.from!==null&&st.to!==null;
 sum.hidden=!ok;sup.hidden=!ok;idn.hidden=!ok;
 var g=guests(),els=F.elements;
 els.arrival.value=ok?ds(st.from):"";els.departure.value=ok?ds(st.to):"";
 els.room.value=st.room?st.room.n:"";els.adults.value=g.a||"";els.children.value=g.c||"";
 if(!ok){els.recap.value="";return;}
 buildSup();sup.hidden=!st.hasSup;
 var c=calc(),h="<strong>"+e(st.room.n)+"</strong><br>Du "+fr(st.from)+" au "+fr(st.to)+" · "+c.nights+" nuit"+(c.nights>1?"s":"")+" · "+g.a+" adulte"+(g.a>1?"s":"")+(g.c?", "+g.c+" enfant"+(g.c>1?"s":""):"");
 h+="<br>Hébergement : "+eur(c.sub);
 if(c.da>0)h+="<br>"+(c.kind==="lm"?"Remise dernière minute":"Remise séjour long")+" ("+c.pct+" %) : -"+eur(c.da);
 c.lines.forEach(function(l){h+="<br>"+e(l.n)+(l.q>1?" × "+l.q:"")+" : "+eur(l.a);});
 if(c.tax>0)h+="<br>Taxe de séjour : "+eur(c.tax);
 h+="<br><strong>Total estimé : "+eur(c.total)+"</strong><br><span class=\"muted small\">Estimation à confirmer par l’établissement avec la disponibilité réelle.</span>";
 sum.innerHTML=h;
 var sp=[];for(var sid in st.sup)sp.push({id:sid,qty:st.sup[sid]});
 els.roomid.value=st.room.id;els.kind.value="stay";els.payload.value=JSON.stringify({roomAmount:c.sub-c.da,tax:c.tax,total:c.total,discPct:c.pct,discKind:c.kind,sup:sp});
 var r=["Logement : "+st.room.n,"Du "+fr(st.from)+" au "+fr(st.to)+" ("+c.nights+" nuit"+(c.nights>1?"s":"")+")","Voyageurs : "+g.a+" adulte(s)"+(g.c?", "+g.c+" enfant(s)":""),"Hébergement : "+eur(c.sub)];
 if(c.da>0)r.push((c.kind==="lm"?"Remise dernière minute":"Remise séjour long")+" ("+c.pct+" %) : -"+eur(c.da));
 c.lines.forEach(function(l){r.push(l.n+(l.q>1?" x "+l.q:"")+" : "+eur(l.a));});
 if(c.tax>0)r.push("Taxe de séjour : "+eur(c.tax));
 r.push("Total estimé : "+eur(c.total));
 els.recap.value=r.join(NL);
}
function buildSup(){
 var key=st.room.id;if(supFor===key)return;supFor=key;st.sup={};
 var h="",any=false;
 D.sup.forEach(function(s){
  var pr=s.pr[key];if(!pr)return;any=true;
  var q=(s.u==="nuit"||s.u==="sejour")?"":"<input type=\"number\" min=\"1\" max=\""+s.mx+"\" value=\"1\" data-q=\""+e(s.id)+"\" aria-label=\"Quantité\" class=\"bk-q\">";
  h+="<div class=\"bk-opt\"><label class=\"bk-ck\"><input type=\"checkbox\" data-s=\""+e(s.id)+"\"> <span>"+e(s.n)+" <span class=\"muted\">· "+eur(pr)+" "+e(s.l)+"</span></span></label>"+q+"</div>";
 });
 supl.innerHTML=any?h:"<p class=\"muted\">Aucun service en supplément pour ce logement.</p>";
 st.hasSup=any;
}
function readSup(){
 var o={};
 [].slice.call(supl.querySelectorAll("input[data-s]")).forEach(function(c){
  if(!c.checked)return;var id=c.getAttribute("data-s"),q=supl.querySelector("input[data-q=\""+id+"\"]");
  var v=q?Math.max(1,Math.floor(+q.value||1)):1;o[id]=v;
 });
 st.sup=o;update();
}
supl.addEventListener("change",readSup);supl.addEventListener("input",readSup);
cal.addEventListener("click",function(ev){var b=ev.target.closest?ev.target.closest("button[data-n]"):null;if(b)pick(+b.getAttribute("data-n"));});
$("bk-prev").addEventListener("click",function(){if(st.month>0){st.month-=1;draw();}});
$("bk-next").addEventListener("click",function(){st.month+=1;draw();});
rs.addEventListener("change",onRoom);
ad.addEventListener("change",refresh);ch.addEventListener("change",refresh);
F.addEventListener("reset",function(){setTimeout(function(){supFor="";onRoom();syncMode();if(AL)aSetup();},0);});
var mode="stay";
var AL=$("bk-alone");
function syncMode(){
 var r=$("bk-mode-alone");mode=r&&r.checked?"alone":"stay";
 var st1=$("bk-stay");if(st1)st1.hidden=mode!=="stay";
 if(AL)AL.hidden=mode!=="alone";
 if(mode==="stay")update();else aUpdate();
}
var ai=$("al-item"),ao=$("al-opt"),aq=$("al-qty"),asl=$("al-slots"),af=$("al-from"),at=$("al-to"),asum=$("al-sum"),amsg=$("al-msg");
function aitem(){
 if(!ai||!ai.value||!D.alone)return null;
 var p=ai.value.split(":"),k=p.shift(),id=p.join(":");
 for(var i=0;i<D.alone.length;i++)if(D.alone[i].k===k&&D.alone[i].id===id)return D.alone[i];
 return null;
}
function nopts(n,from,to){var h="";for(var i=from;i<=to;i++)h+="<option value=\""+i+"\">"+i+"</option>";n.innerHTML=h;}
function aSetup(){
 var it=aitem();
 $("al-optw").hidden=true;$("al-qtyw").hidden=true;$("al-slotw").hidden=true;$("al-tow").hidden=true;
 $("al-desc").textContent=it?(it.d+(it.c?" · "+it.c:"")):"";
 if(it){
  var needTo=false;
  $("al-qtyw").hidden=false;nopts(aq,1,it.mx);
  if(it.k==="r"){
   $("al-qlabel").textContent="Personnes";
   ao.innerHTML=it.h>0?"<option value=\"slot\">Créneau</option><option value=\"half\">Demi-journée (par personne)</option>":"";
   $("al-optw").hidden=!(it.h>0);
   needTo=it.m==="per_day";
   if(it.m==="per_slot"||it.m==="per_person_slot"){$("al-slotw").hidden=false;nopts(asl,1,8);}
  }else{
   $("al-qlabel").textContent=it.m==="animal"?"Animaux":it.m==="personne"?"Personnes":"Quantité";
   if(it.o.length){var h2="";it.o.forEach(function(o){h2+="<option value=\""+e(o.i)+"\">"+e(o.l)+" · "+eur(o.p)+"</option>";});ao.innerHTML=h2;$("al-optw").hidden=false;needTo=true;}
   else if(it.m==="nuit")needTo=true;
  }
  $("al-tow").hidden=!needTo;
 }
 aUpdate();
}
function aUpdate(){
 if(mode!=="alone")return;
 var it=aitem(),els=F.elements;
 amsg.textContent="";amsg.className="bkmsg";
 var ok=false;
 if(it&&af.value){
  var needTo=!$("al-tow").hidden,qty=+aq.value||1,from=dnum(af.value),to=at.value?dnum(at.value):from;
  var days=to-from+1,total=0,what=[];
  if(from<T)amsg.textContent="Cette date est passée.";
  else if(needTo&&(!at.value||to<from))amsg.textContent=at.value?"La dernière date ne peut pas précéder la première.":"";
  else{
   if(it.k==="r"){
    var half=it.h>0&&ao.value==="half";
    if(it.m==="free")total=0;
    else if(half){total=it.h*qty;what.push("Demi-journée × "+qty+" personne"+(qty>1?"s":""));}
    else if(it.m==="per_slot"){var s1=+asl.value||1;total=it.p*s1;what.push(s1+" créneau"+(s1>1?"x":""));}
    else if(it.m==="per_person_slot"){var s2=+asl.value||1;total=it.p*qty*s2;what.push(qty+" personne"+(qty>1?"s":"")+", "+s2+" créneau"+(s2>1?"x":""));}
    else{total=it.p*days;what.push(days+" jour"+(days>1?"s":""));}
    if(it.m==="free")what.push("Gratuit");
    ok=true;
   }else{
    var opt=null;it.o.forEach(function(o){if(o.i===ao.value)opt=o;});
    if(opt){var nl=/nuit/i.test(opt.l),cnt=nl?Math.max(1,to-from):days;total=opt.p*qty*cnt;what.push(opt.l+" × "+qty+", "+cnt+(nl?" nuit":" jour")+(cnt>1?"s":""));ok=true;}
    else if(it.m==="nuit"){var nn=to-from;if(nn<1)amsg.textContent="Indiquez la date de fin (au moins une nuit).";else{total=it.p*qty*nn;what.push(qty+" × "+nn+" nuit"+(nn>1?"s":""));ok=true;}}
    else{total=it.p*qty;what.push("Quantité : "+qty);ok=true;}
   }
  }
  if(ok){
   total=Math.round(total*100)/100;
   var period=needTo&&to>from?"Du "+fr(from)+" au "+fr(to):"Le "+fr(from);
   asum.innerHTML="<strong>"+e(it.n)+"</strong><br>"+e(period)+"<br>"+e(what.join(" · "))+"<br><strong>Total estimé : "+eur(total)+"</strong><br><span class=\"muted small\">Estimation à confirmer par l’établissement.</span>";
   els.arrival.value=ds(from);els.departure.value=ds(needTo&&to>from?to:from);els.room.value=it.n;els.roomid.value=it.id;els.kind.value="alone";els.payload.value=JSON.stringify({total:total,roomAmount:total});els.adults.value=qty;els.children.value="";
   els.recap.value=["Réservation sans hébergement : "+it.n,period,what.join(" ; "),"Total estimé : "+eur(total)].join(NL);
  }
 }
 asum.hidden=!ok;idn.hidden=!ok;
 if(!ok){els.recap.value="";els.arrival.value="";els.departure.value="";}
}
if(AL){
 ai.addEventListener("change",aSetup);
 [ao,aq,asl,af,at].forEach(function(n){n.addEventListener("change",aUpdate);n.addEventListener("input",aUpdate);});
 [$("bk-mode-stay"),$("bk-mode-alone")].forEach(function(r){if(r)r.addEventListener("change",syncMode);});
}
draw();
if(C.connector&&C.id&&window.fetch){
 fetch(C.connector+"?action=siteAvailability&id="+encodeURIComponent(C.id)).then(function(r){return r.json();}).then(function(j){
  if(!j||j.status!=="success")return;
  /* Prix, remises, services et taxe à jour (envoyés par l’application à chaque enregistrement) */
  if(j.live&&j.live.v===2&&j.live.rooms&&j.live.rooms.length){
   setData(j.live);
   var mn=$("bk-mode-note");if(mn&&D.mode)mn.textContent=D.mode==="auto"?"Si les dates sont libres, votre réservation est confirmée tout de suite.":"Votre demande sera effective après validation de l’établissement.";
   if(st.room){var nr=roomOf(st.room.id);if(!nr){rs.value="";onRoom();return;}st.room=nr;supFor="";}
  }
  avail=j.rooms||{};
  if(st.room){buildClosed(st.room);if(st.from!==null&&st.to!==null)for(var k=st.from;k<st.to;k++)if(closed(k)){st.from=st.to=null;say("Ces dates viennent d’être prises : choisissez-en d’autres.");break;}draw();update();}
  else draw();
 }).catch(function(){});
}
})();
if(C.preview){
 var pages=[].slice.call(document.querySelectorAll('[data-page]'));
 var show=function(id){
  var hit=pages.some(function(p){return p.getAttribute('data-page')===id;});
  if(!hit&&pages.length)id=pages[0].getAttribute('data-page');
  pages.forEach(function(p){p.hidden=p.getAttribute('data-page')!==id;});
  document.querySelectorAll('nav a[data-go]').forEach(function(a){if(a.getAttribute('data-go')===id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  if(n)n.classList.remove('open');window.scrollTo(0,0);
 };
 document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[data-go]');if(a){e.preventDefault();show(a.getAttribute('data-go'));}});
 show(C.first||'');
}
})();
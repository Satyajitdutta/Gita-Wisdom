import {showLoader, hideLoader} from './ui.js';
import {currentUser} from './auth.js';

const API='https://bhagavadgitaapi.in/slok';
// fallback local verses (tiny sample) to keep bundle small
const fallbackVerses={
  "1/1":{
    slok:"धृतराष्ट्र उवाच | धर्मक्षेत्रे कुरुक्षेत्रे समवेता यuyutsavaḥ...",
    transliteration:"dhṛitarāṣhṭra uvācha...",
    translation:"King Dhritarashtra said...",
    explanation:{adult:"...",teenager:"...",child:"..."}
  }
};

export async function loadVerse(ch, vs, lang='english'){
  const key=`${ch}/${vs}`;
  showLoader();
  try{
    const res=await fetch(`${API}/${ch}/${vs}`);
    const data= await res.json();
    const exp=data[`${lang}Explanation`] || data.explanation || fallbackVerses[key]?.explanation.adult;
    renderVerse(data.slok, data.transliteration, data.translation, exp);
  }catch(e){
    const f=fallbackVerses[key];
    if(f) renderVerse(f.slok,f.transliteration,f.translation,f.explanation[currentUser().ageGroup]||f.explanation.adult);
    else alert('Verse unavailable');
  }
  hideLoader();
}

function renderVerse(sanskrit, translit, trans, expl){
  document.getElementById('sanskritVerse').textContent=sanskrit;
  document.getElementById('transliteration').textContent=translit;
  document.getElementById('translation').textContent=trans;
  document.getElementById('explanation').innerHTML=expl;
}

export function randomVerse(){
  const ch=Math.ceil(Math.random()*18);
  const vs=Math.ceil(Math.random()*Math.min(47, [47,72,43,42,29,47,30,28,34,42,55,20,35,27,20,24,28,78][ch-1]));
  document.getElementById('chapterSelect').value=ch;
  populateVerses(ch);
  document.getElementById('verseSelect').value=vs;
  loadVerse(ch,vs);
}

export function initExplore(){
  const chSel=document.getElementById('chapterSelect');
  const vsSel=document.getElementById('verseSelect');
  const langSel=document.getElementById('langSelect');
  const randBtn=document.getElementById('randomBtn');

  // populate chapters
  const chapters=[...Array(18)].map((_,i)=>{
    const names=["Arjuna's Dilemma","Sankhya Yoga","Karma Yoga","Jnana Yoga","Karma Sanyas","Dhyan Yoga","Jnana Vigyana","Akshar Brahma","Raja Vidya","Vibhuti","Vishvaroop","Bhakti","Kshetra-Kshetrajna","Gunatraya","Purushottam","Daivasura","Shraddha","Moksha"];
    return {value:i+1,text:`${i+1}: ${names[i]}`};
  });
  chSel.innerHTML=chapters.map(c=>`<option value="${c.value}">${c.text}</option>`).join('');
  chSel.onchange=()=>populateVerses(chSel.value);
  vsSel.onchange=()=>loadVerse(chSel.value, vsSel.value, langSel.value);
  langSel.onchange=()=>loadVerse(chSel.value, vsSel.value, langSel.value);
  randBtn.onclick=randomVerse;

  // restore last position
  const u=currentUser();
  if(!u.isAdmin && u.lastChapter){
    chSel.value=u.lastChapter;
    populateVerses(u.lastChapter);
    if(u.lastVerse) vsSel.value=u.lastVerse;
    loadVerse(u.lastChapter, u.lastVerse);
  }else{
    loadVerse(1,1);
  }
}

function populateVerses(ch){
  const vsSel=document.getElementById('verseSelect');
  const count=[47,72,43,42,29,47,30,28,34,42,55,20,35,27,20,24,28,78][ch-1];
  vsSel.innerHTML=[...Array(count)].map((_,i)=>`<option value="${i+1}">${i+1}</option>`).join('');
}

// SPEAK YOUR MIND
export function initSpeak(){
  const input=document.getElementById('questionInput');
  const micBtn=document.getElementById('micBtn');
  const askBtn=document.getElementById('askBtn');
  const left=document.getElementById('questionsLeft');
  const user=currentUser();

  function updateLeft(){
    left.textContent=`${user.questionsLeft} questions left`;
    askBtn.disabled=user.questionsLeft<=0;
  }
  updateLeft();

  // mic
  if('webkitSpeechRecognition' in window || 'SpeechRecognition' in window){
    const rec=new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    rec.lang='en-IN';
    rec.onresult=e=>input.value=e.results[0][0].transcript;
    micBtn.onclick=()=>rec.start();
  }

  askBtn.onclick=async ()=>{
    if(user.questionsLeft<=0){openModal(document.getElementById('upgradeModal'));return;}
    const q=input.value.trim();if(!q)return;
    showLoader();
    // cheapest LLM-like logic: keyword match + random fallback
    const verse=await getRelevantVerse(q);
    renderAIResponse(verse);
    user.questionsLeft--;
    localStorage.setItem('gitaUser_'+user.email, JSON.stringify(user));
    updateLeft();
    hideLoader();
  };
}

async function getRelevantVerse(query){
  // simple keyword map + random fallback
  const map={
    "stress":"2/47","fear":"11/32","anger":"2/62","desire":"2/59"
  };
  const key=Object.keys(map).find(k=>query.toLowerCase().includes(k)) || Object.keys(map)[Math.floor(Math.random()*Object.keys(map).length)];
  const [ch,vs]=map[key].split('/').map(Number);
  const res=await fetch(`${API}/${ch}/${vs}`);
  return await res.json();
}

function renderAIResponse(data){
  document.getElementById('aiResponse').classList.remove('hidden');
  document.getElementById('aiSanskrit').textContent=data.slok;
  document.getElementById('aiTranslation').textContent=data.translation;
  document.getElementById('aiGuidance').innerHTML=data.explanation[currentUser().ageGroup] || data.explanation.adult || "Contemplate this wisdom.";
}

// REMINDERS
export function initReminders(){
  const enable=document.getElementById('enableReminders');
  const time=document.getElementById('reminderTime');
  const saveBtn=document.getElementById('saveReminder');
  const user=currentUser();

  // load saved
  enable.checked=!!user.reminders;
  time.value=user.reminderTime||'08:00';
  saveBtn.onclick=()=>{
    user.reminders=enable.checked;
    user.reminderTime=time.value;
    localStorage.setItem('gitaUser_'+user.email, JSON.stringify(user));
    if(enable.checked) requestNotificationPermission();
    alert('Saved!');
  };
}

function requestNotificationPermission(){
  if(!('Notification' in window)) return;
  if(Notification.permission==='default') Notification.requestPermission();
  if(Notification.permission==='granted') schedule();
}

function schedule(){
  const user=currentUser();
  if(!user.reminders) return;
  const [h,m]=user.reminderTime.split(':').map(Number);
  const now=new Date();
  const target=new Date();
  target.setHours(h,m,0,0);
  if(target<now) target.setDate(target.getDate()+1);
  const delay=target-now;
  setTimeout(()=>{
    if(Notification.permission==='granted'){
      randomVerse();
      const verse=document.getElementById('sanskritVerse').textContent;
      new Notification('Gita Wisdom – Daily Verse',{body:verse});
    }
    schedule();
  },delay);
}
let _current = null;

function currentUser() {
  return _current;
}

export { currentUser };

export function showLoader(){document.getElementById('loader').classList.remove('hidden');}
export function hideLoader(){document.getElementById('loader').classList.add('hidden');}
//export function openModal(el){el.classList.remove('hidden');}
export function closeModal(el){el.classList.add('hidden');}

// UPGRADE
document.getElementById('closeUpgrade').onclick=()=>closeModal(document.getElementById('upgradeModal'));
document.getElementById('confirmUpgrade').onclick=()=>{
  const plan=[...document.querySelectorAll('input[name="plan"]')].find(r=>r.checked).value;
  const user=currentUser();
  user.plan=plan;
  user.questionsLeft=plan==='free'?3:90;
  localStorage.setItem('gitaUser_'+user.email, JSON.stringify(user));
  location.reload();
};

// SPEECH
window.playShloka=(text)=>{
  const utter=new SpeechSynthesisUtterance(text);
  utter.lang='hi-IN';
  utter.rate=.9;
  const voices=window.speechSynthesis.getVoices();
  const v=voices.find(v=>v.lang==='hi-IN' && v.name.includes('Google')) || voices.find(v=>v.lang==='hi-IN') || voices[0];
  utter.voice=v;
  window.speechSynthesis.speak(utter);
};

document.addEventListener('click',e=>{
  if(e.target.classList.contains('audio-btn')){
    const target=document.getElementById(e.target.dataset.target);
    playShloka(target.textContent);
  }
});
//upgrade button magic
document.getElementById('confirmUpgrade').onclick = () => {
  const plan = [...document.querySelectorAll('input[name="plan"]')].find(r => r.checked).value;
  const user = currentUser();
  user.plan = plan;
  user.questionsLeft = plan === 'free' ? 3 : 90;
  localStorage.setItem('gitaUser_' + user.email, JSON.stringify(user));
  location.reload();
};

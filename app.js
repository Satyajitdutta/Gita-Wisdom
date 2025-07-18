import {initAuth, logout, currentUser} from './auth.js';
import {loadVerse, randomVerse, initExplore} from './gita.js';
import {initSpeak} from './gita.js';
import {initReminders} from './gita.js';
//import {showLoader, hideLoader, openModal, closeModal} from './ui.js';

const tabs = ['explore','speak','remind'];

function showTab(name){
  tabs.forEach(t=>{
    document.getElementById(t+'Tab').classList.toggle('hidden', t!==name);
    document.getElementById('tab-'+t).classList.toggle('active', t===name);
  });
}

function initRouting(){
  document.getElementById('tab-explore').onclick=()=>showTab('explore');
  document.getElementById('tab-speak').onclick=()=>showTab('speak');
  document.getElementById('tab-remind').onclick=()=>showTab('remind');
}

function initApp(){
  initRouting();
  initAuth(()=>{
    // after login
    initExplore();
    initSpeak();
    initReminders();
    // open onboarding if needed
    if(currentUser().plan==='free' && !currentUser().hasSeenGuide){
      startGuide();
    }
  });
}

// ONBOARDING
const guideSteps=[
  "Welcome! Let's explore the three tabs.",
  "Explore: choose any chapter/verse or hit Random.",
  "Speak: ask anything & get a verse that answers you.",
  "Reminders: set daily verse notifications.",
  "Free users get 3 questions; upgrade anytime!"
];
let guideIdx=0;
function startGuide(){
  const modal=document.getElementById('guideModal');
  const step=document.getElementById('guideStep');
  const nextBtn=document.getElementById('guideNext');
  function render(){
    step.textContent=guideSteps[guideIdx];
    nextBtn.textContent = guideIdx===guideSteps.length-1 ? 'Finish' : 'Next';
    //openModal(modal);
  }
  nextBtn.onclick=()=>{
    guideIdx++;
    if(guideIdx>=guideSteps.length){
      closeModal(modal);
      const u=currentUser();
      u.hasSeenGuide=true;
      localStorage.setItem('gitaUser', JSON.stringify(u));
      return;
    }
    render();
  };
  render();
}
//Add autocomplete attributes to dynamic inputs
initApp();
const emailInput = document.createElement('input');
emailInput.type = 'email';
emailInput.id = 'email';
emailInput.setAttribute('autocomplete', 'email');
emailInput.placeholder = 'Email';
emailInput.required = true;
// Append the input to the form or wherever it needs to go

const passwordInput = document.createElement('input');
passwordInput.type = 'password';
passwordInput.id = 'password';
passwordInput.setAttribute('autocomplete', 'current-password');
passwordInput.placeholder = 'Password';
passwordInput.required = true;
// Append the input to the form or wherever it needs to go
document.getElementById('tab-upgrade').onclick = () => showTab('upgrade');

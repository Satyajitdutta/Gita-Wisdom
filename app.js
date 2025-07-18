import {initAuth, logout, currentUser} from './auth.js';
import {loadVerse, randomVerse, initExplore} from './gita.js';
import {initSpeak} from './gita.js';
import {initReminders} from './gita.js';
import {showLoader, hideLoader, openModal, closeModal, playShloka} from './ui.js';

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
    openModal(modal);
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

initApp();
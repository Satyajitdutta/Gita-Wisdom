const ADMIN={email:'jeetworkdomain@gmail.com',password:'Admin@321',isAdmin:true,plan:'annual',questionsLeft:Infinity,hasSeenGuide:true};
const DEMO={email:'User1@demo',password:'Demo1',plan:'free',questionsLeft:3,hasSeenGuide:true};

let _current=null;
export function currentUser(){return _current;}

export function initAuth(onLogin){
  document.getElementById('logoutBtn').onclick=logout;
  document.getElementById('toggleAuth').onclick=toggleAuthMode;
  document.getElementById('authForm').onsubmit=handleAuth;
  checkAutoLogin(onLogin);
}

function toggleAuthMode(){
  const isSignup=document.getElementById('signupFields').classList.toggle('hidden');
  document.getElementById('authTitle').textContent=isSignup?'Login':'Sign Up';
  document.getElementById('authSubmit').textContent=isSignup?'Login':'Create Account';
  document.getElementById('toggleAuth').innerHTML=isSignup?"Don't have an account? <span class='link'>Sign up</span>":"Already have an account? <span class='link'>Login</span>";
}

function handleAuth(e){
  e.preventDefault();
  const email=document.getElementById('email').value.trim();
  const pwd=document.getElementById('password').value.trim();
  if(!document.getElementById('signupFields').classList.contains('hidden')){
    // signup
    const fullName=document.getElementById('fullName').value.trim();
    const age=document.getElementById('ageGroup').value;
    const user={email,password:pwd,fullName,ageGroup:age,plan:'free',questionsLeft:3,hasSeenGuide:false,lastChapter:1,lastVerse:1};
    localStorage.setItem('gitaUser_'+email, JSON.stringify(user));
    _current=user;
  }else{
    // login
    if(email===ADMIN.email && pwd===ADMIN.password){_current=ADMIN;}
    else if(email===DEMO.email && pwd===DEMO.password){_current=DEMO;}
    else{
      const u=JSON.parse(localStorage.getItem('gitaUser_'+email)||'null');
      if(!u || u.password!==pwd){alert('Invalid credentials');return;}
      _current=u;
    }
  }
  finishLogin(onLogin);
}

function finishLogin(cb){
  document.getElementById('authPage').classList.add('hidden');
  document.getElementById('mainApp').classList.remove('hidden');
  document.getElementById('upgradeBtn').classList.toggle('hidden', _current.plan!=='free');
  if(_current.plan==='free') document.getElementById('upgradeBtn').onclick=()=>openModal(document.getElementById('upgradeModal'));
  cb();
}

function checkAutoLogin(cb){
  const email=localStorage.getItem('gitaLastEmail');
  if(!email) return;
  const u=JSON.parse(localStorage.getItem('gitaUser_'+email)||'null');
  if(u){_current=u; finishLogin(cb);}
}

export function logout(){
  localStorage.removeItem('gitaLastEmail');
  _current=null;
  location.reload();
}
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',()=>self.clients.claim());
self.addEventListener('push',e=>{
  const data=e.data.json();
  self.registration.showNotification(data.title,{body:data.body});
});
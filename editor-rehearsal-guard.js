/* Restricted authenticated production draft rehearsal. No live publication or storage writes. */
(()=>{
'use strict';
const allowedDrafts=new Set(['tribune_prod_article_drafts','tribune_prod_comic_drafts','tribune_prod_crossword_drafts','tribune_prod_editions','tribune_prod_edition_comics']);
const allowed=(url,method)=>{
  if(['GET','HEAD'].includes(method))return true;
  let u;try{u=new URL(url,location.href)}catch{return false}
  if(u.hostname!=='nlckcelwfcoszbvqyeyr.supabase.co')return false;
  if(u.pathname==='/auth/v1/token'&&method==='POST')return true;
  if(u.pathname==='/auth/v1/logout'&&method==='POST')return true;
  if(u.pathname==='/auth/v1/user'&&method==='PUT')return true;
  const table=u.pathname.match(/^\/rest\/v1\/([a-z_]+)$/)?.[1];
  return allowedDrafts.has(table)&&['POST','PATCH','DELETE'].includes(method);
};
const oldFetch=window.fetch.bind(window);
window.fetch=(input,init={})=>{
 const method=String(init.method||(typeof input==='object'&&input.method)||'GET').toUpperCase();
 const url=typeof input==='string'?input:input?.url;
 if(!allowed(url,method)){console.warn('REHEARSAL BLOCKED',method,url);return Promise.resolve(new Response(JSON.stringify({message:'REHEARSAL_WRITE_BLOCKED'}),{status:403,headers:{'Content-Type':'application/json'}}))}
 return oldFetch(input,init);
};
const oldOpen=XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open=function(method,url,...args){this.__rehearsalBlocked=!allowed(url,String(method).toUpperCase());return oldOpen.call(this,method,url,...args)};
const oldSend=XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send=function(...args){if(this.__rehearsalBlocked){console.warn('REHEARSAL XHR BLOCKED');this.abort();return}return oldSend.apply(this,args)};
if(navigator.sendBeacon)navigator.sendBeacon=()=>false;
document.addEventListener('DOMContentLoaded',()=>{
 const b=document.createElement('div');b.style.cssText='position:sticky;top:0;z-index:2147483647;background:#3b2424;color:white;padding:12px;text-align:center;font:700 14px system-ui';
 b.textContent='PRIVATE EDITOR REHEARSAL · DRAFTS ONLY · LIVE PUBLICATION LOCKED · NOT THE LIVE WEBSITE';
 document.body.prepend(b);
});
})();
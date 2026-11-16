/* TRIBUNE STAGING: browser-side read-only testing guard.
 * Defense-in-depth only: not a replacement for server-side isolation.
 * All network mutations and form submissions are blocked on this staging copy.
 */
(()=>{
  'use strict';
  const blocked=()=>{console.warn('[TRIBUNE STAGING] Mutation blocked: read-only test site.');return new Response(JSON.stringify({error:'STAGING_READ_ONLY'}),{status:403,headers:{'Content-Type':'application/json'}})};
  const nativeFetch=window.fetch.bind(window);
  window.fetch=(input,init={})=>{
    const method=String(init.method||(typeof input==='object'&&input.method)||'GET').toUpperCase();
    if(method!=='GET'&&method!=='HEAD')return Promise.resolve(blocked());
    return nativeFetch(input,init);
  };
  const nativeOpen=XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open=function(method,...args){this.__stagingBlocked=!['GET','HEAD'].includes(String(method).toUpperCase());return nativeOpen.call(this,method,...args)};
  const nativeSend=XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send=function(...args){if(this.__stagingBlocked){console.warn('[TRIBUNE STAGING] XHR mutation blocked.');try{this.abort()}catch{}return;}return nativeSend.apply(this,args)};
  if(navigator.sendBeacon)navigator.sendBeacon=()=>false;
  document.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();alert('This staging website is READ-ONLY. No forms or publications can be submitted here.')},true);
  // Read-only staging reuses publicly served images from the existing live site.
  // No binary assets are copied or changed in production.
  const remapImage=img=>{
    const raw=img.getAttribute('src');
    if(!raw||/^(?:https?:|data:|blob:|\/\/)/i.test(raw))return;
    if(!/\.(?:png|jpe?g|webp|gif|svg)(?:[?#].*)?$/i.test(raw))return;
    img.setAttribute('src','https://fourthandfuckup.com/'+raw.replace(/^\.\//,'').replace(/^\//,''));
  };
  const remapAll=root=>{
    if(root.nodeType!==1)return;
    if(root.matches?.('img'))remapImage(root);
    root.querySelectorAll?.('img').forEach(remapImage);
  };
  const imageObserver=new MutationObserver(records=>{
    for(const rec of records){
      if(rec.type==='attributes'&&rec.target.matches?.('img'))remapImage(rec.target);
      for(const node of rec.addedNodes)remapAll(node);
    }
  });
  imageObserver.observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
  document.addEventListener('DOMContentLoaded',()=>{
    remapAll(document.documentElement);
    const b=document.createElement('div');
    b.setAttribute('role','status');
    b.style.cssText='position:sticky;top:0;z-index:2147483647;background:#3b2424;color:white;padding:8px 14px;text-align:center;font:700 13px system-ui,sans-serif';
    b.textContent='TRIBUNE STAGING · READ-ONLY TEST · NOT THE LIVE NEWSPAPER';
    document.body.prepend(b);
  });
})();

(()=>{
  'use strict';
  const cssFiles=['./app-css-1.txt', './app-css-2.txt', './app-css-3.txt'];
  const jsFiles=['./app-js-1.txt', './app-js-2.txt', './app-js-3.txt', './app-js-4.txt', './app-js-5.txt', './app-js-6.txt', './app-js-7.txt'];
  const fallback=()=>{const d=new Date(),h=d.getHours(),m=String(d.getMinutes()).padStart(2,'0');document.getElementById('hour').textContent=h%12||12;document.getElementById('minute').textContent=m;document.getElementById('ampm').textContent=h>=12?'PM':'AM';document.getElementById('seconds').textContent=String(d.getSeconds()).padStart(2,'0');document.getElementById('date').textContent=d.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});};
  fallback();const ft=setInterval(fallback,1000);
  Promise.all([Promise.all(cssFiles.map(u=>fetch(u).then(r=>{if(!r.ok)throw new Error('Style load failed');return r.text();}))),Promise.all(jsFiles.map(u=>fetch(u).then(r=>{if(!r.ok)throw new Error('App load failed');return r.text();})))])
    .then(([css,js])=>{const style=document.createElement('style');style.textContent=css.join('');document.head.appendChild(style);clearInterval(ft);new Function(js.join(''))();})
    .catch(error=>{console.error('[Deskline loader]',error);document.body.classList.add('load-fallback');});
})();

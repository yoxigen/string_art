if(!self.define){let e,i={};const f=(f,a)=>(f=new URL(f+".js",a).href,i[f]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=f,e.onload=i,document.head.appendChild(e)}else e=f,importScripts(f),i()})).then((()=>{let e=i[f];if(!e)throw new Error(`Module ${f} didn’t register its module`);return e})));self.define=(a,c)=>{const n=e||("document"in self?document.currentScript.src:"")||location.href;if(i[n])return;let r={};const d=e=>f(e,n),s={module:{uri:n},exports:r,require:d};i[n]=Promise.all(a.map((e=>s[e]||d(e)))).then((e=>(c(...e),r)))}}define(["./workbox-873c5e43"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"favicon-152.2f686107.png",revision:"8aba6594abffa4180a0cb72cc4921572"},{url:"favicon-16.a85eb53d.png",revision:"d49f7240ecc1cad06f9326031b6b3490"},{url:"favicon-196.cc405182.png",revision:"b4c8d258f92b49cd136562888780685b"},{url:"favicon-32.b172050f.png",revision:"36a46a5eefb6ffe940d404ec3f7b6ae8"},{url:"favicon-512.5fd56506.png",revision:"044a58c11e1b4fe7bd11607827ce5cd4"},{url:"favicon-96.c34d97c1.png",revision:"99854aa8db7a3895ccb8cf894dbefd5b"},{url:"GitHub-Mark-Light-32px.3ab7bc7b.png",revision:"37d962a0d9a85b7236192cc23e69825f"},{url:"index.2f523550.css",revision:"e9f876addbd4c17c4aeb0a0aaf49f596"},{url:"index.2f523550.css.map",revision:"292cfb114687e10d33139dc6728bd36a"},{url:"index.ffff2575.js",revision:"3a6577540fb42ed2cf3d36dba34f1710"},{url:"index.ffff2575.js.map",revision:"746b7e19937cd44a0148a324251c99a1"},{url:"index.html",revision:"e10e9834fe77038d588f24f456d1caf1"},{url:"manifest.webmanifest",revision:"06aa5b0332a3863904e9b66e89f417f9"},{url:"maskable-icon-192.fc6db75a.png",revision:"fce78f463da46c02a59d78d89d8a790c"},{url:"maskable-icon-512.cda76ca7.png",revision:"7d4bab16a6ae1c6008dfbcafaefb1905"},{url:"string_art_studio.319bd9b7.woff",revision:"eeed06ee01b9b88ed5049e6a864361a7"},{url:"string_art_studio.425770e4.svg",revision:"713537e1415fa41c72e2e93acd311860"}],{})}));
//# sourceMappingURL=service-worker.js.map

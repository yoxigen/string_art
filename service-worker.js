if(!self.define){let e,i={};const c=(c,f)=>(c=new URL(c+".js",f).href,i[c]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=c,e.onload=i,document.head.appendChild(e)}else e=c,importScripts(c),i()})).then((()=>{let e=i[c];if(!e)throw new Error(`Module ${c} didn’t register its module`);return e})));self.define=(f,n)=>{const r=e||("document"in self?document.currentScript.src:"")||location.href;if(i[r])return;let d={};const b=e=>c(e,r),s={module:{uri:r},exports:d,require:b};i[r]=Promise.all(f.map((e=>s[e]||b(e)))).then((e=>(n(...e),d)))}}define(["./workbox-873c5e43"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"favicon-152.2f686107.png",revision:"8aba6594abffa4180a0cb72cc4921572"},{url:"favicon-16.a85eb53d.png",revision:"d49f7240ecc1cad06f9326031b6b3490"},{url:"favicon-196.cc405182.png",revision:"b4c8d258f92b49cd136562888780685b"},{url:"favicon-32.b172050f.png",revision:"36a46a5eefb6ffe940d404ec3f7b6ae8"},{url:"favicon-512.5fd56506.png",revision:"044a58c11e1b4fe7bd11607827ce5cd4"},{url:"favicon-96.c34d97c1.png",revision:"99854aa8db7a3895ccb8cf894dbefd5b"},{url:"GitHub-Mark-Light-32px.3ab7bc7b.png",revision:"37d962a0d9a85b7236192cc23e69825f"},{url:"index.650977c7.css",revision:"473f16381b6175bf898ba4ce16ab9e97"},{url:"index.650977c7.css.map",revision:"530235332db663f7f9300e90f91b07a6"},{url:"index.e39d28df.js",revision:"137d2cb34d96284015666c0d004880f7"},{url:"index.e39d28df.js.map",revision:"ff8c04935e4b12f45903feb85fdb61b9"},{url:"index.html",revision:"49895d2bf8ab52b6fd0ec490c7134cb7"},{url:"manifest.webmanifest",revision:"313885bc3f6b48058c549b981207fec5"},{url:"maskable-icon-192.fc6db75a.png",revision:"fce78f463da46c02a59d78d89d8a790c"},{url:"maskable-icon-512.50f1eb7c.png",revision:"79e9914e61a95f92249e231c5281e778"},{url:"privacy.html",revision:"759a2370f3cf8f83feed53b40bf0c850"},{url:"string_art_studio.319bd9b7.woff",revision:"eeed06ee01b9b88ed5049e6a864361a7"},{url:"string_art_studio.425770e4.svg",revision:"713537e1415fa41c72e2e93acd311860"}],{})}));
//# sourceMappingURL=service-worker.js.map

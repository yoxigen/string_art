const t=2*Math.PI;class e{constructor(t,e){this.context=t.getContext("2d"),this.setConfig(e),this.centerX=t.width/2,this.nails=[]}setConfig({nailRadius:t,nailsColor:e,nailNumbersFontSize:i}){this.nailRadius=t,this.nailsColor=e,this.nailNumbersFontSize=i,this.nails=[]}addNail(t){this.nails.push(t)}fill({drawNumbers:e=!0}={}){this.context.globalCompositeOperation="source-over",this.context.beginPath(),this.context.fillStyle=this.nailsColor,this.context.textBaseline="middle",this.context.font=`${this.nailNumbersFontSize}px sans-serif`;const i=this.nailRadius+4;this.nails.forEach((({point:[n,s],number:a})=>{if(this.context.moveTo(n+this.nailRadius,s),this.context.arc(n,s,this.nailRadius,0,t),e&&null!=a){const t=n<this.centerX,e=[t?n-i:n+i,s];this.context.textAlign=t?"right":"left",this.context.fillText(String(a),...e)}})),this.context.fill(),this.nails=[]}}const i="#171717",n="#ffffff",s=[{key:"general",label:"General",type:"group",defaultValue:"minimized",children:[{key:"showStrings",label:"Show strings",defaultValue:!0,type:"checkbox",isDisabled:({showNails:t})=>!t},{key:"stringWidth",label:"String width",defaultValue:1,type:"range",attr:{min:.2,max:4,step:.2},show:({showStrings:t})=>t},{key:"margin",label:"Margin",defaultValue:20,type:"number",attr:{min:0,max:500,step:1},displayValue:({margin:t})=>`${t}px`}]},{key:"nails",label:"Nails",type:"group",defaultValue:"minimized",children:[{key:"showNails",label:"Show nails",defaultValue:!0,type:"checkbox",isDisabled:({showStrings:t})=>!t},{key:"nailRadius",label:"Nail size",defaultValue:1.5,type:"range",attr:{min:.5,max:5,step:.25},show:({showNails:t})=>t},{key:"nailsColor",label:"Nails color",defaultValue:"#ffffff",type:"color"},{key:"showNailNumbers",label:"Show nail numbers",defaultValue:!1,type:"checkbox",show:({showNails:t})=>t},{key:"nailNumbersFontSize",label:"Nail numbers font size",defaultValue:10,type:"range",attr:{min:6,max:24,step:.5},displayValue:({nailNumbersFontSize:t})=>`${t}px`,show:({showNails:t,showNailNumbers:e})=>t&&e}]},{key:"background",label:"Background",type:"group",defaultValue:"minimized",children:[{key:"darkMode",label:"Dark mode",defaultValue:!0,type:"checkbox"},{key:"customBackgroundColor",label:"Custom background color",defaultValue:!1,type:"checkbox"},{key:"backgroundColor",label:"Background color",defaultValue:i,type:"color",show:({customBackgroundColor:t})=>t}]}];function a(t){return t.reduce(((t,{key:e,defaultValue:i,children:n})=>n?{...t,...a(n)}:{...t,[e]:i}),{})}var o=class{constructor(t){if(!t)throw new Error("Canvas not specified!");this.canvas=t,this.ctx=this.canvas.getContext("2d");const e=window.devicePixelRatio||1,i=this.ctx.webkitBackingStorePixelRatio||this.ctx.mozBackingStorePixelRatio||this.ctx.msBackingStorePixelRatio||this.ctx.oBackingStorePixelRatio||this.ctx.backingStorePixelRatio||1;this.pixelRatio=e/i}get configControls(){return(this.controls??[]).concat(s)}get defaultConfig(){return this._defaultConfig||(this._defaultConfig=a(this.configControls)),this._defaultConfig}get config(){return this._config??this.defaultConfig}set config(t){this._config=Object.assign({},this.defaultConfig,t)}getSize(){return[this.canvas.clientWidth,this.canvas.clientHeight].map((t=>t*this.pixelRatio))}setUpDraw(){this.canvas.removeAttribute("width"),this.canvas.removeAttribute("height");const[t,i]=this.size=this.getSize();Object.assign(this,this.size),this.canvas.setAttribute("width",t),this.canvas.setAttribute("height",i),this.center=this.size.map((t=>t/2)),this.nails?this.nails.setConfig(this.config):this.nails=new e(this.canvas,this.config),this.ctx.clearRect(0,0,...this.size),this.ctx.lineWidth=this.config.stringWidth}afterDraw(){const{showNails:t,showNailNumbers:e}=this.config;t&&(this.drawNails(),this.nails.fill({drawNumbers:e}))}initDraw(){this.setUpDraw(this.config);const{showNails:t,showNailNumbers:e,darkMode:s,backgroundColor:a,customBackgroundColor:o}=this.config;this.ctx.beginPath(),this.ctx.globalCompositeOperation="destination-over",this.ctx.fillStyle=o?a:s?i:n,this.ctx.fillRect(0,0,...this.size),this.ctx.globalCompositeOperation="source-over",t&&(this.drawNails(),this.nails.fill({drawNumbers:e}))}draw({position:t=1/0}={}){this.initDraw();const{showStrings:e}=this.config;if(e){for(this.stringsIterator=this.generateStrings(),this.position=0;!this.drawNext().done&&this.position<t;);this.afterDraw()}}goto(t){if(t!==this.position)if(this.stringsIterator&&t>this.position)for(;!this.drawNext().done&&this.position<t;);else this.draw({position:t})}drawNext(){const t=this.stringsIterator.next();return t.done?this.afterDraw():this.position++,t}generateStrings(){throw new Error("generateStrings method not defined!")}getStepCount(){throw new Error(`'getStepCount' method not implemented for string art type "${this.name}"`)}};var r=class extends o{name="Spirals";id="spirals";link="https://www.etsy.com/il-en/listing/974865185/3d-string-art-spiral-mandala-wall?ref=shop_home_active_10&frs=1";controls=[{key:"n",label:"Number of nails",defaultValue:92,type:"range",attr:{min:3,max:200,step:1}},{key:"radiusIncrease",label:"Size",defaultValue:3,type:"range",attr:{min:1,max:20,step:.2}},{key:"angleStep",label:"Angle step",defaultValue:.05,type:"range",attr:{min:.01,max:1,step:.01}},{key:"nSpirals",label:"Number of spirals",defaultValue:3,type:"range",attr:{min:1,max:20,step:1}},{key:"color",label:"String color",defaultValue:"#00ddff",type:"color"}];*generatePoints(){const{n:t,radiusIncrease:e,angleStep:i,nSpirals:n}=this.config;let s=0,a=0;const[o,r]=this.center;for(let l=0;l<t;l++){for(let t=0;t<n;t++){const e=2*t*Math.PI/n,i=[o+s*Math.sin(a+e),r+s*Math.cos(a+e)];yield{point:i,nailNumber:`${t+1}_${l+1}`}}a+=i,s+=e}}*generateStrings(){const t=this.generatePoints();let e=0;this.ctx.beginPath(),this.ctx.moveTo(...this.center),this.ctx.strokeStyle=this.config.color;let i=this.center;for(const{point:n}of t)this.ctx.beginPath(),this.ctx.moveTo(...i),i=n,this.ctx.lineTo(...n),this.ctx.strokeStyle=this.config.color,this.ctx.stroke(),yield e++}getStepCount(){const{n:t,nSpirals:e}=this.config;return t*e}drawNails(){const t=this.generatePoints();for(const{point:e,nailNumber:i}of t)this.nails.addNail({point:e,number:i})}};const l=2*Math.PI;class c{constructor(t){const{n:e,size:i,margin:n=0,rotation:s=0,center:a,radius:o,reverse:r=!1}=this.config=t;this.center=a??i.map((t=>t/2)),this.radius=o??Math.min(...this.center)-n,this.indexAngle=l/e,this.rotationAngle=-l*s,this.isReverse=r}getPoint(t=0){const e=this.isReverse?this.config.n-1-t:t;return[this.center[0]+Math.sin(e*this.indexAngle+this.rotationAngle)*this.radius,this.center[1]+Math.cos(e*this.indexAngle+this.rotationAngle)*this.radius]}drawNails(t,{nailsNumberStart:e=0,getNumber:i}={}){for(let n=0;n<this.config.n;n++)t.addNail({point:this.getPoint(n),number:i?i(n):n+1+e})}static rotationConfig={key:"rotation",label:"Rotation",defaultValue:0,type:"range",attr:{min:0,max:1+1/360,step:1/360},displayValue:(t,{key:e})=>`${Math.round(360*t[e])}°`}}const h=["left","bottom","right","top"],d=["left","bottom","right","top"],u={left:0,bottom:Math.PI/2,right:Math.PI,top:1.5*Math.PI};var g=class extends o{name="Eye";id="eye";link="https://www.etsy.com/listing/489853161/rose-of-space-string-art-sacred-geometry?ga_order=most_relevant&ga_search_type=all&ga_view_type=gallery&ga_search_query=string+art&ref=sr_gallery_1&epik=dj0yJnU9WXNpM1BDTnNkLVBtcWdCa3AxN1J5QUZRY1FlbkJ5Z18mcD0wJm49ZXdJb2JXZmVpNVVwN1NKQ3lXMy10ZyZ0PUFBQUFBR0ZuUzZv";controls=[{key:"n",label:"Number of nails per side",defaultValue:82,type:"range",attr:{min:2,max:200,step:1}},{key:"layers",label:"Layers",defaultValue:13,type:"range",attr:{min:1,max:20,step:1}},{key:"angle",label:"Layer angle",defaultValue:30,displayValue:({angle:t})=>`${t}°`,type:"range",attr:{min:0,max:45,step:1}},{key:"color",label:"Color",type:"group",children:[{key:"color1",label:"String #1 color",defaultValue:"#11e8bd",type:"color"},{key:"color2",label:"String #2 color",defaultValue:"#6fff52",type:"color"},{key:"colorPerLayer",label:"Color per layer",defaultValue:!1,type:"checkbox"}]}];setUpDraw(){super.setUpDraw();const{n:t,angle:e}=this.config;this.maxSize=Math.min(...this.size)-40,this.nailSpacing=this.maxSize/(t-1),this.layerAngle=e*Math.PI/180}getPoint({index:t,angle:e,layerStart:i,rotation:n}){const s=e+n,a=i.x,o=i.y+this.nailSpacing*t,r=this.center[0],l=this.center[1],c=Math.cos(s),h=Math.sin(s);return[c*(a-r)-h*(o-l)+r,h*(a-r)+c*(o-l)+l]}*drawSide({side:t,color:e="#ffffff",angle:i,size:n,layerStart:s,layerStringCount:a}){const o=h.indexOf(t),r=h[o===h.length-1?0:o+1],l=u[t],c=u[r],d={layerStringCount:a,size:n,layerStart:s,angle:i};for(let i=0;i<=a;i++)this.ctx.beginPath(),this.ctx.moveTo(...this.getPoint({side:t,index:i,rotation:l,...d})),this.ctx.lineTo(...this.getPoint({side:r,index:i,rotation:c,...d})),this.ctx.strokeStyle=e,this.ctx.stroke(),yield i}_getLayerProps(t){const e=this._getLayerColors(t),i=this.layerAngle*t,n=this.maxSize/Math.pow(Math.cos(this.layerAngle)+Math.sin(this.layerAngle),t);return{colors:e,layerAngle:i,layerSize:n,layerStart:{x:this.center[0]-n/2,y:this.center[1]-n/2},layerStringCount:Math.floor(n/this.nailSpacing)}}_getLayerColors(t){const{color1:e,color2:i,colorPerLayer:n}=this.config;if(n){const n=t%2?e:i;return[n,n,n,n]}return[i,e,i,e]}*drawLayer(t){const{colors:e,layerAngle:i,layerSize:n,layerStart:s,layerStringCount:a}=this._getLayerProps(t);for(let t=0;t<h.length;t++)yield*this.drawSide({color:e[t],side:d[t],angle:i,size:n,layerStart:s,layerStringCount:a})}*generateStrings(){const{layers:t}=this.config;for(let e=t-1;e>=0;e--)yield*this.drawLayer(e)}getStepCount(){let t=0;const{layers:e,angle:i,n:n}=this.config,s=i*Math.PI/180,a=Math.min(this.canvas.clientWidth,this.canvas.clientHeight)-40,o=a/(n-1);for(let i=0;i<e;i++){const e=a/Math.pow(Math.cos(s)+Math.sin(s),i);t+=4*(Math.floor(e/o)+1)}return t}drawNails(){const{layers:t}=this.config;for(let e=t-1;e>=0;e--){const{layerAngle:t,layerSize:i,layerStart:n,layerStringCount:s}=this._getLayerProps(e);for(let a=0;a<h.length;a++){const o=d[a],r=u[o];for(let l=0;l<=s;l++){const c={layerStringCount:s,size:i,layerStart:n,angle:t};this.nails.addNail({point:this.getPoint({sideOrder:o,index:l,rotation:r,...c}),number:`${e+1}_${a+1}_${l+1}`})}}}}};var p=[class extends o{name="Star";id="star";link="https://www.etsy.com/listing/557818258/string-art-meditation-geometric-yoga?epik=dj0yJnU9Mm1hYmZKdks1eTc3bVY2TkVhS2p2Qlg0N2dyVWJxaTEmcD0wJm49MGlWSXE1SVJ2Vm0xZ0xtaGhITDBWQSZ0PUFBQUFBR0Zwd2lj";controls=[{key:"sides",label:"Sides",defaultValue:3,type:"range",attr:{min:3,max:20,step:1}},{key:"sideNails",label:"Nails per side",defaultValue:40,type:"range",attr:{min:1,max:200,step:1}},c.rotationConfig,{key:"colorGroup",label:"Color",type:"group",children:[{key:"innerColor",label:"Star color",defaultValue:"#2ec0ff",type:"color"},{key:"outterColor",label:"Outter color",defaultValue:"#2a82c6",type:"color"}]}];get n(){if(!this._n){const{n:t,sides:e}=this.config,i=t%e;this._n=t-i}return this._n}setUpDraw(){this._n=null,super.setUpDraw();const{sides:t,rotation:e,sideNails:i,margin:n=0}=this.config;this.circle=new c({size:this.size,n:i*t,margin:n,rotation:e}),this.sideAngle=2*Math.PI/t,this.nailSpacing=this.circle.radius/i,this.starCenterStart=i%1*this.nailSpacing,this.sides=new Array(t).fill(null).map(((t,e)=>{const n=e*this.sideAngle+this.circle.rotationAngle,s=e*i;return{sinSideAngle:Math.sin(n),cosSideAngle:Math.cos(n),circlePointsStart:s,circlePointsEnd:s+i}}))}getStarPoint({side:t,sideIndex:e}){const i=this.starCenterStart+e*this.nailSpacing,{sinSideAngle:n,cosSideAngle:s}=this.sides[t],[a,o]=this.circle.center;return[a+n*i,o+s*i]}*generateStarPoints({reverseOrder:t=!1}={}){const{sides:e,sideNails:i}=this.config;for(let n=0;n<e;n++){const s=0===n?e-1:n-1;for(let e=0;e<i;e++){const a=t?i-e:e;yield{side:n,prevSide:s,sideIndex:a,point:this.getStarPoint({side:n,sideIndex:a})}}}}*drawStar(){const{innerColor:t,sideNails:e}=this.config;let i;this.ctx.strokeStyle=t;for(const{prevSide:t,sideIndex:n,point:s}of this.generateStarPoints()){this.ctx.beginPath(),!n||n%2?this.ctx.moveTo(...s):(this.ctx.moveTo(...i),this.ctx.lineTo(...s));const a=e-n;this.ctx.lineTo(...this.getStarPoint({side:t,sideIndex:a})),i=s,this.ctx.stroke(),yield}}*drawCircle(){const{outterColor:t}=this.config;let e,i=!1;this.ctx.strokeStyle=t;for(const{side:t,prevSide:n,sideIndex:s,point:a}of this.generateStarPoints({reverseOrder:!0})){this.ctx.beginPath(),e||(e=this.circle.getPoint(this.sides[n].circlePointsStart)),this.ctx.moveTo(...e),this.ctx.lineTo(...a),this.ctx.stroke(),yield,this.ctx.beginPath(),this.ctx.moveTo(...a);const o=i?this.sides[n].circlePointsEnd-s:this.sides[t].circlePointsStart+s,r=this.circle.getPoint(o);this.ctx.lineTo(...r),e=this.circle.getPoint(i?this.sides[n].circlePointsEnd-s+1:this.sides[t].circlePointsStart+s-1),this.ctx.lineTo(...e),this.ctx.stroke(),i=!i,yield}}*generateStrings(){yield*this.drawCircle(),yield*this.drawStar()}drawNails(){this.circle.drawNails(this.nails);for(const{point:t,side:e,sideIndex:i}of this.generateStarPoints())this.nails.addNail({point:t,number:i?`${e+1}_${i+1}`:0});this.circle.drawNails(this.nails)}getStepCount(){const{sides:t,sideNails:e}=this.config;return 3*(e*t)}},class extends o{name="Assymetry";id="assymetry";link="https://www.etsy.com/il-en/listing/1018950430/calming-wall-art-in-light-blue-for";controls=[{key:"n",label:"Circle nails",defaultValue:144,type:"range",attr:{min:3,max:300,step:1}},c.rotationConfig,{key:"layers",label:"Layers",type:"group",children:[{key:"layer1",label:"Layer 1",type:"group",children:[{key:"show1",label:"Enable",defaultValue:!0,type:"checkbox"},{key:"size1",label:"Size",defaultValue:.25,type:"range",attr:{min:0,max:.5,step:({config:{n:t}})=>1/t},displayValue:({size1:t,n:e})=>Math.round(e*t),show:({show1:t})=>t},{key:"end1",label:"End Position",defaultValue:1,type:"range",attr:{min:0,max:1,step:({config:{n:t}})=>1/t},displayValue:({end1:t,n:e})=>Math.round(e*t),show:({show1:t})=>t},{key:"color1",label:"Color",defaultValue:"#a94fb0",type:"color",show:({show1:t})=>t},{key:"reverse1",label:"Reverse",defaultValue:!1,type:"checkbox",show:({show1:t})=>t}]},{key:"layer2",label:"Layer 2",type:"group",children:[{key:"show2",label:"Enable",defaultValue:!0,type:"checkbox"},{key:"size2",label:"Size",defaultValue:.125,type:"range",attr:{min:0,max:.5,step:({config:{n:t}})=>1/t},displayValue:({size2:t,n:e})=>Math.round(e*t),show:({show2:t})=>t},{key:"end2",label:"End Position",defaultValue:.888,type:"range",attr:{min:0,max:1,step:({config:{n:t}})=>1/t},displayValue:({end2:t,n:e})=>Math.round(e*t),show:({show2:t})=>t},{key:"color2",label:"Color",defaultValue:"#ec6ad0",type:"color",show:({show2:t})=>t},{key:"reverse2",label:"Reverse",defaultValue:!1,type:"checkbox",show:({show2:t})=>t}]},{key:"layer3",label:"Layer 3",type:"group",children:[{key:"show3",label:"Enable",defaultValue:!0,type:"checkbox"},{key:"size3",label:"Size",defaultValue:0,type:"range",attr:{min:0,max:.5,step:({config:{n:t}})=>1/t},displayValue:({size3:t,n:e})=>Math.round(e*t),show:({show3:t})=>t},{key:"end3",label:"End Position",defaultValue:.826,type:"range",attr:{min:0,max:1,step:({config:{n:t}})=>1/t},displayValue:({end2:t,n:e})=>Math.round(e*t),show:({show3:t})=>t},{key:"color3",label:"Color",defaultValue:"#f08ad5",type:"color",show:({show3:t})=>t},{key:"reverse3",label:"Reverse",defaultValue:!0,type:"checkbox",show:({show3:t})=>t}]}]}];setUpDraw(){super.setUpDraw(),Object.assign(this,this.getSetUp())}getSetUp(){const{rotation:t,n:e,margin:i=0}=this.config,n=new c({size:this.getSize(),n:e,margin:i,rotation:t-.25});let s=n.indexAngle*n.radius;const a=Math.floor(n.radius/s)-1;s+=(n.radius-s*a)/a;const o=n.getPoint(0),r=a+e,l=r+a,h=new Array(3).fill(null).map(((t,e)=>d.call(this,e+1))).filter((({enable:t})=>t));function d(t){const i=Math.round(e*this.config["size"+t])+a;return{size:i,endIndex:Math.round(this.config["end"+t]*(r+a))-i,color:this.config["color"+t],enable:this.config["show"+t],isReverse:this.config["reverse"+t]}}return{circle:n,lineSpacing:s,lineNailCount:a,firstCirclePoint:o,layers:h,totalNailCount:r,totalIndexCount:l}}getPoint(t){if(t<this.lineNailCount||t>this.totalNailCount){const e=(t<this.lineNailCount?this.lineNailCount-t:t-this.totalNailCount)*this.lineSpacing;return[this.firstCirclePoint[0]-e*Math.sin(this.circle.rotationAngle),this.firstCirclePoint[1]-e*Math.cos(this.circle.rotationAngle)]}{const e=t-this.lineNailCount;return this.circle.getPoint(e)}}*drawCircle({endIndex:t,color:e,isReverse:i,size:n}){let s,a,o=!1;this.ctx.strokeStyle=e;const r=this,l=i?-1:1;for(let e=0;e<=t;e++)this.ctx.beginPath(),s?(this.ctx.moveTo(...s),this.ctx.lineTo(...this.getPoint(a+l))):this.ctx.moveTo(...this.getPoint(c(e))),a=c(o?e:e+n),s=this.getPoint(a),this.ctx.lineTo(...s),this.ctx.stroke(),yield,o=!o;function c(t){return i?r.totalIndexCount-t:t}}*generateStrings(){for(const t of this.layers)yield*this.drawCircle(t)}drawNails(){this.circle.drawNails(this.nails,{nailsNumberStart:this.lineNailCount});for(let t=0;t<this.lineNailCount;t++)this.nails.addNail({point:this.getPoint(t),number:t+1})}getStepCount(){const{layers:t}=this.getSetUp();return t.reduce(((t,e)=>t+e.endIndex+1),0)}},class extends o{name="Times Tables";id="times_tables";link="https://www.youtube.com/watch?v=LWin7w9hF-E&ab_channel=Jorgedelatierra";controls=[{key:"n",label:"Number of nails",defaultValue:180,type:"range",attr:{min:3,max:240,step:1}},{key:"base",label:"Multiplication",defaultValue:2,type:"range",attr:{min:2,max:99,step:1}},{key:"layers",label:"Layers",defaultValue:7,type:"range",attr:{min:1,max:20,step:1}},c.rotationConfig,{key:"colorGroup",label:"Color",type:"group",children:[{key:"multicolor",label:"Use multiple colors",defaultValue:!0,type:"checkbox"},{key:"multicolorRange",label:"Multicolor range",defaultValue:180,type:"range",attr:{min:1,max:360,step:1},show:({multicolor:t})=>t},{key:"multicolorStart",label:"Multicolor start",defaultValue:256,type:"range",attr:{min:0,max:360,step:1},show:({multicolor:t})=>t},{key:"color",label:"String color",defaultValue:"#ff4d00",type:"color",show:({multicolor:t})=>!t}]}];get n(){if(!this._n){const{n:t,layers:e}=this.config,i=t%e;this._n=t-i}return this._n}setUpDraw(){this._n=null,super.setUpDraw();const{layers:t,multicolorRange:e,rotation:i}=this.config;this.circle=new c({size:this.size,n:this.n,margin:20,rotation:i}),this.multiColorStep=e/t,this.layerShift=Math.floor(this.n/t)}*drawTimesTable({shift:t=0,color:e="#f00",steps:i,time:n}){const{base:s}=this.config,a=this.n,o=i??a;let r=this.circle.getPoint(t);for(let i=1;i<=o;i++){this.ctx.beginPath(),this.ctx.moveTo(...r),r=this.circle.getPoint(i+t),this.ctx.lineTo(...r);const o=i*s%a;this.ctx.lineTo(...this.circle.getPoint(o+t)),this.ctx.strokeStyle=e,this.ctx.stroke(),yield{instructions:`${i-1} → ${i} → ${o} → ${i}`,index:n*a+i}}}*generateStrings(){const{color:t,multicolor:e,layers:i}=this.config;for(let n=0;n<i;n++){const s=e?this.getTimeColor(n,i):t;yield*this.drawTimesTable({time:n,color:s,shift:this.layerShift*n})}}drawNails(){this.circle.drawNails(this.nails)}getTimeColor(t){const{multicolorStart:e,darkMode:i}=this.config;return`hsl(${e+t*this.multiColorStep}, 80%, ${i?50:40}%)`}getStepCount(){return this.config.layers*this.n}},r,class extends o{id="spiral";name="Spiral";link="https://www.etsy.com/il-en/listing/943140543/personalized-gift-string-art-mandala?ref=sim_rv-5&pro=1";controls=[{key:"n",label:"Number of nails",defaultValue:144,type:"range",attr:{min:3,max:200,step:1}},{key:"repetition",label:"Repetition",defaultValue:2,type:"range",attr:{min:1,max:60,step:1}},{key:"innerLength",label:"Spiral thickness",defaultValue:72,type:"range",attr:{min:1,max:144,step:1}},{...c.rotationConfig,defaultValue:.49},{key:"layers",label:"Layers",defaultValue:9,type:"range",attr:{min:1,max:20,step:1}},{key:"layerSpread",label:"Layer spread",defaultValue:13,type:"range",attr:{min:1,max:200,step:1}},{key:"colorGroup",label:"Color",type:"group",children:[{key:"multicolorRange",label:"Multicolor range",defaultValue:216,type:"range",attr:{min:1,max:360,step:1}},{key:"multicolorStart",label:"Multicolor start",defaultValue:263,type:"range",attr:{min:0,max:360,step:1}},{key:"multicolorByLightness",label:"Multicolor by lightness",defaultValue:!0,type:"checkbox"}]}];setUpDraw(){super.setUpDraw();const{n:t,rotation:e}=this.config;this.circle=new c({size:this.size,n:t,rotation:e,margin:20});const{layers:i,multicolorRange:n,multicolorByLightness:s,layerSpread:a}=this.config;this.multiColorStep=n/i,this.multiColorLightnessStep=s?100/i:1,this.layerShift=a}*drawSpiral({shift:t=0,color:e="#f00"}={}){const{repetition:i,innerLength:n}=this.config;this.ctx.moveTo(...this.circle.getPoint(t));let s=n,a=0;this.ctx.strokeStyle=e;for(let e=0;s;e++)this.ctx.beginPath(),this.ctx.lineTo(...this.circle.getPoint(e+s+t)),this.ctx.lineTo(...this.circle.getPoint(e+1+t)),this.ctx.stroke(),a++,a===i&&(s--,a=0),yield e}*generateStrings(){const{layers:t}=this.config;for(let e=0;e<t;e++)yield*this.drawSpiral({color:this.getLayerColor(e),shift:-this.layerShift*e})}getLayerColor(t){const{multicolorStart:e,darkMode:i,multicolorByLightness:n}=this.config,s=n?this.multiColorLightnessStep*t:i?50:40;return`hsl(${e+t*this.multiColorStep}, 80%, ${s}%)`}getStepCount(){const{innerLength:t,repetition:e,layers:i}=this.config;return i*t*e}drawNails(){this.circle.drawNails(this.nails)}},g,class extends o{name="Circles";id="circles";link="https://www.etsy.com/il-en/listing/1018950430/calming-wall-art-in-light-blue-for";controls=[{key:"n",label:"Circle nails",defaultValue:80,type:"range",attr:{min:1,max:300,step:1}},{key:"minNailDistance",label:"Min nail distance",defaultValue:20,type:"range",attr:{min:1,max:300,step:1}},{key:"color",label:"Color",defaultValue:"#ec6ad0",type:"color"},{key:"layers",label:"Layers",type:"group",children:[{key:"layer1",label:"Layer 1",type:"group",children:[{key:"show1",label:"Enable",defaultValue:!0,type:"checkbox"},{key:"radius1",label:"Radius",defaultValue:.5,type:"range",attr:{min:.01,max:1,step:.01},show:({show1:t})=>t},{key:"x1",label:"Position X",defaultValue:.5,type:"range",attr:{min:0,max:1,step:.01},show:({show1:t})=>t},{key:"y1",label:"Position Y",defaultValue:0,type:"range",attr:{min:0,max:1,step:.01},show:({show1:t})=>t},{...c.rotationConfig,key:"rotation1",show:({show1:t})=>t},{key:"reverse1",label:"Reverse",defaultValue:!1,type:"checkbox",show:({show1:t})=>t}]},{key:"layer2",label:"Layer 2",type:"group",children:[{key:"show2",label:"Enable",defaultValue:!0,type:"checkbox"},{key:"radius2",label:"Radius",defaultValue:.5,type:"range",attr:{min:.01,max:1,step:.01},show:({show2:t})=>t},{key:"x2",label:"Position X",defaultValue:0,type:"range",attr:{min:0,max:1,step:.01},show:({show2:t})=>t},{key:"y2",label:"Position Y",defaultValue:1,type:"range",attr:{min:0,max:1,step:.01},show:({show2:t})=>t},{...c.rotationConfig,key:"rotation2",show:({show2:t})=>t},{key:"reverse2",label:"Reverse",defaultValue:!1,type:"checkbox",show:({show2:t})=>t}]},{key:"layer3",label:"Layer 3",type:"group",children:[{key:"show3",label:"Enable",defaultValue:!0,type:"checkbox"},{key:"radius3",label:"Radius",defaultValue:.5,type:"range",attr:{min:.01,max:1,step:.01},show:({show3:t})=>t},{key:"x3",label:"Position X",defaultValue:1,type:"range",attr:{min:0,max:1,step:.01},show:({show3:t})=>t},{key:"y3",label:"Position Y",defaultValue:1,type:"range",attr:{min:0,max:1,step:.01},show:({show3:t})=>t},{...c.rotationConfig,key:"rotation3",show:({show3:t})=>t},{key:"reverse3",label:"Reverse",defaultValue:!1,type:"checkbox",show:({show3:t})=>t}]}]}];setUpDraw(){super.setUpDraw(),Object.assign(this,this.getSetUp())}getSetUp(){const{n:t,margin:e=0,minNailDistance:i}=this.config,n=this.getSize(),s=Math.min(...n.map((t=>t-2*e)))/2,a=new Array(3).fill(null).map(((t,e)=>r.call(this,e+1))).filter((({enable:t})=>t)),o=Math.max(...a.map((({circle:t})=>t.config.n)));function r(a){const o=t=>this.config[t+a],r={enable:o("show"),isReverse:o("reverse"),position:[o("x"),o("y")],radius:s*o("radius"),rotation:o("rotation")},l=2*Math.PI*r.radius,h=Math.min(t,Math.floor(l/i));return{circle:new c({radius:r.radius,center:r.position.map(((t,i)=>r.radius+e+(n[i]-2*(r.radius+e))*t)),n:h,rotation:r.rotation,reverse:r.isReverse}),...r}}return{layers:a,maxShapeNailsCount:o}}getPoint(t,e){const{circle:i}=t;let n=Math.round(e*i.config.n/this.maxShapeNailsCount);return i.getPoint(n)}*generateStrings(){const{n:t,color:e}=this.config;let i;this.ctx.strokeStyle=e;for(let t=0;t<this.maxShapeNailsCount;t++)for(let e=0;e<this.layers.length;e++){const n=this.layers[e];this.ctx.beginPath(),this.ctx.moveTo(...i??this.getPoint(n,t)),0===e&&t&&this.ctx.lineTo(...this.getPoint(n,t));let s=e+1;s===this.layers.length&&(s=0),i=this.getPoint(this.layers[s],t),this.ctx.lineTo(...i),this.ctx.stroke(),yield}}drawNails(){this.config;this.layers.forEach((({circle:t},e)=>t.drawNails(this.nails,{getNumber:t=>`${e+1}_${t+1}`})))}getStepCount(){const{layers:t,maxShapeNailsCount:e}=this.getSetUp();return t.length*e-1}}];const y={controls:document.querySelector("#controls"),sidebarForm:document.querySelector("#sidebar_form")},m=new Set(["input","change"]);let f;class w{constructor({pattern:t}){this.pattern=t,this.state=this._getState()??{groups:{}},this.eventHandlers={input:new Set,change:new Set},this._wrappedOnInput=t=>this._onInput(t),this._toggleFieldset=t=>{if("LEGEND"===t.target.nodeName){t.target.parentElement.classList.toggle("minimized");const e=t.target.parentElement.dataset.group;this.state={...this.state,groups:{...this.state.groups,[e]:!t.target.parentElement.classList.contains("minimized")}},this._updateState(this.state)}},this._toggleFieldSetOnEnter=t=>{"LEGEND"===t.target.nodeName&&"Enter"===t.key&&this._toggleFieldset(t)},y.controls.addEventListener("input",this._wrappedOnInput),y.sidebarForm.addEventListener("click",this._toggleFieldset),y.sidebarForm.addEventListener("keydown",this._toggleFieldSetOnEnter),this.controlElements={},this.renderControls()}destroy(){y.controls.removeEventListener("input",this._wrappedOnInput),y.sidebarForm.removeEventListener("click",this._toggleFieldset),y.sidebarForm.removeEventListener("keydown",this._toggleFieldSetOnEnter),y.controls.innerHTML=""}addEventListener(t,e){if(!m.has(t))throw new Error(`Unsupported event for EditorControls, "${t}"!`);if(!(e instanceof Function))throw new Error("Invalid event handler.");this.eventHandlers[t].add(e)}_triggerEvent(t,e){for(const i of this.eventHandlers[t])i(e)}_onInput(t){requestAnimationFrame((()=>{clearTimeout(f);const e=function(t,e){switch(t){case"range":case"number":return parseFloat(e.value);case"checkbox":return e.checked;default:return e.value}}(t.target.type,t.target),i=t.target.id.replace(/^config_/,"");this.pattern.config=Object.freeze({...this.pattern.config,[i]:e});const{config:n,displayValue:s}=this.controlElements[i];if(s){const e=n.displayValue?n.displayValue(this.pattern.config,n):t.target.value;s.innerText=e}const a=Object.freeze({control:i,value:e,originalEvent:t,pattern:this.pattern});this._triggerEvent("input",a),f=setTimeout((()=>{this._triggerEvent("change",a),this.updateControlsVisibility()}),100)}))}_getState(){const t=localStorage.getItem("controls_state");if(t)try{return JSON.parse(t)}catch(t){return null}return null}_updateState(t){t?localStorage.setItem("controls_state",JSON.stringify(t)):localStorage.removeItem("controls_state")}updateControlsVisibility(t=this.pattern.configControls){t.forEach((t=>{if(t.show){const e=t.show(this.pattern.config),i=this.controlElements[t.key].control;i&&(e?i.removeAttribute("hidden"):i.setAttribute("hidden","hidden"))}if(t.isDisabled){const e=t.isDisabled(this.pattern.config),i=this.controlElements[t.key].input;i&&(e?i.setAttribute("disabled","disabled"):i.removeAttribute("disabled"))}t.children&&this.updateControlsVisibility(t.children)}))}updateInputs(t){Object.entries(t).forEach((([t,e])=>{const{input:i,value:n}=this.controlElements[t];i&&("checkbox"===i.type?i.checked=e:i.value=e,n&&(n.innerText=e))}))}renderControls(t=y.controls,e){const i=e??this.pattern.configControls;t.innerHTML="";const n=document.createDocumentFragment();i.forEach((t=>{const e=`config_${t.key}`,i=this.controlElements[t.key]={config:t};let s;if("group"===t.type){s=document.createElement("fieldset"),s.setAttribute("data-group",t.key);const e=document.createElement("legend");e.setAttribute("tabindex","0"),e.innerText=t.label,s.appendChild(e),s.className="control control_group";const i=document.createElement("div");s.appendChild(i),this.renderControls(i,t.children)}else{s=document.createElement("div"),s.className="control";const n=document.createElement("label");n.innerHTML=t.label,n.setAttribute("for",e);const a=i.input=document.createElement("input");a.setAttribute("type",t.type);const o=this.pattern.config[t.key]??t.defaultValue;if(t.attr&&Object.entries(t.attr).forEach((([t,e])=>{const i=e instanceof Function?e(this.pattern):e;a.setAttribute(t,i)})),"checkbox"===t.type)a.checked=o,s.appendChild(a),s.appendChild(n);else{s.appendChild(n),s.appendChild(a),a.value=o;const e=i.displayValue=document.createElement("span");e.id=`config_${t.key}_value`,e.innerText=t.displayValue?t.displayValue(this.pattern.config,t):o,e.className="control_input_value",s.appendChild(e)}a.id=e}this.controlElements[t.key].control=s,s.id=`control_${t.key}`,n.appendChild(s)})),t.appendChild(n),this.updateGroupsState(),requestAnimationFrame((()=>this.updateControlsVisibility()))}updateGroupsState(){y.sidebarForm.querySelectorAll("[data-group]").forEach((t=>{const e=t.dataset.group,i=this.state.groups[e];"boolean"==typeof i&&(i?t.classList.remove("minimized"):t.classList.add("minimized"))}))}}const b={sizeSelect:document.querySelector("#size_select"),sizeCustom:document.querySelector("#size_custom"),width:document.querySelector("#size_custom_width"),height:document.querySelector("#size_custom_height")};function x(t,e=300){return Math.floor(t/2.54*e)}const S=[Math.floor(window.screen.width*window.devicePixelRatio),Math.floor(window.screen.height*window.devicePixelRatio)],k=[{id:"fit",name:"Fit to screen"},{id:"A4",value:[20,28].map((t=>x(t)))},{id:"A3",value:[28,40].map((t=>x(t)))},{id:"screen",name:`Screen size (${S.join("x")})`,value:S},{id:"custom",name:"Custom..."}];const v={canvas:document.querySelector("canvas"),patternSelector:document.querySelector("#pattern_select"),patternLink:document.querySelector("#pattern_link"),downloadBtn:document.querySelector("#download_btn"),downloadNailsBtn:document.querySelector("#download_nails_btn")},C=p.map((t=>new t(v.canvas)));let V;const N=new class{constructor(t){this.elements={player:t,step:t.querySelector("#step"),stepInstructions:t.querySelector("#step_instructions"),playerPosition:t.querySelector("#player_position"),playBtn:t.querySelector("#play_btn"),pauseBtn:t.querySelector("#pause_btn")},this.stepCount=0,this._isPlaying=!1,this.elements.playerPosition.addEventListener("input",(({target:t})=>{this.goto(+t.value)})),this.elements.playBtn.addEventListener("click",(()=>{this.play()})),this.elements.pauseBtn.addEventListener("click",(()=>{this.pause()}))}updateStatus(t){this._isPlaying!==t&&(this.elements.player.classList.toggle("playing"),this._isPlaying=t)}update(t,{draw:e=!0}={}){this.stringArt=t,this.stepCount=t.getStepCount(),this.elements.playerPosition.setAttribute("max",this.stepCount),this.goto(this.stepCount,{updateStringArt:e})}updatePosition(t){this.elements.step.innerText=`${t}/${this.stepCount}`,this.elements.playerPosition.value=t}goto(t,{updateStringArt:e=!0}={}){this.pause(),this.updatePosition(t),e&&this.stringArt.goto(t)}setInstructions(t){this.elements.stepInstructions.innerText=t}play(){this.updateStatus(!0),cancelAnimationFrame(this.renderRafId),this.stringArt.position===this.stepCount&&this.stringArt.goto(0);const t=this;!function e(){t.stringArt.drawNext().done?t.updateStatus(!1):t.renderRafId=requestAnimationFrame(e);t.updatePosition(t.stringArt.position)}()}pause(){cancelAnimationFrame(this.renderRafId),this.updateStatus(!1)}toggle(){this._isPlaying?this.pause():this.play()}}(document.querySelector("#player")),P=new class{element=document.querySelector("#size_controls");constructor({getCurrentSize:t}){const e=document.createDocumentFragment();k.forEach((t=>{const i=document.createElement("option");i.setAttribute("value",t.id),i.innerText=t.name??t.id,e.appendChild(i)})),b.sizeSelect.appendChild(e),b.sizeSelect.addEventListener("change",(e=>{const i=e.target.value,n=k.find((({id:t})=>t===i));if("custom"===n.id){b.sizeCustom.removeAttribute("hidden");const[e,i]=t();b.width.value=e,b.height.value=i}else b.sizeCustom.setAttribute("hidden","hidden"),this._notifyOnChange(n.value)})),b.sizeCustom.addEventListener("focusin",(t=>{t.target.select()})),b.sizeCustom.addEventListener("input",(()=>{this._notifyOnChange([b.width.value?parseInt(b.width.value):null,b.height.value?parseInt(b.height.value):null])}))}_notifyOnChange([t,e]=[]){this.element.dispatchEvent(new CustomEvent("sizechange",{detail:{width:t,height:e}}))}}({getCurrentSize:()=>[v.canvas.clientWidth,v.canvas.clientHeight]});let _;function E(){const t=document.createElement("a");t.download=V.name+".png",t.href=v.canvas.toDataURL("image/png"),t.setAttribute("target","download"),t.click()}function z(){V.config;V.config={darkMode:!1,showNails:!0,showNailNumbers:!0,showStrings:!1},V.draw(),E()}function L(){N.update(V);const t=JSON.stringify(V.config);history.replaceState({pattern:V.id,config:t},V.name,`?pattern=${V.id}&config=${encodeURIComponent(t)}`)}function M(t){const e=A(t.pattern);v.patternSelector.value=e.id,T(e,{draw:!1,config:t.config?JSON.parse(t.config):null}),V.draw()}function A(t){const e=C.find((({id:e})=>e===t));if(!e)throw new Error(`Pattern with id "${t} not found!`);return e}function T(t,{config:e,draw:i=!0}={}){V=t,e&&(V.config=e),_&&_.destroy(),_=new w({pattern:t,config:e}),_.addEventListener("input",(()=>V.draw())),_.addEventListener("change",L),v.patternLink.setAttribute("href",t.link),i&&V.draw(),N.update(V,{draw:!1}),document.title=`${t.name} - String Art Studio`}!function(){if(function(){window.addEventListener("popstate",(({state:t})=>{M(t)}))}(),function(){P.element.addEventListener("sizechange",(({detail:t})=>{!function({width:t,height:e}){v.canvas.removeAttribute("width"),v.canvas.removeAttribute("height"),t&&e?(v.canvas.style.width=`${t}px`,v.canvas.style.height=`${e}px`):v.canvas.removeAttribute("style");V.draw()}(t)}))}(),function(){C.forEach((t=>{const e=document.createElement("option");e.innerText=t.name,e.value=t.id,v.patternSelector.appendChild(e)})),v.patternSelector.addEventListener("change",(t=>{const e=t.target.value;T(A(e)),history.pushState({pattern:e},e,"?pattern="+e)}))}(),history.state?.pattern)M(history.state);else{const t=new URLSearchParams(document.location.search),e=t.get("pattern");if(e){const i=t.get("config");M({pattern:e,config:i})}else T(C[0])}window.addEventListener("resize",(()=>V.draw())),v.canvas.addEventListener("click",(()=>{N.toggle()})),v.downloadBtn.addEventListener("click",E),v.downloadNailsBtn.addEventListener("click",z)}();
//# sourceMappingURL=index.3fe5dfcb.js.map

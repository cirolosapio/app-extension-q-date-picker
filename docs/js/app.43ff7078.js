(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[1],{0:function(e,n,t){e.exports=t("2f39")},"2f39":function(e,n,t){"use strict";t.r(n);t("7d6e"),t("9f29"),t("62f2"),t("7e6d");var o=t("2b0e"),r=t("875c"),a=t("b05d");o["default"].use(a["a"],{config:{},iconSet:r["a"]});var i=function(){var e=this,n=e.$createElement,t=e._self._c||n;return t("div",{attrs:{id:"q-app"}},[t("router-view")],1)},c=[],l={name:"App"},u=l,s=t("2877"),d=Object(s["a"])(u,i,c,!1,null,null,null),p=d.exports,f=t("8c4f");const w=[{path:"/",component:()=>Promise.all([t.e(0),t.e(3)]).then(t.bind(null,"f241")),children:[{path:"",redirect:"/docs"},{path:"/docs",component:()=>Promise.all([t.e(0),t.e(5)]).then(t.bind(null,"8b24"))}]}];w.push({path:"*",component:()=>t.e(4).then(t.bind(null,"e51e"))});var h=w;o["default"].use(f["a"]);var b=function(){const e=new f["a"]({scrollBehavior:()=>({x:0,y:0}),routes:h,mode:"history",base:"/app-extension-q-date-filter/"});return e},v=async function(){const e="function"===typeof b?await b({Vue:o["default"]}):b,n={router:e,render:e=>e(p),el:"#q-app"};return{app:n,router:e}},m=t("dbd5");async function y(){const{app:e,router:n}=await v();let t=!0;const r=e=>{t=!1,window.location.href=e},a=window.location.href.replace(window.location.origin,""),i=[m["a"]];for(let l=0;!0===t&&l<i.length;l++)if("function"===typeof i[l])try{await i[l]({app:e,router:n,Vue:o["default"],ssrContext:null,redirect:r,urlPath:a})}catch(c){return c&&c.url?void(window.location.href=c.url):void console.error("[Quasar] boot error:",c)}!1!==t&&new o["default"](e)}y()},"7e6d":function(e,n,t){}},[[0,2,0]]]);
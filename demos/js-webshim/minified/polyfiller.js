(function(b){if(window.jQuery)b(jQuery),b=jQuery.noop;"function"===typeof define&&define.amd&&define.amd.jQuery&&define("polyfiller",["jquery"],b)})(function(b){var D=b(document.scripts||"script"),o=b.event.special,E=b([]),f=window.Modernizr,r=window.asyncWebshims,t=f.addTest,z=parseFloat(b.browser.version,10),p=window.Object,F=window.html5||{};f.genericDOM=!!b("<video><div></div></video>")[0].innerHTML;f.advancedObjectProperties=f.objectAccessor=f.ES5=!!("create"in p&&"seal"in p);var d={version:"1.9.0pre",
cfg:{useImportantStyles:!0,waitReady:!0,extendNative:!0,loadStyles:!0,disableShivMethods:!0,basePath:function(){var a=D.filter('[src*="polyfiller.js"]'),a=a[0]||a.end()[a.end().length-1],a=(b.support.hrefNormalized?a.src:a.getAttribute("src",4)).split("?")[0];return a=a.slice(0,a.lastIndexOf("/")+1)+"shims/"}()},bugs:{},browserVersion:z,modules:{},features:{},featureList:[],setOptions:function(a,c){"string"==typeof a&&void 0!==c?k[a]=!b.isPlainObject(c)?c:b.extend(!0,k[a]||{},c):"object"==typeof a&&
b.extend(!0,k,a)},addPolyfill:function(a,c){var c=c||{},e=c.f||a;if(!n[e])n[e]=[],n[e].delayReady=0,d.featureList.push(e),k[e]={};n[e].push(a);c.options=b.extend(k[e],c.options);A(a,c);c.methodNames&&b.each(c.methodNames,function(a,b){d.addMethodName(b)})},polyfill:function(){var a=function(c){var g=[],h;if(k.disableShivMethods&&f.genericDOM&&"html5Clone"in b.support)F.shivMethods=!1;var i=function(){b("html").removeClass("loading-polyfills long-loading-polyfills");b(window).unbind(".lP");clearTimeout(h)};
g.push("loading-polyfills");b(window).bind("load.lP error.lP",i);h=setTimeout(function(){b("html").addClass("long-loading-polyfills")},600);k.waitReady&&b.isReady&&d.warn("Call webshims.polyfill before DOM-Ready or set waitReady to false.");q(c,i);k.useImportantStyles&&g.push("polyfill-important");g[0]&&b("html").addClass(g.join(" "));k.loadStyles&&s.loadCSS("styles/shim.css");a=b.noop},c;return function(e){var g=[],e=e||d.featureList;"string"==typeof e&&(e=e.split(" "));c||(c=-1!==b.inArray("forms",
e),!c&&-1!==b.inArray("forms-ext",e)&&(e.push("forms"),c=!0));k.waitReady&&(b.readyWait++,q(e,function(){b.ready(!0)}));b.each(e,function(a,b){n[b]?(b!==n[b][0]&&q(n[b],function(){l(b,!0)}),g=g.concat(n[b])):(d.warn("could not find webshims-feature (aborted): "+b),l(b,!0))});a(e);u(g)}}(),reTest:function(){var a,c,e=function(e,h){var i=m[h],d=h+"Ready",f;if(i&&!i.loaded&&!(i.test&&b.isFunction(i.test)?i.test([]):i.test)){o[d]&&delete o[d];if((f=n[i.f])&&!c)f.delayReady++,q(h,function(){f.delayReady--;
l(i.f,f.callReady)});a.push(h)}};return function(d,h){c=h;"string"==typeof d&&(d=d.split(" "));a=[];b.each(d,e);u(a)}}(),isReady:function(a,c){if(n[a]&&0<n[a].delayReady){if(c)n[a].callReady=!0;return!1}a+="Ready";if(c){if(o[a]&&o[a].add)return!0;o[a]=b.extend(o[a]||{},{add:function(b){b.handler.call(this,a)}});b.event.trigger(a)}return!(!o[a]||!o[a].add)||!1},ready:function(a,c,e){"string"==typeof a&&(a=a.split(" "));e||(a=b.map(b.grep(a,function(a){return!l(a)}),function(a){return a+"Ready"}));
a.length?(e=a.shift(),b(document).one(e,function(){q(a,c,!0)})):c(b,d,window,document)},capturingEvents:function(a,c){document.addEventListener&&("string"==typeof a&&(a=[a]),b.each(a,function(a,g){var h=function(a){a=b.event.fix(a);c&&d.capturingEventPrevented&&d.capturingEventPrevented(a);return b.event.handle.call(this,a)};o[g]=o[g]||{};!o[g].setup&&!o[g].teardown&&b.extend(o[g],{setup:function(){this.addEventListener(g,h,!0)},teardown:function(){this.removeEventListener(g,h,!0)}})}))},register:function(a,
c){var e=m[a];if(e){if(e.noAutoCallback){var g=function(){c(b,d,window,document,void 0,e.options);l(a,!0)};e.d?q(e.d,g):g()}}else d.warn("can't find module: "+a)},c:{},loader:{addModule:function(a,c){m[a]=c;c.name=c.name||a;if(!c.c)c.c=[];b.each(c.c,function(b,c){d.c[c]||(d.c[c]=[]);d.c[c].push(a)})},loadList:function(){var a=[],c=function(c,e){"string"==typeof e&&(e=[e]);b.merge(a,e);s.loadScript(c,!1,e)},e=function(c,e){if(l(c)||-1!=b.inArray(c,a))return!0;var d=m[c];if(d)if(d=d.test&&b.isFunction(d.test)?
d.test(e):d.test)l(c,!0);else return!1;return!0},g=function(a,c){if(a.d&&a.d.length){var d=function(a,d){!e(d,c)&&-1==b.inArray(d,c)&&c.push(d)};b.each(a.d,function(a,c){m[c]?d(a,c):n[c]&&(b.each(n[c],d),q(n[c],function(){l(c,!0)}))});if(!a.noAutoCallback)a.noAutoCallback=!0}};return function(h){var i,f=[],j,k,l=function(e,h){k=h;b.each(d.c[h],function(c,d){if(-1==b.inArray(d,f)||-1!=b.inArray(d,a))return k=!1});if(k)return c("combos/"+k,d.c[k]),!1};for(j=0;j<h.length;j++)i=m[h[j]],!i||e(i.name,h)?
i||d.warn("could not find: "+h[j]):(i.css&&s.loadCSS(i.css),i.loadInit&&i.loadInit(),i.loaded=!0,g(i,h),f.push(i.name));for(j=0,h=f.length;j<h;j++)k=!1,i=f[j],-1==b.inArray(i,a)&&("noCombo"!=d.debug&&b.each(m[i].c,l),k||c(m[i].src||i,i))}}(),makePath:function(a){if(-1!=a.indexOf("//")||0===a.indexOf("/"))return a;-1==a.indexOf(".")&&(a+=".js");k.addCacheBuster&&(a+=k.addCacheBuster);return k.basePath+a},loadCSS:function(){var a,c=[];return function(d){d=this.makePath(d);-1==b.inArray(d,c)&&(a=a||
b("link, style")[0]||b("script")[0],c.push(d),b('<link rel="stylesheet" />').insertBefore(a).attr({href:d}))}}(),loadScript:function(){var a=[];return function(c,d,g){c=s.makePath(c);if(-1==b.inArray(c,a)){var h=function(){h=null;d&&d();g&&("string"==typeof g&&(g=g.split(" ")),b.each(g,function(a,c){m[c]&&(m[c].afterLoad&&m[c].afterLoad(),l(!m[c].noAutoCallback?c:c+"FileLoaded",!0))}))};a.push(c);window.require?require([c],h):window.sssl?sssl(c,h):window.yepnope?yepnope.injectJs(c,h):window.steal&&
steal(c).then(h)}}}()}};b.webshims=d;var v=("https:"==location.protocol?"https://":"http://")+"ajax.googleapis.com/ajax/libs/",z=v+"jqueryui/1.8.23/",k=d.cfg,n=d.features,l=d.isReady,q=d.ready,j=d.addPolyfill,m=d.modules,s=d.loader,u=s.loadList,A=s.addModule,w=[],G={warn:1,error:1};d.addMethodName=function(a){var a=a.split(":"),c=a[1];1==a.length&&(c=a[0]);a=a[0];b.fn[a]=function(){return this.callProp(c,arguments)}};b.fn.callProp=function(a,c){var e;c||(c=[]);this.each(function(){var g=b.prop(this,
a);if(g&&g.apply){if(e=g.apply(this,c),void 0!==e)return!1}else d.warn(a+" is not a method of "+this)});return void 0!==e?e:this};d.activeLang=function(){var a=navigator.browserLanguage||navigator.language||"";q("webshimLocalization",function(){d.activeLang(a)});return function(c){if(c)if("string"==typeof c)a=c;else if("object"==typeof c){var b=arguments,g=this;q("webshimLocalization",function(){d.activeLang.apply(g,b)})}return a}}();b.each(["log","error","warn","info"],function(a,c){d[c]=function(a){if((G[c]&&
!1!==d.debug||d.debug)&&window.console&&console.log)return console[console[c]?c:"log"](a)}});(function(){b.isDOMReady=b.isReady;if(b.isDOMReady)l("DOM",!0);else{var a=b.ready;b.ready=function(c){if(!0!==c&&!b.isDOMReady)document.body?(b.isDOMReady=!0,l("DOM",!0),b.ready=a):setTimeout(function(){b.ready(c)},13);return a.apply(this,arguments)};b.ready.promise=a.promise}b(function(){b.isDOMReady=!0;l("DOM",!0);setTimeout(function(){l("WINDOWLOAD",!0)},9999)});b(window).load(function(){l("DOM",!0);l("WINDOWLOAD",
!0)})})();(function(){var a=[];b.extend(d,{addReady:function(c){var b=function(a,b){d.ready("DOM",function(){c(a,b)})};a.push(b);b(document,E)},triggerDomUpdate:function(c){if(!c||!c.nodeType)c&&c.jquery&&c.each(function(){d.triggerDomUpdate(this)});else{var e=c.nodeType;if(!(1!=e&&9!=e)){var g=c!==document?b(c):E;b.each(a,function(a,b){b(c,g)})}}}});b.fn.htmlPolyfill=function(a){a=b.fn.html.call(this,a);a===this&&b.isDOMReady&&this.each(function(){1==this.nodeType&&d.triggerDomUpdate(this)});return a};
b.each(["after","before","append","prepend","replaceWith"],function(a,e){b.fn[e+"Polyfill"]=function(a){a=b(a);b.fn[e].call(this,a);b.isDOMReady&&a.each(function(){1==this.nodeType&&d.triggerDomUpdate(this)});return this}});b.each(["insertAfter","insertBefore","appendTo","prependTo","replaceAll"],function(a,e){b.fn[e.replace(/[A-Z]/,function(a){return"Polyfill"+a})]=function(){b.fn[e].apply(this,arguments);b.isDOMReady&&d.triggerDomUpdate(this);return this}});b.fn.updatePolyfill=function(){b.isDOMReady&&
d.triggerDomUpdate(this);return this};b.each(["getNativeElement","getShadowElement","getShadowFocusElement"],function(a,d){b.fn[d]=function(){return this}})})();(function(){var a=p.prototype.hasOwnProperty,c=["configurable","enumerable","writable"],e=function(a){for(var b=0;3>b;b++)if(void 0===a[c[b]]&&("writable"!==c[b]||void 0!==a.value))a[c[b]]=!0},f=function(b){if(b)for(var c in b)a.call(b,c)&&e(b[c])};if(p.create)d.objectCreate=function(a,c,d){f(c);a=p.create(a,c);if(d)a.options=b.extend(!0,
{},a.options||{},d),d=a.options;a._create&&b.isFunction(a._create)&&a._create(d);return a};p.defineProperty&&(d.defineProperty=function(a,b,c){e(c);return p.defineProperty(a,b,c)});if(p.defineProperties)d.defineProperties=function(a,b){f(b);return p.defineProperties(a,b)};d.getOwnPropertyDescriptor=p.getOwnPropertyDescriptor;d.getPrototypeOf=p.getPrototypeOf})();A("jquery-ui",{src:z+"jquery-ui.min.js",test:function(){return!(!b.widget||!b.Widget)}});A("input-widgets",{src:"",test:function(){return!this.src||
!(b.widget&&(!b.fn.datepicker||!b.fn.slider))}});A("swfobject",{src:v+"swfobject/2.2/swfobject.js",test:function(){return"swfobject"in window}});j("es5",{test:!(!f.ES5||!Function.prototype.bind),c:[10,1,22]});j("dom-extend",{f:"dom-support",noAutoCallback:!0,d:["es5"],c:[10,9,12,17,16,8,1,24,19,11,13]});"localstorage"in f&&j("json-storage",{test:f.localstorage&&"sessionStorage"in window&&"JSON"in window,loadInit:function(){u(["swfobject"])},noAutoCallback:!0,c:[14]});"geolocation"in f&&j("geolocation",
{test:f.geolocation,options:{destroyWrite:!0},d:["json-storage"],c:[14,15]});(function(){if("canvas"in f){var a;j("canvas",{src:"excanvas",test:f.canvas,options:{type:"flash"},noAutoCallback:!0,loadInit:function(){var c=this.options.type;if(c&&-1!==c.indexOf("flash")&&(!window.swfobject||swfobject.hasFlashPlayerVersion("9.0.0")))window.FlashCanvasOptions=window.FlashCanvasOptions||{},a=FlashCanvasOptions,"flash"==c?(b.extend(a,{swfPath:k.basePath+"FlashCanvas/"}),this.src="FlashCanvas/flashcanvas"):
(b.extend(a,{swfPath:k.basePath+"FlashCanvasPro/"}),this.src="FlashCanvasPro/flashcanvas")},afterLoad:function(){d.addReady(function(a,d){a==document&&window.G_vmlCanvasManager&&G_vmlCanvasManager.init_&&G_vmlCanvasManager.init_(document);b("canvas",a).add(d.filter("canvas")).each(function(){!this.getContext&&window.G_vmlCanvasManager&&G_vmlCanvasManager.initElement(this)});a==document&&l("canvas",!0)})},methodNames:["getContext"],d:["dom-support"]})}})();var B=f.input,x=f.inputtypes;if(B&&x){var y,
C=d.bugs,v=b('<select required="" name="a"><option disabled="" /></select>')[0];t("formvalidation",function(){return!(!B.required||!B.pattern)});t("fieldsetdisabled",function(){var a=b("<fieldset />")[0];return"elements"in a&&"disabled"in a});if(f.formvalidation)C.bustedValidity=!f.fieldsetdisabled||!(b('<input type="date" value="1488-12-11" />')[0].validity||{valid:!0}).valid||!("required"in v)||(v.validity||{}).valid;t("styleableinputrange",function(){if(!x.range)return!1;var a=document.createElement("input");
a.setAttribute("type","range");return void 0!==a.style.WebkitAppearance});d.validationMessages=d.validityMessages=[];d.inputTypes={};j("form-core",{f:"forms",d:["es5"],test:function(){if(y.lightweightDatalist&&!this.datalistLoaded)this.datalistLoaded=!0,m["form-datalist"].f="forms",d.reTest(["form-datalist"]);return!1},options:{placeholderType:"value",langSrc:"i18n/errormessages-",availabeLangs:"ar,ch-ZN,el,es,fr,he,hi,hu,it,ja,nl,pt-PT,ru".split(",")},methodNames:["setCustomValidity","checkValidity"],
c:[3,2,59,17,16,5,4,24,19]});y=k.forms;f.formvalidation&&!C.bustedValidity?(j("form-extend",{f:"forms",src:"form-native-extend",test:function(a){return(m["form-number-date-api"].test()||-1==b.inArray("form-number-date-api",a||[]))&&!y.overrideMessages},d:["form-core","dom-support","form-message"],c:[18,7,59,5]}),w=w.concat([2,3,23,21])):(w=w.concat([18,7,4,59,5]),j("form-extend",{f:"forms",src:"form-shim-extend",test:function(){return!1},d:["form-core","dom-support"],c:[3,2,23,21]}));j("form-message",
{f:"forms",test:function(a){return!(y.customMessages||!f.formvalidation||!m["form-extend"].test(a)||C.validationMessage||C.bustedValidity)},d:["dom-support"],c:[3,2,23,21,59,17,5,4]});d.addPolyfill("form-output",{f:"forms",test:"value"in document.createElement("output"),d:["dom-support"],c:[3,2,23,21]});j("form-number-date-api",{f:"forms-ext",uiTest:function(){return x.range&&x.date&&x.number},test:function(){return this.uiTest()&&!d.bugs.valueAsNumberSet},d:["forms","dom-support"],c:[18,7,6]});j("form-number-date-ui",
{f:"forms-ext",test:function(){return m["form-number-date-api"].test()&&!this.options.replaceUI},d:["forms","dom-support","form-number-date-api"],loadInit:function(){u(["jquery-ui"]);m["input-widgets"].src&&u(["input-widgets"])},options:{stepArrows:{number:1,time:1},calculateWidth:!0,slider:{},datepicker:{},langSrc:z+"i18n/jquery.ui.datepicker-"},c:[18,7,6]});j("form-datalist",{f:"forms-ext",test:function(){return B.list&&!y.customDatalist},d:["form-core","dom-support"],c:[3,59,18,24,19,11]})}"details"in
f||t("details",function(){return"open"in document.createElement("details")});j("details",{test:f.details,d:["dom-support"],options:{text:"Details"},c:[12,13,15]});if("audio"in f&&"video"in f)d.mediaelement={},j("mediaelement-core",{f:"mediaelement",noAutoCallback:!0,d:["swfobject","dom-support"],c:[10,9,12,17,16,8,22,23,24,20]}),j("mediaelement-swf",{f:"mediaelement",options:{hasToPlay:"any",preferFlash:!1,jwVars:{},jwParams:{},jwAttrs:{},changeJW:b.noop},methodNames:["play","pause","canPlayType",
"mediaLoad:load"],d:["swfobject","dom-support"],test:function(){if(!f.audio||!f.video)return!1;var a=this.options,b=a.hasToPlay;return!((!window.swfobject||window.swfobject.hasFlashPlayerVersion("9.0.115"))&&(a.preferFlash||"any"!=b&&!f.video[b]&&!f.audio[b]))},c:[10,9,22,20]}),t("track",function(){return!(!f.audio||!(window.TextTrack&&"default"in document.createElement("track")))}),j("track",{options:{positionDisplay:!0},test:f.track,d:["mediaelement","dom-support"],methodNames:["addTextTrack"],
c:[]}),d.loader.addModule("track-ui",{d:["track"]});j("feature-dummy",{test:!0,loaded:!0,c:w});b.fn.on||d.error("webshims 1.9.0 needs jQuery 1.7+. Please use a newer version of jQuery");D.filter("[data-polyfill-cfg]").each(function(){try{d.setOptions(b(this).data("polyfillCfg"))}catch(a){d.warn("error parsing polyfill cfg: "+a)}}).end().filter("[data-polyfill]").each(function(){d.polyfill(b.trim(b(this).data("polyfill")||""))});r&&(r.cfg&&d.setOptions(r.cfg),r.lang&&d.activeLang(r.lang),"polyfill"in
r&&d.polyfill(r.polyfill))});

jQuery.webshims.register("dom-extend",function(e,t,n,r,i){"use strict";var s=t.modules,o=/\s*,\s*/,u={},a={},f={},l={},c={},h=e.fn.val,p=function(t,n,r,i,s){return s?h.call(e(t)):h.call(e(t),r)};e.fn.val=function(t){var n=this[0];arguments.length&&t==null&&(t="");if(!arguments.length)return!n||n.nodeType!==1?h.call(this):e.prop(n,"value",t,"val",!0);if(e.isArray(t))return h.apply(this,arguments);var r=e.isFunction(t);return this.each(function(s){n=this;if(n.nodeType===1)if(r){var o=t.call(n,s,e.prop(n,"value",i,"val",!0));o==null&&(o=""),e.prop(n,"value",o,"val")}else e.prop(n,"value",t,"val")})},e.fn.onTrigger=function(e,t){return this.on(e,t).each(t)};var d="_webshimsLib"+Math.round(Math.random()*1e3),v=function(t,n,r){t=t.jquery?t[0]:t;if(!t)return r||{};var s=e.data(t,d);return r!==i&&(s||(s=e.data(t,d,{})),n&&(s[n]=r)),n?s&&s[n]:s};[{name:"getNativeElement",prop:"nativeElement"},{name:"getShadowElement",prop:"shadowElement"},{name:"getShadowFocusElement",prop:"shadowFocusElement"}].forEach(function(t){e.fn[t.name]=function(){return this.map(function(){var e=v(this,"shadowData");return e&&e[t.prop]||this})}}),["removeAttr","prop","attr"].forEach(function(n){u[n]=e[n],e[n]=function(t,r,s,o,l){var h=o=="val",d=h?p:u[n];if(!t||!a[r]||t.nodeType!==1||!h&&o&&n=="attr"&&e.attrFn[r])return d(t,r,s,o,l);var v=(t.nodeName||"").toLowerCase(),m=f[v],g=n!="attr"||s!==!1&&s!==null?n:"removeAttr",y,b,w;m||(m=f["*"]),m&&(m=m[r]),m&&(y=m[g]);if(y){r=="value"&&(b=y.isVal,y.isVal=h);if(g==="removeAttr")return y.value.call(t);if(s===i)return y.get?y.get.call(t):y.value;y.set&&(n=="attr"&&s===!0&&(s=r),w=y.set.call(t,s)),r=="value"&&(y.isVal=b)}else w=d(t,r,s,o,l);if((s!==i||g==="removeAttr")&&c[v]&&c[v][r]){var E;g=="removeAttr"?E=!1:g=="prop"?E=!!s:E=!0,c[v][r].forEach(function(e){(!e.only||(e.only=n=="prop")||e.only=="attr"&&n!="prop")&&e.call(t,s,E,h?"val":g,n)})}return w},l[n]=function(r,s,o){f[r]||(f[r]={}),f[r][s]||(f[r][s]={});var a=f[r][s][n],l=function(e,t,r){return t&&t[e]?t[e]:r&&r[e]?r[e]:n=="prop"&&s=="value"?function(e){var t=this;return o.isVal?p(t,s,e,!1,arguments.length===0):u[n](t,s,e)}:n=="prop"&&e=="value"&&o.value.apply?function(e){var t=u[n](this,s);return t&&t.apply&&(t=t.apply(this,arguments)),t}:function(e){return u[n](this,s,e)}};f[r][s][n]=o,o.value===i&&(o.set||(o.set=o.writeable?l("set",o,a):t.cfg.useStrict&&s=="prop"?function(){throw s+" is readonly on "+r}:e.noop),o.get||(o.get=l("get",o,a))),["value","get","set"].forEach(function(e){o[e]&&(o["_sup"+e]=l(e,a))})}});var m=function(){var e=t.getPrototypeOf(r.createElement("foobar")),n=Object.prototype.hasOwnProperty,i=Modernizr.advancedObjectProperties&&Modernizr.objectAccessor;return function(s,o,u){var a,f;if(i&&(a=r.createElement(s))&&(f=t.getPrototypeOf(a))&&e!==f&&(!a[o]||!n.call(a,o))){var l=a[o];u._supvalue=function(){return l&&l.apply?l.apply(this,arguments):l},f[o]=u.value}else u._supvalue=function(){var e=v(this,"propValue");return e&&e[o]&&e[o].apply?e[o].apply(this,arguments):e&&e[o]},g.extendValue(s,o,u.value);u.value._supvalue=u._supvalue}}(),g=function(){var n={};t.addReady(function(r,i){var s={},o=function(t){s[t]||(s[t]=e(r.getElementsByTagName(t)),i[0]&&e.nodeName(i[0],t)&&(s[t]=s[t].add(i)))};e.each(n,function(e,n){o(e);if(!n||!n.forEach){t.warn("Error: with "+e+"-property. methods: "+n);return}n.forEach(function(t){s[e].each(t)})}),s=null});var i,s=e([]),o=function(t,s){n[t]?n[t].push(s):n[t]=[s],e.isDOMReady&&(i||e(r.getElementsByTagName(t))).each(s)},u={};return{createTmpCache:function(t){return e.isDOMReady&&(i=i||e(r.getElementsByTagName(t))),i||s},flushTmpCache:function(){i=null},content:function(t,n){o(t,function(){var t=e.attr(this,n);t!=null&&e.attr(this,n,t)})},createElement:function(e,t){o(e,t)},extendValue:function(t,n,r){o(t,function(){e(this).each(function(){var e=v(this,"propValue",{});e[n]=this[n],this[n]=r})})}}}(),y=function(e,t){e.defaultValue===i&&(e.defaultValue=""),e.removeAttr||(e.removeAttr={value:function(){e[t||"prop"].set.call(this,e.defaultValue),e.removeAttr._supvalue.call(this)}}),e.attr||(e.attr={})};e.extend(t,{getID:function(){var t=(new Date).getTime();return function(n){n=e(n);var r=n.attr("id");return r||(t++,r="ID-"+t,n.attr("id",r)),r}}(),extendUNDEFProp:function(t,n){e.each(n,function(e,n){e in t||(t[e]=n)})},createPropDefault:y,data:v,moveToFirstEvent:function(t,n,r){var i=(e._data(t,"events")||{})[n],s;i&&i.length>1&&(s=i.pop(),r||(r="bind"),r=="bind"&&i.delegateCount?i.splice(i.delegateCount,0,s):i.unshift(s)),t=null},addShadowDom:function(){var i,s,o,u={init:!1,runs:0,test:function(){var e=u.getHeight(),t=u.getWidth();e!=u.height||t!=u.width?(u.height=e,u.width=t,u.handler({type:"docresize"}),u.runs++,u.runs<9&&setTimeout(u.test,90)):u.runs=0},handler:function(t){clearTimeout(i),i=setTimeout(function(){if(t.type=="resize"){var i=e(n).width(),a=e(n).width();if(a==s&&i==o)return;s=a,o=i,u.height=u.getHeight(),u.width=u.getWidth()}e(r).triggerHandler("updateshadowdom")},t.type=="resize"?50:9)},_create:function(){e.each({Height:"getHeight",Width:"getWidth"},function(e,t){var n=r.body,i=r.documentElement;u[t]=function(){return Math.max(n["scroll"+e],i["scroll"+e],n["offset"+e],i["offset"+e],i["client"+e])}})},start:function(){!this.init&&r.body&&(this.init=!0,this._create(),this.height=u.getHeight(),this.width=u.getWidth(),setInterval(this.test,600),e(this.test),t.ready("WINDOWLOAD",this.test),e(n).bind("resize",this.handler),function(){var t=e.fn.animate,n;e.fn.animate=function(){return clearTimeout(n),n=setTimeout(function(){u.test()},99),t.apply(this,arguments)}}())}};return t.docObserve=function(){t.ready("DOM",function(){u.start()})},function(n,r,i){i=i||{},n.jquery&&(n=n[0]),r.jquery&&(r=r[0]);var s=e.data(n,d)||e.data(n,d,{}),o=e.data(r,d)||e.data(r,d,{}),u={};i.shadowFocusElement?i.shadowFocusElement&&(i.shadowFocusElement.jquery&&(i.shadowFocusElement=i.shadowFocusElement[0]),u=e.data(i.shadowFocusElement,d)||e.data(i.shadowFocusElement,d,u)):i.shadowFocusElement=r,s.hasShadow=r,u.nativeElement=o.nativeElement=n,u.shadowData=o.shadowData=s.shadowData={nativeElement:n,shadowElement:r,shadowFocusElement:i.shadowFocusElement},i.shadowChilds&&i.shadowChilds.each(function(){v(this,"shadowData",o.shadowData)}),i.data&&(u.shadowData.data=o.shadowData.data=s.shadowData.data=i.data),i=null,t.docObserve()}}(),propTypes:{standard:function(e,t){y(e);if(e.prop)return;e.prop={set:function(t){e.attr.set.call(this,""+t)},get:function(){return e.attr.get.call(this)||e.defaultValue}}},"boolean":function(e,t){y(e);if(e.prop)return;e.prop={set:function(t){t?e.attr.set.call(this,""):e.removeAttr.value.call(this)},get:function(){return e.attr.get.call(this)!=null}}},src:function(){var t=r.createElement("a");return t.style.display="none",function(n,r){y(n);if(n.prop)return;n.prop={set:function(e){n.attr.set.call(this,e)},get:function(){var n=this.getAttribute(r),i;if(n==null)return"";t.setAttribute("href",n+"");if(!e.support.hrefNormalized){try{e(t).insertAfter(this),i=t.getAttribute("href",4)}catch(s){i=t.getAttribute("href",4)}e(t).detach()}return i||t.href}}}}(),enumarated:function(e,t){y(e);if(e.prop)return;e.prop={set:function(t){e.attr.set.call(this,t)},get:function(){var t=(e.attr.get.call(this)||"").toLowerCase();if(!t||e.limitedTo.indexOf(t)==-1)t=e.defaultValue;return t}}}},reflectProperties:function(n,r){typeof r=="string"&&(r=r.split(o)),r.forEach(function(r){t.defineNodeNamesProperty(n,r,{prop:{set:function(t){e.attr(this,r,t)},get:function(){return e.attr(this,r)||""}}})})},defineNodeNameProperty:function(n,r,i){return a[r]=!0,i.reflect&&t.propTypes[i.propType||"standard"](i,r),["prop","attr","removeAttr"].forEach(function(s){var o=i[s];o&&(s==="prop"?o=e.extend({writeable:!0},o):o=e.extend({},o,{writeable:!0}),l[s](n,r,o),n!="*"&&t.cfg.extendNative&&s=="prop"&&o.value&&e.isFunction(o.value)&&m(n,r,o),i[s]=o)}),i.initAttr&&g.content(n,r),i},defineNodeNameProperties:function(e,n,r,i){var s;for(var o in n)!i&&n[o].initAttr&&g.createTmpCache(e),r&&(n[o][r]||(n[o][r]={},["value","set","get"].forEach(function(e){e in n[o]&&(n[o][r][e]=n[o][e],delete n[o][e])}))),n[o]=t.defineNodeNameProperty(e,o,n[o]);return i||g.flushTmpCache(),n},createElement:function(n,r,i){var s;return e.isFunction(r)&&(r={after:r}),g.createTmpCache(n),r.before&&g.createElement(n,r.before),i&&(s=t.defineNodeNameProperties(n,i,!1,!0)),r.after&&g.createElement(n,r.after),g.flushTmpCache(),s},onNodeNamesPropertyModify:function(t,n,r,i){typeof t=="string"&&(t=t.split(o)),e.isFunction(r)&&(r={set:r}),t.forEach(function(e){c[e]||(c[e]={}),typeof n=="string"&&(n=n.split(o)),r.initAttr&&g.createTmpCache(e),n.forEach(function(t){c[e][t]||(c[e][t]=[],a[t]=!0),r.set&&(i&&(r.set.only=i),c[e][t].push(r.set)),r.initAttr&&g.content(e,t)}),g.flushTmpCache()})},defineNodeNamesBooleanProperty:function(n,r,s){s||(s={}),e.isFunction(s)&&(s.set=s),t.defineNodeNamesProperty(n,r,{attr:{set:function(e){this.setAttribute(r,e),s.set&&s.set.call(this,!0)},get:function(){var e=this.getAttribute(r);return e==null?i:r}},removeAttr:{value:function(){this.removeAttribute(r),s.set&&s.set.call(this,!1)}},reflect:!0,propType:"boolean",initAttr:s.initAttr||!1})},contentAttr:function(e,t,n){if(!e.nodeName)return;var r;if(n===i)return r=e.attributes[t]||{},n=r.specified?r.value:null,n==null?i:n;typeof n=="boolean"?n?e.setAttribute(t,t):e.removeAttribute(t):e.setAttribute(t,n)},activeLang:function(){var n=[],r={},i,o,u=/:\/\/|^\.*\//,a=function(n,r,i){var s;return r&&i&&e.inArray(r,i.availabeLangs||[])!==-1?(n.loading=!0,s=i.langSrc,u.test(s)||(s=t.cfg.basePath+s),t.loader.loadScript(s+r+".js",function(){n.langObj[r]?(n.loading=!1,l(n,!0)):e(function(){n.langObj[r]&&l(n,!0),n.loading=!1})}),!0):!1},f=function(e){r[e]&&r[e].forEach(function(e){e.callback(i,o,"")})},l=function(e,t){if(e.activeLang!=i&&e.activeLang!==o){var n=s[e.module].options;e.langObj[i]||o&&e.langObj[o]?(e.activeLang=i,e.callback(e.langObj[i]||e.langObj[o],i),f(e.module)):!t&&!a(e,i,n)&&!a(e,o,n)&&e.langObj[""]&&e.activeLang!==""&&(e.activeLang="",e.callback(e.langObj[""],i),f(e.module))}},c=function(t){return typeof t=="string"&&t!==i?(i=t,o=i.split("-")[0],i==o&&(o=!1),e.each(n,function(e,t){l(t)})):typeof t=="object"&&(t.register?(r[t.register]||(r[t.register]=[]),r[t.register].push(t),t.callback(i,o,"")):(t.activeLang||(t.activeLang=""),n.push(t),l(t))),i};return c}()}),e.each({defineNodeNamesProperty:"defineNodeNameProperty",defineNodeNamesProperties:"defineNodeNameProperties",createElements:"createElement"},function(e,n){t[e]=function(e,r,i,s){typeof e=="string"&&(e=e.split(o));var u={};return e.forEach(function(e){u[e]=t[n](e,r,i,s)}),u}}),t.isReady("webshimLocalization",!0)}),function(e,t){if(!Modernizr.localstorage||"hidden"in t.createElement("a"))return;var n={article:"article",aside:"complementary",section:"region",nav:"navigation",address:"contentinfo"},r=function(e,t){var n=e.getAttribute("role");n||e.setAttribute("role",t)};e.webshims.addReady(function(i,s){e.each(n,function(t,n){var o=e(t,i).add(s.filter(t));for(var u=0,a=o.length;u<a;u++)r(o[u],n)});if(i===t){var o=t.getElementsByTagName("header")[0],u=t.getElementsByTagName("footer"),a=u.length;o&&!e(o).closest("section, article")[0]&&r(o,"banner");if(!a)return;var f=u[a-1];e(f).closest("section, article")[0]||r(f,"contentinfo")}})}(jQuery,document),function(e){"use strict";var t="webkitURL"in window,n=window.Modernizr,r=e.webshims,i=r.bugs,s=e('<form action="#" style="width: 1px; height: 1px; overflow: hidden;"><select name="b" required="" /><input required="" name="a" /></form>'),o=function(){if(s[0].querySelector)try{i.findRequired=!s[0].querySelector("select:required")}catch(e){i.findRequired=!1}},u=e("input",s).eq(0),a=function(e){r.loader.loadList(["dom-extend"]),r.ready("dom-extend",e)};i.findRequired=!1,i.validationMessage=!1,r.capturingEventPrevented=function(t){if(!t._isPolyfilled){var n=t.isDefaultPrevented,r=t.preventDefault;t.preventDefault=function(){return clearTimeout(e.data(t.target,t.type+"DefaultPrevented")),e.data(t.target,t.type+"DefaultPrevented",setTimeout(function(){e.removeData(t.target,t.type+"DefaultPrevented")},30)),r.apply(this,arguments)},t.isDefaultPrevented=function(){return!!(n.apply(this,arguments)||e.data(t.target,t.type+"DefaultPrevented")||!1)},t._isPolyfilled=!0}};if(!n.formvalidation||i.bustedValidity)o();else{r.capturingEvents(["input"]),r.capturingEvents(["invalid"],!0);if(window.opera||window.testGoodWithFix)s.appendTo("head"),o(),i.validationMessage=!u.prop("validationMessage"),r.reTest(["form-native-extend","form-message"]),s.remove(),e(function(){a(function(){var t=function(e){e.preventDefault()};["form","input","textarea","select"].forEach(function(n){var i=r.defineNodeNameProperty(n,"checkValidity",{prop:{value:function(){r.fromSubmit||e(this).on("invalid.checkvalidity",t),r.fromCheckValidity=!0;var n=i.prop._supvalue.apply(this,arguments);return r.fromSubmit||e(this).unbind("invalid.checkvalidity",t),r.fromCheckValidity=!1,n}}})})})});t&&!r.bugs.bustedValidity&&function(){var t=/^(?:textarea|input)$/i,n=!1;document.addEventListener("contextmenu",function(e){t.test(e.target.nodeName||"")&&(n=e.target.form)&&setTimeout(function(){n=!1},1)},!1),e(window).on("invalid",function(e){e.originalEvent&&n&&n==e.target.form&&(e.wrongWebkitInvalid=!0,e.stopImmediatePropagation())})}()}e.webshims.register("form-core",function(e,r,i,s,o,u){var a={checkbox:1,radio:1},f=e([]),l=r.bugs,c={radio:1},h=function(t){t=e(t);var n,r,i=f;return c[t[0].type]&&(r=t.prop("form"),n=t[0].name,n?r?i=e(r[n]):i=e(s.getElementsByName(n)).filter(function(){return!e.prop(this,"form")}):i=t,i=i.filter('[type="radio"]')),i},p=r.getContentValidationMessage=function(t,n,r){var i=e(t).data("errormessage")||t.getAttribute("x-moz-errormessage")||"";return r&&i[r]&&(i=i[r]),typeof i=="object"&&(n=n||e.prop(t,"validity")||{valid:1},n.valid||e.each(n,function(e,t){if(t&&e!="valid"&&i[e])return i=i[e],!1})),typeof i=="object"&&(i=i.defaultMessage),i||""},d={number:1,range:1,date:1},v=function(t){var n=!1;return e(e.prop(t,"elements")).each(function(){n=e(this).is(":invalid");if(n)return!1}),n};e.extend(e.expr[":"],{"valid-element":function(t){return e.nodeName(t,"form")?!v(t):!!e.prop(t,"willValidate")&&!!g(t)},"invalid-element":function(t){return e.nodeName(t,"form")?v(t):!!e.prop(t,"willValidate")&&!g(t)},"required-element":function(t){return!!e.prop(t,"willValidate")&&!!e.prop(t,"required")},"user-error":function(t){return e.prop(t,"willValidate")&&e(t).hasClass("user-error")},"optional-element":function(t){return!!e.prop(t,"willValidate")&&e.prop(t,"required")===!1},"in-range":function(t){if(!d[e.prop(t,"type")]||!e.prop(t,"willValidate"))return!1;var n=e.prop(t,"validity");return!!(n&&!n.rangeOverflow&&!n.rangeUnderflow)},"out-of-range":function(t){if(!d[e.prop(t,"type")]||!e.prop(t,"willValidate"))return!1;var n=e.prop(t,"validity");return!(!n||!n.rangeOverflow&&!n.rangeUnderflow)}}),["valid","invalid","required","optional"].forEach(function(t){e.expr[":"][t]=e.expr.filters[t+"-element"]}),e.expr[":"].focus=function(e){try{var t=e.ownerDocument;return e===t.activeElement&&(!t.hasFocus||t.hasFocus())}catch(n){}return!1};var m=e.event.customEvent||{},g=function(t){return(e.prop(t,"validity")||{valid:1}).valid};(l.bustedValidity||l.findRequired)&&function(){var t=e.find,r=e.find.matchesSelector,i=/(\:valid|\:invalid|\:optional|\:required|\:in-range|\:out-of-range)(?=[\s\[\~\.\+\>\:\#*]|$)/ig,o=function(e){return e+"-element"};e.find=function(){var e=Array.prototype.slice,n=function(n){var r=arguments;return r=e.call(r,1,r.length),r.unshift(n.replace(i,o)),t.apply(this,r)};for(var r in t)t.hasOwnProperty(r)&&(n[r]=t[r]);return n}();if(!n.prefixed||n.prefixed("matchesSelector",s.documentElement))e.find.matchesSelector=function(e,t){return t=t.replace(i,o),r.call(this,e,t)}}();var y=e.prop,b={selectedIndex:1,value:1,checked:1,disabled:1,readonly:1};e.prop=function(t,n,r){var i=y.apply(this,arguments);return t&&"form"in t&&b[n]&&r!==o&&e(t).hasClass(S)&&g(t)&&(e(t).getShadowElement().removeClass(S),n=="checked"&&r&&h(t).not(t).removeClass(S).removeAttr("aria-invalid")),i};var w=function(t,n){var r;return e.each(t,function(t,i){if(i)return r=t=="customError"?e.prop(n,"validationMessage"):t,!1}),r},E=function(e){var t;try{t=s.activeElement.name===e}catch(n){}return t},S="user-error",x="user-success",T=function(t){var n,r;if(!t.target)return;n=e(t.target).getNativeElement()[0];if(n.type=="submit"||!e.prop(n,"willValidate"))return;r=e.data(n,"webshimsswitchvalidityclass");var i=function(){if(t.type=="focusout"&&n.type=="radio"&&E(n.name))return;var r=e.prop(n,"validity"),i=e(n).getShadowElement(),s,o,u,f,l;e(n).trigger("refreshCustomValidityRules"),r.valid?i.hasClass(x)||(s=x,o=S,f="changedvaliditystate",u="changedvalid",a[n.type]&&n.checked&&h(n).not(n).removeClass(o).addClass(s).removeAttr("aria-invalid"),e.removeData(n,"webshimsinvalidcause")):(l=w(r,n),e.data(n,"webshimsinvalidcause")!=l&&(e.data(n,"webshimsinvalidcause",l),f="changedvaliditystate"),i.hasClass(S)||(s=S,o=x,a[n.type]&&!n.checked&&h(n).not(n).removeClass(o).addClass(s),u="changedinvalid")),s&&(i.addClass(s).removeClass(o),setTimeout(function(){e(n).trigger(u)},0)),f&&setTimeout(function(){e(n).trigger(f)},0),e.removeData(t.target,"webshimsswitchvalidityclass")};r&&clearTimeout(r),t.type=="refreshvalidityui"?i():e.data(n,"webshimsswitchvalidityclass",setTimeout(i,9))};e(s).on(u.validityUIEvents||"focusout change refreshvalidityui",T),m.changedvaliditystate=!0,m.refreshCustomValidityRules=!0,m.changedvalid=!0,m.changedinvalid=!0,m.refreshvalidityui=!0,r.triggerInlineForm=function(t,n){e(t).trigger(n)},r.modules["form-core"].getGroupElements=h;var N=function(){r.scrollRoot=t||s.compatMode=="BackCompat"?e(s.body):e(s.documentElement)};N(),r.ready("DOM",N),r.getRelOffset=function(t,n){t=e(t);var r=e(n).offset(),i;return e.swap(e(t)[0],{visibility:"hidden",display:"inline-block",left:0,top:0},function(){i=t.offset()}),r.top-=i.top,r.left-=i.left,r},r.wsPopover={_create:function(){this.options=e.extend({},r.cfg.wspopover,this.options),this.id=r.wsPopover.id++,this.eventns=".wsoverlay"+this.id,this.timers={},this.element=e('<div class="ws-popover" tabindex="-1"><div class="ws-po-outerbox"><div class="ws-po-arrow"><div class="ws-po-arrowbox" /></div><div class="ws-po-box" /></div></div>'),this.contentElement=e(".ws-po-box",this.element),this.lastElement=e([]),this.bindElement(),this.options.prepareFor&&this.prepareFor(e(this.options.prepareFor).getNativeElement(),e(this.options.prepareFor).getShadowElement()),this.element.data("wspopover",this)},options:{},content:function(e){this.contentElement.html(e)},bindElement:function(){var e=this,t=function(){e.stopBlur=!1};this.element.on({mousedown:function(n){e.stopBlur=!0,e.timers.stopBlur=setTimeout(t,9)}})},show:function(t){if(this.isVisible)return;this.isVisible=!0,t=e(t).getNativeElement();var n=this,r=e(t).getShadowElement();this.clear(),this.element.removeClass("ws-po-visible").css("display","none"),this.options.prepareFor&&this.prepareFor(t,r),this.position(r),n.timers.show=setTimeout(function(){n.element.css("display",""),n.timers.show=setTimeout(function(){n.element.addClass("ws-po-visible")},9)},9),e(s).on("focusin"+this.eventns+" mousedown"+this.eventns,function(t){n.options.hideOnBlur&&!n.stopBlur&&!e.contains(n.lastElement[0]||s.body,t.target)&&!e.contains(n.element[0],t.target)&&n.hide()}),e(i).on("resize"+this.eventns+" pospopover"+this.eventns,function(){clearTimeout(n.timers.repos),n.timers.repos=setTimeout(function(){n.position(r)},900)})},prepareFor:function(t,n){var r,i=e.extend({},this.options,e(t.prop("form")||[]).data("wspopover")||{},t.data("wspopover")),s=this;this.lastElement=e(t).getShadowFocusElement(),i.appendTo=="element"?this.element.insertAfter(t):this.element.appendTo(i.appendTo),this.element.attr({"data-class":t.prop("className"),"data-id":t.prop("id")}),this.element.css({width:i.constrainWidth?n.outerWidth():""}),i.hideOnBlur&&(r=function(e){s.stopBlur?e.stopImmediatePropagation():s.hide()},this.options.prepareFor?s.lastElement.on("focusout"+s.eventns+" blur"+s.eventns,r).data("preparedpopover",s):s.timers.bindBlur=setTimeout(function(){s.lastElement.on("focusout"+s.eventns+" blur"+s.eventns,r)},10)),!this.prepared&&e.fn.bgIframe&&this.element.bgIframe(),this.prepared=!0},clear:function(){e(i).off(this.eventns),e(s).off(this.eventns),this.options.prepareFor||this.lastElement.off(this.eventns),this.stopBlur=!1,e.each(this.timers,function(e,t){clearTimeout(t)})},hide:function(){if(!this.isVisible)return;this.isVisible=!1;var t=this,n=function(){t.element.css("display","none").attr({"data-id":"","data-class":"",hidden:"hidden"}),clearTimeout(t.timers.forcehide)};this.clear(),this.element.removeClass("ws-po-visible"),e(i).on("resize"+this.eventns,n),t.timers.forcehide=setTimeout(n,999)},position:function(e){var t=r.getRelOffset(this.element.css({marginTop:0,marginLeft:0,marginRight:0,marginBottom:0}).removeAttr("hidden"),e);t.top+=e.outerHeight(),this.element.css({marginTop:"",marginLeft:"",marginRight:"",marginBottom:""}).css(t)}},r.wsPopover.id=0,r.validityAlert=function(){var t=!1,n=r.objectCreate(r.wsPopover,{},u.messagePopover),s=n.hide.bind(n);return n.element.addClass("validity-alert").attr({role:"alert"}),e.extend(n,{hideDelay:5e3,showFor:function(t,n,r,i){t=e(t).getNativeElement(),this.clear(),this.hide(),i||(this.getMessage(t,n),this.show(t),this.hideDelay&&(this.timers.delayedHide=setTimeout(s,this.hideDelay))),r||this.setFocus(t)},setFocus:function(t){var n=e(t).getShadowFocusElement(),s=r.scrollRoot.scrollTop(),o=n.offset().top-30,u;s>o&&(r.scrollRoot.animate({scrollTop:o-5},{queue:!1,duration:Math.max(Math.min(600,(s-o)*1.5),80)}),u=!0);try{n[0].focus()}catch(a){}u&&(r.scrollRoot.scrollTop(s),setTimeout(function(){r.scrollRoot.scrollTop(s)},0)),e(i).triggerHandler("pospopover"+this.eventns)},getMessage:function(e,t){t||(t=p(e[0])||e.prop("customValidationMessage")||e.prop("validationMessage")),t?n.contentElement.text(t):this.hide()}}),n}(),function(){var t,n=[],r,i;e(s).on("invalid",function(i){if(i.wrongWebkitInvalid)return;var o=e(i.target),u=o.getShadowElement();u.hasClass(S)||(u.addClass(S).removeClass(x),setTimeout(function(){e(i.target).trigger("changedinvalid").trigger("changedvaliditystate")},0));if(!t){t=e.Event("firstinvalid"),t.isInvalidUIPrevented=i.isDefaultPrevented;var a=e.Event("firstinvalidsystem");e(s).triggerHandler(a,{element:i.target,form:i.target.form,isInvalidUIPrevented:i.isDefaultPrevented}),o.trigger(t)}t&&t.isDefaultPrevented()&&i.preventDefault(),n.push(i.target),i.extraData="fix",clearTimeout(r),r=setTimeout(function(){var r={type:"lastinvalid",cancelable:!1,invalidlist:e(n)};t=!1,n=[],e(i.target).trigger(r,r)},9),o=null,u=null})}(),e.fn.getErrorMessage=function(){var t="",n=this[0];return n&&(t=p(n)||e.prop(n,"customValidationMessage")||e.prop(n,"validationMessage")),t},u.replaceValidationUI&&r.ready("DOM forms",function(){e(s).on("firstinvalid",function(t){t.isInvalidUIPrevented()||(t.preventDefault(),e.webshims.validityAlert.showFor(t.target))})})})}(jQuery),jQuery.webshims.register("form-message",function(e,t,n,r,i,s){"use strict";var o=t.validityMessages,u=s.overrideMessages||s.customMessages?["customValidationMessage"]:[];o.en=e.extend(!0,{typeMismatch:{email:"Please enter an email address.",url:"Please enter a URL.",number:"Please enter a number.",date:"Please enter a date.",time:"Please enter a time.",range:"Invalid input.","datetime-local":"Please enter a datetime."},rangeUnderflow:{defaultMessage:"Value must be greater than or equal to {%min}."},rangeOverflow:{defaultMessage:"Value must be less than or equal to {%max}."},stepMismatch:"Invalid input.",tooLong:"Please enter at most {%maxlength} character(s). You entered {%valueLen}.",patternMismatch:"Invalid input. {%title}",valueMissing:{defaultMessage:"Please fill out this field.",checkbox:"Please check this box if you want to proceed."}},o.en||o["en-US"]||{}),["select","radio"].forEach(function(e){typeof o["en"].valueMissing=="object"&&(o.en.valueMissing[e]="Please select an option.")}),["date","time","datetime-local","month"].forEach(function(e){typeof o.en.rangeUnderflow=="object"&&(o.en.rangeUnderflow[e]="Value must be at or after {%min}.")}),["date","time","datetime-local","month"].forEach(function(e){typeof o.en.rangeOverflow=="object"&&(o.en.rangeOverflow[e]="Value must be at or before {%max}.")}),o["en-US"]=o["en-US"]||o.en,o[""]=o[""]||o["en-US"],o.de=e.extend(!0,{typeMismatch:{email:"{%value} ist keine zul\u00e4ssige E-Mail-Adresse",url:"{%value} ist keine zul\u00e4ssige Webadresse",number:"{%value} ist keine Nummer!",date:"{%value} ist kein Datum",time:"{%value} ist keine Uhrzeit",range:"{%value} ist keine Nummer!","datetime-local":"{%value} ist kein Datum-Uhrzeit Format."},rangeUnderflow:{defaultMessage:"{%value} ist zu niedrig. {%min} ist der unterste Wert, den Sie benutzen k\u00f6nnen."},rangeOverflow:{defaultMessage:"{%value} ist zu hoch. {%max} ist der oberste Wert, den Sie benutzen k\u00f6nnen."},stepMismatch:"Der Wert {%value} ist in diesem Feld nicht zul\u00e4ssig. Hier sind nur bestimmte Werte zul\u00e4ssig. {%title}",tooLong:"Der eingegebene Text ist zu lang! Sie haben {%valueLen} Zeichen eingegeben, dabei sind {%maxlength} das Maximum.",patternMismatch:"{%value} hat f\u00fcr dieses Eingabefeld ein falsches Format! {%title}",valueMissing:{defaultMessage:"Bitte geben Sie einen Wert ein",checkbox:"Bitte aktivieren Sie das K\u00e4stchen"}},o.de||{}),["select","radio"].forEach(function(e){typeof o.de.valueMissing=="object"&&(o.de.valueMissing[e]="Bitte w\u00e4hlen Sie eine Option aus")}),["date","time","datetime-local","month"].forEach(function(e){typeof o.de.rangeUnderflow=="object"&&(o.de.rangeUnderflow[e]="{%value} ist zu fr\u00fch. {%min} ist die fr\u00fcheste Zeit, die Sie benutzen k\u00f6nnen.")}),["date","time","datetime-local","month"].forEach(function(e){typeof o.de.rangeOverflow=="object"&&(o.de.rangeOverflow[e]="{%value} ist zu sp\u00e4t. {%max} ist die sp\u00e4teste Zeit, die Sie benutzen k\u00f6nnen.")});var a=o[""];t.createValidationMessage=function(n,r){var i=a[r];return i&&typeof i!="string"&&(i=i[e.prop(n,"type")]||i[(n.nodeName||"").toLowerCase()]||i.defaultMessage),i&&["value","min","max","title","maxlength","label"].forEach(function(s){if(i.indexOf("{%"+s)===-1)return;var o=(s=="label"?e.trim(e('label[for="'+n.id+'"]',n.form).text()).replace(/\*$|:$/,""):e.attr(n,s))||"";r=="patternMismatch"&&s=="title"&&!o&&t.error("no title for patternMismatch provided. Always add a title attribute."),i=i.replace("{%"+s+"}",o),"value"==s&&(i=i.replace("{%valueLen}",o.length))}),i||""},(t.bugs.validationMessage||!Modernizr.formvalidation||t.bugs.bustedValidity)&&u.push("validationMessage"),t.activeLang({langObj:o,module:"form-core",callback:function(e){a=e}}),u.forEach(function(n){t.defineNodeNamesProperty(["fieldset","output","button"],n,{prop:{value:"",writeable:!1}}),["input","select","textarea"].forEach(function(r){var i=t.defineNodeNameProperty(r,n,{prop:{get:function(){var n=this,r="";if(!e.prop(n,"willValidate"))return r;var s=e.prop(n,"validity")||{valid:1};if(s.valid)return r;r=t.getContentValidationMessage(n,s);if(r)return r;if(s.customError&&n.nodeName){r=Modernizr.formvalidation&&!t.bugs.bustedValidity&&i.prop._supget?i.prop._supget.call(n):t.data(n,"customvalidationMessage");if(r)return r}return e.each(s,function(e,i){if(e=="valid"||!i)return;r=t.createValidationMessage(n,e);if(r)return!1}),r||""},writeable:!1}})})})});
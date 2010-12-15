(function($){
	"use strict";
	var doc = document;
	var support = $.support;
	var special = $.event.special;
	var undefined;
	
	//simple shiv
	//http://code.google.com/p/html5shim/
	'abbr article aside audio canvas datalist details figcaption figure footer header hgroup mark meter nav output progress section source summary time track video'.replace(/\w+/g,function(n){doc.createElement(n);});
	support.dynamicHTML5 =  !!($('<video><div></div></video>')[0].innerHTML);
	
	$('html').addClass('js-on').removeClass('js-off');
	
	$.webshims = {
		version: 'pre1.1.0',
		useImportantStyles: true,
		fix: {},
		implement: {},
		fixHTML5: function(h){return h;},
		createReadyEvent: (function(){
			var makeReady = function(triggerName, name, noForce){
				
				if(modules[name] || webshims.features[name]){
					triggerName = triggerName +'Ready';
				}
				
				if(special[triggerName] && special[triggerName].add){return;}
				
				special[triggerName] = $.extend(special[triggerName] || {}, {
					add: function( details ) {
						details.handler.call(this, $.Event(triggerName));
					}
				});
				$.event.trigger(triggerName);
			};
			return function(names){
				var noForce = arguments[1];
				
				if(!names){return;}
				if(!$.isArray(names)){
					names = [names];
				}
				
				$.each(names, function(i, name){
					if(noForce && modules[name] && modules[name].noAutoCallback ){return;}
					makeReady(name+'SYS', name, noForce);
					makeReady(name, name, noForce);
				});
			};
		})(),
		
		moduleList: [],
		
		modules: {},
		
		features: {},
		
		featureList: [],
		
		loader: {
			
			basePath: (function(){
				var scripts = $('script'),
					path 	= scripts[scripts.length - 1].src.split('?')[0]
				;
				return path.slice(0, path.lastIndexOf("/") + 1);
			})(),
			
			combinations: {},
			
			addModule: function(name, ext){
				modules[name] = ext;
			},
			
			loadList: (function(){
				var loadedModules = [];
				return function(list){
					var toLoad = [];
					
					$.each(list, function(i, name){
						var module = modules[name];
						if ('test' in module && module.test(list)) {
							isReady(name);
							return;
						}
						if (module.css) {
							loader.loadCSS(module.css);
						}
						toLoad.push(name);
						if(module.loadInit){
							module.loadInit();
						}
						
					});
					
					if(!webshims.debug){
						$.each(loader.combinations || [], function(combi, combiModules){
							
							var loadCombi = true;
							$.each(combiModules, function(i, combinedModule){
								if ($.inArray(combinedModule, toLoad) === -1 || $.inArray(combinedModule, loadedModules) !== -1) {
									loadCombi = false;
									return false;
								}
							});
							
							if(loadCombi){
								loadedModules = loadedModules.concat(combiModules);
								loader.loadScript(combi, false, combiModules);
								return false;
							}
						});
					}
					
					$.each(toLoad, function(i, loadName){
						if ($.inArray(loadName, loadedModules) == -1) {
							loader.loadScript(modules[loadName].src || loadName, false, loadName);
						}
					});
				};
			})(),
			
			makePath: function(src){
				if(src.indexOf('://') != -1 || src.indexOf('/') === 0){
					return src;
				}
				
				if(src.indexOf('.') == -1){
					src += '.js';
				}
				return loader.basePath + src;
			},
			
			loadCSS: (function(){
				var parent, 
					loadedSrcs = []
				;
				return function(src){
					src = this.makePath(src);
					if($.inArray(src, loadedSrcs) != -1){
						return;
					}
					parent = parent || doc.getElementsByTagName('head')[0] || doc.body;
					loadedSrcs.push(src);
					$('<link rel="stylesheet" />')
						.prependTo(parent)
						.attr({href: src})
					;
				};
			})(),
			
			loadScript: (function(){
				var parent, 
					loadedSrcs = []
				;
				return function(src, callback, name){
					
					src = loader.makePath(src);
					if($.inArray(src, loadedSrcs) != -1){
						return;
					}
					parent = parent || doc.getElementsByTagName('head')[0] || doc.body;
					if(!parent || !parent.appendChild){
						setTimeout(function(){
							loader.loadScript(src, callback, name);
						}, 9);
						return;
					}
					
					var script = doc.createElement('script'),
						onLoad = function(e){
							
							if(!this.readyState ||
										this.readyState == "loaded" || this.readyState == "complete"){
								script.onload =  null;
								script.onerror = null;
								script.onreadystatechange = null;
								if(callback){
									callback(e, this);
								}
								isReady(name, true);
								
								script = null;
							}
						}
					;
					script.setAttribute('async', 'async');
					script.src = src;
					script.onload = onLoad;
					script.onerror = onLoad;
					script.onreadystatechange = onLoad;
					parent.appendChild(script);
					script.async = true;
					loadedSrcs.push(src);
				};
			})()
		},
		
		ready: function(events, fn /*, _notQueued, _created*/){
			var _created = arguments[3],
				_notQueued 	= arguments[2]
			;
			if(typeof events == 'string'){
				events = events.split(' ');
			}
			
			if(!_created){
				events = $.map(events, function(e){
					var evt = e;
					if(_notQueued && evt != 'ready'){
						evt += 'SYS';
					}
					if(modules[e] || webshims.features[e]){
						evt += 'Ready';
					}
					return evt;
				});
			}
			
			if(!events.length){
				fn($, webshims, window, document);
				return;
			}
			var readyEv = events.shift(),
				readyFn = function(){
					webshims.ready(events, fn, _notQueued, true);
				}
			;
			
			if(readyEv == 'ready'){
				$(readyFn);
			} else {
				$(doc).one(readyEv, readyFn);
			}
		},
		
		capturingEvents: function(names/*, _maybePrevented */){
			if(!doc.addEventListener){return;}
			var _maybePrevented = arguments[1];
			if(typeof names == 'string'){
				names = [names];
			}
			$.each(names, function(i, name){
				var handler = function( e ) { 
					e = $.event.fix( e );
					if(_maybePrevented){
						var preventDefault = e.preventDefault;
						e.preventDefault =  function(){
							preventDefault.apply(this, arguments);
							clearTimeout($.data(e.target, 'maybePrevented'+e.type));
							$.data(e.target, 'maybePrevented'+e.type, setTimeout(function(){
								$.removeData(e.target, 'maybePrevented'+e.type);
							}, 90));
							
						};
					}
					return $.event.handle.call( this, e );
				};
				special[name] = special[name] || {};
				if(special[name].setup || special[name].teardown){return;}
				$.extend(special[name], {
					setup: function() {
						this.addEventListener(name, handler, true);
					}, 
					teardown: function() { 
						this.removeEventListener(name, handler, true);
					}
				});
			});
		},
		
		defineNodeNamesProperty: function(names, prop, desc){
			webshims.ready('es5', function(){
				if(typeof names == 'string'){
					names = names.split(/\s*,\s*/);
				}
				names.forEach(function(nodeName){
					webshims.defineNodeNameProperty(nodeName, prop, desc);
				});
				
			}, true);
		},
		contentAttr: function(elem, name, val){
			if(!elem.nodeName){return;}
			if(val === undefined){
				val = elem.getAttribute(name);
				return (val == null) ? undefined : val;
			}
			if(typeof val == 'boolean'){
				if(!val){
					elem.removeAttribute(name);
				} else {
					elem.setAttribute(name, name);
				}
			} else {
				elem.setAttribute(name, val);
			}
		},
		
		defineNodeNamesBooleanProperty: function(elementNames, prop, setDesc){
			
			var desc = {
				set: function(elem, val){
					val = !!val;
					elem[prop] = val;
					webshims.contentAttr(elem, prop, val);
					return val;
				},
				get: function(elem){
					var val;
					if(support.contentAttr && prop in elem){
						val = !!elem[prop];
					} else {
						val = (webshims.contentAttr(elem, prop) != null);
					}
					return val;
				}
			};
			webshims.defineNodeNamesProperty(elementNames, prop, desc);
			if(setDesc){
				webshims.onNodeNamesPropertyModify(elementNames, prop, setDesc);
			}
		},
				
		addMethodName: function(name){
			if($.fn[name] && 'shim' in $.fn[name]){return;}
			$.fn[name] = function(){
				var args = arguments,
					ret
				;
				this.each(function(){
					var fn = $.attr(this, name);
					if(fn && fn.apply){
						ret = fn.apply(this, args);
						if(ret !== undefined){
							return false;
						}
					}
				});
				return (ret !== undefined) ? ret : this;
			};
		},
		
		addPolyfill: function(name, cfg){
			cfg = cfg || {};
			var feature 		= cfg.feature || name,
				shims 			= webshims
			;
			if(!shims.features[feature]){
				shims.features[feature] = [];
				shims.featureList.push(feature);
			}
			shims.features[feature].push(name);
			loader.addModule(name, cfg);
			shims.moduleList.push(name);
			$.each(cfg.combination || [], function(i, combi){
				if(!combinations[combi]){
					combinations[combi] = [name];
				} else {
					combinations[combi].push(name);
				}
			});
			if(cfg.methodNames) {
				if (!$.isArray(cfg.methodNames)) {
					cfg.methodNames = [cfg.methodNames];
				}
				
				$.each(cfg.methodNames, function(i, methodName){
					webshims.addMethodName(methodName.name, methodName.elementNames);
				});
			}
		},
		
		polyfill: function(features, fn){
			var shims 	= this,
				loader 	= shims.loader,
				toLoadFeatures = [],
				removeLoader = function(){
					$('html').removeClass('loading-polyfills long-loading-polyfills polyfill-remove-fouc');
					$(window).unbind('load.loadingPolyfills error.loadingPolyfills');
					clearTimeout(loadingTimer);
				},
				loadingTimer
			;
			
			fn = fn || $.noop;
			
			features = features || shims.featureList;
			if(features == 'lightweight'){
				features = webshims.light;
			}
			if (typeof features == 'string') {
				features = features.split(' ');
			}
			
			
			if(!$.isReady){
				if(webshims.removeFOUC){
					$('html').addClass('polyfill-remove-fouc');
				}
				$('html').addClass('loading-polyfills');
				$(window).bind('load.loadingPolyfills error.loadingPolyfills', removeLoader);
				loadingTimer = setTimeout(function(){
					$('html').addClass('long-loading-polyfills');
				}, 400);
			}
			webshims.ready(features, function(){
				removeLoader();
				fn($, webshims, window, document);
			});
			
			$.each(features, function(i, feature){
				if(feature !== shims.features[feature][0]){
					shims.ready(shims.features[feature], function(){
						isReady(feature);
					}, true);
				}
				toLoadFeatures = toLoadFeatures.concat(shims.features[feature]);
			});
			
			if(webshims.useImportantStyles){
				$('html').addClass('polyfill-important');
			}
			loader.loadCSS('shim.css');
			loader.loadList(toLoadFeatures);
			$(function(){
				loader.loadList(['html5a11y']);
			});
		},
		getID: (function(){
			var ID = new Date().getTime();
			return function(elem){
				elem = $(elem);
				var id = elem.attr('id');
				if(!id){
					ID++;
					id = 'elem-id-'+ ID;
					elem.attr('id', id);
				}
				return id;
			};
		})(),
		activeLang: (function(){
			var langs = [navigator.browserLanguage || navigator.language || ''];
			var paLang = $('html').attr('lang');
			var timer;
			
			if(paLang){
				langs.push(paLang);
			}
			return function(lang, module, fn){
				if(lang){
					if(!module || !fn){
						if(lang !== langs[0]){
							langs[0] = lang;
							clearTimeout(timer);
							timer = setTimeout(function(){
								$(doc).triggerHandler('htmlExtLangChange', langs);
							}, 9);
						}
					} else {
						module = modules[module].options;
						var langObj = lang,
							loadRemoteLang = function(lang){
								if($.inArray(lang, remoteLangs) !== -1){
									loader.loadScript(module.langSrc+lang+'.js', function(){
										if(langObj[lang]){
											fn(langObj[lang]);
										}
									});
									return true;
								}
								return false;
							},
							remoteLangs = module && module.availabeLangs
						;
						
						$.each(langs, function(i, lang){
							var shortLang = lang.split('-')[0];
							if(langObj[lang] || langObj[shortLang]){
								fn(langObj[lang] || langObj[shortLang]);
								return false;
							}
							if(remoteLangs && module.langSrc && (loadRemoteLang(lang) || loadRemoteLang(shortLang))){
								return false;
							}
						});
					}
				}
				return langs;
			};
		})()
	};
	
	var webshims 		= $.webshims,
		isReady 		= webshims.createReadyEvent,
		loader 			= webshims.loader,
		modules 		= webshims.modules,
		combinations 	= loader.combinations,
		addPolyfill 	= webshims.addPolyfill,
		extendedProps 	= webshims.extendedProps
	;
	
	(function(){
		var readyFns = [];
		var emptyJ = $([]);
		$.extend(webshims, {
			addReady: function(fn){
				var readyFn = function(context, elem){
					$(function(){fn(context, elem);});
				};
				readyFns.push(readyFn);
				readyFn(doc, emptyJ);
			},
			triggerDomUpdate: function(context){
				if(!context){return;}
				var elem = (context !== document) ? $(context) : emptyJ;
				$.each(readyFns, function(i, fn){
					fn(context, elem);
				});
			}
		});
		
		webshims.defineNodeNameProperty = (function(){
			var oldAttr = $.attr;
			var extendedProps = {};
			var modifyProps = {};
			
			$.attr = function(elem, name, value, arg1, arg3){
				var nodeName = (elem.nodeName || '').toLowerCase();
				if(!nodeName || elem.nodeType !== 1){return oldAttr(elem, name, value, arg1, arg3);}
				var desc = extendedProps[nodeName];
				var handeld;
				var ret;
								
				if(desc){
					desc = desc[name];
				}
				if(!desc){
					desc = extendedProps['*'];
					if(desc){
						desc = desc[name];
					}
				}
				
				// we got a winner
				if(desc){
					if(value === undefined){
						if(desc.get){
							return desc.get(elem, value);
						} 
						return desc.value;
						
					} else if(desc.set) {
						ret = desc.set(elem, value);
						handeld = true;
					}
				}
				if(!handeld){
					ret = oldAttr(elem, name, value, arg1, arg3);
				}
				if(value !== undefined && modifyProps[nodeName] && modifyProps[nodeName][name]){
					modifyProps[nodeName][name].forEach(function(fn){
						fn(elem, value);
					});
				}
				return ret;
			};
			
			
			webshims.onNodeNamesPropertyModify = function(nodeNames, prop, desc){
				if(typeof nodeNames == 'string'){
					nodeNames = nodeNames.split(/\s*,\s*/);
				}
				if($.isFunction(desc)){
					desc = {set: desc};
				}
				nodeNames.forEach(function(name){
					if(!modifyProps[name]){
						modifyProps[name] = {};
					}
					if(!modifyProps[name][prop]){
						modifyProps[name][prop] = [];
					}
					if(desc.set){
						modifyProps[name][prop].push(desc.set);
					}
					if(desc.init){
						initProp(name, prop);
					}
				});
			};
			
			
			var initProp = (function(){
				var nodeNameCache = {};
				var initProps = {};
				var isReady;
				webshims.addReady(function(context, contextElem){	
					nodeNameCache = {};
					$.each(initProps, function(name, props){
						nodeNameCache[name] = $(context.getElementsByTagName(name));
						if(contextElem[0] && $.nodeName(contextElem[0], name)){
							nodeNameCache[name] = nodeNameCache[name].add(contextElem);
						}
						props.forEach(function(prop){
							nodeNameCache[name].filter('['+ prop +']').attr(prop, function(i, val){
								return val;
							});
						});
					});
					isReady = true;
				});
				return function(nodeName, prop){
					
					if(!initProps[nodeName]){
						initProps[nodeName] = [prop];
					} else {
						initProps[nodeName].push(prop);
					}
					if(isReady){
						nodeNameCache[nodeName] = nodeNameCache[nodeName] || $( document.getElementsByTagName(nodeName) );
						nodeNameCache[nodeName].filter('['+ prop +']').attr(prop, function(i, val){
							return val;
						});
					}
				};
			})();
			
			return function(nodeName, prop, desc){
				desc = $.extend({writeable: true}, desc);
				
				if(!extendedProps[nodeName]){
					extendedProps[nodeName] = {};
				}
				var oldDesc = extendedProps[nodeName][prop];
				var getSup = function(propName, descriptor){
					if(descriptor && descriptor[propName]){
						return descriptor[propName];
					}
					return propName == 'value' 
						? 
							function(elem){
								var fn = oldAttr(elem, prop); 
								if(fn && fn.apply){
									return fn.apply(elem, arguments);
								}
							} 
						: 
							function(elem, value){
								return oldAttr(elem, prop, value);
							}
					;
				};
				extendedProps[nodeName][prop] = desc;
				if(desc.value === undefined){
					if(!desc.set){
						desc.set = desc.writeable ? getSup('set', desc) : function(){throw(prop +'is readonly on '+ nodeName);};
					}
					if(!desc.get){
						desc.get = getSup('get', desc);
					}
					
				}
				
				['value', 'get', 'set'].forEach(function(descProp){
					if(desc[descProp]){
						desc[descProp]._polyfilled = getSup(descProp, oldDesc);
					}
				});
				if(desc.init){
					initProp(nodeName, prop);
				} 
				return desc;
			};
		})();
		
		
	})();
	
	$.fn.htmlWebshim = function(a){
		var ret = this.html((a) ? webshims.fixHTML5(a) : a);
		if(ret === this && $.isReady){
			this.each(function(){
				webshims.triggerDomUpdate(this);
			});
		}
		return ret;
	};
	
	$.each(['after', 'before', 'append', 'prepend'], function(i, name){
		$.fn[name+'Webshim'] = function(a){
			var elems = $(webshims.fixHTML5(a));
			this[name](elems);
			if($.isReady){
				elems.each(function(){
					webshims.triggerDomUpdate(this);
				});
			}
			return this;
		};
	});
		
	isReady('htmlExtLangChange', true);
	
	/*
	 * Start Features 
	 */
	
	/* general modules */
	/* change path $.webshims.modules[moduleName].src */
	var browserVersion = parseFloat($.browser.version, 10);
	loader.addModule('html5a11y', {
		src: 'html5a11y',
		test: function(){
			return !(($.browser.msie && browserVersion < 10 && browserVersion > 7) || ($.browser.mozilla && browserVersion < 2) || ($.browser.webkit && browserVersion < 540));
		}
	});
	
	loader.addModule('jquery-ui', {
		src: 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.5/jquery-ui.min.js',
		test: function(){return !!($.widget && $.Widget);}
	});
	
	loader.addModule('input-widgets', {
		src: '',
		test: function(){
			return !($.widget && !($.datepicker || $.fn.slider));
		}
	});
	
	loader.addModule('swfobject', {
		src: 'http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js',
		test: function(){return ('swfobject' in window);}
	});
	
	var testElem = $('<div />')[0];
	
	/* 
	 * polyfill-Modules 
	 */
	
	// webshims lib uses a of http://github.com/kriskowal/es5-shim/ to implement
	var es5 = [];
	es5.push( !!(Array.isArray && Object.keys && Object.create && Function.prototype.bind && Object.defineProperties && !isNaN( Date.parse("T00:00") )) );
	es5.push( !!(String.prototype.trim && Date.now && Date.prototype.toISOString) );
	
	if(es5[1]){
		$.each(['filter', 'map', 'every', 'reduce', 'reduceRight', 'lastIndexOf'], function(i, name){
			if(!Array.prototype[name]){
				es5[1] = false;
				return false;
			}
		});
	}
	support.es5 = (es5[0] && es5[1]);
	
	support.objectAccessor = !!( (Object.create && Object.defineProperties) || Object.prototype.__defineGetter__);
	support.domAccessor = !!( Object.prototype.__defineGetter__ || ( Object.defineProperty && Object.defineProperty(document.createElement('b'),'x',{get: function(){return true;}}).x));
	
	testElem.setAttribute('dataHttpAttr', ':-)');
	support.contentAttr = !(testElem.dataHttpAttr);
	
	webshims.objectCreate = Object.create;
	webshims.defineProperty = Object.defineProperty;
	webshims.defineProperties = Object.defineProperties;
	webshims.getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
		
	addPolyfill('es5-1', {
		feature: 'es5',
		test: function(){
			return (es5[1] && es5[0]);
		},
		combination: ['combined-ie7', 'combined-ie8', 'combined-ff3', 'combined-ie7-light', 'combined-ie8-light', 'combined-ff3-light', 'combined-webkit']
	});
	
	addPolyfill('es5-2', {
		feature: 'es5',
		test: function(){
			return es5[1];
		},
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie7-light', 'combined-ie8-light']
	});
	
	
	
	/* geolocation */
	support.geolocation = ('geolocation'  in navigator);
	addPolyfill('geolocation', {
		test: function(){
			return support.geolocation;
		},
		options: {destroyWrite: true},
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ie7-light', 'combined-ie8-light', 'combined-ie9-light']
	});
	/* END: geolocation */
	
	/* canvas */
	support.canvas = ('getContext'  in $('<canvas />')[0]);
	
	addPolyfill('canvas', {
		test: function(){
			return support.canvas;
		},
		noAutoCallback: true,
		methodNames: [
			{
				name: 'getContext',
				elementNames: ['canvas']
			}
		],
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie7-light', 'combined-ie8-light']
	});
	/* END: canvas */
	
	/*
	 * HTML5 FORM-Features
	 */
	
	/* html5 constraint validation */
	
	
	/* bugfixes, validation-message + fieldset.checkValidity pack */
	webshims.validityMessages = [];
	webshims.inputTypes = {};
	
	(function(){
		var form = $('<form action="#"><fieldset><input name="a" required /><select><option>y</option></select></fieldset></form>'),
			field = $('fieldset', form)[0],
			range = $('<input type="range" />')[0],
			date = $('<input type="date" />')[0]
		;
		
		support.validity = ('checkValidity' in form[0]);
		support.validationMessage = !!($('input', form).attr('validationMessage'));
		support.fieldsetValidation = !!(field.elements && field.checkValidity && 'disabled' in field && !field.checkValidity() );
		support.output = !!( 'value' in doc.createElement('output') );
		support.numericDateProps = (range.type == 'range' && date.type == 'date');
		support.requiredSelect = ('required' in $('select', form)[0]);
		
		support.rangeUI = support.numericDateProps;
		support.dateUI = support.numericDateProps;
		if(window.Modernizr){
			support.rangeUI = Modernizr.inputtypes.range;
			support.dateUI = Modernizr.inputtypes.date;
		}
		
		form = null;
		field = null;
		range = null;
		date = null;
	})();
	
	//ToDo: these assumption aren't used yet || we have to wait till these bug are fixed
	//Bug in Safari 5.0.2 and Chrome 7
//	webshims.fix.interactiveValidation = ($.browser.webkit && !support.requiredSelect && !support.output);
//	//Bug in Safari 5.0.2 (isn't used yet)
//	webshims.fix.checkValidity = webshims.fix.interactiveValidation;
//	//Bug in Safari 5.0.2, Chrome 7 and Opera 10
//	webshims.fix.submission = ((window.opera && !support.requiredSelect) || webshims.fix.interactiveValidation);
	
	addPolyfill('form-core', {
		feature: 'forms',
		noAutoCallback: true,
		loadInit: function(){
			setTimeout(function(){
				webshims.polyfill(['es5']);
			}, 0);
		},
		//no test = always load
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ff3', 'combined-ff4', 'combined-ie7-light', 'combined-ie8-light', 'combined-ie9-light', 'combined-ff3-light', 'combined-webkit']
	});
	
	addPolyfill('form-message', {
		feature: 'forms',
		test: function(){
			return (support.validity && support.validationMessage && webshims.implement.customValidationMessage && modules['form-extend']() );
		},
		options: {},
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ff3', 'combined-ff4', 'combined-ie7-light', 'combined-ie8-light', 'combined-ie9-light', 'combined-ff3-light', 'combined-webkit']
	});
	
	if(support.validity){
		//create delegatable-like events
		webshims.capturingEvents(['input']);
		webshims.capturingEvents(['invalid'], true);
		
		addPolyfill('form-extend', {
			feature: 'forms',
			src: 'form-native-extend',
			noAutoCallback: true,
			test: function(toLoad){
				return (support.requiredSelect && support.validationMessage && (support.numericDateProps || $.inArray('form-number-date', toLoad) == -1) && !webshims.overrideValidationMessages );
			},
			loadInit: function(){
				setTimeout(function(){
					loader.loadList(['form-message']);
				}, 0);
			},
			methodNames: [
				{
					name: 'setCustomValidity',
					elementNames: ['input', 'select', 'textarea']
				},
				{
					name: 'checkValidity',
					elementNames: ['form', 'fieldset', 'input', 'select', 'textarea']
				}
			],
			combination: ['combined-ff4', 'combined-webkit']
		});
		
		addPolyfill('form-native-fix', {
			feature: 'forms',
			test: function(){return support.requiredSelect;},
			combination: ['combined-webkit']
		});
		
	} else {
		addPolyfill('form-extend', {
			feature: 'forms',
			src: 'form-shim-extend',
			noAutoCallback: true,
			test: function(){
				return false;
			},
			methodNames: [
				{
					name: 'setCustomValidity',
					elementNames: ['input', 'select', 'textarea']
				},
				{
					name: 'checkValidity',
					elementNames: ['form', 'fieldset', 'input', 'select', 'textarea']
				}
			],
			combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ff3', 'combined-ie7-light', 'combined-ie8-light', 'combined-ie9-light', 'combined-ff3-light']
		});
	}
	
	addPolyfill('form-number-date', {
		feature: 'forms-ext',
		noAutoCallback: true,
		
		test: function(){
			return support.numericDateProps;
		},
		
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ff3', 'combined-ff4'],
		options: {stepArrows: {number: 1, time: 1}, calculateWidth: true}
	});
	
	
			
	addPolyfill('inputUI', {
		feature: 'forms-ext',
		src: 'form-date-range-ui',
		test: function(){return (support.rangeUI && support.dateUI && !modules.inputUI.options.replaceNative);},
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ff3', 'combined-ff4'],
		noAutoCallback: true,
		loadInit: function(){
			loader.loadList(['jquery-ui']);
			if(modules['input-widgets'].src){
				loader.loadList(['input-widgets']);
			}
		},
		options: {
			slider: {},
			datepicker: {},
			langSrc: 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.5/i18n/jquery.ui.datepicker-',
			availabeLangs: 'af ar az bg bs cs da de el en-GB eo es et eu fa fi fo fr fr-CH he hr hu hy id is it ja ko it lt lv ms nl no pl pt-BR ro ru sk sl sq sr sr-SR sv ta th tr uk vi zh-CN zh-HK zh-TW'.split(' '),
			recalcWidth: true,
			replaceNative: false
		}
	});
	
	
	addPolyfill('form-output', {
		feature: 'forms',
		noAutoCallback: true,
		test: function(){
			return support.output;
		},
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ff3', 'combined-ie7-light', 'combined-ie8-light', 'combined-ie9-light', 'combined-ff3-light']
	});
	
	/* placeholder */
	
	support.placeholder = ($('<input type="text" />').attr('placeholder') != null);
	addPolyfill('form-placeholder', {
		feature: 'forms',
		test: function(){
			return support.placeholder;
		},
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ff3', 'combined-ie7-light', 'combined-ie8-light', 'combined-ie9-light', 'combined-ff3-light']
	});
	/* END: placeholder */
	
	/* END: html5 forms */
	
	/* json + loacalStorage */
	
	support.jsonStorage = ('JSON' in window && 'localStorage' in window && 'sessionStorage' in window);
	addPolyfill('json-storage', {
		test: function(){
			return support.jsonStorage;
		},
		loadInit: function(){
			loader.loadList(['swfobject']);
		},
		noAutoCallback: true,
		combination: ['combined-ie7', 'combined-ie7-light']
	});
	
	addPolyfill('html5shiv', {
		test: function(){
			return support.dynamicHTML5;
		},
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie7-light', 'combined-ie8-light']
	});
	/* END: json + loacalStorage */
	//predefined list without input type number/date/time etc.
	webshims.light = ['es5', 'html5shiv', 'canvas', 'geolocation', 'forms', 'json-storage'];
	
})(jQuery);

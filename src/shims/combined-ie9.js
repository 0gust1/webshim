(function($){
	if(navigator.geolocation){return;}
	$.support.geolocation = 'shim';
	var domWrite = function(){
			setTimeout(function(){
				throw('document.write is overwritten by geolocation shim. This method is incompatibel with this plugin');
			}, 1);
		},
		id = 0
	;
	navigator.geolocation = (function(){
		var createCoords = function(){
				if(pos || !window.google || !google.loader || !google.loader.ClientLocation){return;}
				var cl = google.loader.ClientLocation;
	            pos = {
					coords: {
						latitude: cl.latitude,
		                longitude: cl.longitude,
		                altitude: null,
		                accuracy: 43000,
		                altitudeAccuracy: null,
		                heading: parseInt('NaN', 10),
		                velocity: null
					},
	                //extension similiar to FF implementation
					address: $.extend({streetNumber: '', street: '', premises: '', county: '', postalCode: ''}, cl.address)
	            };
			},
			pos
		;
		var api = {
			getCurrentPosition: function(success, error, opts){
				var callback = function(){
						clearTimeout(timer);
						createCoords();
						if(pos){
							success($.extend(pos, {timestamp: new Date().getTime()}));
						} else if(error) {
							error({ code: 2, message: "POSITION_UNAVAILABLE"});
						}
					},
					timer
				;
				if(!window.google || !google.loader){
					//destroys document.write!!!
					if($.webshims.modules.geolocation.options.destroyWrite){
						document.write = domWrite;
						document.writeln = domWrite;
					}
					$(document).one('google-loader', callback);
					$.webshims.loader.loadScript('http://www.google.com/jsapi', false, 'google-loader');
				} else {
					setTimeout(callback, 1);
					return;
				}
				if(opts && opts.timeout){
					timer = setTimeout(function(){
						$(document).unbind('google-loader', callback);
						if(error) {
							error({ code: 3, message: "TIMEOUT"});
						}
					}, opts.timeout);
				}
			},
			clearWatch: $.noop
		};
		api.watchPosition = function(a, b, c){
			api.getCurrentPosition(a, b, c);
			id++;
			return id;
		};
		return api;
	})();
})(jQuery);
/* fix chrome 5/6 and safari 5 implemenation + add some usefull custom invalid event called firstinvalid */
jQuery.webshims.ready('es5', function($, webshims, window){
	"use strict";
	var validityMessages = webshims.validityMessages;
	var support = $.support;
	var fixNative = false;
	var doc = document;
	var undefined;
	if(support.validity === true){
		fixNative = !window.noHTMLExtFixes;
	}
	/*
	 * Selectors for all browsers
	 */
	$.extend($.expr.filters, {
		valid: function(elem){
			return ($.attr(elem, 'validity') || {valid: true}).valid;
		},
		invalid: function(elem){
			return !$.expr.filters.valid(elem);
		},
		willValidate: function(elem){
			return $.attr(elem, 'willValidate');
		}
	});
	
	webshims.triggerInlineForm = (function(){
		var stringify = function(id){
			if(typeof id != 'string' || id.indexOf('-') !== -1 || id.indexOf('.') !== -1 || id.indexOf('"') !== -1){return '';}
			return 'var '+ id +' = this.form["'+ id +'"];';
		};
		return function(elem, event){
			var attr = elem['on'+event] || elem.getAttribute('on'+event) || '';
			var ret;
			event = $.Event({
				type: event,
				target: elem[0],
				currentTarget: elem[0]
			});
			if(attr && typeof attr == 'string' && elem.form && elem.form.elements){
				var scope = '';
				for(var i = 0, elems = elem.form.elements, len = elems.length; i < len; i++ ){
					var name = elems[i].name;
					var id = elems[i].id;
					if(name){
						scope += stringify(name);
					}
					if(id && id !== name){
						scope += stringify(id);
					}
				}
				ret = (function(){eval( scope + attr );}).call(elem, event);
			}
			$(elem).trigger(event);
			return ret;
		};
	})();
	
	/* some extra validation UI */
	webshims.validityAlert = (function(){
		var alertElem = (!$.browser.msie || parseInt($.browser.version, 10) > 7) ? 'span' : 'label';
		var api = {
			hideDelay: 5000,
			showFor: function(elem, message, hideOnBlur){
				elem = $(elem);
				var visual = (elem.data('inputUIReplace') || {visual: elem}).visual;
				createAlert();
				api.clear();
				this.getMessage(elem, message);
				this.position(visual);
				this.show();
				
				if(this.hideDelay){
					hideTimer = setTimeout(boundHide, this.hideDelay);
				}
				if(!hideOnBlur){
					var focusElem = $('input, select, textarea, .ui-slider-handle', visual).filter(':visible:first');
					if(!focusElem[0]){
						focusElem = visual;
					}
					alert.attr('for', webshims.getID(focusElem));
					focusElem.focus();
					$(doc).bind('focusout.validityalert', boundHide);
				}
			},
			getMessage: function(elem, message){
				$('> span', alert).html(message || elem.attr('validationMessage'));
			},
			position: function(elem){
				var offset = elem.offset();
				offset.top += elem.outerHeight();
				alert.css(offset);
			},
			show: function(){
				if(alert.css('display') === 'none'){
					alert.fadeIn();
				} else {
					alert.fadeTo(400, 1);
				}
			},
			hide: function(){
				api.clear();
				alert.fadeOut();
			},
			clear: function(){
				clearTimeout(hideTimer);
				$(doc).unbind('focusout.validityalert');
				alert.stop().removeAttr('for');
			},
			alert: $('<'+alertElem+' class="validity-alert" role="alert"><span class="va-box" /></'+alertElem+'>').css({position: 'absolute', display: 'none'})
		};
		
		var alert = api.alert;
		var hideTimer = false;
		var boundHide = $.proxy(api, 'hide');
		var created = false;
		var createAlert = function(){
			if(created){return;}
			created = true;
			$(function(){alert.appendTo('body');});
		};
		return api;
	})();
	
	/* implements validationMessage and customValidationMessage */
	
	validityMessages['en'] = validityMessages['en'] || validityMessages['en-US'] || {
		typeMismatch: {
			email: '{%value} is not a legal email address',
			url: '{%value} is not a valid web address',
			number: '{%value} is not a number!',
			date: '{%value} is not a date',
			time: '{%value} is not a time',
			range: '{%value} is not a number!',
			"datetime-local": '{%value} is not a correct date-time format.'
		},
		rangeUnderflow: '{%value} is too low. The lowest value you can use is {%min}.',
		rangeOverflow: '{%value}  is too high. The highest value you can use is {%max}.',
		stepMismatch: 'The value {%value} is not allowed for this form.',
		tooLong: 'The entered text is too large! You used {%valueLen} letters and the limit is {%maxlength}.',
		
		patternMismatch: '{%value} is not in the format this page requires! {%title}',
		valueMissing: 'You have to specify a value'
	};
	
	validityMessages['en-US'] = validityMessages['en-US'] || validityMessages['en'];
	validityMessages[''] = validityMessages[''] || validityMessages['en'];
	
	validityMessages['de'] = validityMessages['de'] || {
		typeMismatch: {
			email: '{%value} ist keine zulässige E-Mail-Adresse',
			url: '{%value} ist keine zulässige Webadresse',
			number: '{%value} ist keine Nummer!',
			date: '{%value} ist kein Datum',
			time: '{%value} ist keine Uhrzeit',
			range: '{%value} ist keine Nummer!',
			"datetime-local": '{%value} ist kein Datum-Uhrzeit Format.'
		},
		rangeUnderflow: '{%value} ist zu niedrig. {%min} ist der unterste Wert, den Sie benutzen können.',
		rangeOverflow: '{%value} ist zu hoch. {%max} ist der oberste Wert, den Sie benutzen können.',
		stepMismatch: 'Der Wert {%value} ist in diesem Feld nicht zulässig. Hier sind nur bestimmte Werte zulässig. {%title}',
		tooLong: 'Der eingegebene Text ist zu lang! Sie haben {%valueLen} Buchstaben eingegeben, dabei sind {%maxlength} das Maximum.',
		
		patternMismatch: '{%value} hat für diese Seite ein falsches Format! {%title}',
		valueMissing: 'Sie müssen einen Wert eingeben'
	};
	
	
	/* ugly workaround/bugfixes */
	(function(){
		var firstEvent,
			invalids = [],
			advancedForm = ( 'value' in doc.createElement('output') && 'list' in doc.createElement('input') ),
			stopSubmitTimer,
			form
		;
		
		
		//opera/chrome fix (this will double all invalid events, we have to stop them!)
		//opera throws a submit-event and then the invalid events,
		//chrome7/safari5.02 has disabled invalid events, this brings them back
		//safari 5.02 reports false invalid events, if setCustomValidity was used
		if(fixNative && window.addEventListener){
			var formnovalidate = {
				timer: undefined,
				prevented: false
			};
			window.addEventListener('submit', function(e){
				if(!formnovalidate.prevented && e.target.checkValidity && $.attr(e.target, 'novalidate') == null){
					$(e.target).checkValidity();
				}
			}, true);
			var preventValidityTest = function(e){
				if($.attr(e.target, 'formnovalidate') == null){return;}
				if(formnovalidate.timer){
					clearTimeout(formnovalidate.timer);
				}
				formnovalidate.prevented = true;
				formnovalidate.timer = setTimeout(function(){
					formnovalidate.prevented = false;
				}, 20);
			};
			window.addEventListener('click', preventValidityTest, true);
			window.addEventListener('touchstart', preventValidityTest, true);
			window.addEventListener('touchend', preventValidityTest, true);
		}
		$(doc).bind('invalid', function(e){
			//safari 5.0.2 has some serious issues
			if(fixNative && $.attr(e.target, 'validity').valid){
				e.stopImmediatePropagation();
				return false;
			}
			if(!firstEvent){
				//webkitfix 
				//chrome 6/safari5.0 submits an invalid form, if you prevent all invalid events
				//this also prevents opera from throwing a submit event if form isn't valid
				form = e.target.form;
				if (form && fixNative){
					
					var submitEvents = $(form)
						.bind('submit.preventInvalidSubmit', function(submitEvent){
							if( $.attr(form, 'novalidate') == null ){
								submitEvent.stopImmediatePropagation();
								return false;
							}
						})
						.data('events').submit
					;
					//add this handler as first executing handler
					if (submitEvents && submitEvents.length > 1) {
						submitEvents.unshift(submitEvents.pop());
					}
				}
				
				//trigger firstinvalid
				firstEvent = $.Event('firstinvalid');
				$(e.target).trigger(firstEvent);
			}
			//if firstinvalid was prevented all invalids will be also prevented
			if( firstEvent && firstEvent.isDefaultPrevented() ){
				e.preventDefault();
			}
			
			//prevent doubble invalids + fix safari bug, where checkValdity returns false
			if(support.validity !== true || invalids.indexOf(e.target) == -1){
				invalids.push(e.target);
			} else if(fixNative) {
				e.stopImmediatePropagation();
			}
			e.extraData = 'fix'; 
			clearTimeout(stopSubmitTimer);
			stopSubmitTimer = setTimeout(function(){
				var lastEvent = {type: 'lastinvalid', cancelable: false, invalidlist: $(invalids)};
				//bad assumption
				if( fixNative && !advancedForm && doc.activeElement && firstEvent && firstEvent.target !== doc.activeElement && !$.data(firstEvent.target, 'maybePreventedinvalid') ){
					webshims.validityAlert.showFor(firstEvent.target);
				}
				//reset firstinvalid
				firstEvent = false;
				invalids = [];
				//remove webkit/operafix
				$(form).unbind('submit.preventInvalidSubmit');
				$(e.target).trigger(lastEvent, lastEvent);
			}, 9);
			
		});
	})();
	
	(function(){
		if(!fixNative){return;}
		support.fieldsetValidation = support.fieldsetValidation || 'shim';
		//safari 5.0.2 has serious issues with checkValidity in combination with setCustomValidity so we mimic checkValidity using validity-property
		var checkValidity = function(elem){
			var valid = ($.attr(elem, 'validity') || {valid: true}).valid;
			if(!valid && elem.checkValidity()){
				$(elem).trigger('invalid');
			}			
			return valid;
		};
		
		//no current browser supports checkValidity on fieldset
		webshims.addMethod('checkValidity', function(){
			if(this.elements || $.nodeName(this, 'fieldset')){
				var ret = true;
				$(this.elements || 'input, textarea, select', this)
					.each(function(){
						 if(!checkValidity(this)){
							ret = false;
						}
					})
				;
				return ret;
			} else if(this.checkValidity){
				return checkValidity(this);
			}
		});
	})();
	
	//implements validationMessage in uncapable browser and adds unknown types/attributes in capable browsers/overrides validationMessage in capable browsers
	(function(){
		var overrideNativeMessages = ( support.validity === true && webshims.overrideValidationMessages );
		var supportRequiredSelect = true;
		var supportNumericDate = true;
		if(support.validity === true){
			supportRequiredSelect = !!( ('required' in doc.createElement('select')) || window.noHTMLExtFixes );
			supportNumericDate = !!(($('<input type="datetime-local" />')[0].type == 'datetime-local' && $('<input type="range" />')[0].type == 'range') );
		}
		var overrideValidity = (!supportRequiredSelect || !supportNumericDate || overrideNativeMessages);
		var typeModels = webshims.inputTypes;
		var validityRules = {};
		var validityProps = ['customError','typeMismatch','rangeUnderflow','rangeOverflow','stepMismatch','tooLong','patternMismatch','valueMissing','valid'];
		var oldAttr = $.attr;
		var oldVal = $.fn.val;
		var validityChanger = (overrideNativeMessages)? {value: 1, checked: 1} : {value: 1};
		var validityElements = (overrideNativeMessages) ? ['textarea'] : [];
		var checkTypes = {radio:1,checkbox:1};
		var testValidity = function(elem, init){
			if(!elem.form){return;}
			var type = (elem.getAttribute && elem.getAttribute('type') || elem.type || '').toLowerCase();
			
			if(!overrideNativeMessages){
				if(!(!supportRequiredSelect && type == 'select-one') && !typeModels[type]){return;}
			}
			
			if(overrideNativeMessages && !init && checkTypes[type] && elem.name){
				$(doc.getElementsByName( elem.name )).each(function(){
					$.attr(this, 'validity');
				});
			} else {
				$.attr(elem, 'validity');
				
			}
		};
		
		if(!supportRequiredSelect || overrideNativeMessages){
			$.extend(validityChanger, {
				required: 1,
				size: 1,
				multiple: 1,
				selectedIndex: 1
			});
			validityElements.push('select');
		}
		if(!supportNumericDate || overrideNativeMessages){
			$.extend(validityChanger, {
				min: 1, max: 1, step: 1
			});
			validityElements.push('input');
		}
		
		var currentValidationMessage =  validityMessages[''];
		$(doc).bind('htmlExtLangChange', function(){
			webshims.activeLang(validityMessages, 'validation-base', function(langObj){
				currentValidationMessage = langObj;
			});
		});
		
		webshims.createValidationMessage = function(elem, name){
			var message = currentValidationMessage[name];
			if(message && typeof message !== 'string'){
				message = message[ (elem.getAttribute('type') || '').toLowerCase() ] || message.defaultMessage;
			}
			if(message){
				['value', 'min', 'max', 'title', 'maxlength', 'label'].forEach(function(attr){
					if(message.indexOf('{%'+attr) === -1){return;}
					var val = ((attr == 'label') ? $.trim($('label[for='+ elem.id +']', elem.form).text()).replace(/\*$|:$/, '') : $.attr(elem, attr)) || '';
					message = message.replace('{%'+ attr +'}', val);
					if('value' == attr){
						message = message.replace('{%valueLen}', val.length);
					}
				});
			}
			return message || '';
		};
		$.each((support.validationMessage) ? ['customValidationMessage'] : ['customValidationMessage', 'validationMessage'], function(i, fn){
			webshims.attr(fn, {
				elementNames: ['input', 'select', 'textarea'],
				getter: function(elem){
					var message = '';
					if(!$.attr(elem, 'willValidate')){
						return message;
					}
					
					var validity = $.attr(elem, 'validity') || {valid: 1};
					if(validity.valid){return message;}
					if(validity.customError || fn === 'validationMessage'){
						message = ('validationMessage' in elem) ? elem.validationMessage : $.data(elem, 'customvalidationMessage');
						if(message){return message;}
					}
					$.each(validity, function(name, prop){
						if(name == 'valid' || !prop){return;}
						message = webshims.createValidationMessage(elem, name);
						if(message){
							return false;
						}
					});
					
					return message || '';
				}
			});
		});
		support.validationMessage = support.validationMessage || 'shim';
		
		
		webshims.addMethod('setCustomValidity', function(error){
			error = error+'';
			if(this.setCustomValidity){
				this.setCustomValidity(error);
				if(overrideValidity){
					$.data(this, 'hasCustomError', !!(error));
					testValidity(this);
				}
			} else {
				$.data(this, 'customvalidationMessage', ''+error);
			}
		});
		
		if(support.validity === true){
			webshims.addInputType = function(type, obj){
				typeModels[type] = obj;
			};
			
			webshims.addValidityRule = function(type, fn){
				validityRules[type] = fn;
			};
			
			webshims.addValidityRule('typeMismatch',function (input, val, cache, validityState){
				if(val === ''){return false;}
				var ret = validityState.typeMismatch;
				if(!('type' in cache)){
					cache.type = (input[0].getAttribute('type') || '').toLowerCase();
				}
				
				if(typeModels[cache.type] && typeModels[cache.type].mismatch){
					ret = typeModels[cache.type].mismatch(val, input);
				}
				return ret;
			});
		}
		
		if(!supportRequiredSelect){
			webshims.createBooleanAttrs('required', ['select']);
			
			webshims.addValidityRule('valueMissing', function(jElm, val, cache, validityState){
				
				if(cache.nodeName == 'select' && !val && jElm.attr('required') && jElm[0].size < 2){
					if(!cache.type){
						cache.type = jElm[0].type;
					}
					
					if(cache.type == 'select-one' && $('> option:first-child:not(:disabled)', jElm).attr('selected')){
						return true;
					}
				}
				return validityState.valueMissing;
			});
		}
		
		if(overrideValidity){
			webshims.attr('validity', {
				elementNames: validityElements,
				getter: function(elem){
					var validity 	= elem.validity;
					if(!validity){
						return validity;
					}
					var validityState = {};
					validityProps.forEach(function(prop){
						validityState[prop] = validity[prop];
					});
					
					if( !$.attr(elem, 'willValidate') ){
						return validityState;
					}
					var jElm 			= $(elem),
						cache 			= {type: (elem.getAttribute && elem.getAttribute('type') || '').toLowerCase(), nodeName: (elem.nodeName || '').toLowerCase()},
						val				= oldVal.call(jElm),
						customError 	= !!($.data(elem, 'hasCustomError')),
						setCustomMessage
					;
					
					validityState.customError = customError;
										
					if( validityState.valid && validityState.customError ){
						validityState.valid = false;
					} else if(!validityState.valid) {
						var allFalse = true;
						$.each(validityState, function(name, prop){
							if(prop){
								allFalse = false;
								return false;
							}
						});
						
						if(allFalse){
							validityState.valid = true;
						}
						
					}
					
					$.each(validityRules, function(rule, fn){
						validityState[rule] = fn(jElm, val, cache, validityState);
						if( validityState[rule] && (validityState.valid || (!setCustomMessage && overrideNativeMessages)) ) {
							elem.setCustomValidity(webshims.createValidationMessage(elem, rule));
							validityState.valid = false;
							setCustomMessage = true;
						}
					});
					if(validityState.valid){
						elem.setCustomValidity('');
					}
					return validityState;
				}
			});
						
			
			$.fn.val = function(val){
				var ret = oldVal.apply(this, arguments);
				this.each(function(){
					testValidity(this);
				});
				return ret;
			};
			
			$.attr = function(elem, prop, value){
				var ret = oldAttr.apply(this, arguments);
				if(validityChanger[prop] && value !== undefined && elem.form){
					testValidity(elem);
				}
				return ret;
			};
			
			if(doc.addEventListener){
				doc.addEventListener('change', function(e){
					testValidity(e.target);
				}, true);
				if (!supportNumericDate) {
					doc.addEventListener('input', function(e){
						testValidity(e.target);
					}, true);
				}
			}
						
			webshims.addReady(function(context){
				
				if(context === doc){
					$(validityElements.join(',')).each(function(){
						testValidity(this, true);
					});
				} else {
					$(validityElements.join(','), context).each(function(){
						testValidity(this, true);
					});
				}
			});
			
		} //end: overrideValidity -> (!supportRequiredSelect || !supportNumericDate || overrideNativeMessages)
		
	})();
	
	webshims.createReadyEvent('validation-base');
}, true);



jQuery.webshims.ready('validation-base', function($){
if($.support.validity){
	return;
}
var webshims = $.webshims;
webshims.inputTypes = webshims.inputTypes || {};
//some helper-functions
var getNames = function(elem){
		return (elem.form && elem.name) ? elem.form[elem.name] : [];
	},
	isNumber = function(string){
		return (typeof string == 'number' || (string && string == string * 1));
	},
	typeModels = webshims.inputTypes,
	checkTypes = {
		radio: 1,
		checkbox: 1		
	},
	getType = function(elem){
		return (elem.getAttribute('type') || elem.type || '').toLowerCase();
	}
;

//API to add new input types
webshims.addInputType = function(type, obj){
	typeModels[type] = obj;
};

//contsrain-validation-api
var validiyPrototype = {
	customError: false,

	typeMismatch: false,
	rangeUnderflow: false,
	rangeOverflow: false,
	stepMismatch: false,
	tooLong: false,
	patternMismatch: false,
	valueMissing: false,
	
	valid: true
};

var validityRules = {
		valueMissing: function(input, val, cache){
			if(!input.attr('required')){
				return false;
			}
			var ret = false;
			if(!('type' in cache)){
				cache.type = getType(input[0]);
			}
			if(cache.nodeName == 'select'){
				ret = (!val && input[0].type == 'select-one' && input[0].size < 2 && $('> option:first-child:not(:disabled)', input).attr('selected'));
			} else if(checkTypes[cache.type]){
				ret = !$(getNames(input[0])).filter(':checked')[0];
			} else {
				ret = !(val);
			}
			return ret;
		},
		tooLong: function(input, val, cache){
			if(val === '' || cache.nodeName == 'select'){return false;}
			var maxLen 	= input.attr('maxlength'),
				ret 	= false,
				len 	= val.length	
			;
			if(len && maxLen >= 0 && val.replace && isNumber(maxLen)){
				ret = (len > maxLen);
			}
			return ret;
		},
		typeMismatch: function (input, val, cache){
			if(val === '' || cache.nodeName == 'select'){return false;}
			var ret = false;
			if(!('type' in cache)){
				cache.type = getType(input[0]);
			}
			
			if(typeModels[cache.type] && typeModels[cache.type].mismatch){
				ret = typeModels[cache.type].mismatch(val, input);
			}
			return ret;
		},
		patternMismatch: function(input, val, cache) {
			if(val === '' || cache.nodeName == 'select'){return false;}
			var pattern = input.attr('pattern');
			if(!pattern){return false;}
			return !(new RegExp('^(?:' + pattern + ')$').test(val));
		}
	}
;

webshims.addValidityRule = function(type, fn){
	validityRules[type] = fn;
};

webshims.addMethod('checkValidity', (function(){
	var unhandledInvalids;
	var testValidity = function(elem){
		
		var e,
			v = $.attr(elem, 'validity')
		;
		if(v){
			$.data(elem, 'cachedValidity', v);
		} else {
			return true;
		}
		if( !v.valid ){
			e = $.Event('invalid');
			var jElm = $(elem).trigger(e);
			if(!unhandledInvalids && !e.isDefaultPrevented()){
				webshims.validityAlert.showFor(jElm);
				unhandledInvalids = true;
			}
		}
		$.data(elem, 'cachedValidity', false);
		return v.valid;
	};
	return function(){
		unhandledInvalids = false;
		if($.nodeName(this, 'form') || $.nodeName(this, 'fieldset')){
			var ret = true,
				elems = this.elements || $( 'input, textarea, select', this);
			
			for(var i = 0, len = elems.length; i < len; i++){
				if( !testValidity(elems[i]) ){
					ret = false;
				}
			}
			return ret;
		} else if(this.form){
			return testValidity(this);
		} else {
			return true;
		}

	};
})());

$.event.special.invalid = {
	add: function(){
		if( !$.data(this, 'invalidEventShim') ){
			$.event.special.invalid.setup.call(this);
		}
	},
	setup: function(){
		$(this)
			.bind('submit', $.event.special.invalid.handler)
			.data('invalidEventShim', true)
		;
		var submitEvents = $(this).data('events').submit;
		if(submitEvents && submitEvents.length > 1){
			submitEvents.unshift( submitEvents.pop() );
		}
	},
	teardown: function(){
		$(this)
			.unbind('submit', $.event.special.invalid.handler)
			.data('invalidEventShim', false)
		;
	},
	handler: function(e, d){
		if( e.type != 'submit' || !$.nodeName(e.target, 'form') || $.attr(e.target, 'novalidate') != null || $.data(e.target, 'novalidate') ){return;}
		var notValid = !($(e.target).checkValidity());
		if(notValid){
			//ToDo
			if(!e.originalEvent && window.console && console.log){
				console.log('submit');
			}
			e.stopImmediatePropagation();
			return false;
		}
	}
};

// IDLs for constrain validation API
webshims.attr('validity', {
	elementNames: ['input', 'select', 'textarea'],
	getter: function(elem){
		var validityState = $.data(elem, 'cachedValidity');
		if(validityState){
			return validityState;
		}
		validityState 	= $.extend({}, validiyPrototype);
		
		if( !$.attr(elem, 'willValidate') ){
			return validityState;
		}
		var jElm 			= $(elem),
			val				= jElm.val(),
			cache 			= {nodeName: elem.nodeName.toLowerCase()}
		;
		
		validityState.customError = !!($.data(elem, 'customvalidationMessage'));
		if( validityState.customError ){
			validityState.valid = false;
		}
						
		$.each(validityRules, function(rule, fn){
			if (fn(jElm, val, cache)) {
				validityState[rule] = true;
				validityState.valid = false;
			}
		});
		return validityState;
	}
});

webshims.createBooleanAttrs('required', ['input', 'textarea', 'select']);

webshims.attr('willValidate', {
	elementNames: ['input', 'select', 'textarea'],
	getter: (function(){
		var types = {
				button: 1,
				reset: 1,
				add: 1,
				remove: 1,
				'move-up': 1,
				'move-down': 1,
				hidden: 1,
				submit: 1
			}
		;
		return function(elem){
			return !!( elem.name && elem.form && !elem.disabled && !elem.readOnly && !types[elem.type] && $.attr(elem.form, 'novalidate') == null );
		};
	})()
});

webshims.addInputType('email', {
	mismatch: (function(){
		//taken from scott gonzales
		var test = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|(\x22((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?\x22))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;
		return function(val){
			return !test.test(val);
		};
	})()
});

webshims.addInputType('url', {
	mismatch: (function(){
		//taken from scott gonzales
		var test = /^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!\$&'\(\)\*\+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
		return function(val){
			return !test.test(val);
		};
	})()
});

var noValidate = function(){
		var elem = this;
		if(!elem.form){return;}
		$.data(elem.form, 'novalidate', true);
		setTimeout(function(){
			$.data(elem.form, 'novalidate', false);
		}, 1);
	}, 
	submitterTypes = {submit: 1, button: 1}
;

$(document).bind('click', function(e){
	if(e.target && e.target.form && submitterTypes[e.target.type] && $.attr(e.target, 'formnovalidate') != null){
		noValidate.call(e.target);
	}
});

webshims.addReady(function(context){
	//start constrain-validation
	var form = $('form', context)
		.bind('invalid', $.noop)
		.find('button[formnovalidate]')
		.bind('click', noValidate)
		.end()
	;
	if(!document.activeElement || !document.activeElement.form){
		$('input, select, textarea', form).filter('[autofocus]:first').focus();
	}
});
$.support.validity = $.support.validity || 'shim';

webshims.createReadyEvent('validity');

}, true); //webshims.ready end



jQuery.webshims.ready('validation-base', function($, webshims){
	if( 'value' in document.createElement('output') ){return;}
	var doc = document;	
	
	(function(){
		var elements = {
				input: 1,
				textarea: 1
			},
			noInputTypes = {
				radio: 1,
				checkbox: 1,
				submit: 1,
				button: 1,
				image: 1,
				reset: 1
				
				//pro forma
				,color: 1
				//,range: 1
			},
			observe = function(input){
				var timer,
					lastVal = input.attr('value'),
					trigger = function(e){
						//input === null
						if(!input){return;}
						var newVal = input.attr('value');
						
						if(newVal !== lastVal){
							lastVal = newVal;
							if(!e || e.type != 'input'){
								webshims.triggerInlineForm(input[0], 'input');
							}
						}
					},
					unbind = function(){
						input.unbind('focusout', unbind).unbind('input', trigger);
						clearInterval(timer);
						trigger();
						input = null;
					}
				;
				
				clearInterval(timer);
				timer = setInterval(trigger, ($.browser.mozilla) ? 250 : 111);
				setTimeout(trigger, 9);
				input.bind('focusout', unbind).bind('input', trigger);
			}
		;
			
		
		$(doc)
			.bind('focusin', function(e){
				if( e.target && e.target.type && !e.target.readonly && !e.target.readOnly && !e.target.disabled && elements[(e.target.nodeName || '').toLowerCase()] && !noInputTypes[e.target.type] ){
					observe($(e.target));
				}
			})
		;
	})();
	
	
	
	var outputCreate = function(elem){
		if(elem.getAttribute('aria-live')){return;}
		elem = $(elem);
		var value = (elem.text() || '').trim();
		var	id 	= elem.attr('id');
		var	htmlFor = elem.attr('for');
		var shim = $('<input class="output-shim" type="hidden" name="'+ (elem.attr('name') || '')+'" value="'+value+'" style="display: none" />').insertAfter(elem);
		var form = shim[0].form || doc;
		var setValue = function(val){
			shim[0].value = val;
			val = shim[0].value;
			elem.text(val);
			elem[0].value = val;
		};
		
		elem[0].defaultValue = value;
		elem[0].value = value;
		
		elem.attr({'aria-live': 'polite'});
		if(id){
			shim.attr('id', id);
			elem.attr('aria-labeldby', webshims.getID($('label[for='+id+']', form)));
		}
		if(htmlFor){
			id = webshims.getID(elem);
			htmlFor.split(' ').forEach(function(control){
				control = form.getElementById(control);
				if(control){
					control.setAttribute('aria-controls', id);
				}
			});
		}
		elem.data('outputShim', setValue );
		shim.data('outputShim', setValue );
		return setValue;
	};
	

	webshims.attr('value', {
		elementNames: ['output', 'input'],
		getter: true,
		setter: function(elem, value, oldFn){
			var setVal = $.data(elem, 'outputShim');
			if(!setVal){
				if($.nodeName(elem, 'output')){
					setVal = outputCreate(elem);
				} else {
					return oldFn();
				}
			}
			setVal(value);
		}
	});
	
	webshims.addReady(function(context){
		$('output', context).each(function(){
			outputCreate(this);
		});
	});
	
	webshims.createReadyEvent('output');
}, true);(function($){
	"use strict";
	var isImplemented;
	
	var implementTypes = function($, webshims, window){
		if(isImplemented){return;}
		isImplemented = true;
		
		var nan = parseInt('NaN', 10),
			doc = document,
			typeModels = webshims.inputTypes,
			isNumber = function(string){
				
				return (typeof string == 'number' || (string && string == string * 1));
			},
			supportsType = function(type){
				return ($('<input type="'+type+'" />').attr('type') === type);
			},
			getType = function(elem){
				return (elem.getAttribute('type') || '').toLowerCase();
			},
			isDateTimePart = function(string){
				return (isNumber(string) || (string && string == '0' + (string * 1)));
			},
			//why no step IDL?
			getStep = function(elem, type){
				var step = $.attr(elem, 'step');
				if(step === 'any'){
					return step;
				}
				type = type || getType(elem);
				if(!typeModels[type] || !typeModels[type].step){
					return step;
				}
				step = typeModels.number.asNumber(step);
				return ((!isNaN(step) && step > 0) ? step : typeModels[type].step) * typeModels[type].stepScaleFactor;
			},
			//why no min/max IDL?
			addMinMaxNumberToCache = function(attr, elem, cache){
				if (!(attr+'AsNumber' in cache)) {
					cache[attr+'AsNumber'] = typeModels[cache.type].asNumber(elem.attr(attr));
					if(isNaN(cache[attr+'AsNumber']) && (attr+'Default' in typeModels[cache.type])){
						cache[attr+'AsNumber'] = typeModels[cache.type][attr+'Default'];
					}
				}
			},
			addleadingZero = function(val, len){
				val = ''+val;
				len = len - val.length;
				for(var i = 0; i < len; i++){
					val = '0'+val;
				}
				return val;
			},
			EPS = 1e-7
		;
		
		webshims.addValidityRule('stepMismatch', function(input, val, cache){
			if(val === ''){return false;}
			if(!('type' in cache)){
				cache.type = getType(input[0]);
			}
			//stepmismatch with date is computable, but it would be a typeMismatch (performance)
			if(cache.type == 'date'){
				return false;
			}
			var ret = false, base;
			if(typeModels[cache.type] && typeModels[cache.type].step){
				if( !('step' in cache) ){
					cache.step = getStep(input[0], cache.type);
				}
				
				if(cache.step == 'any'){return false;}
				
				if(!('valueAsNumber' in cache)){
					cache.valueAsNumber = typeModels[cache.type].asNumber( val );
				}
				if(isNaN(cache.valueAsNumber)){return false;}
				
				addMinMaxNumberToCache('min', input, cache);
				base = cache.minAsNumber;
				if(isNaN(base)){
					base = typeModels[cache.type].stepBase || 0;
				}
				
				ret =  Math.abs((cache.valueAsNumber - base) % cache.step);
								
				ret = !(  ret <= EPS || Math.abs(ret - cache.step) <= EPS  );
			}
			return ret;
		});
		
		
		
		[{name: 'rangeOverflow', attr: 'max', factor: 1}, {name: 'rangeUnderflow', attr: 'min', factor: -1}].forEach(function(data, i){
			webshims.addValidityRule(data.name, function(input, val, cache) {
				var ret = false;
				if(val === ''){return ret;}
				if (!('type' in cache)) {
					cache.type = getType(input[0]);
				}
				if (typeModels[cache.type] && typeModels[cache.type].asNumber) {
					if(!('valueAsNumber' in cache)){
						cache.valueAsNumber = typeModels[cache.type].asNumber( val );
					}
					if(isNaN(cache.valueAsNumber)){
						return false;
					}
					
					addMinMaxNumberToCache(data.attr, input, cache);
					
					if(isNaN(cache[data.attr+'AsNumber'])){
						return ret;
					}
					ret = ( cache[data.attr+'AsNumber'] * data.factor <  cache.valueAsNumber * data.factor - EPS );
				}
				return ret;
			});
		});
		
		//IDLs and methods, that aren't part of constrain validation, but strongly tight to it
		webshims.attr('valueAsNumber', {
			elementNames: ['input'],
			getter: function(elem, fn){
				var type = getType(elem);
				return (typeModels[type] && typeModels[type].asNumber) ? 
					typeModels[type].asNumber($.attr(elem, 'value')) :
					nan;
			},
			setter: function(elem, val, fn){
				var type = getType(elem);
				if(typeModels[type] && typeModels[type].numberToString){
					//is NaN a number?
					if(isNaN(val)){
						$.attr(elem, 'value', '');
						return;
					}
					var set = typeModels[type].numberToString(val);
					if(set !==  false){
						$.attr(elem, 'value', set);
					} else {
						throw('INVALID_STATE_ERR: DOM Exception 11');
					}
				} else {
					fn();
				}
			}
		});
		
		webshims.attr('valueAsDate', {
			elementNames: ['input'],
			getter: function(elem, fn){
				var type = getType(elem);
				return (typeModels[type] && typeModels[type].asDate && !typeModels[type].noAsDate) ? 
					typeModels[type].asDate($.attr(elem, 'value')) :
					null;
			},
			setter: function(elem, value, fn){
				var type = getType(elem);
				if(typeModels[type] && typeModels[type].dateToString){
					if(!window.noHTMLExtFixes) {
						throw("there are some serious issues in opera's implementation. don't use!");
					}
					if(value === null){
						$.attr(elem, 'value', '');
						return;
					}
					var set = typeModels[type].dateToString(value);
					if(set !== false){
						$.attr(elem, 'value', set);
					} else {
						throw('INVALID_STATE_ERR: DOM Exception 11');
					}
				} else {
					fn();
				}
			}
		});
		
		var typeProtos = {
			
			number: {
				mismatch: function(val){
					return !(isNumber(val));
				},
				step: 1,
				//stepBase: 0, 0 = default
				stepScaleFactor: 1,
				asNumber: function(str){
					return (isNumber(str)) ? str * 1 : nan;
				},
				numberToString: function(num){
					return (isNumber(num)) ? num : false;
				}
			},
			
			range: {
				minDefault: 0,
				maxDefault: 100
			},
			
			date: {
				mismatch: function(val){
					if(!val || !val.split || !(/\d$/.test(val))){return true;}
					var valA = val.split(/\u002D/);
					if(valA.length !== 3){return true;}
					var ret = false;
					$.each(valA, function(i, part){
						if(!isDateTimePart(part)){
							ret = true;
							return false;
						}
					});
					if(ret){return ret;}
					if(valA[0].length !== 4 || valA[1].length != 2 || valA[1] > 12 || valA[2].length != 2 || valA[2] > 33){
						ret = true;
					}
					return (val !== this.dateToString( this.asDate(val, true) ) );
				},
				step: 1,
				//stepBase: 0, 0 = default
				stepScaleFactor:  86400000,
				asDate: function(val, _noMismatch){
					if(!_noMismatch && this.mismatch(val)){
						return null;
					}
					return new Date(this.asNumber(val, true));
				},
				asNumber: function(str, _noMismatch){
					var ret = nan;
					if(_noMismatch || !this.mismatch(str)){
						str = str.split(/\u002D/);
						ret = Date.UTC(str[0], str[1] - 1, str[2]);
					}
					return ret;
				},
				numberToString: function(num){
					return (isNumber(num)) ? this.dateToString(new Date( num * 1)) : false;
				},
				dateToString: function(date){
					return (date && date.getFullYear) ? date.getUTCFullYear() +'-'+ addleadingZero(date.getUTCMonth()+1, 2) +'-'+ addleadingZero(date.getUTCDate(), 2) : false;
				}
			},
			
			time: {
				mismatch: function(val, _getParsed){
					if(!val || !val.split || !(/\d$/.test(val))){return true;}
					val = val.split(/\u003A/);
					if(val.length < 2 || val.length > 3){return true;}
					var ret = false,
						sFraction;
					if(val[2]){
						val[2] = val[2].split(/\u002E/);
						sFraction = parseInt(val[2][1], 10);
						val[2] = val[2][0];
					}
					$.each(val, function(i, part){
						if(!isDateTimePart(part) || part.length !== 2){
							ret = true;
							return false;
						}
					});
					if(ret){return true;}
					if(val[0] > 23 || val[0] < 0 || val[1] > 59 || val[1] < 0){
						return true;
					}
					if(val[2] && (val[2] > 59 || val[2] < 0 )){
						return true;
					}
					if(sFraction && isNaN(sFraction)){
						return true;
					}
					if(sFraction){
						if(sFraction < 100){
							sFraction *= 100;
						} else if(sFraction < 10){
							sFraction *= 10;
						}
					}
					return (_getParsed === true) ? [val, sFraction] : false;
				},
				step: 60,
				stepBase: 0,
				stepScaleFactor:  1000,
				asDate: function(val){
					val = new Date(this.asNumber(val));
					return (isNaN(val)) ? null : val;
				},
				asNumber: function(val){
					var ret = nan;
					val = this.mismatch(val, true);
					if(val !== true){
						ret = Date.UTC('1970', 0, 1, val[0][0], val[0][1], val[0][2] || 0);
						if(val[1]){
							ret += val[1];
						}
					}
					return ret;
				},
				dateToString: function(date){
					if(date && date.getUTCHours){
						var str = addleadingZero(date.getUTCHours(), 2) +':'+ addleadingZero(date.getUTCMinutes(), 2),
							tmp = date.getSeconds()
						;
						if(tmp != "0"){
							str += ':'+ addleadingZero(tmp, 2);
						}
						tmp = date.getUTCMilliseconds();
						if(tmp != "0"){
							str += '.'+ addleadingZero(tmp, 3);
						}
						return str;
					} else {
						return false;
					}
				}
			},
			
			'datetime-local': {
				mismatch: function(val, _getParsed){
					if(!val || !val.split || (val+'special').split(/\u0054/).length !== 2){return true;}
					val = val.split(/\u0054/);
					return ( typeModels.date.mismatch(val[0]) || typeModels.time.mismatch(val[1], _getParsed) );
				},
				noAsDate: true,
				asDate: function(val){
					val = new Date(this.asNumber(val));
					
					return (isNaN(val)) ? null : val;
				},
				asNumber: function(val){
					var ret = nan;
					var time = this.mismatch(val, true);
					if(time !== true){
						val = val.split(/\u0054/)[0].split(/\u002D/);
						
						ret = Date.UTC(val[0], val[1] - 1, val[2], time[0][0], time[0][1], time[0][2] || 0);
						if(time[1]){
							ret += time[1];
						}
					}
					return ret;
				},
				dateToString: function(date, _getParsed){
					return typeModels.date.dateToString(date) +'T'+ typeModels.time.dateToString(date, _getParsed);
				}
			}
		};
		
		if(!supportsType('number')){
			webshims.addInputType('number', typeProtos.number);
		}
		
		if(!supportsType('range')){
			webshims.addInputType('range', $.extend({}, typeProtos.number, typeProtos.range));
		}
		if(!supportsType('date')){
			webshims.addInputType('date', typeProtos.date);
		}
		if(!supportsType('time')){
			webshims.addInputType('time', $.extend({}, typeProtos.date, typeProtos.time));
		}
		
		if(!supportsType('datetime-local')){
			webshims.addInputType('datetime-local', $.extend({}, typeProtos.date, typeProtos.time, typeProtos['datetime-local']));
		}
		
		//implement set/arrow controls
		(function(){
			var options = webshims.modules['number-date-type'].options;
			var getNextStep = function(input, upDown, cache){
				
				cache = cache || {};
				
				if( !('type' in cache) ){
					cache.type = getType(input);
				}
				if( !('step' in cache) ){
					cache.step = getStep(input, cache.type);
				}
				if( !('valueAsNumber' in cache) ){
					cache.valueAsNumber = typeModels[cache.type].asNumber($.attr(input, 'value'));
				}
				var delta = (cache.step == 'any') ? typeModels[cache.type].step * typeModels[cache.type].stepScaleFactor : cache.step,
					ret
				;
				addMinMaxNumberToCache('min', $(input), cache);
				addMinMaxNumberToCache('max', $(input), cache);
				
				if(isNaN(cache.valueAsNumber)){
					cache.valueAsNumber = typeModels[cache.type].stepBase || 0;
				}
				//make a valid step
				if(cache.step !== 'any'){
					ret = Math.round( ((cache.valueAsNumber - (cache.minAsnumber || 0)) % cache.step) * 1e7 ) / 1e7;
					if(ret &&  Math.abs(ret) != cache.step){
						cache.valueAsNumber = cache.valueAsNumber - ret;
					}
				}
				ret = cache.valueAsNumber + (delta * upDown);
				//using NUMBER.MIN/MAX is really stupid | ToDo: either use disabled state or make this more usable
				if(!isNaN(cache.minAsNumber) && ret < cache.minAsNumber){
					ret = (cache.valueAsNumber * upDown  < cache.minAsNumber) ? cache.minAsNumber : isNaN(cache.maxAsNumber) ? Number.MAX_VALUE : cache.maxAsNumber;
				} else if(!isNaN(cache.maxAsNumber) && ret > cache.maxAsNumber){
					ret = (cache.valueAsNumber * upDown > cache.maxAsNumber) ? cache.maxAsNumber : isNaN(cache.minAsNumber) ? Number.MIN_VALUE : cache.minAsNumber;
				}
				return Math.round( ret * 1e7)  / 1e7;
			};
			
			webshims.modules['number-date-type'].getNextStep = getNextStep;
			
			var doSteps = function(input, type, control){
				if(input.disabled || input.readOnly || $(control).hasClass('step-controls')){return;}
				$.attr(input, 'value',  typeModels[type].numberToString(getNextStep(input, ($(control).hasClass('step-up')) ? 1 : -1, {type: type})));
				$(input).unbind('blur.stepeventshim');
				webshims.triggerInlineForm(input, 'input');
				
				
				if( doc.activeElement ){
					if(doc.activeElement !== input){
						try {input.focus();} catch(e){}
					}
					setTimeout(function(){
						if(doc.activeElement !== input){
							try {input.focus();} catch(e){}
						}
						$(input)
							.one('blur.stepeventshim', function(){
								$(input).trigger('change');
							})
						;
					}, 0);
					
				}
			};
			
			
			if(options.stepArrows){
				var disabledReadonly = {
					elementNames: ['input'],
					// don't change getter
					setter: function(elem, value, fn){
						fn();
						var stepcontrols = $.data(elem, 'step-controls');
						if(stepcontrols){
							stepcontrols[ (elem.disabled || elem.readonly) ? 'addClass' : 'removeClass' ]('disabled-step-control');
						}
					}
				};
				webshims.attr('disabled', disabledReadonly);
				webshims.attr('readonly', disabledReadonly);
				
			}
			var stepKeys = {
				38: 1,
				40: -1
			};
			webshims.addReady(function(context){
				
				//ui for numeric values
				if(options.stepArrows){
					$('input', context).each(function(){
						var type = getType(this);
						if(!typeModels[type] || !typeModels[type].asNumber || !options.stepArrows || (options.stepArrows !== true && !options.stepArrows[type])){return;}
						var elem = this,
							dir 	= ($(this).css('direction') == 'rtl') ? 
								{
									action: 'insertBefore',
									side: 'Left',
									otherSide: 'right'
								} :
								{
									action: 'insertAfter',
									side: 'Right',
									otherSide: 'Left'
								}
						;
						var controls = $('<span class="step-controls" unselectable="on"><span class="step-up" /><span class="step-down" /></span>')	
							[dir.action](this)
							.bind('selectstart dragstart', function(){
								return false;
							})
							.bind('mousedown mousepress', function(e){
								doSteps(elem, type, e.target);
								return false;
							})
						;
						
						$(this)
							.addClass('has-step-controls')
							.data('step-controls', controls)
							.attr({
								readonly: this.readOnly,
								disabled: this.disabled
							})
							.bind('keypress', function(e){
								if(this.disabled || this.readOnly || !stepKeys[e.keyCode]){return;}
								$.attr(this, 'value',  typeModels[type].numberToString(getNextStep(this, stepKeys[e.keyCode], {type: type})));
								webshims.triggerInlineForm(this, 'input');
								return false;
							})
						;
						
						if(options.calculateWidth){
							var jElm = $(this);
							var inputDim = {
								w: jElm.getwidth()
							};
							if(!inputDim.w){return;}
							var controlDim = {
								mL: (parseInt(controls.css('margin'+dir.otherSide), 10) || 0),
//								mR: (parseInt(controls.css('margin'+dir.side), 10) || 0),
								w: controls.getouterWidth()
							};
							inputDim.mR = (parseInt(jElm.css('margin'+dir.side), 10) || 0);
							if(inputDim.mR){
								jElm.css('margin'+dir.side, 0);
							}
							//is inside
							if( controlDim.mL <= (controlDim.w * -1) ){
								controls.css('margin'+dir.side, Math.abs(controlDim.w + controlDim.mL) + inputDim.mR);
								jElm.css('padding'+dir.side, (parseInt($(this).css('padding'+dir.side), 10) || 0) + Math.abs(controlDim.mL));
								jElm.css('width', inputDim.w + controlDim.mL);
							} else {
								controls.css('margin'+dir.side, inputDim.mR);
								jElm.css('width', inputDim.w - controlDim.mL - controlDim.w);
							}
							
						}
					});
				}
			});
		})();
		// add support for new input-types
		webshims.attr('type', {
			elementNames: ['input'],
			getter: function(elem, fn){
				var type = getType(elem);
				return (webshims.inputTypes[type]) ? type : elem.type || elem.getAttribute('type');
			},
			//don't change setter
			setter: true
		});
		
		webshims.createReadyEvent('number-date-type');
	};
	
	if($.support.validity === true){
		$.webshims.ready('validation-base', implementTypes, true);
	} else {
		$.webshims.ready('validity', implementTypes, true);
	}
	
})(jQuery);
jQuery.webshims.ready('number-date-type', function($, webshims, window, document){
	"use strict";
	$.support.inputUI = 'shim';
		
	var options = $.webshims.modules.inputUI.options;
	var globalInvalidTimer;
	var labelID = 0;
	var replaceInputUI = function(context){
		$('input', context).each(function(){
			var type = $.attr(this, 'type');
			if(replaceInputUI[type]  && !$.data(this, 'inputUIReplace')){
				replaceInputUI[type]($(this));
			}
		});
	};
	
	replaceInputUI.common = function(orig, shim, methods){
		if(options.replaceNative){
			(function(){
				var events = [];
				var timer;
				var throwError = function(e){
					if(!$.data(e.target, 'maybePreventedinvalid') && (!events[0] || !events[0].isDefaultPrevented()) && (!events[1] || !events[1].isDefaultPrevented()) ){
						var elem = e.target;
						var name = elem.nodeName;
						if(elem.id){
							name += '#'+elem.id;
						}
						if(elem.name){
							name += '[name='+ elem.name +']';
						}
						if(elem.className){
							name += '.'+ (elem.className.split(' ').join('.'));
						}
						throw(name +' can not be focused. handle the invalid event.');
					}
				};
				orig.bind('firstinvalid invalid', function(e){
					clearTimeout(timer);
					events.push(e);
					timer = setTimeout(function(){
						throwError(e);
						events = [];
					}, 30);
				});
			})();
		} else if($.support.validity === true){
			orig.bind('firstinvalid', function(e){
				clearTimeout(globalInvalidTimer);
				globalInvalidTimer = setTimeout(function(){
					if(!$.data(e.target, 'maybePreventedinvalid') && !e.isDefaultPrevented()){
						webshims.validityAlert.showFor( e.target ); 
					}
				}, 30);
			});
		}
		var id = orig.attr('id'),
			attr = {
				css: {
					marginRight: orig.css('marginRight'),
					marginLeft: orig.css('marginLeft')
				},
				outerWidth: orig.getouterWidth(),
				label: (id) ? $('label[for='+ id +']', orig[0].form) : $([])
			},
			curLabelID =  webshims.getID(attr.label)
		;
		shim.addClass(orig[0].className).data('html5element', orig);
		orig
			.after(shim)
			.data('inputUIReplace', {visual: shim, methods: methods})
			.hide()
		;
		
		if(shim.length == 1 && !$('*', shim)[0]){
			shim.attr('aria-labeledby', curLabelID);
			attr.label.bind('click', function(){
				shim.focus();
				return false;
			});
		}
		return attr;
	};
	
	replaceInputUI['datetime-local'] = function(elem){
		if(!$.fn.datepicker){return;}
		var date = $('<span class="input-datetime-local"><input type="text" class="input-datetime-local-date" /><input type="time" class="input-datetime-local-time" /></span>'),
			attr  = this.common(elem, date, replaceInputUI['datetime-local'].attrs),
			datePicker = $('input.input-datetime-local-date', date)
		;
		$('input', date).data('html5element', $.data(date[0], 'html5element'));
		
		datePicker.attr('aria-labeledby', attr.label.attr('id'));
		attr.label.bind('click', function(){
			datePicker.focus();
			return false;
		});
		
		if(attr.css){
			date.css(attr.css);
			if(attr.outerWidth){
				date.outerWidth(attr.outerWidth);
				var width = date.getwidth();
				datePicker
					.css({marginLeft: 0, marginRight: 2})
					.outerWidth(Math.floor(width * 0.61))
				;
				$('input.input-datetime-local-time')
					.css({marginLeft: 2, marginRight: 0})
					.outerWidth(Math.floor(width * 0.37))
				;
			}
		}
		
		webshims.triggerDomUpdate(date);
		$('input.input-datetime-local-date', date)
			.datepicker($.extend({}, options.datepicker))
			.bind('change', function(val, ui){
				
				var value, timeVal = $('input.input-datetime-local-time', date).attr('value');
				try {
					value = $.datepicker.parseDate(datePicker.datepicker('option', 'dateFormat'), datePicker.attr('value'));
					value = (value) ? $.datepicker.formatDate('yy-mm-dd', value) : datePicker.attr('value');
				} 
				catch (e) {
					value = datePicker.attr('value');
				}
				if (!$('input.input-datetime-local-time', date).attr('value')) {
					timeVal = '00:00';
					$('input.input-datetime-local-time', date).attr('value', timeVal);
				}
				replaceInputUI['datetime-local'].blockAttr = true;
				elem.attr('value', value + 'T' + timeVal);
				replaceInputUI['datetime-local'].blockAttr = false;
				elem.trigger('change');
			})
			.data('datepicker')
			.dpDiv.addClass('input-date-datepicker-control')
		;
		
		$('input.input-datetime-local-time', date).bind('input change', function(){
			var val = elem.attr('value').split('T');
			if(val.length < 2 || !val[0]){
				val[0] = $.datepicker.formatDate('yy-mm-dd', new Date());
			}
			val[1] = $.attr(this, 'value');
			replaceInputUI['datetime-local'].blockAttr = true;
			
			try {
				datePicker.attr('value', $.datepicker.formatDate(datePicker.datepicker('option', 'dateFormat'), $.datepicker.parseDate('yy-mm-dd', val[0])));
			} catch(e){}
			elem.attr('value', val.join('T'));
			replaceInputUI['datetime-local'].blockAttr = false;
			elem.trigger('change');
		});
		
		$.each(['disabled', 'min', 'max', 'value', 'step'], function(i, name){
			elem.attr(name, function(i, value){return value || '';});
		});
	};
	
	replaceInputUI['datetime-local'].attrs = {
		disabled: function(orig, shim, value){
			$('input.input-datetime-local-date', shim).datepicker('option', 'disabled', !!value);
			$('input.input-datetime-local-time', shim).attr('disabled', !!value);
		},
		step: function(orig, shim, value){
			$('input.input-datetime-local-time', shim).attr('step', value);
		},
		//ToDo: use min also on time
		min: function(orig, shim, value){
			value = (value.split) ? value.split('T') : [];
			try {
				value = $.datepicker.parseDate('yy-mm-dd', value[0]);
			} catch(e){value = false;}
			if(value){
				$('input.input-datetime-local-date', shim).datepicker('option', 'minDate', value);
			}
		},
		//ToDo: use max also on time
		max: function(orig, shim, value){
			value = (value.split) ? value.split('T') : [];
			try {
				value = $.datepicker.parseDate('yy-mm-dd', value[0]);
			} catch(e){value = false;}
			if(value){
				$('input.input-datetime-local-date', shim).datepicker('option', 'maxDate', value);
			}
		},
		value: function(orig, shim, value){
			if(!replaceInputUI['datetime-local'].blockAttr){
				var dateValue;
				value = (value.split) ? value.split('T') : [];
				try {
					dateValue = $.datepicker.parseDate('yy-mm-dd', value[0]);
				} catch(e){dateValue = false;}
				if(dateValue){
					$('input.input-datetime-local-date', shim).datepicker('setDate', dateValue);
					$('input.input-datetime-local-time', shim).attr('value', value[1] || '00:00');
				} else {
					$('input.input-datetime-local-date', shim).attr('value', value[0] || '');
					$('input.input-datetime-local-time', shim).attr('value', value[1] || '');
				}
				
			}
		}
	};
	
	replaceInputUI.date = function(elem){
		if(!$.fn.datepicker){return;}
		var date = $('<input type="text" class="input-date" />'),
			attr  = this.common(elem, date, replaceInputUI.date.attrs),
			change = function(val, ui){
				replaceInputUI.date.blockAttr = true;
				var value;
				try {
					value = $.datepicker.parseDate(date.datepicker('option', 'dateFormat'), date.attr('value') );
					value = (value) ? $.datepicker.formatDate( 'yy-mm-dd', value ) : date.attr('value');
				} catch(e){
					value = date.attr('value');
				}
				elem.attr('value', value);
				replaceInputUI.date.blockAttr = false;
				elem.trigger('change');
			}
		;
		
		if(attr.css){
			date.css(attr.css);
			if(attr.outerWidth){
				date.outerWidth(attr.outerWidth);
			}
		}
		date
			.datepicker($.extend({}, options.datepicker))
			.bind('change', change)
			.data('datepicker')
			.dpDiv.addClass('input-date-datepicker-control')
		;
		$.each(['disabled', 'min', 'max', 'value'], function(i, name){
			elem.attr(name, function(i, value){return value || '';});
		});
	};
	
	replaceInputUI.date.attrs = {
		disabled: function(orig, shim, value){
			shim.datepicker('option', 'disabled', !!value);
		},
		min: function(orig, shim, value){
			try {
				value = $.datepicker.parseDate('yy-mm-dd', value);
			} catch(e){value = false;}
			if(value){
				shim.datepicker('option', 'minDate', value);
			}
		},
		max: function(orig, shim, value){
			try {
				value = $.datepicker.parseDate('yy-mm-dd', value);
			} catch(e){value = false;}
			if(value){
				shim.datepicker('option', 'maxDate', value);
			}
		},
		value: function(orig, shim, value){
			if(!replaceInputUI.date.blockAttr){
				try {
					var dateValue = $.datepicker.parseDate('yy-mm-dd', value);
				} catch(e){var dateValue = false;}
				if(dateValue){
					shim.datepicker('setDate', dateValue);
				} else {
					shim.attr('value', value);
				}
			}
		}
	};
	
	replaceInputUI.range = function(elem){
		if(!$.fn.slider){return;}
		var range = $('<span class="input-range"><span class="ui-slider-handle" role="slider" tabindex="0" /></span>'),
			attr  = this.common(elem, range, replaceInputUI.range.attrs),
			change = function(e, ui){
				if(e.originalEvent){
					replaceInputUI.range.blockAttr = true;
					elem.attr('value', ui.value);
					replaceInputUI.range.blockAttr = false;
					if(e.type == 'slidechange'){
						elem.trigger('change');
					} else {
						webshims.triggerInlineForm(elem[0], 'input');
					}
				}
			}
		;
		
		$('span', range).attr('aria-labeledby', attr.label.attr('id'));
		attr.label.bind('click', function(){
			$('span', range).focus();
			return false;
		});
		
		if(attr.css){
			range.css(attr.css);
			if(attr.outerWidth){
				range.outerWidth(attr.outerWidth);
			}
		}
		range.slider($.extend(options.slider, {
			change: change,
			slide: change
		}));
		
		$.each(['disabled', 'min', 'max', 'value', 'step'], function(i, name){
			elem.attr(name, function(i, value){return value || '';});
		});
	};
	
	replaceInputUI.range.attrs = {
		disabled: function(orig, shim, value){
			value = !!value;
			shim.slider( "option", "disabled", value );
			$('span', shim)
				.attr({
					'aria-disabled': value+'',
					'tabindex': (value) ? '-1' : '0'
				})
			;
		},
		min: function(orig, shim, value){
			value = (value) ? value * 1 || 0 : 0;
			shim.slider( "option", "min", value );
			$('span', shim).attr({'aria-valuemin': value});
		},
		max: function(orig, shim, value){
			value = (value || value === 0) ? value * 1 || 100 : 100;
			shim.slider( "option", "max", value );
			$('span', shim).attr({'aria-valuemax': value});
		},
		value: function(orig, shim, value){
			value = $(orig).attr('valueAsNumber');
			if(isNaN(value)){
				value = (shim.slider('option', 'max') - shim.slider('option', 'min')) / 2;
				orig.value = value;
			}
			if(!replaceInputUI.range.blockAttr){
				shim.slider( "option", "value", value );
			}
			$('span', shim).attr({'aria-valuenow': value, 'aria-valuetext': value});
		},
		step: function(orig, shim, value){
			value = (value && $.trim(value)) ? value * 1 || 1 : 1;
			shim.slider( "option", "step", value );
		}
	};
	
	$.each(['disabled', 'min', 'max', 'value', 'step'], function(i, attr){
		webshims.attr(attr, {
			elementNames: ['input'],
			setter: function(elem, val, fn){
				var widget = $.data(elem, 'inputUIReplace');
				fn();
				if(widget && widget.methods[attr]){
					val = widget.methods[attr](elem, widget.visual, val);
				}
			},
			getter: true
		});
	});
	
		
	var changeDefaults = function(langObj){
		if(!langObj){return;}
		var opts = $.extend({}, langObj, options.date);
		$('input.hasDatepicker').filter('.input-date, .input-datetime-local-date').datepicker('option', opts).each(function(){
			var orig = $.data(this, 'html5element');
			if(orig){
				$.each(['disabled', 'min', 'max', 'value'], function(i, name){
					orig.attr(name, function(i, value){return value || '';});
				});
			}
		});
		$.datepicker.setDefaults(opts);
	};
	
	$(document).bind('jquery-uiReady.langchange input-widgetsReady.langchange', function(){
		if(!$.datepicker){return;}
		$(document)
			.bind('htmlExtLangChange', function(){
				webshims.activeLang($.datepicker.regional, 'inputUI', changeDefaults);
			})
			.unbind('jquery-uiReady.langchange input-widgetsReady.langchange')
		;
	});
	
	webshims.addReady(function(context){
		$(document).bind('jquery-uiReady.initinputui input-widgetsReady.initinputui', function(){
			if($.datepicker || $.fn.slider){
				replaceInputUI(context);
			}
			if($.datepicker && $.fn.slider){
				$(document).unbind('jquery-uiReady.initinputui input-widgetsReady.initinputui');
			}
			if(context === document){
				webshims.createReadyEvent('inputUI');
			}
		});
	});
	
}, true);
/*
 * HTML5 placeholder-enhancer
 * version: 2.0.2
 * including a11y-name fallback
 * 
 * 
 */


(function($){
	if($.support.placeholder){
		return;
	}
	$.support.placeholder = 'shim';
	var changePlaceholderVisibility = function(elem, value, placeholderTxt, data, type){
			if(!data){
				data = $.data(elem, 'placeHolder');
				if(!data){return;}
			}
			if(type == 'focus' || (!type && elem === document.activeElement)){
				data.box.removeClass('placeholder-visible');
				return;
			}
			if(value === false){
				value = $.attr(elem, 'value');
			}
			if(value){
				data.box.removeClass('placeholder-visible');
				return;
			}
			if(placeholderTxt === false){
				placeholderTxt = $.attr(elem, 'placeholder');
			}
			
			data.box[(placeholderTxt && !value) ? 'addClass' : 'removeClass']('placeholder-visible');
		},
		createPlaceholder = function(elem){
			elem = $(elem);
			var id 			= elem.attr('id'),
				hasLabel	= !!(elem.attr('title') || elem.attr('aria-labeledby')),
				pHolderTxt
			;
			if(!hasLabel && id){
				hasLabel = !!( $('label[for='+ id +']', elem[0].form)[0] );
			}
			return $((hasLabel) ? '<span class="placeholder-text"></span>' : '<label for="'+ (id || $.webshims.getID(elem)) +'" class="placeholder-text"></label>');
		},
		pHolder = (function(){
			var delReg 	= /\n|\r|\f|\t/g,
				allowedPlaceholder = {
					text: 1,
					search: 1,
					url: 1,
					email: 1,
					password: 1,
					tel: 1
				}
			;
			
			return {
				create: function(elem){
					var data = $.data(elem, 'placeHolder');
					if(data){return data;}
					data = $.data(elem, 'placeHolder', {
						text: createPlaceholder(elem)
					});
					data.box = $(elem)
						.wrap('<span class="placeholder-box placeholder-box-'+ (elem.nodeName || '').toLowerCase() +'" />')
						.bind('focus.placeholder blur.placeholder', function(e){
							changePlaceholderVisibility(this, false, false, data, e.type );
						})
						.parent()
					;

					data.text
						.insertAfter(elem)
						.bind('mousedown.placeholder', function(){
							changePlaceholderVisibility(this, false, false, data, 'focus' );
							elem.focus();
							return false;
						})
					;
					
					
	
					$.each(['Left', 'Top'], function(i, side){
						var size = (parseInt($.curCSS(elem, 'padding'+ side), 10) || 0) + Math.max((parseInt($.curCSS(elem, 'margin'+ side), 10) || 0), 0) + (parseInt($.curCSS(elem, 'border'+ side +'Width'), 10) || 0);
						data.text.css('padding'+ side, size);
					});
					var lineHeight 	= $.curCSS(elem, 'lineHeight'),
						dims 		= {
							width: $(elem).getwidth(),
							height: $(elem).getheight()
						},
						cssFloat 		= $.curCSS(elem, 'float')
					;
					if(data.text.css('lineHeight') !== lineHeight){
						data.text.css('lineHeight', lineHeight);
					}
					if(dims.width && dims.height){
						data.text.css(dims);
					}
					if(cssFloat !== 'none'){
						data.box.addClass('placeholder-box-'+cssFloat);
					}
					
					return data;
				},
				update: function(elem, val){
					if(!allowedPlaceholder[$.attr(elem, 'type')] && !$.nodeName(elem, 'textarea')){return;}
					if($.nodeName(elem, 'input')){
						val = val.replace(delReg, '');
					}
					var data = pHolder.create(elem);
					elem.setAttribute('placeholder', val);
					data.text.text(val);
					changePlaceholderVisibility(elem, false, val, data);
				}
			};
		})()
	;
	
	
	$.webshims.attr('placeholder', {
		elementNames: ['input', 'textarea'],
		setter: function(elem, val){
			pHolder.update(elem, val);
		},
		getter: function(elem){
			return elem.getAttribute('placeholder') || '';
		}
	});
		
	var value = {
		elementNames: ['input', 'textarea'],
		setter: function(elem, value, oldFn){
			var placeholder = elem.getAttribute('placeholder');
			if(placeholder && 'value' in elem){
				changePlaceholderVisibility(elem, value, placeholder);
			}
			oldFn();
		},
		getter: true
	};
	
	$.webshims.attr('value', value);
	
	var oldVal = $.fn.val;
	$.fn.val = function(val){
		if(val !== undefined){
			this.each(function(){
				if( this.nodeType === 1 ){
					value.setter(this, val, $.noop);
				}
			});
		}
		return oldVal.apply(this, arguments);
	};
			
	$.webshims.addReady(function(context){
		$('input[placeholder], textarea[placeholder]', context).attr('placeholder', function(i, holder){
			return holder;
		});
	});
})(jQuery);

/* fix chrome 5/6 and safari 5 implemenation + add some usefull custom invalid event called firstinvalid */
jQuery.webshims.ready('es5', function($){
	
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
	
	$.webshims.triggerInlineForm = (function(){
		var stringify = function(id){
			if(typeof id != 'string' || id.indexOf('-') !== -1 || id.indexOf('.') !== -1 || id.indexOf('"') !== -1){return '';}
			return 'var '+ id +' = this.form["'+ id +'"];';
		};
		return function(elem, event){
			var attr = elem['on'+event] || elem.getAttribute('on'+event) || '';
			event = $.Event({
				type: event,
				target: elem[0],
				currentTarget: elem[0]
			});
			if(attr && typeof attr == 'string' && elem.form && elem.form.elements){
				var scope = '';
				$(elem.form.elements).each(function(){
					var name = this.name;
					var id = this.id;
					if(!id && !name){return;}
					if(name){
						scope += stringify(name);
					}
					if(id && id !== name){
						scope += stringify(id);
					}
				});
				(function(){eval( scope + attr );}).call(elem, event);
			}
			$(elem).trigger(event);
		};
	})();
	
	/* some extra validation UI */
	$.webshims.validityAlert = (function(){
		
		var api = {
			hideDelay: 5000,
			showFor: function(elem, message, hideOnBlur){
				elem = $(elem);
				var visual = (elem.data('inputUIReplace') || {visual: elem}).visual;
				createAlert();
				api.clear();
				alert.attr('for', visual.attr('id'));
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
					focusElem.focus();
					$(document).bind('focusout.validityalert', boundHide);
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
				$(document).unbind('focusout.validityalert');
				alert.stop().removeAttr('for');
			},
			alert: $('<label class="validity-alert" role="alert"><span class="va-box" /></label>').css({position: 'absolute', display: 'none'})
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
	$.webshims.validityMessages['en'] = $.webshims.validityMessages['en'] || $.webshims.validityMessages['en-US'] || {
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
	
	$.webshims.validityMessages['en-US'] = $.webshims.validityMessages['en-US'] || $.webshims.validityMessages['en'];
	$.webshims.validityMessages[''] = $.webshims.validityMessages[''] || $.webshims.validityMessages['en'];
	
	$.webshims.validityMessages['de'] = $.webshims.validityMessages['de'] || {
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
			stopSubmitTimer,
			form,
			invalidTriggeredBySubmit,
			doubled
		;
		
		//ToDo: This break formnovalidate on submitters
		//opera/chrome fix (this will double all invalid events, we have to stop them!)
		//opera throws a submit-event and then the invalid events,
		//chrome7 has disabled invalid events, this brings them back
		if($.support.validity === true && window.addEventListener && !window.noHTMLExtFixes){
			var formnovalidate = {
				timer: undefined,
				prevented: false
			};
			window.addEventListener('submit', function(e){
				if(!formnovalidate.prevented && e.target.checkValidity && $.attr(e.target, 'novalidate') === undefined && !e.target.checkValidity()){
					invalidTriggeredBySubmit = true;
				}
			}, true);
			var preventValidityTest = function(e){
				if($.attr(e.target, 'formnovalidate') === undefined){return;}
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
		$(document).bind('invalid', function(e){
			if(!firstEvent){
				//webkitfix 
				//chrome 6/safari5.0 submits an invalid form, if you prevent all invalid events
				//this also prevents opera from throwing a submit event if form isn't valid
				form = e.target.form;
				if ($.support.validity === true && form && !window.noHTMLExtFixes){
					var submitEvents = $(form)
						.bind('submit.preventInvalidSubmit', function(submitEvent){
							if( $.attr(form, 'novalidate') === undefined ){
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
			//prevent doubble invalids
			if($.support.validity !== true || invalids.indexOf(e.target) == -1){
				invalids.push(e.target);
			} else if(!window.noHTMLExtFixes) {
				doubled = true;
				e.stopImmediatePropagation();
			}
			e.extraData = 'fix'; 
			clearTimeout(stopSubmitTimer);
			stopSubmitTimer = setTimeout(function(){
				var lastEvent = {type: 'lastinvalid', cancelable: false, invalidlist: $(invalids)};
				//if events aren't dubled, we have a bad implementation, if the event isn't prevented and the first invalid elemenet isn't focused we show custom bubble
				if( invalidTriggeredBySubmit && !doubled && firstEvent.target !== document.activeElement && document.activeElement && !$.data(firstEvent.target, 'maybePreventedinvalid') ){
					$.webshims.validityAlert.showFor(firstEvent.target);
				}
				//reset firstinvalid
				doubled = false;
				firstEvent = false;
				invalidTriggeredBySubmit = false;
				invalids = [];
				//remove webkit/operafix
				$(form).unbind('submit.preventInvalidSubmit');
				$(e.target).trigger(lastEvent, lastEvent);
			}, 0);
			
		});
	})();
	
	(function(){
		if($.support.validity !== true || $.support.fieldsetValidation || window.noHTMLExtFixes){
			return;
		}
		$.support.fieldsetValidation = 'shim';
		$.webshims.addMethod('checkValidity', function(error){
			if($.nodeName(this, 'fieldset')){
				var ret = true;
				$(this.elements || 'input, textarea, select', this)
					.each(function(){
						 if(this.checkValidity){
							if(!this.checkValidity()){
								ret = false;
							}
						}
					})
				;
				return ret;
			} else if(this.checkValidity){
				return this.checkValidity();
			}
		});
	})();
	
	//implements validationMessage in uncapable browser and adds unknown types/attributes in capable browsers/overrides validationMessage in capable browsers
	(function(){
		var overrideNativeMessages = ( $.support.validity === true && $.webshims.overrideValidationMessages );
		var supportRequiredSelect = true;
		var supportNumericDate = true;
		if($.support.validity === true){
			supportRequiredSelect = !!( ('required' in document.createElement('select')) || window.noHTMLExtFixes );
			supportNumericDate = !!(($('<input type="datetime-local" />')[0].type == 'datetime-local' && $('<input type="range" />')[0].type == 'range') );
		}
		var overrideValidity = (!supportRequiredSelect || !supportNumericDate || overrideNativeMessages);
		var typeModels = $.webshims.inputTypes;
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
				$(document.getElementsByName( elem.name )).each(function(){
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
		
		select = null;
		
		var currentValidationMessage =  $.webshims.validityMessages[''];
		$(document).bind('htmlExtLangChange', function(){
			$.webshims.activeLang($.webshims.validityMessages, 'validation-base', function(langObj){
				currentValidationMessage = langObj;
			});
		});
		
		$.webshims.createValidationMessage = function(elem, name){
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
		$.each(($.support.validationMessage) ? ['customValidationMessage'] : ['customValidationMessage', 'validationMessage'], function(i, fn){
			$.webshims.attr(fn, {
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
						message = $.webshims.createValidationMessage(elem, name);
						if(message){
							return false;
						}
					});
					
					return message || '';
				}
			});
		});
		$.support.validationMessage = $.support.validationMessage || 'shim';
		
		
		$.webshims.addMethod('setCustomValidity', function(error){
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
		
		if($.support.validity === true){
			$.webshims.addInputType = function(type, obj){
				typeModels[type] = obj;
			};
			
			$.webshims.addValidityRule = function(type, fn){
				validityRules[type] = fn;
			};
			
			$.webshims.addValidityRule('typeMismatch',function (input, val, cache, validityState){
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
			$.webshims.createBooleanAttrs('required', ['select']);
			
			$.webshims.addValidityRule('valueMissing', function(jElm, val, cache, validityState){
				
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
			$.webshims.attr('validity', {
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
							elem.setCustomValidity($.webshims.createValidationMessage(elem, rule));
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
			
			if(document.addEventListener){
				document.addEventListener('change', function(e){
					testValidity(e.target);
				}, true);
				if (!supportNumericDate) {
					document.addEventListener('input', function(e){
						testValidity(e.target);
					}, true);
				}
			}
						
			$.webshims.addReady(function(context){
				
				if(context === document){
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
	
	$.webshims.createReadyEvent('validation-base');
}, true);



(function($){
	var isImplemented;
	var implementTypes = function(){
		if(isImplemented){return;}
		isImplemented = true;
		var nan = parseInt('NaN', 10),
			typeModels = $.webshims.inputTypes,
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
		
		$.webshims.addValidityRule('stepMismatch', function(input, val, cache){
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
			$.webshims.addValidityRule(data.name, function(input, val, cache) {
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
		$.webshims.attr('valueAsNumber', {
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
		
		$.webshims.attr('valueAsDate', {
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
			$.webshims.addInputType('number', typeProtos.number);
		}
		
		if(!supportsType('range')){
			$.webshims.addInputType('range', $.extend({}, typeProtos.number, typeProtos.range));
		}
		if(!supportsType('date')){
			$.webshims.addInputType('date', typeProtos.date);
		}
		if(!supportsType('time')){
			$.webshims.addInputType('time', $.extend({}, typeProtos.date, typeProtos.time));
		}
		
		if(!supportsType('datetime-local')){
			$.webshims.addInputType('datetime-local', $.extend({}, typeProtos.date, typeProtos.time, typeProtos['datetime-local']));
		}
		
		//implement set/arrow controls
		(function(){
			var options = $.webshims.modules['number-date-type'].options;
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
					cache.valueAsNumber = Math.round( ( cache.valueAsNumber - ((cache.valueAsNumber - (cache.minAsnumber || 0)) % cache.step)) * 1e7) / 1e7;
				}
				ret = cache.valueAsNumber + (delta * upDown);
				//using NUMBER.MIN/MAX is really stupid | ToDo: either use disabled state or make this more usable
				if(!isNaN(cache.minAsNumber) && ret < cache.minAsNumber){
					ret = (cache.valueAsNumber * upDown  < cache.minAsNumber) ? cache.minAsNumber : isNaN(cache.maxAsNumber) ? Number.MAX_VALUE : cache.maxAsNumber;
				} else if(!isNaN(cache.maxAsNumber) && ret > cache.maxAsNumber){
					ret = (cache.valueAsNumber * upDown > cache.maxAsNumber) ? cache.maxAsNumber : isNaN(cache.minAsNumber) ? Number.MIN_VALUE : cache.minAsNumber;
				}
				return ret;
			};
			
			$.webshims.modules['number-date-type'].getNextStep = getNextStep;
			
			var doSteps = function(input, type, control){
				if(input.disabled || input.readOnly || $(control).hasClass('step-controls')){return;}
				$.attr(input, 'value',  typeModels[type].numberToString(getNextStep(input, ($(control).hasClass('step-up')) ? 1 : -1, {type: type})));
				$(input).unbind('blur.stepeventshim').trigger('input');
				//IE workaround: ToDo improve usability of workaround
				if( document.activeElement ){
					if(document.activeElement !== input){
						try {input.focus();} catch(e){}
					}
					setTimeout(function(){
						if(document.activeElement !== input){
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
				$.webshims.attr('disabled', disabledReadonly);
				$.webshims.attr('readonly', disabledReadonly);
				
			}
			
			$.webshims.addReady(function(context){
				
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
									otherSide: 'left'
								}
						;
						var controls = $('<span class="step-controls"><span class="step-up" /><span class="step-down" tabindex="-1" /></span>')	
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
						;
						
						if(options.calculateWidth){
							var width = $(this).width() || parseInt($(this).css('width'), 10);
							if(!width){return;}
							var margin = (parseInt($(this).css('margin'+dir.side), 10) || 0) + (parseInt(controls.css('margin'+dir.side), 10) || 0);
							$(this).css('width', width - controls.outerWidth(true));
							if(margin){
								controls.css('margin'+dir.side, margin);
							}
						}
					});
				}
			});
		})();
		// add support for new input-types
		$.webshims.attr('type', {
			elementNames: ['input'],
			getter: function(elem, fn){
				var type = getType(elem);
				return ($.webshims.inputTypes[type]) ? type : elem.type || elem.getAttribute('type');
			},
			//don't change setter
			setter: true
		});
		
		$.webshims.createReadyEvent('number-date-type');
	};
	
	if($.support.validity === true){
		$.webshims.ready('validation-base', implementTypes, true);
	} else {
		$.webshims.ready('validity', implementTypes, true);
	}
	
})(jQuery);
(function($){
	$.support.inputUI = 'shim';
		
	var options = $.webshims.modules.inputUI.options;
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
		if($.support.validity === true){
			orig.bind('firstinvalid', function(e){
				setTimeout(function(){
					if(!$.data(e.target, 'maybePreventedinvalid')){
						$.webshims.validityAlert.showFor(e.target);
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
			curLabelID =  $.webshims.getID(attr.label)
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
		
		$.webshims.triggerDomUpdate(date);
		$('input.input-datetime-local-date', date)
			.datepicker($.extend({}, options.date))
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
		
		$.each(['disabled', 'min', 'max', 'value'], function(i, name){
			elem.attr(name, function(i, value){return value || '';});
		});
	};
	
	replaceInputUI['datetime-local'].attrs = {
		disabled: function(orig, shim, value){
			$('input.input-datetime-local-date', shim).datepicker('option', 'disabled', !!value);
			$('input.input-datetime-local-time', shim).attr('disabled', !!value);
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
		data = date
			.datepicker($.extend({}, options.date))
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
						$.webshims.triggerInlineForm(elem[0], 'input');
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
		$.webshims.attr(attr, {
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
				$.webshims.activeLang($.datepicker.regional, 'inputUI', changeDefaults);
			})
			.unbind('jquery-uiReady.langchange input-widgetsReady.langchange')
		;
	});
	$.webshims.ready('number-date-type', function(){
		$.webshims.addReady(function(context){
			$(document).bind('jquery-uiReady.initinputui input-widgetsReady.initinputui', function(){
				if(!$.datepicker && !$.fn.slider){return;}
				replaceInputUI(context);
				if($.datepicker && $.fn.slider){
					$(document).unbind('jquery-uiReady.initinputui input-widgetsReady.initinputui');
				}
			});
		});
		$.webshims.createReadyEvent('inputUI');
	}, true);
	
})(jQuery);

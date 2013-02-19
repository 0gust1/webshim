jQuery.webshims.register('form-native-extend', function($, webshims, window, doc, undefined, options){
	"use strict";
	var Modernizr = window.Modernizr;
	var modernizrInputTypes = Modernizr.inputtypes;
	if(!Modernizr.formvalidation || webshims.bugs.bustedValidity){return;}
	var typeModels = webshims.inputTypes;
	var validityRules = {};
	
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
	
	var overrideNativeMessages = options.overrideMessages;	
	
	var overrideValidity = (!modernizrInputTypes.number || !modernizrInputTypes.time || !modernizrInputTypes.range || overrideNativeMessages);
	var validityProps = ['customError','typeMismatch','rangeUnderflow','rangeOverflow','stepMismatch','tooLong','patternMismatch','valueMissing','valid'];
	
	var validityChanger = (overrideNativeMessages)? ['value', 'checked'] : ['value'];
	var validityElements = [];
	var testValidity = function(elem, init){
		if(!elem){return;}
		var type = (elem.getAttribute && elem.getAttribute('type') || elem.type || '').toLowerCase();
		
		if(!overrideNativeMessages && !typeModels[type]){
			return;
		}
		
		if(overrideNativeMessages && !init && type == 'radio' && elem.name){
			$(doc.getElementsByName( elem.name )).each(function(){
				$.prop(this, 'validity');
			});
		} else {
			$.prop(elem, 'validity');
		}
	};
	
	var oldSetCustomValidity = {};
	['input', 'textarea', 'select'].forEach(function(name){
		var desc = webshims.defineNodeNameProperty(name, 'setCustomValidity', {
			prop: {
				value: function(error){
					error = error+'';
					var elem = (name == 'input') ? $(this).getNativeElement()[0] : this;
					desc.prop._supvalue.call(elem, error);
					
					if(webshims.bugs.validationMessage){
						webshims.data(elem, 'customvalidationMessage', error);
					}
					if(overrideValidity){
						webshims.data(elem, 'hasCustomError', !!(error));
						testValidity(elem);
					}
				}
			}
		});
		oldSetCustomValidity[name] = desc.prop._supvalue;
	});
		
	
	if(overrideValidity || overrideNativeMessages){
		validityChanger.push('min');
		validityChanger.push('max');
		validityChanger.push('step');
		validityElements.push('input');
	}
	if(overrideNativeMessages){
		validityChanger.push('required');
		validityChanger.push('pattern');
		validityElements.push('select');
		validityElements.push('textarea');
	}
	
	if(overrideValidity){
		var stopValidity;
		validityElements.forEach(function(nodeName){
			
			var oldDesc = webshims.defineNodeNameProperty(nodeName, 'validity', {
				prop: {
					get: function(){
						if(stopValidity){return;}
						var elem = (nodeName == 'input') ? $(this).getNativeElement()[0] : this;
						
						var validity = oldDesc.prop._supget.call(elem);
						
						if(!validity){
							return validity;
						}
						var validityState = {};
						validityProps.forEach(function(prop){
							validityState[prop] = validity[prop];
						});
						
						if( !$.prop(elem, 'willValidate') ){
							return validityState;
						}
						stopValidity = true;
						var jElm 			= $(elem),
							cache 			= {type: (elem.getAttribute && elem.getAttribute('type') || '').toLowerCase(), nodeName: (elem.nodeName || '').toLowerCase()},
							val				= jElm.val(),
							customError 	= !!(webshims.data(elem, 'hasCustomError')),
							setCustomMessage
						;
						stopValidity = false;
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
							if( validityState[rule] && (validityState.valid || !setCustomMessage) && (overrideNativeMessages || (typeModels[cache.type] && typeModels[cache.type].mismatch)) ) {
								oldSetCustomValidity[nodeName].call(elem, webshims.createValidationMessage(elem, rule));
								validityState.valid = false;
								setCustomMessage = true;
							}
						});
						if(validityState.valid){
							oldSetCustomValidity[nodeName].call(elem, '');
							webshims.data(elem, 'hasCustomError', false);
						} else if(overrideNativeMessages && !setCustomMessage && !customError){
							$.each(validityState, function(name, prop){
								if(name !== 'valid' && prop){
									oldSetCustomValidity[nodeName].call(elem, webshims.createValidationMessage(elem, name));
									return false;
								}
							});
						}
						return validityState;
					},
					writeable: false
					
				}
			});
		});

		validityChanger.forEach(function(prop){
			webshims.onNodeNamesPropertyModify(validityElements, prop, function(s){
				testValidity(this);
			});
		});
		
		if(doc.addEventListener){
			var inputThrottle;
			var testPassValidity = function(e){
				if(!('form' in e.target)){return;}
				var form = e.target.form;
				clearTimeout(inputThrottle);
				testValidity(e.target);
				if(form && overrideNativeMessages){
					$('input', form).each(function(){
						if(this.type == 'password'){
							testValidity(this);
						}
					});
				}
			};
			
			doc.addEventListener('change', testPassValidity, true);
			
			if(overrideNativeMessages){
				doc.addEventListener('blur', testPassValidity, true);
				doc.addEventListener('keydown', function(e){
					if(e.keyCode != 13){return;}
					testPassValidity(e);
				}, true);
			}
			
			doc.addEventListener('input', function(e){
				clearTimeout(inputThrottle);
				inputThrottle = setTimeout(function(){
					testValidity(e.target);
				}, 290);
			}, true);
		}
		
		var validityElementsSel = validityElements.join(',');	
		
		webshims.addReady(function(context, elem){
			$(validityElementsSel, context).add(elem.filter(validityElementsSel)).each(function(){
				$.prop(this, 'validity');
			});
		});
		
		
		if(overrideNativeMessages){
			webshims.ready('DOM form-message', function(){
				webshims.activeLang({
					register: 'form-core',
					callback: function(){
						$('input, select, textarea')
							.getNativeElement()
							.each(function(){
								if(webshims.data(this, 'hasCustomError')){return;}
								var elem = this;
								var validity = $.prop(elem, 'validity') || {valid: true};
								var nodeName;
								if(validity.valid){return;}
								nodeName = (elem.nodeName || '').toLowerCase();
								$.each(validity, function(name, prop){
									if(name !== 'valid' && prop){
										oldSetCustomValidity[nodeName].call(elem, webshims.createValidationMessage(elem, name));
										return false;
									}
								});
							})
						;
					}
				});
			});
		}
		
	} //end: overrideValidity
	
	webshims.defineNodeNameProperty('input', 'type', {
		prop: {
			get: function(){
				var elem = this;
				var type = (elem.getAttribute('type') || '').toLowerCase();
				return (webshims.inputTypes[type]) ? type : elem.type;
			}
		}
	});
	
	
});
jQuery.webshims.register('form-number-date-api', function($, webshims, window, document, undefined){
	"use strict";
	
	
	if(!webshims.getStep){
		webshims.getStep = function(elem, type){
			var step = $.attr(elem, 'step');
			if(step === 'any'){
				return step;
			}
			type = type || getType(elem);
			if(!typeModels[type] || !typeModels[type].step){
				return step;
			}
			step = typeProtos.number.asNumber(step);
			return ((!isNaN(step) && step > 0) ? step : typeModels[type].step) * (typeModels[type].stepScaleFactor || 1);
		};
	}
	if(!webshims.addMinMaxNumberToCache){
		webshims.addMinMaxNumberToCache = function(attr, elem, cache){
			if (!(attr+'AsNumber' in cache)) {
				cache[attr+'AsNumber'] = typeModels[cache.type].asNumber(elem.attr(attr));
				if(isNaN(cache[attr+'AsNumber']) && (attr+'Default' in typeModels[cache.type])){
					cache[attr+'AsNumber'] = typeModels[cache.type][attr+'Default'];
				}
			}
		};
	}
	
	var nan = parseInt('NaN', 10),
		doc = document,
		typeModels = webshims.inputTypes,
		isNumber = function(string){
			return (typeof string == 'number' || (string && string == string * 1));
		},
		supportsType = function(type){
			return ($('<input type="'+type+'" />').prop('type') === type);
		},
		getType = function(elem){
			return (elem.getAttribute('type') || '').toLowerCase();
		},
		isDateTimePart = function(string){
			var numStr = string * 1;
			return (string && (numStr == string || string == '0' + numStr));
		},
		addMinMaxNumberToCache = webshims.addMinMaxNumberToCache,
		addleadingZero = function(val, len){
			val = ''+val;
			len = len - val.length;
			for(var i = 0; i < len; i++){
				val = '0'+val;
			}
			return val;
		},
		EPS = 1e-7,
		typeBugs = webshims.bugs.bustedValidity
	;
	
	webshims.addValidityRule('stepMismatch', function(input, val, cache, validityState){
		if(val === ''){return false;}
		if(!('type' in cache)){
			cache.type = getType(input[0]);
		}
		
		var ret = (validityState || {}).stepMismatch || false, base;
		if(typeModels[cache.type] && typeModels[cache.type].step){
			if( !('step' in cache) ){
				cache.step = webshims.getStep(input[0], cache.type);
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
		webshims.addValidityRule(data.name, function(input, val, cache, validityState) {
			var ret = (validityState || {})[data.name] || false;
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
	
	webshims.reflectProperties(['input'], ['max', 'min', 'step']);
	
	
	//IDLs and methods, that aren't part of constrain validation, but strongly tight to it
	var valueAsNumberDescriptor = webshims.defineNodeNameProperty('input', 'valueAsNumber', {
		prop: {
			get: function(){
				var elem = this;
				var type = getType(elem);
				var ret = (typeModels[type] && typeModels[type].asNumber) ? 
					typeModels[type].asNumber($.prop(elem, 'value')) :
					(valueAsNumberDescriptor.prop._supget && valueAsNumberDescriptor.prop._supget.apply(elem, arguments));
				if(ret == null){
					ret = nan;
				}
				return ret;
			},
			set: function(val){
				var elem = this;
				var type = getType(elem);
				if(typeModels[type] && typeModels[type].numberToString){
					//is NaN a number?
					if(isNaN(val)){
						$.prop(elem, 'value', '');
						return;
					}
					var set = typeModels[type].numberToString(val);
					if(set !==  false){
						$.prop(elem, 'value', set);
					} else {
						webshims.error('INVALID_STATE_ERR: DOM Exception 11');
					}
				} else {
					valueAsNumberDescriptor.prop._supset && valueAsNumberDescriptor.prop._supset.apply(elem, arguments);
				}
			}
		}
	});
	
	var valueAsDateDescriptor = webshims.defineNodeNameProperty('input', 'valueAsDate', {
		prop: {
			get: function(){
				var elem = this;
				var type = getType(elem);
				return (typeModels[type] && typeModels[type].asDate && !typeModels[type].noAsDate) ? 
					typeModels[type].asDate($.prop(elem, 'value')) :
					valueAsDateDescriptor.prop._supget && valueAsDateDescriptor.prop._supget.call(elem) || null;
			},
			set: function(value){
				var elem = this;
				var type = getType(elem);
				if(typeModels[type] && typeModels[type].dateToString && !typeModels[type].noAsDate){
					
					if(value === null){
						$.prop(elem, 'value', '');
						return '';
					}
					var set = typeModels[type].dateToString(value);
					if(set !== false){
						$.prop(elem, 'value', set);
						return set;
					} else {
						webshims.error('INVALID_STATE_ERR: DOM Exception 11');
					}
				} else {
					return valueAsDateDescriptor.prop._supset && valueAsDateDescriptor.prop._supset.apply(elem, arguments) || null;
				}
			}
		}
	});
	
	$.each({stepUp: 1, stepDown: -1}, function(name, stepFactor){
		var stepDescriptor = webshims.defineNodeNameProperty('input', name, {
			prop: {
				value: function(factor){
					var step, val, dateVal, valModStep, alignValue, cache;
					var type = getType(this);
					if(typeModels[type] && typeModels[type].asNumber){
						cache = {type: type};
						if(!factor){
							factor = 1;
							webshims.info("you should always use a factor for stepUp/stepDown");
						}
						factor *= stepFactor;
						
						val = $.prop(this, 'valueAsNumber');
						
						if(isNaN(val)){
							webshims.info("valueAsNumber is NaN can't apply stepUp/stepDown ");
							throw('invalid state error');
						}
						
						step = webshims.getStep(this, type);
						
						if(step == 'any'){
							webshims.info("step is 'any' can't apply stepUp/stepDown");
							throw('invalid state error');
						}
						
						webshims.addMinMaxNumberToCache('min', $(this), cache);
						webshims.addMinMaxNumberToCache('max', $(this), cache);
						
						step *= factor;
						
						val = val + step;
						valModStep = (val - (cache.minAsNumber || 0)) % step;
						
						if ( valModStep && (Math.abs(valModStep) > EPS) ) {
							alignValue = val - valModStep;
							alignValue += ( valModStep > 0 ) ? step : ( -step );
							val = alignValue.toFixed(5) * 1;
						}
						
						if( (!isNaN(cache.maxAsNumber) && val > cache.maxAsNumber) || (!isNaN(cache.minAsNumber) && val < cache.minAsNumber) ){
							webshims.info("max/min overflow can't apply stepUp/stepDown");
							throw('invalid state error');
						}
						if(dateVal){
							$.prop(this, 'valueAsDate', dateVal);
						} else {
							$.prop(this, 'valueAsNumber', val);
						}
					} else if(stepDescriptor.prop && stepDescriptor.prop.value){
						return stepDescriptor.prop.value.apply(this, arguments);
					} else {
						webshims.info("no step method for type: "+ type);
						throw('invalid state error');
					}
				}
			}
		});
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
				var i;
				var valA = val.split(/\u002D/);
				if(valA.length !== 3){return true;}
				var ret = false;
				
				
				if(valA[0].length !== 4 || valA[1].length != 2 || valA[1] > 12 || valA[2].length != 2 || valA[2] > 33){
					ret = true;
				} else {
					for(i = 0; i < 3; i++){
						if(!isDateTimePart(valA[0])){
							ret = true;
							break;
						}
					}
				}
				
				return ret || (val !== this.dateToString( this.asDate(val, true) ) );
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
		month: {
			mismatch: function(val){
				return typeProtos.date.mismatch(val+'-01');
			},
			step: 1,
			stepScaleFactor:  false,
			//stepBase: 0, 0 = default
			asDate: function(val){
				return new Date(typeProtos.date.asNumber(val+'-01'));
			},
			asNumber: function(val){
				//1970-01
				var ret = nan;
				if(val && !this.mismatch(val)){
					val = val.split(/\u002D/);
					val[0] = (val[0] * 1) - 1970;
					val[1] = (val[1] * 1) - 1;
					ret = (val[0] * 12) + val[1];
				}
				return ret;
			},
			numberToString: function(num){
				var mod;
				var ret = false;
				if(isNumber(num)){
					mod = (num % 12);
					num = ((num - mod) / 12) + 1970;
					mod += 1;
					if(mod < 1){
						num -= 1;
						mod += 12;
					}
					ret = addleadingZero(num, 4)+'-'+addleadingZero(mod, 2);
					
				}
				
				return ret;
			},
			dateToString: function(date){
				if(date && date.getUTCHours){
					var str = typeProtos.date.dateToString(date);
					return (str.split && (str = str.split(/\u002D/))) ? str[0]+'-'+str[1] : false;
				} else {
					return false;
				}
			}
		}
//		,'datetime-local': {
//			mismatch: function(val, _getParsed){
//				if(!val || !val.split || (val+'special').split(/\u0054/).length !== 2){return true;}
//				val = val.split(/\u0054/);
//				return ( typeProtos.date.mismatch(val[0]) || typeProtos.time.mismatch(val[1], _getParsed) );
//			},
//			noAsDate: true,
//			asDate: function(val){
//				val = new Date(this.asNumber(val));
//				
//				return (isNaN(val)) ? null : val;
//			},
//			asNumber: function(val){
//				var ret = nan;
//				var time = this.mismatch(val, true);
//				if(time !== true){
//					val = val.split(/\u0054/)[0].split(/\u002D/);
//					
//					ret = Date.UTC(val[0], val[1] - 1, val[2], time[0][0], time[0][1], time[0][2] || 0);
//					if(time[1]){
//						ret += time[1];
//					}
//				}
//				return ret;
//			},
//			dateToString: function(date, _getParsed){
//				return typeProtos.date.dateToString(date) +'T'+ typeProtos.time.dateToString(date, _getParsed);
//			}
//		}
	};
	
	if(typeBugs || !supportsType('range') || !supportsType('time')){
		typeProtos.range = $.extend({}, typeProtos.number, typeProtos.range);
		typeProtos.time = $.extend({}, typeProtos.date, typeProtos.time);
		typeProtos.month = $.extend({}, typeProtos.date, typeProtos.month);
//		typeProtos['datetime-local'] = $.extend({}, typeProtos.date, typeProtos.time, typeProtos['datetime-local']);
	}
	
	//'datetime-local'
	['number', 'month', 'range', 'date', 'time'].forEach(function(type){
		if(typeBugs || !supportsType(type)){
			webshims.addInputType(type, typeProtos[type]);
		}
	});

	if($('<input />').prop('labels') == null){
		webshims.defineNodeNamesProperty('button, input, keygen, meter, output, progress, select, textarea', 'labels', {
			prop: {
				get: function(){
					if(this.type == 'hidden'){return null;}
					var id = this.id;
					var labels = $(this)
						.closest('label')
						.filter(function(){
							var hFor = (this.attributes['for'] || {});
							return (!hFor.specified || hFor.value == id);
						})
					;
					
					if(id) {
						labels = labels.add('label[for="'+ id +'"]');
					}
					return labels.get();
				},
				writeable: false
			}
		});
	}
		
});
(function($){
	
	var id = 0;
	var isNumber = function(string){
		return (typeof string == 'number' || (string && string == string * 1));
	};
	var retDefault = function(val, def){
		if(!(typeof val == 'number' || (val && val == val * 1))){
			return def;
		}
		return val * 1;
	};
	var createOpts = ['step', 'min', 'max', 'readonly', 'title', 'disabled', 'tabindex'];
	var rangeProto = {
		_create: function(){
			var i;
			
			
			this.element.addClass('ws-range').attr({role: 'slider'}).html('<span class="ws-range-min" /><span class="ws-range-rail"><span class="ws-range-thumb" /></span>');
			this.trail = $('.ws-range-rail', this.element);
			this.range = $('.ws-range-min', this.element);
			this.thumb = $('.ws-range-thumb', this.trail);
			
			this.updateMetrics();
			
			this.orig = this.options.orig;
			
			for(i = 0; i < createOpts.length; i++){
				this[createOpts[i]](this.options[createOpts[i]]);
			}
			this.value = this._value;
			this.value(this.options.value);
			this.list(this.options.options);
			this.element.data('rangeUi', this);
			this.addBindings();
			this._init = true;
		},
		value: $.noop,
		_value: function(val, _noNormalize, animate){
			var left;
			var o = this.options;
			var oVal = val;
			var thumbStyle = {};
			var rangeStyle = {};
			if(!_noNormalize && parseFloat(val, 10) != val){
				val = o.min + ((o.max - o.min) / 2);
			}
			
			if(!_noNormalize){
				val = this.normalizeVal(val);
			}
			left =  100 * ((val - o.min) / (o.max - o.min));
			
			this.options.value = val;
			this.thumb.stop();
			this.range.stop();
			
			rangeStyle[this.dirs.width] = left+'%';
			if(this.vertical){
				left = Math.abs(left - 100);
			}
			thumbStyle[this.dirs.left] = left+'%';
			
			
			if(!animate){
				this.thumb.css(thumbStyle);
				this.range.css(rangeStyle);
			} else {
				if(typeof o.animate != 'object'){
					o.animate = {};
				}
				this.thumb.animate(thumbStyle, o.animate);
				this.range.animate(rangeStyle, o.animate);
			}
			if(this.orig && (oVal != val || (!this._init && this.orig.value != val)) ){
				this.options._change(val);
			}
			this.element.attr({
				'aria-valuenow': this.options.value,
				'aria-valuetext': this.options.options[this.options.value] || this.options.value
			});
		},
		list: function(opts){
			var o = this.options;
			var min = o.min;
			var max = o.max;
			var trail = this.trail;
			var that = this;
			o.options = opts || {};
			
			this.element.attr({'aria-valuetext': o.options[o.value] || o.value});
			$('.ws-range-ticks', trail).remove();
			
			
			$.each(o.options, function(val, label){
				if(!isNumber(val) || val < min || val > max){return;}
				var left = 100 * ((val - min) / (max - min));
				var title = o.showLabels ? ' title="'+ label +'"' : '';
				if(that.vertical){
					left = Math.abs(left - 100);
				}
				trail.append('<span class="ws-range-ticks"'+ title +' style="'+(that.dirs.left)+': '+left+'%;" />');
			});
		},
		readonly: function(val){
			val = !!val;
			this.options.readonly = val;
			this.element.attr('aria-readonly', ''+val);
		},
		disabled: function(val){
			val = !!val;
			this.options.disabled = val;
			if(val){
				this.element.attr({tabindex: -1, 'aria-disabled': 'true'});
			} else {
				this.element.attr({tabindex: this.options.tabindex, 'aria-disabled': 'false'});
			}
		},
		tabindex: function(val){
			this.options.tabindex = val;
			if(!this.options.disabled){
				this.element.attr({tabindex: val});
			}
		},
		title: function(val){
			this.element.prop('title', val);
		},
		min: function(val){
			this.options.min = retDefault(val, 0);
			this.value(this.options.value, true);
		},
		max: function(val){
			this.options.max = retDefault(val, 100);
			this.value(this.options.value, true);
		},
		step: function(val){
			this.options.step = val == 'any' ? 'any' : retDefault(val, 1);
			this.value(this.options.value);
		},
		
		normalizeVal: function(val){
			var valModStep, alignValue, step;
			var o = this.options;
			
			if(val <= o.min){
				val = o.min;
			} else if(val >= o.max) {
				val = o.max;
			} else if(o.step != 'any'){
				step = o.step;
				valModStep = (val - o.min) % step;
				alignValue = val - valModStep;
				
				if ( Math.abs(valModStep) * 2 >= step ) {
					alignValue += ( valModStep > 0 ) ? step : ( -step );
				}
				val = alignValue.toFixed(5) * 1;
			}
			return val;
		},
		doStep: function(factor){
			var step = retDefault(this.options.step, 1);
			if(this.options.step == 'any'){
				step = Math.min(step, (this.options.max - this.options.min) / 10);
			}
			this.value( this.options.value + (step * factor) );
			
		},
		 
		getStepedValueFromPos: function(pos){
			var val, valModStep, alignValue, step;
			
			if(pos <= 0){
				val = this.options[this.dirs.min];
			} else if(pos > 100) {
				val = this.options[this.dirs.max];
			} else {
				if(this.vertical){
					pos = Math.abs(pos - 100)
				}
				val = ((this.options.max - this.options.min) * (pos / 100)) + this.options.min;
				step = this.options.step;
				if(step != 'any'){
					valModStep = (val - this.options.min) % step;
					alignValue = val - valModStep;
					
					if ( Math.abs(valModStep) * 2 >= step ) {
						alignValue += ( valModStep > 0 ) ? step : ( -step );
					}
					val = ((alignValue).toFixed(5)) * 1;
					
				}
			}
			
			return val;
		},
		addBindings: function(){
			var leftOffset, widgetUnits, hasFocus;
			var that = this;
			var o = this.options;
			
			var eventTimer = (function(){
				var events = {};
				return {
					init: function(name, curVal, fn){
						if(!events[name]){
							events[name] = {fn: fn};
							if(that.orig){
								$(that.orig).on(name, function(){
									events[name].val = $.prop(that.orig, 'value');
								});
							}
							
						}
						events[name].val = curVal;
					},
					call: function(name, val){
						if(events[name].val != val){
							clearTimeout(events[name].timer);
							events[name].val = val;
							events[name].timer = setTimeout(function(){
								events[name].fn(val, that);
							}, 0);
						}
					}
				};
			})();
			
			var setValueFromPos = function(e, animate){
				if(this.vertical){
					left = Math.abs(left - 100)
				}
				var val = that.getStepedValueFromPos((e[that.dirs.mouse] - leftOffset) * widgetUnits);
				if(val != o.value){
					
					that.value(val, false, animate);
					eventTimer.call('input', val);
				}
			};
			
			var remove = function(e){
				if(e && e.type == 'mouseup'){
					eventTimer.call('input', o.value);
					eventTimer.call('change', o.value);
				}
				that.element.removeClass('ws-active');
				$(document).off('mousemove', setValueFromPos).off('mouseup', remove);
			};
			var add = function(e){
				e.preventDefault();
				$(document).off('mousemove', setValueFromPos).off('mouseup', remove);
				if(!o.readonly && !o.disabled){
					leftOffset = that.element.focus().addClass('ws-active').offset();
					widgetUnits = that.element[that.dirs.width]();
					if(!widgetUnits || !leftOffset){return;}
					leftOffset = leftOffset[that.dirs.pos];
					widgetUnits = 100 / (widgetUnits  - ((that.thumb[that.dirs.outerWidth]() || 2) / 2));
					setValueFromPos(e, that.options.animate);
					$(document)
						.on({
							mouseup: remove,
							mousemove: setValueFromPos
						})
					;
					e.stopPropagation();
				}
			};
			
			eventTimer.init('input', o.value, this.options.input);
			eventTimer.init('change', o.value, this.options.change);
			
			this.element.on({
				mousedown: add,
				focus: function(e){
					if(!o.disabled){
						eventTimer.init('input', o.value);
						eventTimer.init('change', o.value);
						that.element.addClass('ws-focus');
					}
					hasFocus = true;
				},
				blur: function(e){
					that.element.removeClass('ws-focus ws-active');
					hasFocus = false;
					eventTimer.init('input', o.value);
					eventTimer.call('change', o.value);
				},
				keyup: function(){
					that.element.removeClass('ws-active');
					eventTimer.call('input', o.value);
					eventTimer.call('change', o.value);
				},
				mousewheel: function(e, delta){
					if(delta && hasFocus && !o.readonly && !o.disabled){
						that.doStep(delta);
						e.preventDefault();
						eventTimer.call('input', o.value);
					}
				},
				keypress: function(e){
					var step = true;
					var code = e.keyCode;
					if(!o.readonly && !o.disabled){
						if (code == 39 || code == 38) {
							that.doStep(1);
						} else if (code == 37 || code == 40) {
							that.doStep(-1);
						} else if (code == 33) {
							that.doStep(10);
						} else if (code == 34) {
							that.doStep(-10);
						} else if (code == 36) {
							that.value(that.options.max);
						} else if (code == 35) {
							that.value(that.options.min);
						} else {
							step = false;
						}
						if (step) {
							that.element.addClass('ws-active');
							eventTimer.call('input', o.value);
							e.preventDefault();
						}
					}
				}
			});
			this.thumb.on({
				mousedown: add
			});
		},
		updateMetrics: function(){
			this.vertical = (this.element.innerHeight() - this.element.innerWidth() > 10);
			console.log('height: '+ this.element.innerHeight(), 'width: '+ this.element.innerWidth())
			this.dirs = this.vertical ? 
				{mouse: 'pageY', pos: 'top', min: 'max', max: 'min', left: 'top', width: 'height', outerWidth: 'outerHeight'} :
				{mouse: 'pageX', pos: 'left', min: 'min', max: 'min', left: 'left', width: 'width', outerWidth: 'outerWidth'}
			;
			this.element
				[this.vertical ? 'addClass' : 'removeClass']('vertical-range')
				[this.vertical ? 'addClass' : 'removeClass']('horizontal-range')
			;
		}
	};
	
	$.fn.rangeUI = function(opts){
		opts = $.extend({readonly: false, disabled: false, tabindex: 0, min: 0, step: 1, max: 100, value: 50, input: $.noop, change: $.noop, _change: $.noop, showLabels: true}, opts);
		return this.each(function(){
			$.webshims.objectCreate(rangeProto, {
				element: {
					value: $(this)
				}
			}, opts);
		});
	};
	jQuery.webshims.isReady('range-ui', true);
})(jQuery);
jQuery.webshims.register('form-number-date-ui', function($, webshims, window, document, undefined, options){
	"use strict";
	var curCfg;
	
	
	var addZero = function(val){
		if(!val){return "";}
		val = val+'';
		return val.length == 1 ? '0'+val : val;
	};
	
		
	(function(){
		
		var formcfg = $.webshims.formcfg;
		formcfg.de = {
			numberFormat: {
				",": ".",
				".": ","
			},
			timeSigns: ":. ",
			numberSigns: ',',
			dateSigns: '.',
			dFormat: ".",
			patterns: {
				d: "dd.mm.yy"
			},
			date: {
				close: 'schließen',
				prevText: 'zurück',
				nextText: 'Vor',
				currentText: 'heute',
				monthNames: ['Januar','Februar','März','April','Mai','Juni',
				'Juli','August','September','Oktober','November','Dezember'],
				monthNamesShort: ['Jan','Feb','Mär','Apr','Mai','Jun',
				'Jul','Aug','Sep','Okt','Nov','Dez'],
				dayNames: ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],
				dayNamesShort: ['So','Mo','Di','Mi','Do','Fr','Sa'],
				dayNamesMin: ['So','Mo','Di','Mi','Do','Fr','Sa'],
				weekHeader: 'KW',
				firstDay: 1,
				isRTL: false,
				showMonthAfterYear: false,
				yearSuffix: ''
			}
		};
		
		formcfg.en = {
			numberFormat: {
				".": ".",
				",": ","
			},
			numberSigns: '.',
			dateSigns: '/',
			timeSigns: ":. ",
			dFormat: "/",
			patterns: {
				d: "mm/dd/yy"
			},
			date: {
				"closeText": "Done",
				"prevText": "Prev",
				"nextText": "Next",
				"currentText": "Today",
				"monthNames": ["January","February","March","April","May","June","July","August","September","October","November","December"],
				"monthNamesShort": ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
				"dayNames": ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
				"dayNamesShort": ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
				"dayNamesMin": ["Su","Mo","Tu","We","Th","Fr","Sa"],
				"weekHeader": "Wk",
				"firstDay": 0,
				"isRTL": false,
				"showMonthAfterYear": false,
				"yearSuffix": ""
			}
		};
		
		formcfg['en-US'] = formcfg['en-US'] || formcfg['en'];
		formcfg[''] = formcfg[''] || formcfg['en-US'];
		curCfg = formcfg[''];
		
		var createMonthKeys = function(langCfg){
			if(!langCfg.date.monthkeys){
				var create = function(i, name){
					var strNum;
					var num = i + 1;
					strNum = (num < 10) ? '0'+num : ''+num;
					
					langCfg.date.monthkeys[num] = strNum;
					langCfg.date.monthkeys[name] = strNum;
				};
				langCfg.date.monthkeys = {};
				$.each(langCfg.date.monthNames, create);
				$.each(langCfg.date.monthNamesShort, create);
			}
		};
		
		createMonthKeys(curCfg);
		$.webshims.ready('dom-extend', function(){
			$.webshims.activeLang({
				register: 'form-core', 
				callback: function(){
					$.each(arguments, function(i, val){
						if(formcfg[val]){
							curCfg = formcfg[val];
							createMonthKeys(curCfg);
							$(document).triggerHandler('wslocalechange');
							return false;
						}
					});
				}
			});
		});
	})();
		
	
	
	(function(){
		
		
		var mousePress = function(e){
			$(this)[e.type == 'mousepressstart' ? 'addClass' : 'removeClass']('mousepress-ui');
		};
		
		var retDefault = function(val, def){
			if(!(typeof val == 'number' || (val && val == val * 1))){
				return def;
			}
			return val * 1;
		};
		
		var createOpts = ['step', 'min', 'max', 'readonly', 'title', 'disabled', 'tabindex', 'placeholder', 'value'];
		
		var createFormat = function(name){
			if(!curCfg.patterns[name+'Obj']){
				var obj = {};
				$.each(curCfg.patterns[name].split(curCfg[name+'Format']), function(i, name){
					obj[name] = i;
				});
				curCfg.patterns[name+'Obj'] = obj;
			}
		};
		
		var formatVal = {
			number: function(val){
				return (val+'').replace(/\,/g, '').replace(/\./, curCfg.numberFormat['.']);
			},
			time: function(val){
				return val;
			},
			month: function(val, options){
				var names;
				var p = val.split('-');
				if(p[0] && p[1]){
					names = curCfg.date[options.monthNames] || curCfg.date.monthNames;
					p[1] = names[(p[1] * 1) - 1];
					if(p[1]){
						val = curCfg.date.showMonthAfterYear ? p.join(' ') : p[1]+' '+p[0];
					}
				}
				return val;
			},
			date: function(val){
				var p = (val+'').split('-');
				if(p[2] && p[1] && p[0]){
					val = curCfg.patterns.d.replace('yy', p[0] || '');
					val = val.replace('mm', p[1] || '');
					val = val.replace('dd', p[2] || '');
				}
				
				return val;
			}
		};
		
		var parseVal = {
			number: function(val){
				return (val+'').replace(curCfg.numberFormat[','], '').replace(curCfg.numberFormat['.'], '.');
			},
			time: function(val){
				return val;
			},
			month: function(val){
				var p = val.trim().split(/[\s-\/\\]+/);
				if(p.length == 2){
					p[0] = curCfg.date.monthkeys[p[0]] || p[0];
					p[1] = curCfg.date.monthkeys[p[1]] || p[1];
					if(p[1].length == 2){
						val = p[0]+'-'+p[1];
					} else if(p[0].length == 2){
						val = p[1]+'-'+p[0];
					}
				}
				return val;
			},
			date: function(val){
				createFormat('d');
				var i;
				var obj = curCfg.patterns.dObj;
				val = val.split(curCfg.dFormat);
				return val.length == 3 ? ([addZero(val[obj.yy]), addZero(val[obj.mm]), addZero(val[obj.dd])]).join('-') : '';
			}
		};
		
		var steps = {
			number: {
				step: 1
			},
			time: {
				step: 60
			},
			month: {
				step: 1,
				start: new Date()
			},
			date: {
				step: 1,
				start: new Date()
			}
		};
		
		var createAsNumber = (function(){
			var types = {};
			return function(type){
				var input;
				if(!types[type]){
					input = $('<input type="'+type+'" />');
					types[type] = function(val){
						var type = (typeof val == 'object') ? 'valueAsDate' : 'value';
						return input.prop(type, val).prop('valueAsNumber');
					};
				}
				return types[type];
			};
		})();
		
		steps.range = steps.number;
		
		
		var spinBtnProto = {
			_create: function(){
				var i;
				this.type = this.options.type;
				this.orig = this.options.orig;
				this.elemHelper = $('<input type="'+ this.type+'" />');
				this.asNumber = createAsNumber(this.type);
				this.buttonWrapper = $('<span class="input-buttons '+this.type+'-input-buttons"><span unselectable="on" class="step-controls"><span class="step-up"></span><span class="step-down"></span></span></span>')
					.insertAfter(this.element)
				;
				
				if(typeof steps[this.type].start == 'object'){
					steps[this.type].start = this.asNumber(steps[this.type].start);
				}
				
				for(i = 0; i < createOpts.length; i++){
					this[createOpts[i]](this.options[createOpts[i]]);
				}
				var elem = this.element.attr('autocomplete', 'off').data('wsspinner', this);
				this.addBindings();
//				if($.browser.mozilla){
//					$(window).on('unload', function(){
//						elem.remove();
//					});
//				}
				this._init = true;
			},
			parseValue: function(val){
				return parseVal[this.type](val);
			},
			formatValue: function(val){
				return formatVal[this.type](val, this.options);
			},
			placeholder: function(val){
				var hintValue;
				this.options.placeholder = val;
				if(this.type == 'date'){
					hintValue = (val || '').split('-');
					if(hintValue.length == 3){
						this.options.placeholder = curCfg.patterns.d.replace('yy', hintValue[0]).replace('mm', hintValue[1]).replace('dd', hintValue[2]);
					}
				}
				this.element.prop('placeholder', this.options.placeholder);
			},
			addZero: addZero,
			_setStartInRange: function(){
				var start = steps[this.type].start || 0;
				if(!isNaN(this.minAsNumber) && start < this.minAsNumber){
					start = this.minAsNumber;
				} else if(!isNaN(this.maxAsNumber) && start > this.maxAsNumber){
					start = this.maxAsNumber;
				}
				this.elemHelper.prop('valueAsNumber', start).prop('value');
				this.options.defValue = this.elemHelper.prop('value');
			},
			value: function(val){
				this.valueAsNumber = this.asNumber(val);
				this.options.value = val;
				if(isNaN(this.valueAsNumber)){
					this._setStartInRange();
				} else {
					this.elemHelper.prop('value', val);
				}
				
				this.element.prop('value', formatVal[this.type](val, this.options));
			},
			
			list: function(opts){
				this.options.options = opts || {};
			},
			readonly: function(val){
				this.options.readonly = !!val;
				this.element.prop('readonly', this.options.readonly);
				if(this.options.readonly || this._init){
					this.buttonWrapper[this.options.readonly ? 'addClass' : 'removeClass']('ws-readonly');
				}
			},
			disabled: function(val){
				this.options.disabled = !!val;
				this.element.prop('disabled', this.options.disabled);
				if(this.options.disabled || this._init){
					this.buttonWrapper[this.options.readonly ? 'addClass' : 'removeClass']('ws-disabled');
				}
			},
			tabindex: function(val){
				this.options.tabindex = val;
				this.element.prop('tabindex', this.options.tabindex);
			},
			title: function(val){
				this.options.title = val;
				this.element.prop('tabindex', this.options.title);
			},
			
			min: function(val){
				this.elemHelper.prop('min', val);
				this.minAsNumber = this.asNumber(val);
				if(this.valueAsNumber != null && isNaN(this.valueAsNumber)){
					this._setStartInRange();
				}
			},
			max: function(val){
				this.elemHelper.prop('max', val);
				this.maxAsNumber = this.asNumber(val);
				if(this.valueAsNumber != null && isNaN(this.valueAsNumber)){
					this._setStartInRange();
				}
			},
			step: function(val){
				var defStep = steps[this.type];
				this.elemHelper.prop('step', retDefault(val, defStep.step));
			},
			
			
			addBindings: function(){
				var isFocused;
				
				var that = this;
				var o = this.options;
				
				var eventTimer = (function(){
					var events = {};
					return {
						init: function(name, curVal, fn){
							if(!events[name]){
								events[name] = {fn: fn};
								$(that.orig).on(name, function(){
									events[name].val = $.prop(that.orig, 'value');
								});
								
							}
							events[name].val = curVal;
						},
						call: function(name, val){
							if(events[name] && events[name].val != val){
								clearTimeout(events[name].timer);
								events[name].val = val;
								events[name].timer = setTimeout(function(){
									events[name].fn(val, that);
								}, 0);
							}
						}
					};
				})();
				
				var step = {};
				
				var preventBlur = function(e){
					if(preventBlur.prevent){
						e.preventDefault();
						that.element.focus();
						e.stopImmediatePropagation();
						return true;
					}
				};
				
				var mouseDownInit = function(){
					if(!o.disabled && !isFocused){
						that.element[0].focus();
					}
					preventBlur.set();
					
					return false;
				};
				
				preventBlur.set = (function(){
					var timer;
					var reset = function(){
						preventBlur.prevent = false;
					};
					return function(){
						clearTimeout(timer);
						preventBlur.prevent = true;
						setTimeout(reset, 9);
					};
				})();
				
				['stepUp', 'stepDown'].forEach(function(name){
					step[name] = function(factor){
						if(!o.disabled && !o.readonly){
							if(!isFocused){
								mouseDownInit();
							}
							var ret = false;
							if (!factor) {
								factor = 1;
							}
							try {
								that.elemHelper[name](factor);
								ret = that.elemHelper.prop('value');
								that.value(ret);
								eventTimer.call('input', ret);
							} catch (er) {}
							return ret;
						}
					};
				});
				
				
				this.buttonWrapper.on('mousedown', mouseDownInit);
				
				this.setChange = function(value){
					that.value(value);
					eventTimer.call('input', value);
					eventTimer.call('change', value);
				};
				
				this.element.on({
					blur: function(e){
						if(!preventBlur(e) && !o.disabled && !o.readonly){
							eventTimer.call('input', $.prop(that.orig, 'value'));
							eventTimer.call('change', $.prop(that.orig, 'value'));
							if(!preventBlur.prevent){
								isFocused = false;
							}
						}
					},
					focus: function(){
						eventTimer.init('input', $.prop(that.orig, 'value'), that.options.input);
						eventTimer.init('change', $.prop(that.orig, 'value'), that.options.change);
						isFocused = true;
					},
					change: function(){
						var val = parseVal[that.type]($.prop(this, 'value'));
						$.prop(that.orig, 'value', val);
						eventTimer.call('input', val);
						eventTimer.call('change', val);
					},
					mousewheel: function(e, delta){
						if(delta && isFocused && !o.disabled){
							step[delta > 0 ? 'stepUp' : 'stepDown']();
							e.preventDefault();
						}
					},
					keypress: function(e){
						var chr;
						var stepped = true;
						var code = e.keyCode;
						if (code == 38) {
							step.stepUp();
						} else if (code == 40) {
							step.stepDown();
						} else {
							if(!e.ctrlKey && !e.metaKey && curCfg[that.type+'Signs']){
								chr = String.fromCharCode(e.charCode == null ? code : e.charCode);
								stepped = !(chr < " " || (curCfg[that.type+'Signs']+'0123456789').indexOf(chr) > -1);
							} else {
								stepped = false;
							}
						}
						if(stepped){
							e.preventDefault();
						}
					}
				});
				
				$(document).on('wslocalechange',function(){
					that.value(that.options.value);
				});
				
				$('.step-up', this.buttonWrapper)
					.on({
						'mousepressstart mousepressend': mousePress,
						'mousedown mousepress': function(e){
							step.stepUp();
						}
					})
				;
				$('.step-down', this.buttonWrapper)
					.on({
						'mousepressstart mousepressend': mousePress,
						'mousedown mousepress': function(e){
							step.stepDown();
						}
					})
				;
				
			}
		};
		
		
		$.fn.spinbtnUI = function(opts){
			opts = $.extend({
				monthNames: 'monthNamesShort',
				size: 1,
				startAt: 0,
				selectNav: false,
				openOnFocus: false
			}, opts);
			return this.each(function(){
				$.webshims.objectCreate(spinBtnProto, {
					element: {
						value: $(this)
					}
				}, opts);
			});
		};
	})();
	
	(function(){
		var picker = {};
		var disable = {
			
		};
		
		var getDateArray = function(date){
			return [date.getFullYear(), addZero(date.getMonth() + 1), addZero(date.getDate())];
		};
		var today = getDateArray(new Date());
		
		picker.getWeek = function(date){
			var onejan = new Date(date.getFullYear(),0,1);
			return Math.ceil((((date - onejan) / 86400000) + onejan.getDay()+1)/7);
		};
		picker.getYearList = function(value, data){
			var j, i, val, disabled, lis, prevDisabled, nextDisabled, classStr, classArray;
			
			value = value[0] * 1;
			
			var size = data.options.size || 1;
			var xth = value % (12 * size);
			var start = value - xth;
			var max = data.options.max.split('-');
			var min = data.options.min.split('-');
			var currentValue = data.options.value.split('-');
			var enabled = 0;
			var str = '';
			for(j = 0; j < size; j++){
				if(j){
					start += 12;
				}  else {
					prevDisabled = picker.isInRange([start-1], max, min) ? {'data-action': 'setYearList','value': start-1} : false;
				}
				
				str += '<div class="year-list"><div class="ws-picker-header"><h3>'+ start +' - '+(start + 11)+'</h3></div>';
				lis = [];
				for(i = 0; i < 12; i++){
					val = start + i ;
					classArray = [];
					if( !picker.isInRange([val], max, min) ){
						disabled = ' disabled="disabled"';
					} else {
						disabled = '';
						enabled++;
					}
					
					
					if(val == today[0]){
						classArray.push('this-year');
					}
					
					if(currentValue[0] == val){
						classArray.push('selected-value');
					}
					
					classStr = classArray.length ? ' class="'+ (classArray.join(' ')) +'"' : '';
					
					
					lis.push('<li><button type="button"'+ disabled + classStr +' data-action="setMonthList" value="'+val+'">'+val+'</button></li>');
				}
				if(j == size - 1){
					nextDisabled = picker.isInRange([val+1], max, min) ? {'data-action': 'setYearList','value': val+1} : false;
				}
				str += '<ul class="year-list">'+ (lis.join(''))+ '</ul></div>';
			}
			
			return {
				enabled: enabled,
				main: str,
				next: nextDisabled,
				prev: prevDisabled
			};
		};
		
		
		picker.getMonthList = function(value, data){
			
			var j, i, name, val, disabled, lis, fullyDisabled, prevDisabled, nextDisabled, classStr, classArray;
			var size = data.options.size || 1;
			var max = data.options.max.split('-');
			var min = data.options.min.split('-');
			var currentValue = data.options.value.split('-');
			var enabled = 0;
			var str = '';
			
			value = value[0] - Math.floor((size - 1) / 2);
			for(j = 0; j < size; j++){
				if(j){
					value++;
				} else {
					prevDisabled = picker.isInRange([value-1], max, min) ? {'data-action': 'setMonthList','value': value-1} : false;
				}
				if(j == size - 1){
					nextDisabled = picker.isInRange([value+1], max, min) ? {'data-action': 'setMonthList','value': value+1} : false;
				}
				lis = [];
				
				
				
				
				if( !picker.isInRange([value, '01'], max, min) && !picker.isInRange([value, '12'], max, min)){
					disabled = ' disabled="disabled"';
					fullyDisabled = true;
				} else {
					fullyDisabled = false;
					disabled = '';
				}
				
				str += '<div class="month-list"><div class="ws-picker-header">';
				
				str += data.options.selectNav ? 
					'<select data-action="setMonthList">'+ picker.createYearSelect(value, max, min).join('') +'</select>' : 
					'<button data-action="setYearList"'+disabled+' value="'+ value +'">'+ value +'</button>';
				str += '</div>';
				
				for(i = 0; i < 12; i++){
					val = curCfg.date.monthkeys[i+1];
					name = curCfg.date.monthNames[i];
					classArray = [];
					if(fullyDisabled || !picker.isInRange([value, val], max, min) ){
						disabled = ' disabled="disabled"';
					} else {
						disabled = '';
						enabled++;
					}
					
					if(value == today[0] && today[1] == val){
						classArray.push('this-month');
					}
					
					if(currentValue[0] == value && currentValue[1] == val){
						classArray.push('selected-value');
					}
					
					classStr = (classArray.length) ? ' class="'+ (classArray.join(' ')) +'"' : '';
					
					lis.push('<li><button type="button"'+ disabled + classStr +' data-action="'+ (data.type == 'month' ? 'changeInput' : 'setDayList' ) +'" value="'+value+'-'+val+'">'+name+'</button></li>');
				}
				
				str += '<ul>'+ (lis.join(''))+ '</ul></div>';
			}
			
			return {
				enabled: enabled,
				main: str,
				prev: prevDisabled,
				next: nextDisabled
			};
		};
		
		
		picker.getDayList = function(value, data){
			
			var j, i, k, day, name, val, disabled, lis,  prevDisabled, nextDisabled, addTr, week;
			
			var lastMotnh, curMonth, otherMonth, dateArray, monthName, buttonStr, date2, classArray;
			var size = data.options.size || 1;
			var max = data.options.max.split('-');
			var min = data.options.min.split('-');
			var currentValue = data.options.value.split('-');
			var monthNames = curCfg.date[data.options.monthNames] || curCfg.date.monthNames; 
			var enabled = 0;
			var str = [];
			var date = new Date(value[0], value[1] - 1, 1);
			
			date.setMonth(date.getMonth()  - Math.floor((size - 1) / 2));
			
			for(j = 0;  j < size; j++){
				lastMotnh = date.getMonth();
				
				if(!j){
					date2 = new Date(date.getTime());
					date2.setDate(-1);
					dateArray = getDateArray(date2);
					prevDisabled = picker.isInRange(dateArray, max, min) ? {'data-action': 'setDayList','value': dateArray[0]+'-'+dateArray[1]} : false;
				}
				
				dateArray = getDateArray(date);
				
				str.push('<div class="day-list"><div class="ws-picker-header">');
				if( data.options.selectNav ){
					monthName = ['<select data-action="setDayList">'+ picker.createMonthSelect(dateArray, max, min, monthNames).join('') +'</select>', '<select data-action="setDayList">'+ picker.createYearSelect(dateArray[0], max, min, '-'+dateArray[1]).join('') +'</select>'];
					if(curCfg.date.showMonthAfterYear){
						monthName.reverse();
					}
					str.push( monthName.join(' ') );
				} else {
					
					monthName = [monthNames[(dateArray[1] * 1) - 1], dateArray[0]];
					if(curCfg.date.showMonthAfterYear){
						monthName.reverse();
					}
					str.push(  
						'<button data-action="setMonthList" value="'+ dateArray[0]+'-'+dateArray[1] +'">'+ monthName.join(' ')  +'</button>'
					);
				}
				
				
				str.push('</div><table><thead><tr>');
				
				if(data.options.showWeek){
					str.push('<th>'+ curCfg.date.weekHeader +'</th>');
				}
				for(k = curCfg.date.firstDay; k < curCfg.date.dayNamesShort.length; k++){
					str.push('<th>'+ curCfg.date.dayNamesShort[k] +'</th>');
				}
				k = curCfg.date.firstDay;
				while(k--){
					str.push('<th>'+ curCfg.date.dayNamesShort[k] +'</th>');
				}
				str.push('</tr></thead><tbody><tr>');
				
				if(data.options.showWeek) {
					week = picker.getWeek(date);
					str.push('<th>'+ week +'</th>');
				}
				
				for (i = 0; i < 99; i++) {
					addTr = (i && !(i % 7));
					curMonth = date.getMonth();
					otherMonth = lastMotnh != curMonth;
					classArray = [];
					
					if(addTr && otherMonth ){
						str.push('</tr>');
						break;
					}
					if(addTr){
						str.push('</tr><tr>');
						if(data.options.showWeek) {
							week++;
							str.push('<th>'+ week +'</th>');
						}
					}
					if(!i){
						day = date.getDay() - curCfg.date.firstDay;
						
						if(day > -1 && day < 6){
							date.setDate(date.getDate() - day);
						}
						curMonth = date.getMonth();
						otherMonth = lastMotnh != curMonth;
					}
					
					dateArray = getDateArray(date);
					buttonStr = '<td><button data-action="changeInput" value="'+ (dateArray.join('-')) +'"';
					
					if(otherMonth){
						classArray.push('othermonth');
					} 
					
					if(dateArray[0] == today[0] && today[1] == dateArray[1] && today[2] == dateArray[2]){
						classArray.push('this-day');
					}
					
					if(currentValue[0] == dateArray[0] && dateArray[1] == currentValue[1] && dateArray[2] == currentValue[2]){
						classArray.push('selected-value');
					}
					
					if(classArray.length){
						buttonStr += ' class="'+ classArray.join(' ') +'"';
					}
					
					if(!picker.isInRange(dateArray, max, min)){
						buttonStr += ' disabled=""';
					}
					
					str.push(buttonStr+'>'+ date.getDate() +'</button></td>');
					
					date.setDate(date.getDate() + 1);
				}
				str.push('</tbody></table></div>');
				if(j == size - 1){
					dateArray = getDateArray(date);
					dateArray[2] = 1;
					nextDisabled = picker.isInRange(dateArray, max, min) ? {'data-action': 'setDayList','value': dateArray[0]+'-'+dateArray[1]} : false;
				}
			}
					
			
			return {
				enabled: 9,
				main: str.join(''),
				prev: prevDisabled,
				next: nextDisabled
			};
		};
		
		picker.isInRange = function(values, max, min){
			var i;
			var ret = true;
			for(i = 0; i < values.length; i++){
				
				if(min[i] && min[i] > values[i]){
					ret = false;
					break;
				} else if( !(min[i] && min[i] == values[i]) ){
					break;
				}
			}
			if(ret){
				for(i = 0; i < values.length; i++){
					
					if((max[i] && max[i] < values[i])){
						ret = false;
						break;
					} else if( !(max[i] && max[i] == values[i]) ){
						break;
					}
				}
			}
			return ret;
		};
		
		picker.createMonthSelect = function(value, max, min, monthNames){
			if(!monthNames){
				monthNames = curCfg.date.monthNames;
			}
			
			var selected;
			var i = 0;
			var options = [];
			var tempVal = value[1]-1;
			for(; i < monthNames.length; i++){
				selected = tempVal == i ? ' selected=""' : '';
				if(selected || picker.isInRange([value[0], i+1], max, min)){
					options.push('<option value="'+ value[0]+'-'+addZero(i+1) + '"'+selected+'>'+ monthNames[i] +'</option>');
				}
			}
			return options;
		};
		
		picker.createYearSelect = function(value, max, min, valueAdd){
			
			var temp;
			var goUp = true;
			var goDown = true;
			var options = ['<option selected="">'+ value + '</option>'];
			var i = 0;
			if(!valueAdd){
				valueAdd = '';
			}
			while(i < 8 && (goUp || goDown)){
				i++;
				temp = value-i;
				if(goUp && picker.isInRange([temp], max, min)){
					options.unshift('<option value="'+ (temp+valueAdd) +'">'+ temp +'</option>');
				} else {
					goUp = false;
				}
				temp = value + i;
				if(goDown && picker.isInRange([temp], max, min)){
					options.push('<option value="'+ (temp+valueAdd) +'">'+ temp +'</option>');
				} else {
					goDown = false;
				}
			}
			return options;
		};
			
		var actions = {
			
			changeInput: function(val, popover, data){
				data.setChange(val);
				popover.hide();
			}
		};
		
		(function(){
			var retNames = function(name){
				return 'get'+name+'List';
			};
			var stops = {
				date: 'Day',
				week: 'Day',
				month: 'Month'
			};
			
			$.each({'setYearList' : ['Year', 'Month', 'Day'], 'setMonthList': ['Month', 'Day'], 'setDayList': ['Day']}, function(setName, names){
				var getNames = names.map(retNames);
				actions[setName] = function(val, popover, data, startAt){
					var values = val.split('-');
					if(!startAt){
						startAt = 0;
					}
					$.each(getNames, function(i, item){
						if(i >= startAt){
							var content = picker[item](values, data);
							
							if( values.length < 2 || content.enabled > 1 || stops[data.type] === names[i]){
								popover.element.attr({'data-currentview': setName});
								popover.bodyElement.html(content.main);
								if(content.prev){
									popover.prevElement
										.attr(content.prev)
										.prop({disabled: false})
									;
								} else {
									popover.prevElement
										.removeAttr('data-action')
										.prop({disabled: true})
									;
								}
								if(content.next){
									popover.nextElement
										.attr(content.next)
										.prop({disabled: false})
									;
								} else {
									popover.nextElement
										.removeAttr('data-action')
										.prop({disabled: true})
									;
								}
								return false;
							}
						}
					});
				};
			});
		})();
		
		picker.commonInit = function(data, popover){
			var actionfn = function(){
				var action = $(this).attr('data-action');
				if(actions[action]){
					actions[action]($(this).val(), popover, data);
				} else {
					webshims.warn('no action for '+ action);
				}
				return false;
			};
			
			data.list = function(opts){
				var o = this.options;
				var options = [];
				
				o.options = opts || {};
				$('div.ws-options', popover.contentElement).remove();
				$.each(o.options, function(val, label){
					options.push('<button value="'+ val +'" data-action="changeInput">'+ (label || data.formatValue(val)) +'</button>');
				});
				if(options.length){
					popover.bodyElement.after('<div class="ws-options">'+ options.join('') +'</div>');
				}
			};
			popover.contentElement.html('<button class="ws-prev"><span></span></button> <button class="ws-next"><span></span></button><div class="ws-picker-body"></div><div class="ws-button-row"><button type="button" class="ws-current" data-text="current"></button> <button type="button" data-action="changeInput" value="" data-text="empty" class="ws-empty"></button></div>');
			popover.nextElement = $('button.ws-next', popover.contentElement);
			popover.prevElement = $('button.ws-prev', popover.contentElement);
			popover.bodyElement = $('div.ws-picker-body', popover.contentElement);
			popover.buttonRow = $('div.ws-button-row', popover.contentElement);
			
			popover.contentElement
				.on('click', 'button[data-action]', actionfn)
				.on('change', 'select[data-action]', actionfn)
			;
			popover.bodyElement.on('click', 'button[data-action]', actionfn)
			$(document)
				.onTrigger('wslocalechange',function(){
					$('> span', popover.nextElement).html(curCfg.date.nextText);
					$('> span', popover.prevElement).html(curCfg.date.prevText);
					$('button', popover.buttonRow).each(function(){
						$(this).text( $(this).data('text') );
					});
				})
			;
			data.list(data.options.options);
		};
		
		picker.month = function(data){
			var popover = webshims.objectCreate(webshims.wsPopover, {}, {prepareFor: data.element});
			var opener = $('<span class="popover-opener" />').appendTo(data.buttonWrapper);
			var options = data.options;
			var init = false;
			
			var show = function(){
				if(!options.disabled && !options.readonly){
					if(!init){
						picker.commonInit(data, popover);
						actions.setYearList( options.value || options.defValue, popover, data, data.options.startAt);
					} else {
						actions[data.options.restartView ? 'setYearList' : popover.element.attr('data-currentview') || 'setYearList' ]( options.value || options.defValue, popover, data, 0);
					}
					
					init = true;
					popover.show(data.element);
				}
			};
			
			popover.element.addClass(data.type+'-popover input-picker');
			
			opener.on('mousedown', show);
			
			data.element.on({
				focus: function(){
					if(data.options.openOnFocus){
						show();
					}
				},
				mousedown: function(){
					if(data.element.is(':focus')){
						show();
					}
				}
			});
		};
		
		picker.date = picker.month;
		
		webshims.picker = picker;
	})();
	
	(function(){
		var modernizrInputTypes = Modernizr.inputtypes;
	
		var stopCircular;
		var inputTypes = {
			
		};
		var copyProps = [
			'disabled',
			'readonly',
			'value',
			'min',
			'max',
			'step',
			'title',
			'placeholder'
		];
		
		//
		var copyAttrs = ['tabindex', 'data-placeholder'];
		var reflectFn = function(val){
			
		};
			
		$.each(copyProps.concat(copyAttrs), function(i, name){
			var fnName = name.replace(/^data\-/, '');
			
			webshims.onNodeNamesPropertyModify('input', name, function(val){
				if(!stopCircular){
					var shadowData = webshims.data(this, 'shadowData');
					if(shadowData && shadowData.data && shadowData.nativeElement === this && shadowData.data[fnName]){
						shadowData.data[fnName](val);
					}
				}
			});
		});
		var extendType = (function(){
			return function(name, data){
				inputTypes[name] = data;
				data.attrs = $.merge([], copyAttrs, data.attrs);
				data.props = $.merge([], copyProps, data.props);
			};
		})();
		var getOptions = function(input, data){
			var list = $.prop(input, 'list');
			var options = {};
			var listTimer, updateList;
			
			if(list){
				$('option', list).each(function(){
					options[$.prop(this, 'value')] = $.prop(this, 'label');
				});
			}
			if(data){
				updateList = function(){
					if(data.shim){
						clearTimeout(listTimer);
						listTimer = setTimeout(function(){
							data.shim.list(getOptions(input));
						}, 9);
					}
				};
				$(list).on('updateDatalist', updateList);
				$(input).on('listdatalistchange', updateList);
			}
			return options;
		};
		var stopPropagation = function(e){
			e.stopImmediatePropagation(e);
		};
		var isVisible = function(){
			return $.css(this, 'display') != 'none';
		};
		var sizeInput = function(data){
			var init;
			var updateStyles = function(){
				$.style( data.orig, 'display', '' );
				
				var correctWidth = 0.6;
				if(!init || data.orig.offsetWidth){
					data.element.css({
						marginLeft: $.css( data.orig, 'marginLeft'),
						marginRight: $.css( data.orig, 'marginRight')
					});
					
					if(data.buttonWrapper && data.buttonWrapper.filter(isVisible).length){
						data.element.css({paddingRight: ''});
						
						if((parseInt(data.buttonWrapper.css('marginLeft'), 10) || 0) < 0){
							data.element
								.css({paddingRight: ''})
								.css({
									paddingRight: (parseInt( data.element.css('paddingRight'), 10) || 0) + data.buttonWrapper.outerWidth()
								})
							;
						} else {
							correctWidth = data.buttonWrapper.outerWidth(true) + 0.6;
						}
					}
					
					data.element.outerWidth( $(data.orig).outerWidth() - correctWidth );
				}
				init = true;
				$.style( data.orig, 'display', 'none' );
			};
			$(document).onTrigger('updateshadowdom', updateStyles);
		};
		
		
		var implementType = function(){
			var type = $.prop(this, 'type');
			
			var i, opts, data, optsName, calcWidth;
			if(inputTypes[type]){
				data = {};
				optsName = type;
				//todo: do we need deep extend?
				opts = $.extend({}, options[type], $($.prop(this, 'form')).data(type) || {}, $(this).data(type) || {}, {
					orig: this,
					type: type,
					options: getOptions(this, data),
					input: function(val){
						opts._change(val, 'input');
					},
					change: function(val){
						opts._change(val, 'change');
					},
					_change: function(val, trigger){
						stopCircular = true;
						$.prop(opts.orig, 'value', val);
						stopCircular = false;
						if(trigger){
							$(opts.orig).trigger(trigger);
						}
					}
				});
				
				
				for(i = 0; i < copyProps.length; i++){
					opts[copyProps[i]] = $.prop(this, copyProps[i]);
				}
				for(i = 0; i < copyAttrs.length; i++){
					optsName = copyAttrs[i].replace(/^data\-/, '');
					if(!opts[optsName]){
						opts[optsName] = $.attr(this, copyAttrs[i]);
					}
				}
				
				data.shim = inputTypes[type]._create(opts);
				
				webshims.addShadowDom(this, data.shim.element, {
					data: data.shim || {}
				});
				
				$(this).on('change', function(e){
					if(!stopCircular && e.originalEvent){
						data.shim.value($.prop(this, 'value'));
					}
				});
				
				data.shim.element.on('change input', stopPropagation);
				data.shim.element.on('focusin focusout', function(e){
					e.stopImmediatePropagation(e);
					$(opts.orig).trigger(e);
				});
				data.shim.element.on('focus blur', function(e){
					e.stopImmediatePropagation(e);
					$(opts.orig).triggerHandler(e);
				});
				
				if(data.shim.buttonWrapper && data.shim.buttonWrapper.filter(isVisible).length){
					data.shim.element.addClass('has-input-buttons');
				}
				
				calcWidth = opts.calculateWidth != null ? opts.calculateWidth : options.calculateWidth;
				
				if(calcWidth){
					sizeInput(data.shim);
				}
				$(this).css({display: 'none'});
			}
		};
		
		if(!modernizrInputTypes.range || options.replaceUI){
			extendType('range', {
				_create: function(opts, set){
					return $('<span />').insertAfter(opts.orig).rangeUI(opts).data('rangeUi');
				}
			});
		}
		
		
		['number', 'time', 'month', 'date'].forEach(function(name){
			if(!modernizrInputTypes[name] || options.replaceUI){
				extendType(name, {
					_create: function(opts, set){
						var data = $('<input class="ws-'+name+'" type="text" />')
							.insertAfter(opts.orig)
							.spinbtnUI(opts)
							.data('wsspinner')
						;
						if(webshims.picker && webshims.picker[name]){
							webshims.picker[name](data);
						}
						data.buttonWrapper.addClass('input-button-size-'+(data.buttonWrapper.children().filter(isVisible).length));
						return data;
					}
				});
			}
		});
		
		
		webshims.addReady(function(context, contextElem){
			$('input', context)
				.add(contextElem.filter('input'))
				.each(implementType)
			;
		});
	})();
});


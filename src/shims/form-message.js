jQuery.webshims.ready('form-core dom-extend', function($, webshims, window, doc, undefined){
	"use strict";
	var validityMessages = webshims.validityMessages;
	var cfg = webshims.cfg.forms;
	var implementProperties = (cfg.overrideMessages || cfg.customMessages) ? ['customValidationMessage'] : [];

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
		rangeUnderflow: {
			defaultMessage: '{%value} is too low. The lowest value you can use is {%min}.'
		},
		rangeOverflow: '{%value}  is too high. The highest value you can use is {%max}.',
		stepMismatch: 'The value {%value} is not allowed for this form.',
		tooLong: 'The entered text is too large! You used {%valueLen} letters and the limit is {%maxlength}.',
		
		patternMismatch: '{%value} is not in the format this page requires! {%title}',
		valueMissing: {
			defaultMessage: 'You have to specify a value',
			checkbox: 'You have to check the box'
		}
	};
	
	['date', 'time', 'datetime-local'].forEach(function(type){
		validityMessages['en'].rangeUnderflow[type] = '{%value} is too early. The earliest value you can use is {%min}.';
	});
	['date', 'time', 'datetime-local'].forEach(function(type){
		validityMessages['en'].rangeOverflow[type] = '{%value} ist too late. The value can not be later than {%max}';
	});
	['select-one', 'radio'].forEach(function(type){
		validityMessages['en'].valueMissing[type] = 'Please select an option';
	});
	
	validityMessages['en-US'] = validityMessages['en-US'] || validityMessages['en'];
	validityMessages[''] = validityMessages[''] || validityMessages['en-US'];
	
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
		rangeUnderflow: {
			defaultMessage: '{%value} ist zu niedrig. {%min} ist der unterste Wert, den Sie benutzen können.'
		},
		rangeOverflow: {
			defaultMessage: '{%value} ist zu hoch. {%max} ist der oberste Wert, den Sie benutzen können.'
		},
		stepMismatch: 'Der Wert {%value} ist in diesem Feld nicht zulässig. Hier sind nur bestimmte Werte zulässig. {%title}',
		tooLong: 'Der eingegebene Text ist zu lang! Sie haben {%valueLen} Buchstaben eingegeben, dabei sind {%maxlength} das Maximum.',
		
		patternMismatch: '{%value} hat für dieses Eingabefeld ein falsches Format! {%title}',
		valueMissing: {
			defaultMessage: 'Bitte geben Sie einen Wert ein',
			checkbox: 'Bitte aktivieren Sie das Kästchen'
		}
	};
	['date', 'time', 'datetime-local'].forEach(function(type){
		validityMessages['de'].rangeUnderflow[type] = '{%value} ist zu früh. {%min} ist die früheste Zeit, die Sie benutzen können.';
	});
	['date', 'time', 'datetime-local'].forEach(function(type){
		validityMessages['de'].rangeOverflow[type] = '{%value} ist zu spät. {%max} ist die späteste Zeit, die Sie benutzen können.';
	});
	['select-one', 'radio'].forEach(function(type){
		validityMessages['de'].valueMissing[type] = 'Bitte wählen Sie eine Option aus';
	});
	
	var currentValidationMessage =  validityMessages[''];
	$(doc).bind('webshimLocalizationReady', function(){
		webshims.activeLang(validityMessages, 'form-message', function(langObj){
			currentValidationMessage = langObj;
		});
	});
	
	webshims.createValidationMessage = function(elem, name){
		var message = currentValidationMessage[name];
		if(message && typeof message !== 'string'){
			message = message[ (elem.getAttribute('type') || '').toLowerCase() || elem.type || 'defaultMessage' ] || message.defaultMessage;
		}
		if(message){
			['value', 'min', 'max', 'title', 'maxlength', 'label'].forEach(function(attr){
				if(message.indexOf('{%'+attr) === -1){return;}
				var val = ((attr == 'label') ? $.trim($('label[for="'+ elem.id +'"]', elem.form).text()).replace(/\*$|:$/, '') : $.attr(elem, attr)) || '';
				message = message.replace('{%'+ attr +'}', val);
				if('value' == attr){
					message = message.replace('{%valueLen}', val.length);
				}
			});
		}
		return message || '';
	};
	
	
	if((!window.noHTMLExtFixes && !Modernizr.validationmessage) || !Modernizr.formvalidation){
		implementProperties.push('validationMessage');
	}
	
	implementProperties.forEach(function(messageProp){
		['input', 'select', 'textarea', 'fieldset', 'output', 'button'].forEach(function(nodeName){
			var desc = webshims.defineNodeNameProperty(nodeName, messageProp, {
				get: function(){
					var elem = this;
					var message = '';
					if(!$.attr(elem, 'willValidate')){
						return message;
					}
					
					var validity = $.attr(elem, 'validity') || {valid: 1};
					
					if(validity.valid){return message;}
					message = elem.getAttribute('x-moz-errormessage') || elem.getAttribute('data-errormessage') || '';
					
					if(message){return message;}
					
					if(validity.customError && elem.nodeName){
						message = (Modernizr.validationmessage && desc._supget) ? desc._supget.call(elem) : $.data(elem, 'customvalidationMessage');
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
				},
				set: $.noop
			});
		});
		
	});
});
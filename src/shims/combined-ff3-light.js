// -- kriskowal Kris Kowal Copyright (C) 2009-2010 MIT License
// -- tlrobinson Tom Robinson
// -- dantman Daniel Friesen

/*!
    Copyright (c) 2009, 280 North Inc. http://280north.com/
    MIT License. http://github.com/280north/narwhal/blob/master/README.md
*/

(function () {

/**
 * Brings an environment as close to ECMAScript 5 compliance
 * as is possible with the facilities of erstwhile engines.
 *
 * ES5 Draft
 * http://www.ecma-international.org/publications/files/drafts/tc39-2009-050.pdf
 *
 * NOTE: this is a draft, and as such, the URL is subject to change.  If the
 * link is broken, check in the parent directory for the latest TC39 PDF.
 * http://www.ecma-international.org/publications/files/drafts/
 *
 * Previous ES5 Draft
 * http://www.ecma-international.org/publications/files/drafts/tc39-2009-025.pdf
 * This is a broken link to the previous draft of ES5 on which most of the
 * numbered specification references and quotes herein were taken.  Updating
 * these references and quotes to reflect the new document would be a welcome
 * volunteer project.
 * 
 * @module
 */

/*whatsupdoc*/

//
// Array
// =====
//

// ES5 15.4.3.2 
if (!Array.isArray) {
    Array.isArray = function(obj) {
        return Object.prototype.toString.call(obj) == "[object Array]";
    };
}

// ES5 15.4.4.18
if (!Array.prototype.forEach) {
    Array.prototype.forEach =  function(block, thisObject) {
        var len = this.length >>> 0;
        for (var i = 0; i < len; i++) {
            if (i in this) {
                block.call(thisObject, this[i], i, this);
            }
        }
    };
}

// ES5 15.4.4.19
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
if (!Array.prototype.map) {
    Array.prototype.map = function(fun /*, thisp*/) {
        var len = this.length >>> 0;
        if (typeof fun != "function")
          throw new TypeError();

        var res = new Array(len);
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this)
                res[i] = fun.call(thisp, this[i], i, this);
        }

        return res;
    };
}

// ES5 15.4.4.20
if (!Array.prototype.filter) {
    Array.prototype.filter = function (block /*, thisp */) {
        var values = [];
        var thisp = arguments[1];
        for (var i = 0; i < this.length; i++)
            if (block.call(thisp, this[i]))
                values.push(this[i]);
        return values;
    };
}

// ES5 15.4.4.16
if (!Array.prototype.every) {
    Array.prototype.every = function (block /*, thisp */) {
        var thisp = arguments[1];
        for (var i = 0; i < this.length; i++)
            if (!block.call(thisp, this[i]))
                return false;
        return true;
    };
}

// ES5 15.4.4.17
if (!Array.prototype.some) {
    Array.prototype.some = function (block /*, thisp */) {
        var thisp = arguments[1];
        for (var i = 0; i < this.length; i++)
            if (block.call(thisp, this[i]))
                return true;
        return false;
    };
}

// ES5 15.4.4.21
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
if (!Array.prototype.reduce) {
    Array.prototype.reduce = function(fun /*, initial*/) {
        var len = this.length >>> 0;
        if (typeof fun != "function")
            throw new TypeError();

        // no value to return if no initial value and an empty array
        if (len == 0 && arguments.length == 1)
            throw new TypeError();

        var i = 0;
        if (arguments.length >= 2) {
            var rv = arguments[1];
        } else {
            do {
                if (i in this) {
                    rv = this[i++];
                    break;
                }

                // if array contains no values, no initial value to return
                if (++i >= len)
                    throw new TypeError();
            } while (true);
        }

        for (; i < len; i++) {
            if (i in this)
                rv = fun.call(null, rv, this[i], i, this);
        }

        return rv;
    };
}

// ES5 15.4.4.22
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight
if (!Array.prototype.reduceRight) {
    Array.prototype.reduceRight = function(fun /*, initial*/) {
        var len = this.length >>> 0;
        if (typeof fun != "function")
            throw new TypeError();

        // no value to return if no initial value, empty array
        if (len == 0 && arguments.length == 1)
            throw new TypeError();

        var i = len - 1;
        if (arguments.length >= 2) {
            var rv = arguments[1];
        } else {
            do {
                if (i in this) {
                    rv = this[i--];
                    break;
                }

                // if array contains no values, no initial value to return
                if (--i < 0)
                    throw new TypeError();
            } while (true);
        }

        for (; i >= 0; i--) {
            if (i in this)
                rv = fun.call(null, rv, this[i], i, this);
        }

        return rv;
    };
}

// ES5 15.4.4.14
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (value /*, fromIndex */ ) {
        var length = this.length;
        if (!length)
            return -1;
        var i = arguments[1] || 0;
        if (i >= length)
            return -1;
        if (i < 0)
            i += length;
        for (; i < length; i++) {
            if (!Object.prototype.hasOwnProperty.call(this, i))
                continue;
            if (value === this[i])
                return i;
        }
        return -1;
    };
}

// ES5 15.4.4.15
if (!Array.prototype.lastIndexOf) {
    Array.prototype.lastIndexOf = function (value /*, fromIndex */) {
        var length = this.length;
        if (!length)
            return -1;
        var i = arguments[1] || length;
        if (i < 0)
            i += length;
        i = Math.min(i, length - 1);
        for (; i >= 0; i--) {
            if (!Object.prototype.hasOwnProperty.call(this, i))
                continue;
            if (value === this[i])
                return i;
        }
        return -1;
    };
}

//
// Object
// ======
// 

// ES5 15.2.3.2
if (!Object.getPrototypeOf) {
    Object.getPrototypeOf = function (object) {
        return object.__proto__;
        // or undefined if not available in this engine
    };
}

// ES5 15.2.3.3
if (!Object.getOwnPropertyDescriptor) {
    Object.getOwnPropertyDescriptor = function (object) {
        return {}; // XXX
    };
}

// ES5 15.2.3.4
if (!Object.getOwnPropertyNames) {
    Object.getOwnPropertyNames = function (object) {
        return Object.keys(object);
    };
}

// ES5 15.2.3.5 
if (!Object.create) {
    Object.create = function(prototype, properties) {
        var object;
        if (prototype === null) {
            object = {"__proto__": null};
        } else {
            if (typeof prototype != "object")
                throw new TypeError("typeof prototype["+(typeof prototype)+"] != 'object'");
            var Type = function () {};
            Type.prototype = prototype;
            object = new Type();
        }
        if (typeof properties !== "undefined")
            Object.defineProperties(object, properties);
        return object;
    };
}

// ES5 15.2.3.6
if (!Object.defineProperty) {
    Object.defineProperty = function(object, property, descriptor) {
        var has = Object.prototype.hasOwnProperty;
        if (typeof descriptor == "object" && object.__defineGetter__) {
            if (has.call(descriptor, "value")) {
                if (!object.__lookupGetter__(property) && !object.__lookupSetter__(property))
                    // data property defined and no pre-existing accessors
                    object[property] = descriptor.value;
                if (has.call(descriptor, "get") || has.call(descriptor, "set"))
                    // descriptor has a value property but accessor already exists
                    throw new TypeError("Object doesn't support this action");
            }
            // fail silently if "writable", "enumerable", or "configurable"
            // are requested but not supported
            /*
            // alternate approach:
            if ( // can't implement these features; allow false but not true
                !(has.call(descriptor, "writable") ? descriptor.writable : true) ||
                !(has.call(descriptor, "enumerable") ? descriptor.enumerable : true) ||
                !(has.call(descriptor, "configurable") ? descriptor.configurable : true)
            )
                throw new RangeError(
                    "This implementation of Object.defineProperty does not " +
                    "support configurable, enumerable, or writable."
                );
            */
            else if (typeof descriptor.get == "function")
                object.__defineGetter__(property, descriptor.get);
            if (typeof descriptor.set == "function")
                object.__defineSetter__(property, descriptor.set);
        }
        return object;
    };
}

// ES5 15.2.3.7
if (!Object.defineProperties) {
    Object.defineProperties = function(object, properties) {
        for (var property in properties) {
            if (Object.prototype.hasOwnProperty.call(properties, property))
                Object.defineProperty(object, property, properties[property]);
        }
        return object;
    };
}

// ES5 15.2.3.8
if (!Object.seal) {
    Object.seal = function (object) {
        // this is misleading and breaks feature-detection, but
        // allows "securable" code to "gracefully" degrade to working
        // but insecure code.
        return object;
    };
}

// ES5 15.2.3.9
if (!Object.freeze) {
    Object.freeze = function (object) {
        // this is misleading and breaks feature-detection, but
        // allows "securable" code to "gracefully" degrade to working
        // but insecure code.
        return object;
    };
}

// detect a Rhino bug and patch it
try {
    Object.freeze(function () {});
} catch (exception) {
    Object.freeze = (function (freeze) {
        return function (object) {
            if (typeof object == "function") {
                return object;
            } else {
                return freeze(object);
            }
        };
    })(Object.freeze);
}

// ES5 15.2.3.10
if (!Object.preventExtensions) {
    Object.preventExtensions = function (object) {
        // this is misleading and breaks feature-detection, but
        // allows "securable" code to "gracefully" degrade to working
        // but insecure code.
        return object;
    };
}

// ES5 15.2.3.11
if (!Object.isSealed) {
    Object.isSealed = function (object) {
        return false;
    };
}

// ES5 15.2.3.12
if (!Object.isFrozen) {
    Object.isFrozen = function (object) {
        return false;
    };
}

// ES5 15.2.3.13
if (!Object.isExtensible) {
    Object.isExtensible = function (object) {
        return true;
    };
}

// ES5 15.2.3.14
if (!Object.keys) {
    Object.keys = function (object) {
        var keys = [];
        for (var name in object) {
            if (Object.prototype.hasOwnProperty.call(object, name)) {
                keys.push(name);
            }
        }
        return keys;
    };
}

//
// Date
// ====
//

// ES5 15.9.5.43
// Format a Date object as a string according to a subset of the ISO-8601 standard.
// Useful in Atom, among other things.
if (!Date.prototype.toISOString) {
    Date.prototype.toISOString = function() {
        return (
            this.getFullYear() + "-" +
            (this.getMonth() + 1) + "-" +
            this.getDate() + "T" +
            this.getHours() + ":" +
            this.getMinutes() + ":" +
            this.getSeconds() + "Z"
        ); 
    }
}

// ES5 15.9.4.4
if (!Date.now) {
    Date.now = function () {
        return new Date().getTime();
    };
}

// ES5 15.9.5.44
if (!Date.prototype.toJSON) {
    Date.prototype.toJSON = function (key) {
        // This function provides a String representation of a Date object for
        // use by JSON.stringify (15.12.3). When the toJSON method is called
        // with argument key, the following steps are taken:

        // 1.  Let O be the result of calling ToObject, giving it the this
        // value as its argument.
        // 2. Let tv be ToPrimitive(O, hint Number).
        // 3. If tv is a Number and is not finite, return null.
        // XXX
        // 4. Let toISO be the result of calling the [[Get]] internal method of
        // O with argument "toISOString".
        // 5. If IsCallable(toISO) is false, throw a TypeError exception.
        if (typeof this.toISOString != "function")
            throw new TypeError();
        // 6. Return the result of calling the [[Call]] internal method of
        // toISO with O as the this value and an empty argument list.
        return this.toISOString();

        // NOTE 1 The argument is ignored.

        // NOTE 2 The toJSON function is intentionally generic; it does not
        // require that its this value be a Date object. Therefore, it can be
        // transferred to other kinds of objects for use as a method. However,
        // it does require that any such object have a toISOString method. An
        // object is free to use the argument key to filter its
        // stringification.
    };
}

// 15.9.4.2 Date.parse (string)
// 15.9.1.15 Date Time String Format
// Date.parse
// based on work shared by Daniel Friesen (dantman)
// http://gist.github.com/303249
if (isNaN(Date.parse("T00:00"))) {
    // XXX global assignment won't work in embeddings that use
    // an alternate object for the context.
    Date = (function(NativeDate) {

        // Date.length === 7
        var Date = function(Y, M, D, h, m, s, ms) {
            var length = arguments.length;
            if (this instanceof NativeDate) {
                var date = length === 1 && String(Y) === Y ? // isString(Y)
                    // We explicitly pass it through parse:
                    new NativeDate(Date.parse(Y)) :
                    // We have to manually make calls depending on argument
                    // length here
                    length >= 7 ? new NativeDate(Y, M, D, h, m, s, ms) :
                    length >= 6 ? new NativeDate(Y, M, D, h, m, s) :
                    length >= 5 ? new NativeDate(Y, M, D, h, m) :
                    length >= 4 ? new NativeDate(Y, M, D, h) :
                    length >= 3 ? new NativeDate(Y, M, D) :
                    length >= 2 ? new NativeDate(Y, M) :
                    length >= 1 ? new NativeDate(Y) :
                                  new NativeDate();
                // Prevent mixups with unfixed Date object
                date.constructor = Date;
                return date;
            }
            return NativeDate.apply(this, arguments);
        };

        // 15.9.1.15 Date Time String Format
        var isoDateExpression = new RegExp("^" +
            "(?:" + // optional year-month-day
                "(" + // year capture
                    "(?:[+-]\\d\\d)?" + // 15.9.1.15.1 Extended years
                    "\\d\\d\\d\\d" + // four-digit year
                ")" +
                "(?:-" + // optional month-day
                    "(\\d\\d)" + // month capture
                    "(?:-" + // optional day
                        "(\\d\\d)" + // day capture
                    ")?" +
                ")?" +
            ")?" + 
            "(?:T" + // hour:minute:second.subsecond
                "(\\d\\d)" + // hour capture
                ":(\\d\\d)" + // minute capture
                "(?::" + // optional :second.subsecond
                    "(\\d\\d)" + // second capture
                    "(?:\\.(\\d\\d\\d))?" + // milisecond capture
                ")?" +
            ")?" +
            "(?:" + // time zone
                "Z|" + // UTC capture
                "([+-])(\\d\\d):(\\d\\d)" + // timezone offset
                // capture sign, hour, minute
            ")?" +
        "$");

        // Copy any custom methods a 3rd party library may have added
        for (var key in NativeDate)
            Date[key] = NativeDate[key];

        // Copy "native" methods explicitly; they may be non-enumerable
        Date.now = NativeDate.now;
        Date.UTC = NativeDate.UTC;
        Date.prototype = NativeDate.prototype;
        Date.prototype.constructor = Date;

        // Upgrade Date.parse to handle the ISO dates we use
        // TODO review specification to ascertain whether it is
        // necessary to implement partial ISO date strings.
        Date.parse = function(string) {
            var match = isoDateExpression.exec(string);
            if (match) {
                match.shift(); // kill match[0], the full match
                // recognize times without dates before normalizing the
                // numeric values, for later use
                var timeOnly = match[0] === undefined;
                // parse numerics
                for (var i = 0; i < 10; i++) {
                    // skip + or - for the timezone offset
                    if (i === 7)
                        continue;
                    // Note: parseInt would read 0-prefix numbers as
                    // octal.  Number constructor or unary + work better
                    // here:
                    match[i] = +(match[i] || (i < 3 ? 1 : 0));
                    // match[1] is the month. Months are 0-11 in JavaScript
                    // Date objects, but 1-12 in ISO notation, so we
                    // decrement.
                    if (i === 1)
                        match[i]--;
                }
                // if no year-month-date is provided, return a milisecond
                // quantity instead of a UTC date number value.
                if (timeOnly)
                    return ((match[3] * 60 + match[4]) * 60 + match[5]) * 1000 + match[6];

                // account for an explicit time zone offset if provided
                var offset = (match[8] * 60 + match[9]) * 60 * 1000;
                if (match[6] === "-")
                    offset = -offset;

                return NativeDate.UTC.apply(this, match.slice(0, 7)) + offset;
            }
            return NativeDate.parse.apply(this, arguments);
        };

        return Date;
    })(Date);
}

// 
// Function
// ========
// 

// ES-5 15.3.4.5
// http://www.ecma-international.org/publications/files/drafts/tc39-2009-025.pdf
var slice = Array.prototype.slice;
if (!Function.prototype.bind) {
    Function.prototype.bind = function (that) { // .length is 1
        // 1. Let Target be the this value.
        var target = this;
        // 2. If IsCallable(Target) is false, throw a TypeError exception.
        // XXX this gets pretty close, for all intents and purposes, letting 
        // some duck-types slide
        if (typeof target.apply != "function" || typeof target.call != "function")
            return new TypeError();
        // 3. Let A be a new (possibly empty) internal list of all of the
        //   argument values provided after thisArg (arg1, arg2 etc), in order.
        var args = slice.call(arguments);
        // 4. Let F be a new native ECMAScript object.
        // 9. Set the [[Prototype]] internal property of F to the standard
        //   built-in Function prototype object as specified in 15.3.3.1.
        // 10. Set the [[Call]] internal property of F as described in
        //   15.3.4.5.1.
        // 11. Set the [[Construct]] internal property of F as described in
        //   15.3.4.5.2.
        // 12. Set the [[HasInstance]] internal property of F as described in
        //   15.3.4.5.3.
        // 13. The [[Scope]] internal property of F is unused and need not
        //   exist.
        var bound = function () {

            if (this instanceof bound) {
                // 15.3.4.5.2 [[Construct]]
                // When the [[Construct]] internal method of a function object,
                // F that was created using the bind function is called with a
                // list of arguments ExtraArgs the following steps are taken:
                // 1. Let target be the value of F's [[TargetFunction]]
                //   internal property.
                // 2. If target has no [[Construct]] internal method, a
                //   TypeError exception is thrown.
                // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.

                var self = Object.create(target.prototype);
                target.apply(self, args.concat(slice.call(arguments)));
                return self;

            } else {
                // 15.3.4.5.1 [[Call]]
                // When the [[Call]] internal method of a function object, F,
                // which was created using the bind function is called with a
                // this value and a list of arguments ExtraArgs the following
                // steps are taken:
                // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 2. Let boundThis be the value of F's [[BoundThis]] internal
                //   property.
                // 3. Let target be the value of F's [[TargetFunction]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the list
                //   boundArgs in the same order followed by the same values as
                //   the list ExtraArgs in the same order. 5.  Return the
                //   result of calling the [[Call]] internal method of target
                //   providing boundThis as the this value and providing args
                //   as the arguments.

                // equiv: target.call(this, ...boundArgs, ...args)
                return target.call.apply(
                    target,
                    args.concat(slice.call(arguments))
                );

            }

        };
        // 5. Set the [[TargetFunction]] internal property of F to Target.
        // extra:
        bound.bound = target;
        // 6. Set the [[BoundThis]] internal property of F to the value of
        // thisArg.
        // extra:
        bound.boundTo = that;
        // 7. Set the [[BoundArgs]] internal property of F to A.
        // extra:
        bound.boundArgs = args;
        bound.length = (
            // 14. If the [[Class]] internal property of Target is "Function", then
            typeof target == "function" ?
            // a. Let L be the length property of Target minus the length of A.
            // b. Set the length own property of F to either 0 or L, whichever is larger.
            Math.max(target.length - args.length, 0) :
            // 15. Else set the length own property of F to 0.
            0
        )
        // 16. The length own property of F is given attributes as specified in
        //   15.3.5.1.
        // TODO
        // 17. Set the [[Extensible]] internal property of F to true.
        // TODO
        // 18. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "caller", PropertyDescriptor {[[Value]]: null,
        //   [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]:
        //   false}, and false.
        // TODO
        // 19. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "arguments", PropertyDescriptor {[[Value]]: null,
        //   [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]:
        //   false}, and false.
        // TODO
        // NOTE Function objects created using Function.prototype.bind do not
        // have a prototype property.
        // XXX can't delete it in pure-js.
        return bound;
    };
}

//
// String
// ======
//

// ES5 15.5.4.20
if (!String.prototype.trim) {
    // http://blog.stevenlevithan.com/archives/faster-trim-javascript
    var trimBeginRegexp = /^\s\s*/;
    var trimEndRegexp = /\s\s*$/;
    String.prototype.trim = function () {
        return String(this).replace(trimBeginRegexp, '').replace(trimEndRegexp, '');
    };
}

})();
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
	
	/* some extra validation UI */
	$.webshims.validityAlert = (function(){
		
		var api = {
			hideDelay: 5000,
			showFor: function(elem, hideOnBlur){
				elem = $(elem);
				var visual = (elem.data('inputUIReplace') || {visual: elem}).visual;
				createAlert();
				api.clear();
				alert.attr('for', visual.attr('id'));
				this.getMessage(elem);
				this.position(visual);
				this.show();
				
				if(this.hideDelay){
					hideTimer = setTimeout(boundHide, this.hideDelay);
				}
				if(!hideOnBlur){
					visual.focus();
					$(document).bind('focusout.validityalert', boundHide);
				}
			},
			getMessage: function(elem){
				$('> span', alert).html(elem.attr('validationMessage'));
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
	} );
	
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
			window.addEventListener('submit', function(e){
				if(e.target.checkValidity && $.attr(e.target, 'novalidate') === undefined && !e.target.checkValidity()){
					invalidTriggeredBySubmit = true;
				}
			}, true);
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
	
	$.support.validationMessage = $.support.validationMessage || 'shim';
	
	
	(function(){
		if($.support.validity !== true){return;}
		var supportRequiredSelect = (('required' in document.createElement('select')) || window.noHTMLExtFixes);
		var supportNumericDate = !!($('<input type="datetime-local" />')[0].type == 'datetime-local' && $('<input type="range" />')[0].type == 'range');
		select = null;
		if(supportRequiredSelect && supportNumericDate){return;}
		
		var typeModels = $.webshims.inputTypes;
		var validityRules = {};
		var validityProps = ['customError','typeMismatch','rangeUnderflow','rangeOverflow','stepMismatch','tooLong','patternMismatch','valueMissing','valid'];
		var oldAttr = $.attr;
		var oldVal = $.fn.val;
		var validityChanger = {value: 1};
		var validityElements = [];
		var testValidity = function(elem){
			var type = (elem.getAttribute && elem.getAttribute('type') || elem.type || '').toLowerCase();
			if((!supportRequiredSelect && type == 'select-one') || !typeModels[type]){return;}
			$.attr(elem, 'validity');
		};
		
		if(!supportRequiredSelect){
			$.extend(validityChanger, {
				required: 1,
				size: 1,
				multiple: 1,
				selectedIndex: 1
			});
			validityElements.push('select');
		}
		if(!supportNumericDate){
			$.extend(validityChanger, {
				min: 1, max: 1, step: 1
			});
			validityElements.push('input');
		}
		
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
					customError 	= !!($.data(elem, 'hasCustomError'))
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
					var message;
					validityState[rule] = fn(jElm, val, cache, validityState);
					if(validityState[rule] && validityState.valid) {
						message = $.webshims.createValidationMessage(elem, rule);
						elem.setCustomValidity(message);
						validityState.valid = false;
					}
				});
				if(validityState.valid){
					elem.setCustomValidity('');
				}
				return validityState;
			}
		});
		
		$.webshims.addMethod('setCustomValidity', function(error){
			error = error+'';
			this.setCustomValidity(error);
			$.data(this, 'hasCustomError', !!(error));
			testValidity(this);
		});
			
		
		$.fn.val = function(val){
			var ret = oldVal.apply(this, arguments);
			this.each(function(){
				testValidity(this);
			});
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
		
		$.attr = function(elem, prop, value){
			var ret = oldAttr.apply(this, arguments);
			if(validityChanger[prop] && value !== undefined && elem.form){
				testValidity(elem);
			}
			return ret;
		};
		
		$.webshims.addReady(function(context){
			$('input', context).each(function(){
				testValidity(this);
			});
		});
		
	})();
	
	$.webshims.createReadyEvent('validation-base');
}, true);



jQuery.webshims.ready('validation-base', function($){
if($.support.validity){
	return;
}

$.webshims.inputTypes = $.webshims.inputTypes || {};
//some helper-functions
var getNames = function(elem){
		return (elem.form && elem.name) ? elem.form[elem.name] : [];
	},
	isNumber = function(string){
		return (typeof string == 'number' || (string && string == string * 1));
	},
	typeModels = $.webshims.inputTypes,
	checkTypes = {
		radio: 1,
		checkbox: 1		
	},
	getType = function(elem){
		return (elem.getAttribute('type') || elem.type || '').toLowerCase();
	}
;

//API to add new input types
$.webshims.addInputType = function(type, obj){
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

$.webshims.addValidityRule = function(type, fn){
	validityRules[type] = fn;
};

$.webshims.addMethod('checkValidity', (function(){
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
				$.webshims.validityAlert.showFor(jElm);
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
		if( e.type != 'submit' || !$.nodeName(e.target, 'form') || $.attr(e.target, 'novalidate') !== undefined || $.data(e.target, 'novalidate') ){return;}
		var notValid = !($(e.target).checkValidity());
		if(notValid){
			//ToDo
			if(!e.originalEvent && !window.debugValidityShim && window.console && console.log){
				console.log('submit');
			}
			e.stopImmediatePropagation();
			return false;
		}
	}
};

// IDLs for constrain validation API
$.webshims.attr('validity', {
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

$.webshims.addMethod('setCustomValidity', function(error){
	$.data(this, 'customvalidationMessage', ''+error);
});

//this will be extended
$.webshims.attr('validationMessage', {
	elementNames: ['input', 'select', 'textarea'],
	getter: function(elem, fn){
		var message = fn() || $.data(elem, 'customvalidationMessage');
		return (!message || !$.attr(elem, 'willValidate')) ? 
			'' :
			message
		;
	}
});

$.webshims.createBooleanAttrs('required', ['input', 'textarea', 'select']);

$.webshims.attr('willValidate', {
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
			return !!( elem.name && elem.form && !elem.disabled && !elem.readOnly && !types[elem.type] && $.attr(elem.form, 'novalidate') === undefined );
		};
	})()
});

$.webshims.addInputType('email', {
	mismatch: (function(){
		//taken from scott gonzales
		var test = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|(\x22((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?\x22))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;
		return function(val){
			return !test.test(val);
		};
	})()
});

$.webshims.addInputType('url', {
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
	if(e.target && e.target.form && submitterTypes[e.target.type] && $.attr(e.target, 'formnovalidate') !== undefined){
		noValidate.call(e.target);
	}
});

$.webshims.addReady(function(context){
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

(function(){
	
if($.support.validity === true){
	return;
}
$.support.validity = 'shim';
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
				type 	= input[0].getAttribute('type'),
				lastVal = input.val(),
				trigger = function(e){
					//input === null
					if(!input){return;}
					var newVal = input.val();
					
					if(newVal !== lastVal){
						lastVal = newVal;
						if(!e || e.type != 'input'){
							input.trigger('input');
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
			timer = setInterval(trigger, 150);
			setTimeout(trigger, 9);
			input.bind('focusout', unbind).bind('input', trigger);
		}
	;
	$(document)
		.bind('focusin', function(e){
			if( e.target && e.target.type && !e.target.readonly && !e.target.readOnly && !e.target.disabled && elements[(e.target.nodeName || '').toLowerCase()] && !noInputTypes[e.target.type] ){
				observe($(e.target));
			}
		})
	;
})();

$.webshims.createReadyEvent('validity');

}, true); //webshims.ready end



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
		placeholderID 	= 0,
		createPlaceholder = function(elem){
			elem = $(elem);
			var id 			= elem.attr('id'),
				hasLabel	= !!(elem.attr('title') || elem.attr('aria-labeledby')),
				pHolderTxt
			;
			if(!hasLabel && id){
				hasLabel = !!($('label[for='+ id +']', elem[0].form)[0]);
			} else if(!id){
				placeholderID++;
				id = 'input-placeholder-id-'+ placeholderID;
				elem.attr('id', id);
			}
			return $((hasLabel) ? '<span class="placeholder-text"></span>' : '<label for="'+ id +'" class="placeholder-text"></label>');
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

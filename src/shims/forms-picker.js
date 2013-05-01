/**
 * jPicker 1.1.6 modified for webshims
 *
 * jQuery Plugin for Photoshop style color picker
 *
 * Copyright (c) 2010 Christopher T. Tillman
 * Digital Magic Productions, Inc. (http://www.digitalmagicpro.com/)
 * MIT style license, FREE to use, alter, copy, sell, and especially ENHANCE
 *
 * Painstakingly ported from John Dyers' excellent work on his own color picker based on the Prototype framework.
 *
 * John Dyers' website: (http://johndyer.name)
 * Color Picker page:   (http://johndyer.name/post/2007/09/PhotoShop-like-JavaScript-Color-Picker.aspx)
 *
 */ (function ($, version) {
 	if(!window.Modernizr || !('opacity' in Modernizr) || !('csstransitions' in Modernizr)){
		$('html').addClass(('opacity' in document.documentElement.style) ? 'opacity' : 'no-opacity');
	}
	Math.precision = function (value, precision) {
		if (precision === undefined) precision = 0;
		return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
	};
	var elemExtend = function (deep, elem, data) {
		var ex = elem;
		if (elem.nodeType) {
			ex = $.data(elem, 'wsjPicker') || $.data(elem, 'wsjPicker', {});
		}
		if(deep){
			$.extend(true, ex, data);
		} else {
			$.extend(ex, data);
		}
	};
	var Slider = // encapsulate slider functionality for the ColorMap and ColorBar - could be useful to use a jQuery UI draggable for this with certain extensions

	function (bar, options) {
		var $this = this, // private properties, methods, and events - keep these variables and classes invisible to outside code
			arrow = bar.find('img').eq(0), // the arrow image to drag
			minX = 0,
			maxX = 100,
			rangeX = 100,
			minY = 0,
			maxY = 100,
			rangeY = 100,
			x = 0,
			y = 0,
			offset,
			timeout,
			changeEvents = new Array(),
			fireChangeEvents = function (context) {
				for (var i = 0; i < changeEvents.length; i++) changeEvents[i].call($this, $this, context);
			},
			mouseDown = // bind the mousedown to the bar not the arrow for quick snapping to the clicked location

			function (e) {
				var off = bar.offset();
				offset = {
					l: off.left | 0,
					t: off.top | 0
				};
				clearTimeout(timeout);
				timeout = setTimeout( // using setTimeout for visual updates - once the style is updated the browser will re-render internally allowing the next Javascript to run

				function () {
					setValuesFromMousePosition.call($this, e);
				}, 0);
				// Bind mousemove and mouseup event to the document so it responds when dragged of of the bar - we will unbind these when on mouseup to save processing
				$(document).bind('mousemove', mouseMove).bind('mouseup', mouseUp);
				e.preventDefault(); // don't try to select anything or drag the image to the desktop
			},
			mouseMove = // set the values as the mouse moves

			function (e) {
				clearTimeout(timeout);
				timeout = setTimeout(function () {
					setValuesFromMousePosition.call($this, e);
				}, 0);
				e.stopPropagation();
				e.preventDefault();
				return false;
			},
			mouseUp = // unbind the document events - they aren't needed when not dragging

			function (e) {
				$(document).unbind('mouseup', mouseUp).unbind('mousemove', mouseMove);
				e.stopPropagation();
				e.preventDefault();
				return false;
			},
			setValuesFromMousePosition = // calculate mouse position and set value within the current range

			function (e) {
				var locX = e.pageX - offset.l,
					locY = e.pageY - offset.t,
					barW = bar.w, // local copies for YUI compressor
					barH = bar.h;
				// keep the arrow within the bounds of the bar
				if (locX < 0) locX = 0;
				else if (locX > barW) locX = barW;
				if (locY < 0) locY = 0;
				else if (locY > barH) locY = barH;
				val.call($this, 'xy', {
					x: ((locX / barW) * rangeX) + minX,
					y: ((locY / barH) * rangeY) + minY
				});
			},
			drawTimeout,
			draw = function () {
				var arrowOffsetX = 0,
					arrowOffsetY = 0,
					barW = bar.w,
					barH = bar.h,
					arrowW = arrow.w,
					arrowH = arrow.h;
				clearTimeout(drawTimeout);
				drawTimeout = setTimeout(function () {
					if (rangeX > 0) // range is greater than zero
					{
						// constrain to bounds
						if (x == maxX) arrowOffsetX = barW;
						else arrowOffsetX = ((x / rangeX) * barW) | 0;
					}
					if (rangeY > 0) // range is greater than zero
					{
						// constrain to bounds
						if (y == maxY) arrowOffsetY = barH;
						else arrowOffsetY = ((y / rangeY) * barH) | 0;
					}
					// if arrow width is greater than bar width, center arrow and prevent horizontal dragging
					if (arrowW >= barW) arrowOffsetX = (barW >> 1) - (arrowW >> 1); // number >> 1 - superfast bitwise divide by two and truncate (move bits over one bit discarding lowest)
					else arrowOffsetX -= arrowW >> 1;
					// if arrow height is greater than bar height, center arrow and prevent vertical dragging
					if (arrowH >= barH) arrowOffsetY = (barH >> 1) - (arrowH >> 1);
					else arrowOffsetY -= arrowH >> 1;
					// set the arrow position based on these offsets
					arrow.css({
						left: arrowOffsetX + 'px',
						top: arrowOffsetY + 'px'
					});
				}, 0);
			},
			val = function (name, value, context) {
				var set = value !== undefined;
				if (!set) {
					if (name === undefined || name == null) name = 'xy';
					switch (name.toLowerCase()) {
					case 'x':
						return x;
					case 'y':
						return y;
					case 'xy':
					default:
						return {
							x: x,
							y: y
						};
					}
				}
				if (context != null && context == $this) return;
				var changed = false,
					newX,
					newY;
				if (name == null) name = 'xy';
				switch (name.toLowerCase()) {
				case 'x':
					newX = value && (value.x && value.x | 0 || value | 0) || 0;
					break;
				case 'y':
					newY = value && (value.y && value.y | 0 || value | 0) || 0;
					break;
				case 'xy':
				default:
					newX = value && value.x && value.x | 0 || 0;
					newY = value && value.y && value.y | 0 || 0;
					break;
				}
				if (newX != null) {
					if (newX < minX) newX = minX;
					else if (newX > maxX) newX = maxX;
					if (x != newX) {
						x = newX;
						changed = true;
					}
				}
				if (newY != null) {
					if (newY < minY) newY = minY;
					else if (newY > maxY) newY = maxY;
					if (y != newY) {
						y = newY;
						changed = true;
					}
				}
				changed && fireChangeEvents.call($this, context || $this);
			},
			range = function (name, value) {
				var set = value !== undefined;
				if (!set) {
					if (name === undefined || name == null) name = 'all';
					switch (name.toLowerCase()) {
					case 'minx':
						return minX;
					case 'maxx':
						return maxX;
					case 'rangex':
						return {
							minX: minX,
							maxX: maxX,
							rangeX: rangeX
						};
					case 'miny':
						return minY;
					case 'maxy':
						return maxY;
					case 'rangey':
						return {
							minY: minY,
							maxY: maxY,
							rangeY: rangeY
						};
					case 'all':
					default:
						return {
							minX: minX,
							maxX: maxX,
							rangeX: rangeX,
							minY: minY,
							maxY: maxY,
							rangeY: rangeY
						};
					}
				}
				var changed = false,
					newMinX,
					newMaxX,
					newMinY,
					newMaxY;
				if (name == null) name = 'all';
				switch (name.toLowerCase()) {
				case 'minx':
					newMinX = value && (value.minX && value.minX | 0 || value | 0) || 0;
					break;
				case 'maxx':
					newMaxX = value && (value.maxX && value.maxX | 0 || value | 0) || 0;
					break;
				case 'rangex':
					newMinX = value && value.minX && value.minX | 0 || 0;
					newMaxX = value && value.maxX && value.maxX | 0 || 0;
					break;
				case 'miny':
					newMinY = value && (value.minY && value.minY | 0 || value | 0) || 0;
					break;
				case 'maxy':
					newMaxY = value && (value.maxY && value.maxY | 0 || value | 0) || 0;
					break;
				case 'rangey':
					newMinY = value && value.minY && value.minY | 0 || 0;
					newMaxY = value && value.maxY && value.maxY | 0 || 0;
					break;
				case 'all':
				default:
					newMinX = value && value.minX && value.minX | 0 || 0;
					newMaxX = value && value.maxX && value.maxX | 0 || 0;
					newMinY = value && value.minY && value.minY | 0 || 0;
					newMaxY = value && value.maxY && value.maxY | 0 || 0;
					break;
				}
				if (newMinX != null && minX != newMinX) {
					minX = newMinX;
					rangeX = maxX - minX;
				}
				if (newMaxX != null && maxX != newMaxX) {
					maxX = newMaxX;
					rangeX = maxX - minX;
				}
				if (newMinY != null && minY != newMinY) {
					minY = newMinY;
					rangeY = maxY - minY;
				}
				if (newMaxY != null && maxY != newMaxY) {
					maxY = newMaxY;
					rangeY = maxY - minY;
				}
			},
			bind = function (callback) {
				if ($.isFunction(callback)) changeEvents.push(callback);
			},
			unbind = function (callback) {
				if (!$.isFunction(callback)) return;
				var i;
				while ((i = $.inArray(callback, changeEvents)) != -1) changeEvents.splice(i, 1);
			},
			destroy = function () {
				// unbind all possible events and null objects
				$(document).unbind('mouseup', mouseUp).unbind('mousemove', mouseMove);
				bar.unbind('mousedown', mouseDown);
				bar = null;
				arrow = null;
				changeEvents = null;
			};
		
		$.extend(true, $this, // public properties, methods, and event bindings - these we need to access from other controls
		{
			val: val,
			range: range,
			bind: bind,
			unbind: unbind,
			destroy: destroy
		});
		// initialize this control
		arrow.src = options.arrow && options.arrow.image;
		arrow.w = options.arrow && options.arrow.width || arrow.width();
		arrow.h = options.arrow && options.arrow.height || arrow.height();
		bar.w = options.map && options.map.width || bar.width();
		bar.h = options.map && options.map.height || bar.height();
		// bind mousedown event
		bar.bind('mousedown', mouseDown);
		bind.call($this, draw);
	},
		ColorValuePicker = // controls for all the input elements for the typing in color values

		function (picker, color, bindedHex, alphaPrecision) {
			var $this = this, // private properties and methods
				inputs = picker.find('td.Text input'),
				red = inputs.eq(3),
				green = inputs.eq(4),
				blue = inputs.eq(5),
				alpha = inputs.length > 7 ? inputs.eq(6) : null,
				hue = inputs.eq(0),
				saturation = inputs.eq(1),
				value = inputs.eq(2),
				hex = inputs.eq(inputs.length > 7 ? 7 : 6),
				ahex = inputs.length > 7 ? inputs.eq(8) : null,
				keyDown = // input box key down - use arrows to alter color

				function (e) {
					if (e.target.value == '' && e.target != hex.get(0) && (bindedHex != null && e.target != bindedHex.get(0) || bindedHex == null)) return;
					if (!validateKey(e)) return e;
					switch (e.target) {
					case red.get(0):
						switch (e.keyCode) {
						case 38:
							red.val(setValueInRange.call($this, (red.val() << 0) + 1, 0, 255));
							color.val('r', red.val(), e.target);
							return false;
						case 40:
							red.val(setValueInRange.call($this, (red.val() << 0) - 1, 0, 255));
							color.val('r', red.val(), e.target);
							return false;
						}
						break;
					case green.get(0):
						switch (e.keyCode) {
						case 38:
							green.val(setValueInRange.call($this, (green.val() << 0) + 1, 0, 255));
							color.val('g', green.val(), e.target);
							return false;
						case 40:
							green.val(setValueInRange.call($this, (green.val() << 0) - 1, 0, 255));
							color.val('g', green.val(), e.target);
							return false;
						}
						break;
					case blue.get(0):
						switch (e.keyCode) {
						case 38:
							blue.val(setValueInRange.call($this, (blue.val() << 0) + 1, 0, 255));
							color.val('b', blue.val(), e.target);
							return false;
						case 40:
							blue.val(setValueInRange.call($this, (blue.val() << 0) - 1, 0, 255));
							color.val('b', blue.val(), e.target);
							return false;
						}
						break;
					case alpha && alpha.get(0):
						switch (e.keyCode) {
						case 38:
							alpha.val(setValueInRange.call($this, parseFloat(alpha.val()) + 1, 0, 100));
							color.val('a', Math.precision((alpha.val() * 255) / 100, alphaPrecision), e.target);
							return false;
						case 40:
							alpha.val(setValueInRange.call($this, parseFloat(alpha.val()) - 1, 0, 100));
							color.val('a', Math.precision((alpha.val() * 255) / 100, alphaPrecision), e.target);
							return false;
						}
						break;
					case hue.get(0):
						switch (e.keyCode) {
						case 38:
							hue.val(setValueInRange.call($this, (hue.val() << 0) + 1, 0, 360));
							color.val('h', hue.val(), e.target);
							return false;
						case 40:
							hue.val(setValueInRange.call($this, (hue.val() << 0) - 1, 0, 360));
							color.val('h', hue.val(), e.target);
							return false;
						}
						break;
					case saturation.get(0):
						switch (e.keyCode) {
						case 38:
							saturation.val(setValueInRange.call($this, (saturation.val() << 0) + 1, 0, 100));
							color.val('s', saturation.val(), e.target);
							return false;
						case 40:
							saturation.val(setValueInRange.call($this, (saturation.val() << 0) - 1, 0, 100));
							color.val('s', saturation.val(), e.target);
							return false;
						}
						break;
					case value.get(0):
						switch (e.keyCode) {
						case 38:
							value.val(setValueInRange.call($this, (value.val() << 0) + 1, 0, 100));
							color.val('v', value.val(), e.target);
							return false;
						case 40:
							value.val(setValueInRange.call($this, (value.val() << 0) - 1, 0, 100));
							color.val('v', value.val(), e.target);
							return false;
						}
						break;
					}
				},
				keyUp = // input box key up - validate value and set color

				function (e) {
					if (e.target.value == '' && e.target != hex.get(0) && (bindedHex != null && e.target != bindedHex.get(0) || bindedHex == null)) return;
					if (!validateKey(e)) return e;
					switch (e.target) {
					case red.get(0):
						red.val(setValueInRange.call($this, red.val(), 0, 255));
						color.val('r', red.val(), e.target);
						break;
					case green.get(0):
						green.val(setValueInRange.call($this, green.val(), 0, 255));
						color.val('g', green.val(), e.target);
						break;
					case blue.get(0):
						blue.val(setValueInRange.call($this, blue.val(), 0, 255));
						color.val('b', blue.val(), e.target);
						break;
					case alpha && alpha.get(0):
						alpha.val(setValueInRange.call($this, alpha.val(), 0, 100));
						color.val('a', Math.precision((alpha.val() * 255) / 100, alphaPrecision), e.target);
						break;
					case hue.get(0):
						hue.val(setValueInRange.call($this, hue.val(), 0, 360));
						color.val('h', hue.val(), e.target);
						break;
					case saturation.get(0):
						saturation.val(setValueInRange.call($this, saturation.val(), 0, 100));
						color.val('s', saturation.val(), e.target);
						break;
					case value.get(0):
						value.val(setValueInRange.call($this, value.val(), 0, 100));
						color.val('v', value.val(), e.target);
						break;
					case hex.get(0):
						hex.val(hex.val().replace(/[^a-fA-F0-9]/g, '').toLowerCase().substring(0, 6));
						bindedHex && bindedHex.val(hex.val());
						color.val('hex', hex.val() != '' ? hex.val() : null, e.target);
						break;
					case bindedHex && bindedHex.get(0):
						bindedHex.val(bindedHex.val().replace(/[^a-fA-F0-9]/g, '').toLowerCase().substring(0, 6));
						hex.val(bindedHex.val());
						color.val('hex', bindedHex.val() != '' ? bindedHex.val() : null, e.target);
						break;
					case ahex && ahex.get(0):
						ahex.val(ahex.val().replace(/[^a-fA-F0-9]/g, '').toLowerCase().substring(0, 2));
						color.val('a', ahex.val() != null ? parseInt(ahex.val(), 16) : null, e.target);
						break;
					}
				},
				blur = // input box blur - reset to original if value empty

				function (e) {
					if (color.val() != null) {
						switch (e.target) {
						case red.get(0):
							red.val(color.val('r'));
							break;
						case green.get(0):
							green.val(color.val('g'));
							break;
						case blue.get(0):
							blue.val(color.val('b'));
							break;
						case alpha && alpha.get(0):
							alpha.val(Math.precision((color.val('a') * 100) / 255, alphaPrecision));
							break;
						case hue.get(0):
							hue.val(color.val('h'));
							break;
						case saturation.get(0):
							saturation.val(color.val('s'));
							break;
						case value.get(0):
							value.val(color.val('v'));
							break;
						case hex.get(0):
						case bindedHex && bindedHex.get(0):
							hex.val(color.val('hex'));
							bindedHex && bindedHex.val(color.val('hex'));
							break;
						case ahex && ahex.get(0):
							ahex.val(color.val('ahex').substring(6));
							break;
						}
					}
				},
				validateKey = // validate key

				function (e) {
					switch (e.keyCode) {
					case 9:
					case 16:
					case 29:
					case 37:
					case 39:
						return false;
					case 'c'.charCodeAt():
					case 'v'.charCodeAt():
						if (e.ctrlKey) return false;
					}
					return true;
				},
				setValueInRange = // constrain value within range

				function (value, min, max) {
					if (value == '' || isNaN(value)) return min;
					if (value > max) return max;
					if (value < min) return min;
					return value;
				},
				colorChanged = function (ui, context) {
					var all = ui.val('all');
					if (context != red.get(0)) red.val(all != null ? all.r : '');
					if (context != green.get(0)) green.val(all != null ? all.g : '');
					if (context != blue.get(0)) blue.val(all != null ? all.b : '');
					if (alpha && context != alpha.get(0)) alpha.val(all != null ? Math.precision((all.a * 100) / 255, alphaPrecision) : '');
					if (context != hue.get(0)) hue.val(all != null ? all.h : '');
					if (context != saturation.get(0)) saturation.val(all != null ? all.s : '');
					if (context != value.get(0)) value.val(all != null ? all.v : '');
					if (context != hex.get(0) && (bindedHex && context != bindedHex.get(0) || !bindedHex)) hex.val(all != null ? all.hex : '');
					if (bindedHex && context != bindedHex.get(0) && context != hex.get(0)) bindedHex.val(all != null ? all.hex : '');
					if (ahex && context != ahex.get(0)) ahex.val(all != null ? all.ahex.substring(6) : '');
				},
				destroy = function () {
					// unbind all events and null objects
					red.add(green).add(blue).add(alpha).add(hue).add(saturation).add(value).add(hex).add(bindedHex).add(ahex).unbind('keyup', keyUp).unbind('blur', blur);
					red.add(green).add(blue).add(alpha).add(hue).add(saturation).add(value).unbind('keydown', keyDown);
					color.unbind(colorChanged);
					red = null;
					green = null;
					blue = null;
					alpha = null;
					hue = null;
					saturation = null;
					value = null;
					hex = null;
					ahex = null;
				};
			elemExtend(true, $this, // public properties and methods
			{
				destroy: destroy
			});
			red.add(green).add(blue).add(alpha).add(hue).add(saturation).add(value).add(hex).add(bindedHex).add(ahex).bind('keyup', keyUp).bind('blur', blur);
			red.add(green).add(blue).add(alpha).add(hue).add(saturation).add(value).bind('keydown', keyDown);
			color.bind(colorChanged);
		};
	$.wsjPicker = {
		List: [], // array holding references to each active instance of the control
		Color: // color object - we will be able to assign by any color space type or retrieve any color space info
		// we want this public so we can optionally assign new color objects to initial values using inputs other than a string hex value (also supported)

		function (init) {
			var $this = this,
				r,
				g,
				b,
				a,
				h,
				s,
				v,
				changeEvents = new Array(),
				fireChangeEvents = function (context) {
					for (var i = 0; i < changeEvents.length; i++) changeEvents[i].call($this, $this, context);
				},
				val = function (name, value, context) {
					var set = value !== undefined;
					if (!set) {
						if (name === undefined || name == null || name == '') name = 'all';
						if (r == null) return null;
						switch (name.toLowerCase()) {
						case 'ahex':
							return ColorMethods.rgbaToHex({
								r: r,
								g: g,
								b: b,
								a: a
							});
						case 'hex':
							return val('ahex').substring(0, 6);
						case 'all':
							return {
								r: r,
								g: g,
								b: b,
								a: a,
								h: h,
								s: s,
								v: v,
								hex: val.call($this, 'hex'),
								ahex: val.call($this, 'ahex')
							};
						default:
							var ret = {};
							for (var i = 0; i < name.length; i++) {
								switch (name.charAt(i)) {
								case 'r':
									if (name.length == 1) ret = r;
									else ret.r = r;
									break;
								case 'g':
									if (name.length == 1) ret = g;
									else ret.g = g;
									break;
								case 'b':
									if (name.length == 1) ret = b;
									else ret.b = b;
									break;
								case 'a':
									if (name.length == 1) ret = a;
									else ret.a = a;
									break;
								case 'h':
									if (name.length == 1) ret = h;
									else ret.h = h;
									break;
								case 's':
									if (name.length == 1) ret = s;
									else ret.s = s;
									break;
								case 'v':
									if (name.length == 1) ret = v;
									else ret.v = v;
									break;
								}
							}
							return ret == {} ? val.call($this, 'all') : ret;
							break;
						}
					}
					if (context != null && context == $this) return;
					var changed = false;
					if (name == null) name = '';
					if (value == null) {
						if (r != null) {
							r = null;
							changed = true;
						}
						if (g != null) {
							g = null;
							changed = true;
						}
						if (b != null) {
							b = null;
							changed = true;
						}
						if (a != null) {
							a = null;
							changed = true;
						}
						if (h != null) {
							h = null;
							changed = true;
						}
						if (s != null) {
							s = null;
							changed = true;
						}
						if (v != null) {
							v = null;
							changed = true;
						}
						changed && fireChangeEvents.call($this, context || $this);
						return;
					}
					switch (name.toLowerCase()) {
					case 'ahex':
					case 'hex':
						var ret = ColorMethods.hexToRgba(value && (value.ahex || value.hex) || value || '00000000');
						val.call($this, 'rgba', {
							r: ret.r,
							g: ret.g,
							b: ret.b,
							a: name == 'ahex' ? ret.a : a != null ? a : 255
						}, context);
						break;
					default:
						if (value && (value.ahex != null || value.hex != null)) {
							val.call($this, 'ahex', value.ahex || value.hex || '00000000', context);
							return;
						}
						var newV = {}, rgb = false,
							hsv = false;
						if (value.r !== undefined && !name.indexOf('r') == -1) name += 'r';
						if (value.g !== undefined && !name.indexOf('g') == -1) name += 'g';
						if (value.b !== undefined && !name.indexOf('b') == -1) name += 'b';
						if (value.a !== undefined && !name.indexOf('a') == -1) name += 'a';
						if (value.h !== undefined && !name.indexOf('h') == -1) name += 'h';
						if (value.s !== undefined && !name.indexOf('s') == -1) name += 's';
						if (value.v !== undefined && !name.indexOf('v') == -1) name += 'v';
						for (var i = 0; i < name.length; i++) {
							switch (name.charAt(i)) {
							case 'r':
								if (hsv) continue;
								rgb = true;
								newV.r = value && value.r && value.r | 0 || value && value | 0 || 0;
								if (newV.r < 0) newV.r = 0;
								else if (newV.r > 255) newV.r = 255;
								if (r != newV.r) {
									r = newV.r;
									changed = true;
								}
								break;
							case 'g':
								if (hsv) continue;
								rgb = true;
								newV.g = value && value.g && value.g | 0 || value && value | 0 || 0;
								if (newV.g < 0) newV.g = 0;
								else if (newV.g > 255) newV.g = 255;
								if (g != newV.g) {
									g = newV.g;
									changed = true;
								}
								break;
							case 'b':
								if (hsv) continue;
								rgb = true;
								newV.b = value && value.b && value.b | 0 || value && value | 0 || 0;
								if (newV.b < 0) newV.b = 0;
								else if (newV.b > 255) newV.b = 255;
								if (b != newV.b) {
									b = newV.b;
									changed = true;
								}
								break;
							case 'a':
								newV.a = value && value.a != null ? value.a | 0 : value != null ? value | 0 : 255;
								if (newV.a < 0) newV.a = 0;
								else if (newV.a > 255) newV.a = 255;
								if (a != newV.a) {
									a = newV.a;
									changed = true;
								}
								break;
							case 'h':
								if (rgb) continue;
								hsv = true;
								newV.h = value && value.h && value.h | 0 || value && value | 0 || 0;
								if (newV.h < 0) newV.h = 0;
								else if (newV.h > 360) newV.h = 360;
								if (h != newV.h) {
									h = newV.h;
									changed = true;
								}
								break;
							case 's':
								if (rgb) continue;
								hsv = true;
								newV.s = value && value.s != null ? value.s | 0 : value != null ? value | 0 : 100;
								if (newV.s < 0) newV.s = 0;
								else if (newV.s > 100) newV.s = 100;
								if (s != newV.s) {
									s = newV.s;
									changed = true;
								}
								break;
							case 'v':
								if (rgb) continue;
								hsv = true;
								newV.v = value && value.v != null ? value.v | 0 : value != null ? value | 0 : 100;
								if (newV.v < 0) newV.v = 0;
								else if (newV.v > 100) newV.v = 100;
								if (v != newV.v) {
									v = newV.v;
									changed = true;
								}
								break;
							}
						}
						if (changed) {
							if (rgb) {
								r = r || 0;
								g = g || 0;
								b = b || 0;
								var ret = ColorMethods.rgbToHsv({
									r: r,
									g: g,
									b: b
								});
								h = ret.h;
								s = ret.s;
								v = ret.v;
							} else if (hsv) {
								h = h || 0;
								s = s != null ? s : 100;
								v = v != null ? v : 100;
								var ret = ColorMethods.hsvToRgb({
									h: h,
									s: s,
									v: v
								});
								r = ret.r;
								g = ret.g;
								b = ret.b;
							}
							a = a != null ? a : 255;
							fireChangeEvents.call($this, context || $this);
						}
						break;
					}
				},
				bind = function (callback) {
					if ($.isFunction(callback)) changeEvents.push(callback);
				},
				unbind = function (callback) {
					if (!$.isFunction(callback)) return;
					var i;
					while ((i = $.inArray(callback, changeEvents)) != -1) changeEvents.splice(i, 1);
				},
				destroy = function () {
					changeEvents = null;
				}
			elemExtend(true, $this, // public properties and methods
			{
				val: val,
				bind: bind,
				unbind: unbind,
				destroy: destroy
			});
			if (init) {
				if (init.ahex != null) val('ahex', init);
				else if (init.hex != null) val((init.a != null ? 'a' : '') + 'hex', init.a != null ? {
						ahex: init.hex + ColorMethods.intToHex(init.a)
					} : init);
				else if (init.r != null && init.g != null && init.b != null) val('rgb' + (init.a != null ? 'a' : ''), init);
				else if (init.h != null && init.s != null && init.v != null) val('hsv' + (init.a != null ? 'a' : ''), init);
			}
		},
		ColorMethods: // color conversion methods  - make public to give use to external scripts
		{
			hexToRgba: function (hex) {
				hex = this.validateHex(hex);
				if (hex == '') return {
						r: null,
						g: null,
						b: null,
						a: null
				};
				var r = '00',
					g = '00',
					b = '00',
					a = '255';
				if (hex.length == 6) hex += 'ff';
				if (hex.length > 6) {
					r = hex.substring(0, 2);
					g = hex.substring(2, 4);
					b = hex.substring(4, 6);
					a = hex.substring(6, hex.length);
				} else {
					if (hex.length > 4) {
						r = hex.substring(4, hex.length);
						hex = hex.substring(0, 4);
					}
					if (hex.length > 2) {
						g = hex.substring(2, hex.length);
						hex = hex.substring(0, 2);
					}
					if (hex.length > 0) b = hex.substring(0, hex.length);
				}
				return {
					r: this.hexToInt(r),
					g: this.hexToInt(g),
					b: this.hexToInt(b),
					a: this.hexToInt(a)
				};
			},
			validateHex: function (hex) {
				hex = hex.toLowerCase().replace(/[^a-f0-9]/g, '');
				if (hex.length > 8) hex = hex.substring(0, 8);
				return hex;
			},
			rgbaToHex: function (rgba) {
				return this.intToHex(rgba.r) + this.intToHex(rgba.g) + this.intToHex(rgba.b) + this.intToHex(rgba.a);
			},
			intToHex: function (dec) {
				var result = (dec | 0).toString(16);
				if (result.length == 1) result = ('0' + result);
				return result.toLowerCase();
			},
			hexToInt: function (hex) {
				return parseInt(hex, 16);
			},
			rgbToHsv: function (rgb) {
				var r = rgb.r / 255,
					g = rgb.g / 255,
					b = rgb.b / 255,
					hsv = {
						h: 0,
						s: 0,
						v: 0
					}, min = 0,
					max = 0,
					delta;
				if (r >= g && r >= b) {
					max = r;
					min = g > b ? b : g;
				} else if (g >= b && g >= r) {
					max = g;
					min = r > b ? b : r;
				} else {
					max = b;
					min = g > r ? r : g;
				}
				hsv.v = max;
				hsv.s = max ? (max - min) / max : 0;
				if (!hsv.s) hsv.h = 0;
				else {
					delta = max - min;
					if (r == max) hsv.h = (g - b) / delta;
					else if (g == max) hsv.h = 2 + (b - r) / delta;
					else hsv.h = 4 + (r - g) / delta;
					hsv.h = parseInt(hsv.h * 60);
					if (hsv.h < 0) hsv.h += 360;
				}
				hsv.s = (hsv.s * 100) | 0;
				hsv.v = (hsv.v * 100) | 0;
				return hsv;
			},
			hsvToRgb: function (hsv) {
				var rgb = {
					r: 0,
					g: 0,
					b: 0,
					a: 100
				}, h = hsv.h,
					s = hsv.s,
					v = hsv.v;
				if (s == 0) {
					if (v == 0) rgb.r = rgb.g = rgb.b = 0;
					else rgb.r = rgb.g = rgb.b = (v * 255 / 100) | 0;
				} else {
					if (h == 360) h = 0;
					h /= 60;
					s = s / 100;
					v = v / 100;
					var i = h | 0,
						f = h - i,
						p = v * (1 - s),
						q = v * (1 - (s * f)),
						t = v * (1 - (s * (1 - f)));
					switch (i) {
					case 0:
						rgb.r = v;
						rgb.g = t;
						rgb.b = p;
						break;
					case 1:
						rgb.r = q;
						rgb.g = v;
						rgb.b = p;
						break;
					case 2:
						rgb.r = p;
						rgb.g = v;
						rgb.b = t;
						break;
					case 3:
						rgb.r = p;
						rgb.g = q;
						rgb.b = v;
						break;
					case 4:
						rgb.r = t;
						rgb.g = p;
						rgb.b = v;
						break;
					case 5:
						rgb.r = v;
						rgb.g = p;
						rgb.b = q;
						break;
					}
					rgb.r = (rgb.r * 255) | 0;
					rgb.g = (rgb.g * 255) | 0;
					rgb.b = (rgb.b * 255) | 0;
				}
				return rgb;
			}
		}
	};
	var Color = $.wsjPicker.Color,
		List = $.wsjPicker.List,
		ColorMethods = $.wsjPicker.ColorMethods; // local copies for YUI compressor
	$.fn.wsjPicker = function (options) {
		var $arguments = arguments;
		return this.each(function () {
			var $this = this,
				settings = $.extend(true, {}, $.fn.wsjPicker.defaults, options); // local copies for YUI compressor
			
			settings.window.liveUpdate = false; // Basic control binding for inline use - You will need to override the liveCallback or commitCallback function to retrieve results
			var container = null,
				colorMapDiv = null,
				colorBarDiv = null,
				colorMapL1 = null, // different layers of colorMap and colorBar
				colorMapL2 = null,
				colorMapL3 = null,
				colorBarL1 = null,
				colorBarL2 = null,
				colorBarL3 = null,
				colorBarL4 = null,
				colorBarL5 = null,
				colorBarL6 = null,
				colorMap = null, // color maps
				colorBar = null,
				colorPicker = null,
				elementStartX = null, // Used to record the starting css positions for dragging the control
				elementStartY = null,
				pageStartX = null, // Used to record the mousedown coordinates for dragging the control
				pageStartY = null,
				activePreview = null, // color boxes above the radio buttons
				currentPreview = null,
				okButton = null,
				cancelButton = null,
				grid = null, // preset colors grid
				moveBar = null, // drag bar
				setColorMode = // set color mode and update visuals for the new color mode

				function (colorMode) {
					var active = color.active, // local copies for YUI compressor
						clientPath = images.clientPath,
						hex = active.val('hex'),
						rgbMap,
						rgbBar;
					settings.color.mode = colorMode;
					switch (colorMode) {
					case 'h':
						setTimeout(function () {
							setBG.call($this, colorMapDiv, 'transparent');
							setImgLoc.call($this, colorMapL1, 0);
							setAlpha.call($this, colorMapL1, 100);
							setImgLoc.call($this, colorMapL2, 260);
							setAlpha.call($this, colorMapL2, 100);
							setBG.call($this, colorBarDiv, 'transparent');
							setImgLoc.call($this, colorBarL1, 0);
							setAlpha.call($this, colorBarL1, 100);
							setImgLoc.call($this, colorBarL2, 260);
							setAlpha.call($this, colorBarL2, 100);
							setImgLoc.call($this, colorBarL3, 260);
							setAlpha.call($this, colorBarL3, 100);
							setImgLoc.call($this, colorBarL4, 260);
							setAlpha.call($this, colorBarL4, 100);
							setImgLoc.call($this, colorBarL6, 260);
							setAlpha.call($this, colorBarL6, 100);
						}, 0);
						colorMap.range('all', {
							minX: 0,
							maxX: 100,
							minY: 0,
							maxY: 100
						});
						colorBar.range('rangeY', {
							minY: 0,
							maxY: 360
						});
						if (active.val('ahex') == null) break;
						colorMap.val('xy', {
							x: active.val('s'),
							y: 100 - active.val('v')
						}, colorMap);
						colorBar.val('y', 360 - active.val('h'), colorBar);
						break;
					case 's':
						setTimeout(function () {
							setBG.call($this, colorMapDiv, 'transparent');
							setImgLoc.call($this, colorMapL1, -260);
							setImgLoc.call($this, colorMapL2, -520);
							setImgLoc.call($this, colorBarL1, -260);
							setImgLoc.call($this, colorBarL2, -520);
							setImgLoc.call($this, colorBarL6, 260);
							setAlpha.call($this, colorBarL6, 100);
						}, 0);
						colorMap.range('all', {
							minX: 0,
							maxX: 360,
							minY: 0,
							maxY: 100
						});
						colorBar.range('rangeY', {
							minY: 0,
							maxY: 100
						});
						if (active.val('ahex') == null) break;
						colorMap.val('xy', {
							x: active.val('h'),
							y: 100 - active.val('v')
						}, colorMap);
						colorBar.val('y', 100 - active.val('s'), colorBar);
						break;
					case 'v':
						setTimeout(function () {
							setBG.call($this, colorMapDiv, '000000');
							setImgLoc.call($this, colorMapL1, -780);
							setImgLoc.call($this, colorMapL2, 260);
							setBG.call($this, colorBarDiv, hex);
							setImgLoc.call($this, colorBarL1, -520);
							setImgLoc.call($this, colorBarL2, 260);
							setAlpha.call($this, colorBarL2, 100);
							setImgLoc.call($this, colorBarL6, 260);
							setAlpha.call($this, colorBarL6, 100);
						}, 0);
						colorMap.range('all', {
							minX: 0,
							maxX: 360,
							minY: 0,
							maxY: 100
						});
						colorBar.range('rangeY', {
							minY: 0,
							maxY: 100
						});
						if (active.val('ahex') == null) break;
						colorMap.val('xy', {
							x: active.val('h'),
							y: 100 - active.val('s')
						}, colorMap);
						colorBar.val('y', 100 - active.val('v'), colorBar);
						break;
					case 'r':
						rgbMap = -1040;
						rgbBar = -780;
						colorMap.range('all', {
							minX: 0,
							maxX: 255,
							minY: 0,
							maxY: 255
						});
						colorBar.range('rangeY', {
							minY: 0,
							maxY: 255
						});
						if (active.val('ahex') == null) break;
						colorMap.val('xy', {
							x: active.val('b'),
							y: 255 - active.val('g')
						}, colorMap);
						colorBar.val('y', 255 - active.val('r'), colorBar);
						break;
					case 'g':
						rgbMap = -1560;
						rgbBar = -1820;
						colorMap.range('all', {
							minX: 0,
							maxX: 255,
							minY: 0,
							maxY: 255
						});
						colorBar.range('rangeY', {
							minY: 0,
							maxY: 255
						});
						if (active.val('ahex') == null) break;
						colorMap.val('xy', {
							x: active.val('b'),
							y: 255 - active.val('r')
						}, colorMap);
						colorBar.val('y', 255 - active.val('g'), colorBar);
						break;
					case 'b':
						rgbMap = -2080;
						rgbBar = -2860;
						colorMap.range('all', {
							minX: 0,
							maxX: 255,
							minY: 0,
							maxY: 255
						});
						colorBar.range('rangeY', {
							minY: 0,
							maxY: 255
						});
						if (active.val('ahex') == null) break;
						colorMap.val('xy', {
							x: active.val('r'),
							y: 255 - active.val('g')
						}, colorMap);
						colorBar.val('y', 255 - active.val('b'), colorBar);
						break;
					case 'a':
						setTimeout(function () {
							setBG.call($this, colorMapDiv, 'transparent');
							setImgLoc.call($this, colorMapL1, -260);
							setImgLoc.call($this, colorMapL2, -520);
							setImgLoc.call($this, colorBarL1, 260);
							setImgLoc.call($this, colorBarL2, 260);
							setAlpha.call($this, colorBarL2, 100);
							setImgLoc.call($this, colorBarL6, 0);
							setAlpha.call($this, colorBarL6, 100);
						}, 0);
						colorMap.range('all', {
							minX: 0,
							maxX: 360,
							minY: 0,
							maxY: 100
						});
						colorBar.range('rangeY', {
							minY: 0,
							maxY: 255
						});
						if (active.val('ahex') == null) break;
						colorMap.val('xy', {
							x: active.val('h'),
							y: 100 - active.val('v')
						}, colorMap);
						colorBar.val('y', 255 - active.val('a'), colorBar);
						break;
					default:
						throw ('Invalid Mode');
						break;
					}
					switch (colorMode) {
					case 'h':
						break;
					case 's':
					case 'v':
					case 'a':
						setTimeout(function () {
							setAlpha.call($this, colorMapL1, 100);
							setAlpha.call($this, colorBarL1, 100);
							setImgLoc.call($this, colorBarL3, 260);
							setAlpha.call($this, colorBarL3, 100);
							setImgLoc.call($this, colorBarL4, 260);
							setAlpha.call($this, colorBarL4, 100);
						}, 0);
						break;
					case 'r':
					case 'g':
					case 'b':
						setTimeout(function () {
							setBG.call($this, colorMapDiv, 'transparent');
							setBG.call($this, colorBarDiv, 'transparent');
							setAlpha.call($this, colorBarL1, 100);
							setAlpha.call($this, colorMapL1, 100);
							setImgLoc.call($this, colorMapL1, rgbMap);
							setImgLoc.call($this, colorMapL2, rgbMap - 260);
							setImgLoc.call($this, colorBarL1, rgbBar - 780);
							setImgLoc.call($this, colorBarL2, rgbBar - 520);
							setImgLoc.call($this, colorBarL3, rgbBar);
							setImgLoc.call($this, colorBarL4, rgbBar - 260);
							setImgLoc.call($this, colorBarL6, 260);
							setAlpha.call($this, colorBarL6, 100);
						}, 0);
						break;
					}
					if (active.val('ahex') == null) return;
					activeColorChanged.call($this, active);
				},
				activeColorChanged = // Update color when user changes text values

				function (ui, context) {
					if (context == null || (context != colorBar && context != colorMap)) positionMapAndBarArrows.call($this, ui, context);
					setTimeout(function () {
						updatePreview.call($this, ui);
						updateMapVisuals.call($this, ui);
						updateBarVisuals.call($this, ui);
					}, 0);
				},
				mapValueChanged = // user has dragged the ColorMap pointer

				function (ui, context) {
					var active = color.active;
					if (context != colorMap && active.val() == null) return;
					var xy = ui.val('all');
					switch (settings.color.mode) {
					case 'h':
						active.val('sv', {
							s: xy.x,
							v: 100 - xy.y
						}, context);
						break;
					case 's':
					case 'a':
						active.val('hv', {
							h: xy.x,
							v: 100 - xy.y
						}, context);
						break;
					case 'v':
						active.val('hs', {
							h: xy.x,
							s: 100 - xy.y
						}, context);
						break;
					case 'r':
						active.val('gb', {
							g: 255 - xy.y,
							b: xy.x
						}, context);
						break;
					case 'g':
						active.val('rb', {
							r: 255 - xy.y,
							b: xy.x
						}, context);
						break;
					case 'b':
						active.val('rg', {
							r: xy.x,
							g: 255 - xy.y
						}, context);
						break;
					}
				},
				colorBarValueChanged = // user has dragged the ColorBar slider

				function (ui, context) {
					var active = color.active;
					if (context != colorBar && active.val() == null) return;
					switch (settings.color.mode) {
					case 'h':
						active.val('h', {
							h: 360 - ui.val('y')
						}, context);
						break;
					case 's':
						active.val('s', {
							s: 100 - ui.val('y')
						}, context);
						break;
					case 'v':
						active.val('v', {
							v: 100 - ui.val('y')
						}, context);
						break;
					case 'r':
						active.val('r', {
							r: 255 - ui.val('y')
						}, context);
						break;
					case 'g':
						active.val('g', {
							g: 255 - ui.val('y')
						}, context);
						break;
					case 'b':
						active.val('b', {
							b: 255 - ui.val('y')
						}, context);
						break;
					case 'a':
						active.val('a', 255 - ui.val('y'), context);
						break;
					}
				},
				positionMapAndBarArrows = // position map and bar arrows to match current color

				function (ui, context) {
					if (context != colorMap) {
						switch (settings.color.mode) {
						case 'h':
							var sv = ui.val('sv');
							colorMap.val('xy', {
								x: sv != null ? sv.s : 100,
								y: 100 - (sv != null ? sv.v : 100)
							}, context);
							break;
						case 's':
						case 'a':
							var hv = ui.val('hv');
							colorMap.val('xy', {
								x: hv && hv.h || 0,
								y: 100 - (hv != null ? hv.v : 100)
							}, context);
							break;
						case 'v':
							var hs = ui.val('hs');
							colorMap.val('xy', {
								x: hs && hs.h || 0,
								y: 100 - (hs != null ? hs.s : 100)
							}, context);
							break;
						case 'r':
							var bg = ui.val('bg');
							colorMap.val('xy', {
								x: bg && bg.b || 0,
								y: 255 - (bg && bg.g || 0)
							}, context);
							break;
						case 'g':
							var br = ui.val('br');
							colorMap.val('xy', {
								x: br && br.b || 0,
								y: 255 - (br && br.r || 0)
							}, context);
							break;
						case 'b':
							var rg = ui.val('rg');
							colorMap.val('xy', {
								x: rg && rg.r || 0,
								y: 255 - (rg && rg.g || 0)
							}, context);
							break;
						}
					}
					if (context != colorBar) {
						switch (settings.color.mode) {
						case 'h':
							colorBar.val('y', 360 - (ui.val('h') || 0), context);
							break;
						case 's':
							var s = ui.val('s');
							colorBar.val('y', 100 - (s != null ? s : 100), context);
							break;
						case 'v':
							var v = ui.val('v');
							colorBar.val('y', 100 - (v != null ? v : 100), context);
							break;
						case 'r':
							colorBar.val('y', 255 - (ui.val('r') || 0), context);
							break;
						case 'g':
							colorBar.val('y', 255 - (ui.val('g') || 0), context);
							break;
						case 'b':
							colorBar.val('y', 255 - (ui.val('b') || 0), context);
							break;
						case 'a':
							var a = ui.val('a');
							colorBar.val('y', 255 - (a != null ? a : 255), context);
							break;
						}
					}
				},
				updatePreview = function (ui) {
					try {
						var all = ui.val('all');
						activePreview.css({
							backgroundColor: all && '#' + all.hex || 'transparent'
						});
						setAlpha.call($this, activePreview, all && Math.precision((all.a * 100) / 255, 4) || 0);
					} catch (e) {}
				},
				updateMapVisuals = function (ui) {
					switch (settings.color.mode) {
					case 'h':
						setBG.call($this, colorMapDiv, new Color({
							h: ui.val('h') || 0,
							s: 100,
							v: 100
						}).val('hex'));
						break;
					case 's':
					case 'a':
						var s = ui.val('s');
						setAlpha.call($this, colorMapL2, 100 - (s != null ? s : 100));
						break;
					case 'v':
						var v = ui.val('v');
						setAlpha.call($this, colorMapL1, v != null ? v : 100);
						break;
					case 'r':
						setAlpha.call($this, colorMapL2, Math.precision((ui.val('r') || 0) / 255 * 100, 4));
						break;
					case 'g':
						setAlpha.call($this, colorMapL2, Math.precision((ui.val('g') || 0) / 255 * 100, 4));
						break;
					case 'b':
						setAlpha.call($this, colorMapL2, Math.precision((ui.val('b') || 0) / 255 * 100));
						break;
					}
					var a = ui.val('a');
					setAlpha.call($this, colorMapL3, Math.precision(((255 - (a || 0)) * 100) / 255, 4));
				},
				updateBarVisuals = function (ui) {
					switch (settings.color.mode) {
					case 'h':
						var a = ui.val('a');
						setAlpha.call($this, colorBarL5, Math.precision(((255 - (a || 0)) * 100) / 255, 4));
						break;
					case 's':
						var hva = ui.val('hva'),
							saturatedColor = new Color({
								h: hva && hva.h || 0,
								s: 100,
								v: hva != null ? hva.v : 100
							});
						setBG.call($this, colorBarDiv, saturatedColor.val('hex'));
						setAlpha.call($this, colorBarL2, 100 - (hva != null ? hva.v : 100));
						setAlpha.call($this, colorBarL5, Math.precision(((255 - (hva && hva.a || 0)) * 100) / 255, 4));
						break;
					case 'v':
						var hsa = ui.val('hsa'),
							valueColor = new Color({
								h: hsa && hsa.h || 0,
								s: hsa != null ? hsa.s : 100,
								v: 100
							});
						setBG.call($this, colorBarDiv, valueColor.val('hex'));
						setAlpha.call($this, colorBarL5, Math.precision(((255 - (hsa && hsa.a || 0)) * 100) / 255, 4));
						break;
					case 'r':
					case 'g':
					case 'b':
						var hValue = 0,
							vValue = 0,
							rgba = ui.val('rgba');
						if (settings.color.mode == 'r') {
							hValue = rgba && rgba.b || 0;
							vValue = rgba && rgba.g || 0;
						} else if (settings.color.mode == 'g') {
							hValue = rgba && rgba.b || 0;
							vValue = rgba && rgba.r || 0;
						} else if (settings.color.mode == 'b') {
							hValue = rgba && rgba.r || 0;
							vValue = rgba && rgba.g || 0;
						}
						var middle = vValue > hValue ? hValue : vValue;
						setAlpha.call($this, colorBarL2, hValue > vValue ? Math.precision(((hValue - vValue) / (255 - vValue)) * 100, 4) : 0);
						setAlpha.call($this, colorBarL3, vValue > hValue ? Math.precision(((vValue - hValue) / (255 - hValue)) * 100, 4) : 0);
						setAlpha.call($this, colorBarL4, Math.precision((middle / 255) * 100, 4));
						setAlpha.call($this, colorBarL5, Math.precision(((255 - (rgba && rgba.a || 0)) * 100) / 255, 4));
						break;
					case 'a':
						var a = ui.val('a');
						setBG.call($this, colorBarDiv, ui.val('hex') || '000000');
						setAlpha.call($this, colorBarL5, a != null ? 0 : 100);
						setAlpha.call($this, colorBarL6, a != null ? 100 : 0);
						break;
					}
				},
				setBG = function (el, c) {
					el.css({
						backgroundColor: c && c.length == 6 && '#' + c || 'transparent'
					});
				},
				setImg = function (img, src) {
					img.css({
						backgroundImage: 'url(\'' + src + '\')'
					});
				},
				setImgLoc = function (img, y) {
					img.css({
						top: y + 'px'
					});
				},
				setAlpha = function (obj, alpha) {
					obj.css({
						visibility: alpha > 0 ? 'visible' : 'hidden'
					});
					if (alpha > 0 && alpha < 100) {
						obj.css({
							opacity: Math.precision(alpha / 100, 4)
						});
					} else if (alpha == 0 || alpha == 100) {
						obj.css({
								opacity: ''
							});
					}
				},
				revertColor = // revert color to original color when opened

				function () {
					color.active.val('ahex', color.current.val('ahex'));
				},
				commitColor = // commit the color changes

				function () {
					color.current.val('ahex', color.active.val('ahex'));
				},
				radioClicked = function (e) {
					container.find('input[type="radio"][value!="' + e.target.value + '"]').prop('checked', false);
					setColorMode.call($this, e.target.value);
				},
				currentClicked = function () {
					revertColor.call($this);
				},
				cancelClicked = function () {
					revertColor.call($this);
					$.isFunction(cancelCallback) && cancelCallback.call($this, color.active, cancelButton);
				},
				okClicked = function () {
					commitColor.call($this);
					$.isFunction(commitCallback) && commitCallback.call($this, color.active, okButton);
				},
				currentColorChanged = function (ui, context) {
					var hex = ui.val('hex');
					currentPreview.css({
						backgroundColor: hex && '#' + hex || 'transparent'
					});
					setAlpha.call($this, currentPreview, Math.precision(((ui.val('a') || 0) * 100) / 255, 4));
				},
				moveBarMouseDown = function (e) {
					elementStartX = parseInt(container.css('left'), 10) || 0;
					elementStartY = parseInt(container.css('top'), 10) || 0;
					pageStartX = e.pageX;
					pageStartY = e.pageY;
					// bind events to document to move window - we will unbind these on mouseup
					$(document).bind('mousemove', documentMouseMove).bind('mouseup', documentMouseUp);
					e.preventDefault(); // prevent attempted dragging of the column
				},
				documentMouseMove = function (e) {
					container.css({
						left: elementStartX - (pageStartX - e.pageX) + 'px',
						top: elementStartY - (pageStartY - e.pageY) + 'px'
					});
					
					
					return false;
				},
				documentMouseUp = function (e) {
					$(document).unbind('mousemove', documentMouseMove).unbind('mouseup', documentMouseUp);
					
					return false;
				},
				quickPickClicked = function (e) {
					
					color.active.val('ahex', $(this).attr('title') || null, e.target);
					return false;
				},
				commitCallback = $.isFunction($arguments[1]) && $arguments[1] || null,
				liveCallback = $.isFunction($arguments[2]) && $arguments[2] || null,
				cancelCallback = $.isFunction($arguments[3]) && $arguments[3] || null,
				show = function () {
					color.current.val('ahex', color.active.val('ahex'));
				},
				hide = function () {
					
				},
				initialize = function () {
					var win = settings.window,
						popup =  null;
					container = $($this);
					container.addClass('jPicker Container');
					
					container.get(0).onselectstart = function (event) {
						if (event.target.nodeName.toLowerCase() !== 'input') return false;
					};
					// inject html source code - we are using a single table for this control - I know tables are considered bad, but it takes care of equal height columns and
					// this control really is tabular data, so I believe it is the right move
					var all = color.active.val('all');
					if (win.alphaPrecision < 0) win.alphaPrecision = 0;
					else if (win.alphaPrecision > 2) win.alphaPrecision = 2;
					var controlHtml = '<table class="jPicker" cellpadding="0" cellspacing="0"><tbody><tr><td rowspan="9"><div class="Map"><span class="Map1">&nbsp;</span><span class="Map2">&nbsp;</span><span class="Map3">&nbsp;</span><img src="' + images.clientPath + images.colorMap.arrow.file + '" class="Arrow"/></div></td><td rowspan="9"><div class="Bar"><span class="Map1">&nbsp;</span><span class="Map2">&nbsp;</span><span class="Map3">&nbsp;</span><span class="Map4">&nbsp;</span><span class="Map5">&nbsp;</span><span class="Map6">&nbsp;</span><img src="' + images.clientPath + images.colorBar.arrow.file + '" class="Arrow"/></div></td><td colspan="2" class="Preview">' + localization.text.newColor + '<div><span class="Active" title="' + localization.tooltips.colors.newColor + '">&nbsp;</span><span class="Current" title="' + localization.tooltips.colors.currentColor + '">&nbsp;</span></div>' + localization.text.currentColor + '</td><td rowspan="9" class="Button"><input type="button" class="Ok" value="' + localization.text.ok + '" title="' + localization.tooltips.buttons.ok + '"/><input type="button" class="Cancel" value="' + localization.text.cancel + '" title="' + localization.tooltips.buttons.cancel + '"/><hr/><div class="Grid">&nbsp;</div></td></tr><tr class="Hue"><td class="Radio"><label><input type="radio" aria-label="' + localization.tooltips.hue.radio + '" class="hue-radio" value="h"' + (settings.color.mode == 'h' ? ' checked="checked"' : '') + '/>H:</label></td><td class="Text"><input type="text" maxlength="3" value="' + (all != null ? all.h : '') + '" title="' + localization.tooltips.hue.textbox + '"/>&nbsp;&deg;</td></tr><tr class="Saturation"><td class="Radio"><label><input type="radio" aria-label="' + localization.tooltips.saturation.radio + '" value="s"' + (settings.color.mode == 's' ? ' checked="checked"' : '') + '/>S:</label></td><td class="Text"><input type="text" maxlength="3" value="' + (all != null ? all.s : '') + '" title="' + localization.tooltips.saturation.textbox + '"/>&nbsp;%</td></tr><tr class="Value"><td class="Radio"><label><input type="radio" aria-label="' + localization.tooltips.value.radio + '" value="v"' + (settings.color.mode == 'v' ? ' checked="checked"' : '') + '/>V:</label><br/><br/></td><td class="Text"><input type="text" maxlength="3" value="' + (all != null ? all.v : '') + '" title="' + localization.tooltips.value.textbox + '"/>&nbsp;%<br/><br/></td></tr><tr class="Red"><td class="Radio"><label><input type="radio" aria-label="' + localization.tooltips.red.radio + '" value="r"' + (settings.color.mode == 'r' ? ' checked="checked"' : '') + '/>R:</label></td><td class="Text"><input type="text" maxlength="3" value="' + (all != null ? all.r : '') + '" title="' + localization.tooltips.red.textbox + '"/></td></tr><tr class="Green"><td class="Radio"><label><input type="radio" title="' + localization.tooltips.green.radio + '" value="g"' + (settings.color.mode == 'g' ? ' checked="checked"' : '') + '/>G:</label></td><td class="Text"><input type="text" maxlength="3" value="' + (all != null ? all.g : '') + '" title="' + localization.tooltips.green.textbox + '"/></td></tr><tr class="Blue"><td class="Radio"><label><input type="radio"  aria-label="' + localization.tooltips.blue.radio + '" value="b"' + (settings.color.mode == 'b' ? ' checked="checked"' : '') + '/>B:</label></td><td class="Text"><input type="text" maxlength="3" value="' + (all != null ? all.b : '') + '" title="' + localization.tooltips.blue.textbox + '"/></td></tr><tr class="Alpha"><td class="Radio"><label><input aria-label="' + localization.tooltips.alpha.radio + '" class="alpha-radio" type="radio" value="a"' + (settings.color.mode == 'a' ? ' checked="checked"' : '') + '/>A:</label></td><td class="Text"><input type="text" maxlength="' + (3 + win.alphaPrecision) + '" value="' + (all != null ? Math.precision((all.a * 100) / 255, win.alphaPrecision) : '') + '" title="' + localization.tooltips.alpha.textbox + '"/>&nbsp;%</td></tr><tr class="Hex"><td colspan="2" class="Text"><label>#:<input  aria-label="' + localization.tooltips.hex.textbox + '" type="text" maxlength="6" class="Hex" value="' + (all != null ? all.hex : '') + '"/></label><input type="text" maxlength="2" class="AHex" value="' + (all != null ? all.ahex.substring(6) : '') + '" title="' + localization.tooltips.hex.alpha + '"/></td></tr></tbody></table>';
					container = $($this);
					container.html(controlHtml);
					// initialize the objects to the source code just injected
					var tbody = container.find('tbody').eq(0);
					colorMapDiv = tbody.find('div.Map').eq(0);
					colorBarDiv = tbody.find('div.Bar').eq(0);
					var MapMaps = colorMapDiv.find('span'),
						BarMaps = colorBarDiv.find('span');
					colorMapL1 = MapMaps.filter('.Map1').eq(0);
					colorMapL2 = MapMaps.filter('.Map2').eq(0);
					colorMapL3 = MapMaps.filter('.Map3').eq(0);
					colorBarL1 = BarMaps.filter('.Map1').eq(0);
					colorBarL2 = BarMaps.filter('.Map2').eq(0);
					colorBarL3 = BarMaps.filter('.Map3').eq(0);
					colorBarL4 = BarMaps.filter('.Map4').eq(0);
					colorBarL5 = BarMaps.filter('.Map5').eq(0);
					colorBarL6 = BarMaps.filter('.Map6').eq(0);
					// create color pickers and maps
					colorMap = new Slider(colorMapDiv, {
						map: {
							width: images.colorMap.width,
							height: images.colorMap.height
						},
						arrow: {
							image: images.clientPath + images.colorMap.arrow.file,
							width: images.colorMap.arrow.width,
							height: images.colorMap.arrow.height
						}
					});
					colorMap.bind(mapValueChanged);
					colorBar = new Slider(colorBarDiv, {
						map: {
							width: images.colorBar.width,
							height: images.colorBar.height
						},
						arrow: {
							image: images.clientPath + images.colorBar.arrow.file,
							width: images.colorBar.arrow.width,
							height: images.colorBar.arrow.height
						}
					});
					colorBar.bind(colorBarValueChanged);
					colorPicker = new ColorValuePicker(tbody, color.active, null, win.alphaPrecision);
					var hex = all != null ? all.hex : null,
						preview = tbody.find('.Preview'),
						button = tbody.find('.Button');
					activePreview = preview.find('.Active:first').css({
						backgroundColor: hex && '#' + hex || 'transparent'
					});
					currentPreview = preview.find('.Current:first').css({
						backgroundColor: hex && '#' + hex || 'transparent'
					}).bind('click', currentClicked);
					setAlpha.call($this, currentPreview, Math.precision(color.current.val('a') * 100) / 255, 4);
					okButton = button.find('.Ok:first').bind('click', okClicked);
					cancelButton = button.find('.Cancel:first').bind('click', cancelClicked);
					grid = button.find('.Grid:first');
					setTimeout(function () {
						setImg.call($this, colorMapL1, images.clientPath + 'Maps.png');
						setImg.call($this, colorMapL2, images.clientPath + 'Maps.png');
						setImg.call($this, colorMapL3, images.clientPath + 'map-opacity.png');
						setImg.call($this, colorBarL1, images.clientPath + 'Bars.png');
						setImg.call($this, colorBarL2, images.clientPath + 'Bars.png');
						setImg.call($this, colorBarL3, images.clientPath + 'Bars.png');
						setImg.call($this, colorBarL4, images.clientPath + 'Bars.png');
						setImg.call($this, colorBarL5, images.clientPath + 'bar-opacity.png');
						setImg.call($this, colorBarL6, images.clientPath + 'AlphaBar.png');
						setImg.call($this, preview.find('div').eq(0), images.clientPath + 'preview-opacity.png');
					}, 0);
					tbody.find('td.Radio input').bind('click', radioClicked);
					// initialize quick list
					if (color.quickList && color.quickList.length > 0) {
						var html = '';
						for (i = 0; i < color.quickList.length; i++) {
							/* if default colors are hex strings, change them to color objects */
							if ((typeof (color.quickList[i])).toString().toLowerCase() == 'string') color.quickList[i] = new Color({
									hex: color.quickList[i]
								});
							var alpha = color.quickList[i].val('a');
							var ahex = color.quickList[i].val('ahex');
							if (!win.alphaSupport && ahex) ahex = ahex.substring(0, 6) + 'ff';
							var quickHex = color.quickList[i].val('hex');
							html += '<span class="QuickColor"' + (ahex && ' title="#' + ahex + '"' || '') + ' style="background-color:' + (quickHex && '#' + quickHex || '') + ';' + (quickHex ? '' : 'background-image:url(' + images.clientPath + 'NoColor.png)') + (win.alphaSupport && alpha && alpha < 255 ? ';opacity:' + Math.precision(alpha / 255, 4) + ';filter:Alpha(opacity=' + Math.precision(alpha / 2.55, 4) + ')' : '') + '">&nbsp;</span>';
						}
						setImg.call($this, grid, images.clientPath + 'bar-opacity.png');
						grid.html(html);
						grid.find('.QuickColor').click(quickPickClicked);
					}
					setColorMode.call($this, settings.color.mode);
					color.active.bind(activeColorChanged);
					$.isFunction(liveCallback) && color.active.bind(liveCallback);
					color.current.bind(currentColorChanged);
					show.call($this);
				},
				destroy = function () {
					var elemData = $.data($this, 'wsjPicker') || $this;
					container.find('td.Radio input').unbind('click', radioClicked);
					currentPreview.unbind('click', currentClicked);
					cancelButton.unbind('click', cancelClicked);
					okButton.unbind('click', okClicked);
					container.find('.QuickColor').unbind('click', quickPickClicked);
					colorMapDiv = null;
					colorBarDiv = null;
					colorMapL1 = null;
					colorMapL2 = null;
					colorMapL3 = null;
					colorBarL1 = null;
					colorBarL2 = null;
					colorBarL3 = null;
					colorBarL4 = null;
					colorBarL5 = null;
					colorBarL6 = null;
					colorMap.destroy();
					colorMap = null;
					colorBar.destroy();
					colorBar = null;
					colorPicker.destroy();
					colorPicker = null;
					activePreview = null;
					currentPreview = null;
					okButton = null;
					cancelButton = null;
					grid = null;
					commitCallback = null;
					cancelCallback = null;
					liveCallback = null;
					container.html('');

					for (i = 0; i < List.length; i++) {
						if (List[i] == elemData) {
							List.splice(i, 1);
							break;
						}
					}
				},
				images = settings.images, // local copies for YUI compressor
				localization = settings.localization,
				color = {
					active: (typeof (settings.color.active)).toString().toLowerCase() == 'string' ? new Color({
						ahex: !settings.window.alphaSupport && settings.color.active ? settings.color.active.substring(0, 6) + 'ff' : settings.color.active
					}) : new Color({
						ahex: !settings.window.alphaSupport && settings.color.active.val('ahex') ? settings.color.active.val('ahex').substring(0, 6) + 'ff' : settings.color.active.val('ahex')
					}),
					current: (typeof (settings.color.active)).toString().toLowerCase() == 'string' ? new Color({
						ahex: !settings.window.alphaSupport && settings.color.active ? settings.color.active.substring(0, 6) + 'ff' : settings.color.active
					}) : new Color({
						ahex: !settings.window.alphaSupport && settings.color.active.val('ahex') ? settings.color.active.val('ahex').substring(0, 6) + 'ff' : settings.color.active.val('ahex')
					}),
					quickList: settings.color.quickList
				};
			elemExtend(false, $this, // public properties, methods, and callbacks
			{
				commitCallback: commitCallback, // commitCallback function can be overridden to return the selected color to a method you specify when the user clicks "OK"
				liveCallback: liveCallback, // liveCallback function can be overridden to return the selected color to a method you specify in live mode (continuous update)
				cancelCallback: cancelCallback, // cancelCallback function can be overridden to a method you specify when the user clicks "Cancel"
				color: color,
				setColorMode: function(val){
					$('input[type="radio"][value="'+val+'"]', container).prop('checked', true).triggerHandler('click');
				},
				settings: settings,
				show: show,
				hide: hide,
				destroy: destroy // destroys this control entirely, removing all events and objects, and removing itself from the List
			});
			List.push($.data($this, 'wsjPicker') || $this);
			setTimeout(function () {
				initialize.call($this);
			}, 0);
		});
	};
	$.fn.wsjPicker.defaults = /* jPicker defaults - you can change anything in this section (such as the clientPath to your images) without fear of breaking the program */ {
		window: {
			liveUpdate: true,
			/* set false if you want the user to have to click "OK" before the binded input box updates values (always "true" for expandable picker) */
			alphaSupport: false,
			/* set to true to enable alpha picking */
			alphaPrecision: 0
			/* set decimal precision for alpha percentage display - hex codes do not map directly to percentage integers - range 0-2 */
		},
		color: {
			mode: 'h',
			/* acceptabled values "h" (hue), "s" (saturation), "v" (value), "r" (red), "g" (green), "b" (blue), "a" (alpha) */
			active: new Color({ahex: '#000000ff'}),
			/* acceptable values are any declared $.jPicker.Color object or string HEX value (e.g. #ffc000) WITH OR WITHOUT the "#" prefix */
			quickList: /* the quick pick color list */ [
				new Color({
					h: 360,
					s: 33,
					v: 100
				}), /* acceptable values are any declared $.jPicker.Color object or string HEX value (e.g. #ffc000) WITH OR WITHOUT the "#" prefix */
				new Color({
					h: 360,
					s: 66,
					v: 100
				}),
				new Color({
					h: 360,
					s: 100,
					v: 100
				}),
				new Color({
					h: 360,
					s: 100,
					v: 75
				}),
				new Color({
					h: 360,
					s: 100,
					v: 50
				}),
				new Color({
					h: 180,
					s: 0,
					v: 100
				}),
				new Color({
					h: 30,
					s: 33,
					v: 100
				}),
				new Color({
					h: 30,
					s: 66,
					v: 100
				}),
				new Color({
					h: 30,
					s: 100,
					v: 100
				}),
				new Color({
					h: 30,
					s: 100,
					v: 75
				}),
				new Color({
					h: 30,
					s: 100,
					v: 50
				}),
				new Color({
					h: 180,
					s: 0,
					v: 90
				}),
				new Color({
					h: 60,
					s: 33,
					v: 100
				}),
				new Color({
					h: 60,
					s: 66,
					v: 100
				}),
				new Color({
					h: 60,
					s: 100,
					v: 100
				}),
				new Color({
					h: 60,
					s: 100,
					v: 75
				}),
				new Color({
					h: 60,
					s: 100,
					v: 50
				}),
				new Color({
					h: 180,
					s: 0,
					v: 80
				}),
				new Color({
					h: 90,
					s: 33,
					v: 100
				}),
				new Color({
					h: 90,
					s: 66,
					v: 100
				}),
				new Color({
					h: 90,
					s: 100,
					v: 100
				}),
				new Color({
					h: 90,
					s: 100,
					v: 75
				}),
				new Color({
					h: 90,
					s: 100,
					v: 50
				}),
				new Color({
					h: 180,
					s: 0,
					v: 70
				}),
				new Color({
					h: 120,
					s: 33,
					v: 100
				}),
				new Color({
					h: 120,
					s: 66,
					v: 100
				}),
				new Color({
					h: 120,
					s: 100,
					v: 100
				}),
				new Color({
					h: 120,
					s: 100,
					v: 75
				}),
				new Color({
					h: 120,
					s: 100,
					v: 50
				}),
				new Color({
					h: 180,
					s: 0,
					v: 60
				}),
				new Color({
					h: 150,
					s: 33,
					v: 100
				}),
				new Color({
					h: 150,
					s: 66,
					v: 100
				}),
				new Color({
					h: 150,
					s: 100,
					v: 100
				}),
				new Color({
					h: 150,
					s: 100,
					v: 75
				}),
				new Color({
					h: 150,
					s: 100,
					v: 50
				}),
				new Color({
					h: 180,
					s: 0,
					v: 50
				}),
				new Color({
					h: 180,
					s: 33,
					v: 100
				}),
				new Color({
					h: 180,
					s: 66,
					v: 100
				}),
				new Color({
					h: 180,
					s: 100,
					v: 100
				}),
				new Color({
					h: 180,
					s: 100,
					v: 75
				}),
				new Color({
					h: 180,
					s: 100,
					v: 50
				}),
				new Color({
					h: 180,
					s: 0,
					v: 40
				}),
				new Color({
					h: 210,
					s: 33,
					v: 100
				}),
				new Color({
					h: 210,
					s: 66,
					v: 100
				}),
				new Color({
					h: 210,
					s: 100,
					v: 100
				}),
				new Color({
					h: 210,
					s: 100,
					v: 75
				}),
				new Color({
					h: 210,
					s: 100,
					v: 50
				}),
				new Color({
					h: 180,
					s: 0,
					v: 30
				}),
				new Color({
					h: 240,
					s: 33,
					v: 100
				}),
				new Color({
					h: 240,
					s: 66,
					v: 100
				}),
				new Color({
					h: 240,
					s: 100,
					v: 100
				}),
				new Color({
					h: 240,
					s: 100,
					v: 75
				}),
				new Color({
					h: 240,
					s: 100,
					v: 50
				}),
				new Color({
					h: 180,
					s: 0,
					v: 20
				}),
				new Color({
					h: 270,
					s: 33,
					v: 100
				}),
				new Color({
					h: 270,
					s: 66,
					v: 100
				}),
				new Color({
					h: 270,
					s: 100,
					v: 100
				}),
				new Color({
					h: 270,
					s: 100,
					v: 75
				}),
				new Color({
					h: 270,
					s: 100,
					v: 50
				}),
				new Color({
					h: 180,
					s: 0,
					v: 10
				}),
				new Color({
					h: 300,
					s: 33,
					v: 100
				}),
				new Color({
					h: 300,
					s: 66,
					v: 100
				}),
				new Color({
					h: 300,
					s: 100,
					v: 100
				}),
				new Color({
					h: 300,
					s: 100,
					v: 75
				}),
				new Color({
					h: 300,
					s: 100,
					v: 50
				}),
				new Color({
					h: 180,
					s: 0,
					v: 0
				}),
				new Color({
					h: 330,
					s: 33,
					v: 100
				}),
				new Color({
					h: 330,
					s: 66,
					v: 100
				}),
				new Color({
					h: 330,
					s: 100,
					v: 100
				}),
				new Color({
					h: 330,
					s: 100,
					v: 75
				}),
				new Color({
					h: 330,
					s: 100,
					v: 50
				}),
				new Color({
					h: 180,
					s: 0,
					v: 0
				})
			]
		},
		images: {
			clientPath: '/jPicker/images/',
			/* Path to image files */
			colorMap: {
				width: 256,
				height: 256,
				arrow: {
					file: 'mappoint.gif',
					/* ColorMap arrow icon */
					width: 15,
					height: 15
				}
			},
			colorBar: {
				width: 20,
				height: 256,
				arrow: {
					file: 'rangearrows.gif',
					/* ColorBar arrow icon */
					width: 20,
					height: 7
				}
			}
		},
		localization: /* alter these to change the text presented by the picker (e.g. different language) */ {
			text: {
				title: 'Drag Markers To Pick A Color',
				newColor: 'new',
				currentColor: 'current',
				ok: 'OK',
				cancel: 'Cancel'
			},
			tooltips: {
				colors: {
					newColor: 'New Color - Press &ldquo;OK&rdquo; To Commit',
					currentColor: 'Click To Revert To Original Color'
				},
				buttons: {
					ok: 'Commit To This Color Selection',
					cancel: 'Cancel And Revert To Original Color'
				},
				hue: {
					radio: 'Set To &ldquo;Hue&rdquo; Color Mode',
					textbox: 'Enter A &ldquo;Hue&rdquo; Value (0-360&deg;)'
				},
				saturation: {
					radio: 'Set To &ldquo;Saturation&rdquo; Color Mode',
					textbox: 'Enter A &ldquo;Saturation&rdquo; Value (0-100%)'
				},
				value: {
					radio: 'Set To &ldquo;Value&rdquo; Color Mode',
					textbox: 'Enter A &ldquo;Value&rdquo; Value (0-100%)'
				},
				red: {
					radio: 'Set To &ldquo;Red&rdquo; Color Mode',
					textbox: 'Enter A &ldquo;Red&rdquo; Value (0-255)'
				},
				green: {
					radio: 'Set To &ldquo;Green&rdquo; Color Mode',
					textbox: 'Enter A &ldquo;Green&rdquo; Value (0-255)'
				},
				blue: {
					radio: 'Set To &ldquo;Blue&rdquo; Color Mode',
					textbox: 'Enter A &ldquo;Blue&rdquo; Value (0-255)'
				},
				alpha: {
					radio: 'Set To &ldquo;Alpha&rdquo; Color Mode',
					textbox: 'Enter A &ldquo;Alpha&rdquo; Value (0-100)'
				},
				hex: {
					textbox: 'Enter A &ldquo;Hex&rdquo; Color Value (#000000-#ffffff)',
					alpha: 'Enter A &ldquo;Alpha&rdquo; Value (#00-#ff)'
				}
			}
		}
	};
})(jQuery, '1.1.6wsmod');
jQuery.webshims.register('forms-picker', function($, webshims, window, document, undefined, options){
	var picker = webshims.picker;
	var actions = {
		changeInput: function(val, popover, data){
			actions.cancel(val, popover, data);
			data.setChange(val);
		},
		cancel: function(val, popover, data){
			popover.stopOpen = true;
			data.element.getShadowFocusElement().focus();
			setTimeout(function(){
				popover.stopOpen = false;
			}, 9);
			popover.hide();
		}
	};
	var moduleOpts = options;
	
	var getDateArray = function(date){
		var ret = [date.getFullYear(), moduleOpts.addZero(date.getMonth() + 1), moduleOpts.addZero(date.getDate())];
		ret.month = ret[0]+'-'+ret[1];
		ret.date = ret[0]+'-'+ret[1]+'-'+ret[2];
		return ret;
	};
	var today = getDateArray(new Date());
	
	var _genericSetFocus = function(element, _noFocus){
		element = $(element || this.activeButton);
		if(!this.popover.openedByFocus && !_noFocus){
			that = this;
			setFocus = function(noTrigger){
				clearTimeout(that.timer);
				that.timer = setTimeout(function(){
					if(element[0]){
						element[0].focus();
						if(noTrigger !== true && !element.is(':focus')){
							setFocus(true);
						}
					}
				}, that.popover.isVisible ? 99 : 360);
			};
			this.popover.activateElement(element);
			setFocus();
		}
	};
	var _setFocus = function(element, _noFocus){
		var setFocus, that;
		element = $(element || this.activeButton);
		this.activeButton.attr({tabindex: '-1', 'aria-selected': 'false'});
		this.activeButton = element.attr({tabindex: '0', 'aria-selected': 'true'});
		this.index = this.buttons.index(this.activeButton[0]);
		
		clearTimeout(this.timer);
		
		_genericSetFocus.apply(this, arguments);
		
	};
	
	var _initialFocus = function(){
		var sel;
		if(this.popover.navedInitFocus){
			sel = this.popover.navedInitFocus.sel || this.popover.navedInitFocus;
			if((!this.activeButton || !this.activeButton[0]) && this.buttons[sel]){
				this.activeButton = this.buttons[sel]();
			} else if(sel){
				this.activeButton = $(sel, this.element);
			}
			
			if(!this.activeButton[0] && this.popover.navedInitFocus.alt){
				this.activeButton = this.buttons[this.popover.navedInitFocus.alt]();
			}
		}
		
		if(!this.activeButton || !this.activeButton[0]){
			this.activeButton = this.buttons.filter('.checked-value');
		}
		
		if(!this.activeButton[0]){
			this.activeButton = this.buttons.filter('.this-value');
		}
		if(!this.activeButton[0]){
			this.activeButton = this.buttons.eq(0);
		}
		
		this.setFocus(this.activeButton, this.opts.noFocus);
	};
	var formcfg = webshims.formcfg;
	var curCfg = formcfg[$.webshims.activeLang()] || formcfg[''];
	$.webshims.activeLang({
		register: 'form-core', 
		callback: function(){
			$.each(arguments, function(i, val){
				if(formcfg[val]){
					curCfg = formcfg[val];
					return false;
				}
			});
		}
	});
	
	
	webshims.ListBox = function (element, popover, opts){
		this.element = $('ul', element);
		this.popover = popover;
		this.opts = opts || {};
		this.buttons = $('button:not(:disabled)', this.element);
		
		
		this.ons(this);
		this._initialFocus();
	};
	
	webshims.ListBox.prototype = {
		setFocus: _setFocus,
		_initialFocus: _initialFocus,
		prev: function(){
			var index = this.index - 1;
			if(index < 0){
				if(this.opts.prev){
					this.popover.navedInitFocus = 'last';
					this.popover.actionFn(this.opts.prev);
					this.popover.navedInitFocus = false;
				}
			} else {
				this.setFocus(this.buttons.eq(index));
			}
		},
		next: function(){
			var index = this.index + 1;
			if(index >= this.buttons.length){
				if(this.opts.next){
					this.popover.navedInitFocus = 'first';
					this.popover.actionFn(this.opts.next);
					this.popover.navedInitFocus = false;
				}
			} else {
				this.setFocus(this.buttons.eq(index));
			}
		},
		ons: function(that){
			this.element
				.on({
					'keydown': function(e){
						var handled;
						var key = e.keyCode;
						if(e.ctrlKey){return;}
						if(key == 36 || key == 33){
							that.setFocus(that.buttons.eq(0));
							handled = true;
						} else if(key == 34 || key == 35){
							that.setFocus(that.buttons.eq(that.buttons.length - 1));
							handled = true;
						} else if(key == 38 || key == 37){
							that.prev();
							handled = true;
						} else if(key == 40 || key == 39){
							that.next();
							handled = true;
						}
						if(handled){
							return false;
						}
					}
				})
			;
		}
	};
	
	webshims.Grid = function (element, popover, opts){
		this.element = $('tbody', element);
		this.popover = popover;
		this.opts = opts || {};
		this.buttons = $('button:not(:disabled,.othermonth)', this.element);
		
		this.ons(this);
		
		this._initialFocus();
		if(this.popover.openedByFocus){
			this.popover.activeElement = this.activeButton;
		}
	};
	
	
	
	webshims.Grid.prototype = {
		setFocus: _setFocus,
		_initialFocus: _initialFocus,
		
		first: function(){
			this.setFocus(this.buttons.eq(0));
		},
		last: function(){
			this.setFocus(this.buttons.eq(this.buttons.length - 1));
		},
		upPage: function(){
			$('.ws-picker-header > button:not(:disabled)', this.popover.element).trigger('click');
		},
		downPage: function(){
			this.activeButton.filter(':not([data-action="changeInput"])').trigger('click');
		},
		ons: function(that){
			this.element
				.on({
					'keydown': function(e){
						var handled;
						var key = e.keyCode;
						
						if(e.shiftKey){return;}
						
						if((e.ctrlKey && key == 40)){
							handled = 'downPage';
						} else if((e.ctrlKey && key == 38)){
							handled = 'upPage';
						} else if(key == 33 || (e.ctrlKey && key == 37)){
							handled = 'prevPage';
						} else if(key == 34 || (e.ctrlKey && key == 39)){
							handled = 'nextPage';
						} else if(e.keyCode == 36 || e.keyCode == 33){
							handled = 'first';
						} else if(e.keyCode == 35){
							handled = 'last';
						} else if(e.keyCode == 38){
							handled = 'up';
						} else if(e.keyCode == 37){
							handled = 'prev';
						} else if(e.keyCode == 40){
							handled = 'down';
						} else if(e.keyCode == 39){
							handled = 'next';
						}
						if(handled){
							that[handled]();
							return false;
						}
					}
				})
			;
		}
	};
	$.each({
		prevPage: {get: 'last', action: 'prev'}, 
		nextPage: {get: 'first', action: 'next'}
	}, function(name, val){
		webshims.Grid.prototype[name] = function(){
			if(this.opts[val.action]){
				this.popover.navedInitFocus = {
					sel: 'button[data-id="'+ this.activeButton.attr('data-id') +'"]:not(:disabled,.othermonth)',
					alt: val.get
				};
				this.popover.actionFn(this.opts[val.action]);
				this.popover.navedInitFocus = false;
			}
		};
	});
	
	$.each({
		up: {traverse: 'prevAll', get: 'last', action: 'prev', reverse: true}, 
		down: {traverse: 'nextAll', get: 'first', action: 'next'}
	}, function(name, val){
		webshims.Grid.prototype[name] = function(){
			var cellIndex = this.activeButton.closest('td').prop('cellIndex');
			var sel = 'td:nth-child('+(cellIndex + 1)+') button:not(:disabled,.othermonth)';
			var button = this.activeButton.closest('tr')[val.traverse]();
			
			if(val.reverse){
				button = $(button.get().reverse());
			}
			button = button.find(sel)[val.get]();
			
			if(!button[0]){
				if(this.opts[val.action]){
					this.popover.navedInitFocus = sel+':'+val.get;
					this.popover.actionFn(this.opts[val.action]);
					this.popover.navedInitFocus = false;
				}
			} else {
				this.setFocus(button.eq(0));
			}
		};
	});
	
	$.each({
		prev: {traverse: 'prevAll',get: 'last', reverse: true}, 
		next: {traverse: 'nextAll', get: 'first'}
	}, function(name, val){
		webshims.Grid.prototype[name] = function(){
			var sel = 'button:not(:disabled,.othermonth)';
			var button = this.activeButton.closest('td')[val.traverse]('td');
			if(val.reverse){
				button = $(button.get().reverse());
			}
			button = button.find(sel)[val.get]();
			if(!button[0]){
				button = this.activeButton.closest('tr')[val.traverse]('tr');
				if(val.reverse){
					button = $(button.get().reverse());
				}
				button = button.find(sel)[val.get]();
			}
			
			if(!button[0]){
				if(this.opts[name]){
					this.popover.navedInitFocus = val.get;
					this.popover.actionFn(this.opts[name]);
					this.popover.navedInitFocus = false;
				}
			} else {
				this.setFocus(button.eq(0));
			}
		};
	});
	
	picker.getWeek = function(date){
		var onejan = new Date(date.getFullYear(),0,1);
		return Math.ceil((((date - onejan) / 86400000) + onejan.getDay()+1)/7);
	};
	picker.getYearList = function(value, data){
		var j, i, val, disabled, lis, prevDisabled, nextDisabled, classStr, classArray, start;
		
		
		var size = data.options.size;
		var max = data.options.max.split('-');
		var min = data.options.min.split('-');
		var currentValue = data.options.value.split('-');
		var xthCorrect = 0;
		var enabled = 0;
		var str = '';
		var rowNum = 0;
		
		if(data.options.useDecadeBase == 'max' && max[0]){
			xthCorrect = 11 - (max[0] % 12);
		} else if(data.options.useDecadeBase == 'min' && min[0]){
			xthCorrect = 11 - (min[0] % 12);
		}
		
		value = value[0] * 1;
		start = value - ((value + xthCorrect) % (12 * size));
		
		
		
		for(j = 0; j < size; j++){
			if(j){
				start += 12;
			}  else {
				prevDisabled = picker.isInRange([start-1], max, min) ? {'data-action': 'setYearList','value': start-1} : false;
			}
			
			str += '<div class="year-list picker-list ws-index-'+ j +'"><div class="ws-picker-header"><button disabled="disabled">'+ start +' – '+(start + 11)+'</button></div>';
			lis = [];
			for(i = 0; i < 12; i++){
				val = start + i ;
				classArray = [];
				if( !picker.isInRange([val], max, min) ){
					disabled = ' disabled=""';
				} else {
					disabled = '';
					enabled++;
				}
				
				if(val == today[0]){
					classArray.push('this-value');
				}
				
				if(currentValue[0] == val){
					classArray.push('checked-value');
				}
				
				classStr = classArray.length ? ' class="'+ (classArray.join(' ')) +'"' : '';
				
				if(i && !(i % 3)){
					rowNum++;
					lis.push('</tr><tr class="ws-row-'+ rowNum +'">');
				}
				lis.push('<td class="ws-item-'+ i +'" role="presentation"><button  data-id="year-'+ i +'" type="button"'+ disabled + classStr +' data-action="setMonthList" value="'+val+'" tabindex="-1" role="gridcell">'+val+'</button></td>');
			}
			if(j == size - 1){
				nextDisabled = picker.isInRange([val+1], max, min) ? {'data-action': 'setYearList','value': val+1} : false;
			}
			str += '<div class="picker-grid"><table role="grid" aria-label="'+ start +' – '+(start + 11)+'"><tbody><tr class="ws-row-0">'+ (lis.join(''))+ '</tr></tbody></table></div></div>';
		}
		
		return {
			enabled: enabled,
			main: str,
			next: nextDisabled,
			prev: prevDisabled,
			type: 'Grid'
		};
	};
	
	
	picker.getMonthList = function(value, data){
		
		var j, i, name, val, disabled, lis, fullyDisabled, prevDisabled, nextDisabled, classStr, classArray;
		var o = data.options;
		var size = o.size;
		var max = o.max.split('-');
		var min = o.min.split('-');
		var currentValue = o.value.split('-');
		var enabled = 0;
		var rowNum = 0;
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
				disabled = ' disabled=""';
				fullyDisabled = true;
			} else {
				fullyDisabled = false;
				disabled = '';
			}
			
			if(o.minView >= 1){
				disabled = ' disabled=""';
			}
			
			str += '<div class="month-list picker-list ws-index-'+ j +'"><div class="ws-picker-header">';
			
			str += o.selectNav ? 
				'<select data-action="setMonthList" class="year-select">'+ picker.createYearSelect(value, max, min).join('') +'</select>' : 
				'<button data-action="setYearList"'+disabled+' value="'+ value +'" tabindex="-1">'+ value +'</button>';
			str += '</div>';
			
			for(i = 0; i < 12; i++){
				val = curCfg.date.monthkeys[i+1];
				name = (curCfg.date[o.monthNames] || curCfg.date.monthNames)[i];
				classArray = [];
				if(fullyDisabled || !picker.isInRange([value, val], max, min) ){
					disabled = ' disabled=""';
				} else {
					disabled = '';
					enabled++;
				}
				
				if(value == today[0] && today[1] == val){
					classArray.push('this-value');
				}
				
				if(currentValue[0] == value && currentValue[1] == val){
					classArray.push('checked-value');
				}
				
				classStr = (classArray.length) ? ' class="'+ (classArray.join(' ')) +'"' : '';
				if(i && !(i % 3)){
					rowNum++;
					lis.push('</tr><tr class="ws-row-'+ rowNum +'">');
				}

				lis.push('<td class="ws-item-'+ i +'" role="presentation"><button data-id="month-'+ i +'" type="button"'+ disabled + classStr +' data-action="'+ (data.type == 'month' ? 'changeInput' : 'setDayList' ) +'" value="'+value+'-'+val+'" tabindex="-1" role="gridcell" aria-label="'+ curCfg.date.monthNames[i] +'">'+name+'</button></td>');
				
			}
			
			str += '<div class="picker-grid"><table role="grid" aria-label="'+value+'"><tbody><tr class="ws-row-0">'+ (lis.join(''))+ '</tr></tbody></table></div></div>';
		}
		
		return {
			enabled: enabled,
			main: str,
			prev: prevDisabled,
			next: nextDisabled,
			type: 'Grid'
		};
	};
	
	
	picker.getDayList = function(value, data){
		
		var j, i, k, day, nDay, name, val, disabled, lis,  prevDisabled, nextDisabled, addTr, week, rowNum;
		
		var lastMotnh, curMonth, otherMonth, dateArray, monthName, fullMonthName, buttonStr, date2, classArray;
		var o = data.options;
		var size = o.size;
		var max = o.max.split('-');
		var min = o.min.split('-');
		var currentValue = o.value.split('-');
		var monthNames = curCfg.date[o.monthNamesHead] || curCfg.date[o.monthNames] || curCfg.date.monthNames; 
		var enabled = 0;
		var str = [];
		var date = new Date(value[0], value[1] - 1, 1);
		
		date.setMonth(date.getMonth()  - Math.floor((size - 1) / 2));
		
		for(j = 0;  j < size; j++){
			date.setDate(1);
			lastMotnh = date.getMonth();
			rowNum = 0;
			if(!j){
				date2 = new Date(date.getTime());
				date2.setDate(-1);
				dateArray = getDateArray(date2);
				prevDisabled = picker.isInRange(dateArray, max, min) ? {'data-action': 'setDayList','value': dateArray[0]+'-'+dateArray[1]} : false;
			}
			
			dateArray = getDateArray(date);
			
			str.push('<div class="day-list picker-list ws-index-'+ j +'"><div class="ws-picker-header">');
			if( o.selectNav ){
				monthName = ['<select data-action="setDayList" class="month-select" tabindex="0">'+ picker.createMonthSelect(dateArray, max, min, monthNames).join('') +'</select>', '<select data-action="setDayList" class="year-select" tabindex="0">'+ picker.createYearSelect(dateArray[0], max, min, '-'+dateArray[1]).join('') +'</select>'];
				if(curCfg.date.showMonthAfterYear){
					monthName.reverse();
				}
				str.push( monthName.join(' ') );
			} 
			
			fullMonthName = [curCfg.date.monthNames[(dateArray[1] * 1) - 1], dateArray[0]];
			monthName = [monthNames[(dateArray[1] * 1) - 1], dateArray[0]];
			if(curCfg.date.showMonthAfterYear){
				monthName.reverse();
				fullMonthName.reverse();
			}
			
			if(!data.options.selectNav) {
				str.push(  
					'<button data-action="setMonthList"'+ (o.minView >= 2 ? ' disabled="" ' : '') +' value="'+ dateArray.date +'" tabindex="-1">'+ monthName.join(' ') +'</button>'
				);
			}
			
			
			str.push('</div><div class="picker-grid"><table role="grid" aria-label="'+ fullMonthName.join(' ')  +'"><thead><tr>');
			
			if(data.options.showWeek){
				str.push('<th class="week-header">'+ curCfg.date.weekHeader +'</th>');
			}
			for(k = curCfg.date.firstDay; k < curCfg.date.dayNamesShort.length; k++){
				str.push('<th class="day-'+ k +'"><abbr title="'+ curCfg.date.dayNames[k] +'">'+ curCfg.date.dayNamesShort[k] +'</abbr></th>');
			}
			k = curCfg.date.firstDay;
			while(k--){
				str.push('<th class="day-'+ k +'"><abbr title="'+ curCfg.date.dayNames[k] +'">'+ curCfg.date.dayNamesShort[k] +'</abbr></th>');
			}
			str.push('</tr></thead><tbody><tr class="ws-row-0">');
			
			if(data.options.showWeek) {
				week = picker.getWeek(date);
				str.push('<td class="week-cell">'+ week +'</td>');
			}
			
			for (i = 0; i < 99; i++) {
				addTr = (i && !(i % 7));
				curMonth = date.getMonth();
				otherMonth = lastMotnh != curMonth;
				day = date.getDay();
				classArray = [];
				
				if(addTr && otherMonth ){
					str.push('</tr>');
					break;
				}
				if(addTr){
					rowNum++;
					str.push('</tr><tr class="ws-row-'+ rowNum +'">');
					if(data.options.showWeek) {
						week++;
						str.push('<td class="week-cell">'+ week +'</td>');
					}
				}
				
				if(!i){
					
					if(day != curCfg.date.firstDay){
						nDay = day - curCfg.date.firstDay;
						if(nDay < 0){
							nDay += 7;
						}
						date.setDate(date.getDate() - nDay);
						day = date.getDay();
						curMonth = date.getMonth();
						otherMonth = lastMotnh != curMonth;
					}
				}
				
				dateArray = getDateArray(date);
				buttonStr = '<td role="presentation" class="day-'+ day +'"><button data-id="day-'+ date.getDate() +'" role="gridcell" data-action="changeInput" value="'+ (dateArray.join('-')) +'"';
				
				if(otherMonth){
					classArray.push('othermonth');
				} else {
					classArray.push('day-'+date.getDate());
				}
				
				if(dateArray[0] == today[0] && today[1] == dateArray[1] && today[2] == dateArray[2]){
					classArray.push('this-value');
				}
				
				if(currentValue[0] == dateArray[0] && dateArray[1] == currentValue[1] && dateArray[2] == currentValue[2]){
					classArray.push('checked-value');
				}
				
				if(classArray.length){
					buttonStr += ' class="'+ classArray.join(' ') +'"';
				}
				
				if(!picker.isInRange(dateArray, max, min) || (data.options.disableDays && $.inArray(day, data.options.disableDays) != -1)){
					buttonStr += ' disabled=""';
				}
				
				str.push(buttonStr+' tabindex="-1">'+ date.getDate() +'</button></td>');
				
				date.setDate(date.getDate() + 1);
			}
			str.push('</tbody></table></div></div>');
			if(j == size - 1){
				dateArray = getDateArray(date);
				dateArray[2] = 1;
				nextDisabled = picker.isInRange(dateArray, max, min) ? {'data-action': 'setDayList','value': dateArray.date} : false;
			}
		}
				
		
		return {
			enabled: 9,
			main: str.join(''),
			prev: prevDisabled,
			next: nextDisabled,
			type: 'Grid'
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
				options.push('<option value="'+ value[0]+'-'+moduleOpts.addZero(i+1) + '"'+selected+'>'+ monthNames[i] +'</option>');
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
		
	(function(){
		var retNames = function(name){
			return 'get'+name+'List';
		};
		var retSetNames = function(name){
			return 'set'+name+'List';
		};
		var stops = {
			date: 'Day',
			week: 'Day',
			month: 'Month'
		};
		
		$.each({'setYearList' : ['Year', 'Month', 'Day'], 'setMonthList': ['Month', 'Day'], 'setDayList': ['Day']}, function(setName, names){
			var getNames = names.map(retNames);
			var setNames = names.map(retSetNames);
			actions[setName] = function(val, popover, data, startAt){
				val = ''+val;
				var o = data.options;
				var values = val.split('-');
				if(!startAt){
					startAt = 0;
				}
				$.each(getNames, function(i, item){
					if(i >= startAt){
						var content = picker[item](values, data);
						
						if( values.length < 2 || content.enabled > 1 || stops[data.type] === names[i]){
							popover.element
								.attr({'data-currentview': setNames[i]})
								.addClass('ws-size-'+o.size)
								.data('pickercontent', {
									data: data,
									content: content,
									values: values
								})
							;
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
							if(webshims[content.type]){
								new webshims[content.type](popover.bodyElement.children(), popover, content);
							}
							popover.element.trigger('pickerchange');
							return false;
						}
					}
				});
			};
		});
	})();
	
	picker.showPickerContent = function(data, popover){
		var options = data.options;
		if(!data._popoverinit){
			picker.commonInit(data, popover);
			picker.commonDateInit(data, popover);
		}
		
		if(!data._popoverinit || options.restartView) {
			actions.setYearList( options.defValue || options.value, popover, data, options.startView);
		} else {
			actions[popover.element.attr('data-currentview') || 'setYearList']( options.defValue || options.value, popover, data, 0);
		}
		data._popoverinit = true;
	};
	
	picker.color.showPickerContent = (function(){
		var _init, curData;
		var jpicker = $('<div class="ws-jpicker" />');
		$.fn.wsjPicker.defaults.images.clientPath = webshims.cfg.basePath + 'jpicker/images/'; 
		var jPickerApi;
		
		var fns = {
			setPicker: function(data){
				
				
				var mode = $(data.orig).data('colormode') || 'h';
				if(!data.alpha.length){
					jpicker.addClass('no-alpha-picker');
					if(mode == 'a'){
						mode = 'h';
					}
				} else {
					jpicker.removeClass('no-alpha-picker');
				}
				
				if(mode != jPickerApi.settings.color.mode){
					jPickerApi.setColorMode(mode);
				}
				
			},
			setInputColor: function(data){
				var oldAlpha;
				var colorData = jPickerApi.color.active.val();
				var value = '#'+colorData.hex;
				if(data.alpha.length){
					oldAlpha = data.alpha.prop('value');
					data.alpha.prop('value', colorData.a / (255 / (data.alpha.prop('max') || 1)));
				}
				$(data.orig).data('colormode', jPickerApi.settings.color.mode);
				actions.changeInput(value, data.popover, data);
				if(data.alpha.length && oldAlpha != data.alpha.prop('value')){
					data.alpha.trigger('input').trigger('change');
				}
				return value;
			}
		};
		var pickerSet = function(fn, data, value){
			if(data == curData && fns[fn]){
				fns[fn](data);
			}
		};
		var createPicker =  function(data){
			
			jPickerApi = jpicker.data('wsjPicker');
			
			if(!jPickerApi){
				jpicker.empty().wsjPicker(
					{},
					function(color){
						if(curData){
							pickerSet('setInputColor', curData);
						}
					},
					false,
					function(color){
						if(curData){
							actions.cancel('#' + color.val().hex, curData.popover, curData);
						}
					}
				);
				jPickerApi = jpicker.data('wsjPicker');
			}
		};
		
		var implementPickerFor = function(data){
			createPicker();
			if( data != curData){
				if(curData){
					curData.popover.hide();
				}
				curData = data;
				data.popover.contentElement.html(jpicker);
				pickerSet('setPicker', data);
			}
		};
		
		return function(data){
			if(!data._popoverinit){
				picker.commonInit(data, data.popover);
				picker.commonColorInit(data);
			}
			
			var value = data.parseValue();
			implementPickerFor(data);
			
			value += (data.alpha.length) ?
				$.wsjPicker.ColorMethods.intToHex( (data.alpha.prop('value') || 1) * (255 / (data.alpha.prop('max') || 1)) ) :
				'ff'
			;
			jPickerApi.color.active.val('ahex', value);
			jPickerApi.color.current.val('ahex', value);
			
			data._popoverinit = true;
		};
	})();
	
	picker.commonDateInit = function(data, popover){
		var actionfn = function(e){
			if(!$(this).is('.othermonth') || $(this).css('cursor') == 'pointer'){
				popover.actionFn({
					'data-action': $.attr(this, 'data-action'),
					value: $(this).val() || $.attr(this, 'value')
				});
			}
			return false;
		};
		var id = new Date().getTime();
		var generateList = function(o, max, min){
			var options = [];
			var label = '';
			var labelId = '';
			o.options = data.getOptions() || {};
			$('div.ws-options', popover.contentElement).remove();
			$.each(o.options[0], function(val, label){
				var disabled = picker.isInRange(val.split('-'), o.maxS, o.minS) ?
					'' :
					' disabled="" '
				;
				options.push('<li role="presentation"><button value="'+ val +'" '+disabled+' data-action="changeInput" tabindex="-1"  role="option">'+ (label || data.formatValue(val, false)) +'</button></li>');
			});
			if(options.length){
				id++;
				if(o.options[1]){
					labelId = 'datalist-'+id;
					label = '<h5 id="'+labelId+'">'+ o.options[1] +'</h5>';
					labelId = ' aria-labelledbyid="'+ labelId +'" ';
				}
				new webshims.ListBox($('<div class="ws-options">'+label+'<ul role="listbox" '+ labelId +'>'+ options.join('') +'</div>').insertAfter(popover.bodyElement)[0], popover, {noFocus: true});
			}
		};
		var updateContent = function(){
			if(popover.isDirty){
				var o = data.options;
				o.maxS = o.max.split('-');
				o.minS = o.min.split('-');
				
				$('button', popover.buttonRow).each(function(){
					var text;
					if($(this).is('.ws-empty')){
						text = curCfg.date.clear;
						if(!text){
							text = formcfg[''].date.clear || 'clear';
							webshims.warn("could not get clear text from form cfg");
						}
					} else if($(this).is('.ws-current')){
						text = (curCfg[data.type] || {}).currentText;
						if(!text){
							text = (formcfg[''][[data.type]] || {}).currentText || 'current';
							webshims.warn("could not get currentText from form cfg");
						}
						$.prop(this, 'disabled', !picker.isInRange(today[data.type].split('-'), o.maxS, o.minS));
					}
					if(text){
						$(this).text(text).attr({'aria-label': text});
						if(webshims.assumeARIA){
							$.attr(this, 'aria-label', text);
						}
					}
					
				});
				popover.nextElement.attr({'aria-label': curCfg.date.nextText});
				$('> span', popover.nextElement).html(curCfg.date.nextText);
				popover.prevElement.attr({'aria-label': curCfg.date.prevText});
				$('> span', popover.prevElement).html(curCfg.date.prevText);
				
				generateList(o, o.maxS, o.minS);
				
			}
			$('button.ws-empty', popover.buttonRow).prop('disabled', $.prop(data.orig, 'required'));
			popover.isDirty = false;
		};
		
		popover.actionFn = function(obj){
			if(actions[obj['data-action']]){
				actions[obj['data-action']](obj.value, popover, data, 0);
			} else {
				webshims.warn('no action for '+ obj['data-action']);
			}
		};
		
		popover.contentElement.html('<button class="ws-prev" tabindex="0"><span></span></button> <button class="ws-next" tabindex="0"><span></span></button><div class="ws-picker-body"></div><div class="ws-button-row"><button type="button" class="ws-current" data-action="changeInput" value="'+today[data.type]+'" tabindex="0"></button> <button type="button" data-action="changeInput" value="" class="ws-empty" tabindex="0"></button></div>');
		popover.nextElement = $('button.ws-next', popover.contentElement);
		popover.prevElement = $('button.ws-prev', popover.contentElement);
		popover.bodyElement = $('div.ws-picker-body', popover.contentElement);
		popover.buttonRow = $('div.ws-button-row', popover.contentElement);
		popover.element.on('updatepickercontent', updateContent);
		
		popover.contentElement
			.on('click', 'button[data-action]', actionfn)
			.on('change', 'select[data-action]', actionfn)
		;
		
		$(data.options.orig).on('input', function(){
			var currentView;
			if(data.options.updateOnInput && popover.isVisible && data.options.value && (currentView = popover.element.attr('data-currentview'))){
				actions[currentView]( data.options.value , popover, data, 0);
			}
		});
		$(document).onTrigger('wslocalechange', data._propertyChange);
	};
	
	picker.commonColorInit = function(data){
		var popover = data.popover;
		popover.element.on({
			wspopovershow: function(){
				data.element.triggerHandler('wsupdatevalue');
				_genericSetFocus.call(data, $('input.Hex', popover.element));
			}
		});
	};
	
	picker.commonInit = function(data, popover){
		var tabbable;
		
		popover.isDirty = true;
		
		popover.element.on('updatepickercontent pickerchange', function(){
			tabbable = false;
		});
		popover.contentElement.on({
			keydown: function(e){
				if(e.keyCode == 9){
					if(!tabbable){
						tabbable = $('input:not(:disabled), [tabindex="0"]:not(:disabled)', this).filter(':visible');
					}
					var index = tabbable.index(e.target);
					if(e.shiftKey && index <= 0){
						tabbable.last().focus();
						return false;
					}
					if(!e.shiftKey && index >= tabbable.length - 1){
						tabbable.first().focus();
						return false;
					}
				} else if(e.keyCode == 27){
					data.element.getShadowFocusElement().focus();
					popover.hide();
					return false;
				}
			}
		});
		
		data._propertyChange = (function(){
			var timer;
			var update = function(){
				if(popover.isVisible){
					popover.element.triggerHandler('updatepickercontent');
				}
			};
			return function(prop){
				if(prop == 'value'){return;}
				popover.isDirty = true;
				if(popover.isVisible){
					clearTimeout(timer);
					timer = setTimeout(update, 9);
				}
			};
		})();
		
		popover.activeElement = $([]);
		
		popover.activateElement = function(element){
			element = $(element);
			if(element[0] != popover.activeElement[0]){
				popover.activeElement.removeClass('ws-focus');
				element.addClass('ws-focus');
			}
			popover.activeElement = element;
		};
		popover.element.on({
			wspopoverbeforeshow: function(){
				data.element.triggerHandler('wsupdatevalue');
				popover.element.triggerHandler('updatepickercontent');
			}
		});
		
		
		$(data.orig).on('remove', function(e){
			if(!e.originalEvent){
				$(document).off('wslocalechange', data._propertyChange);
			}
		});
	};
		
});

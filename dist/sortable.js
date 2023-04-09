/*!
 * sortable-dnd v0.4.7
 * open source under the MIT license
 * https://github.com/mfuu/sortable-dnd#readme
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Sortable = factory());
}(this, (function () { 'use strict';

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }
  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  var captureMode = {
    capture: false,
    passive: false
  };
  var R_SPACE = /\s+/g;
  var events = {
    start: ['pointerdown', 'touchstart', 'mousedown'],
    move: ['pointermove', 'touchmove', 'mousemove'],
    end: ['pointerup', 'pointercancel', 'touchend', 'touchcancel', 'mouseup']
  };
  function userAgent(pattern) {
    if (typeof window !== 'undefined' && window.navigator) {
      return !! /*@__PURE__*/navigator.userAgent.match(pattern);
    }
  }
  var IE11OrLess = userAgent(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i);
  var Edge = userAgent(/Edge/i);
  var Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);

  /**
   * detect passive event support
   */
  var supportPassive = function () {
    // https://github.com/Modernizr/Modernizr/issues/1894
    var supportPassive = false;
    document.addEventListener('checkIfSupportPassive', null, {
      get passive() {
        supportPassive = true;
        return true;
      }
    });
    return supportPassive;
  }();
  var vendorPrefix = function () {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      // Server environment
      return '';
    }

    // window.getComputedStyle() returns null inside an iframe with display: none
    // in this case return an array with a fake mozilla style in it.
    var styles = window.getComputedStyle(document.documentElement, '') || ['-moz-hidden-iframe'];
    var pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || styles.OLink === '' && ['', 'o'])[1];
    switch (pre) {
      case 'ms':
        return 'ms';
      default:
        return pre && pre.length ? pre[0].toUpperCase() + pre.substr(1) : '';
    }
  }();

  /**
   * check if is HTMLElement
   */
  function isHTMLElement(node) {
    if (!node) return false;
    var ctx = document.createElement('div');
    try {
      ctx.appendChild(node.cloneNode(true));
      return node.nodeType == 1 ? true : false;
    } catch (e) {
      return node == window || node == document;
    }
  }

  /**
   * set transition style
   * @param {HTMLElement} el
   * @param {String | Function} transition
   */
  function setTransition(el, transition) {
    el.style["".concat(vendorPrefix, "Transition")] = transition ? transition === 'none' ? 'none' : "".concat(transition) : '';
  }

  /**
   * set transform style
   * @param {HTMLElement} el
   * @param {String} transform
   */
  function setTransform(el, transform) {
    el.style["".concat(vendorPrefix, "Transform")] = transform ? "".concat(transform) : '';
  }

  /**
   * add specified event listener
   * @param {HTMLElement} el
   * @param {String} event
   * @param {Function} fn
   * @param {Boolean} sp
   */
  function on(el, event, fn) {
    if (window.addEventListener) {
      el.addEventListener(event, fn, supportPassive || !IE11OrLess ? captureMode : false);
    } else if (window.attachEvent) {
      el.attachEvent('on' + event, fn);
    }
  }

  /**
   * remove specified event listener
   * @param {HTMLElement} el
   * @param {String} event
   * @param {Function} fn
   * @param {Boolean} sp
   */
  function off(el, event, fn) {
    if (window.removeEventListener) {
      el.removeEventListener(event, fn, supportPassive || !IE11OrLess ? captureMode : false);
    } else if (window.detachEvent) {
      el.detachEvent('on' + event, fn);
    }
  }

  /**
   * get touch event and current event
   * @param {Event|TouchEvent} evt
   */
  function getEvent(evt) {
    var event = evt;
    var touch = evt.touches && evt.touches[0] || evt.changedTouches && evt.changedTouches[0] || evt.pointerType && evt.pointerType === 'touch' && evt;
    var target = touch ? document.elementFromPoint(e.clientX, e.clientY) : evt.target;
    if (touch) {
      event.clientX = touch.clientX;
      event.clientY = touch.clientY;
      event.pageX = touch.pageX;
      event.pageY = touch.pageY;
      event.screenX = touch.screenX;
      event.screenY = touch.screenY;
    }
    return {
      touch: touch,
      event: event,
      target: target
    };
  }

  /**
   * get element's offetTop
   * @param {HTMLElement} el
   */
  function getOffset(el) {
    var offset = {
      top: 0,
      left: 0,
      height: el.offsetHeight,
      width: el.offsetWidth
    };
    var winScroller = getWindowScrollingElement();
    do {
      offset.top += el.offsetTop;
      offset.left += el.offsetLeft;
    } while (el !== winScroller && (el = el.offsetParent));
    return offset;
  }

  /**
   * get scroll element
   * @param {HTMLElement} el
   * @param {Boolean} includeSelf whether to include the passed element
   * @returns {HTMLElement} scroll element
   */
  function getParentAutoScrollElement(el, includeSelf) {
    // skip to window
    if (!el || !el.getBoundingClientRect) return getWindowScrollingElement();
    var elem = el;
    var gotSelf = false;
    do {
      // we don't need to get elem css if it isn't even overflowing in the first place (performance)
      if (elem.clientWidth < elem.scrollWidth || elem.clientHeight < elem.scrollHeight) {
        var elemCSS = css(elem);
        if (elem.clientWidth < elem.scrollWidth && (elemCSS.overflowX == 'auto' || elemCSS.overflowX == 'scroll') || elem.clientHeight < elem.scrollHeight && (elemCSS.overflowY == 'auto' || elemCSS.overflowY == 'scroll')) {
          if (!elem.getBoundingClientRect || elem === document.body) return getWindowScrollingElement();
          if (gotSelf || includeSelf) return elem;
          gotSelf = true;
        }
      }
    } while (elem = elem.parentNode);
    return getWindowScrollingElement();
  }
  function getWindowScrollingElement() {
    var scrollingElement = document.scrollingElement;
    if (scrollingElement) {
      return scrollingElement.contains(document.body) ? document : scrollingElement;
    } else {
      return document;
    }
  }

  /**
   * Returns the "bounding client rect" of given element
   * @param  {HTMLElement} el                       The element whose boundingClientRect is wanted
   * @param  {Object} check
   * @example - {
   * -   parent: true | false, 'check if parentNode.height < el.height'
   * -   block: true | false, 'Whether the rect should be relative to the containing block of (including) the container'
   * -   relative: true | false, 'Whether the rect should be relative to the relative parent of (including) the contaienr'
   * - }
   * @param  {HTMLElement} container              The parent the element will be placed in
   * @return {Object}                               The boundingClientRect of el, with specified adjustments
   */
  function getRect(el) {
    var check = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var container = arguments.length > 2 ? arguments[2] : undefined;
    if (!el.getBoundingClientRect && el !== window) return;
    var elRect, top, left, bottom, right, height, width;
    if (el !== window && el.parentNode && el !== getWindowScrollingElement()) {
      elRect = el.getBoundingClientRect();
      top = elRect.top;
      left = elRect.left;
      bottom = elRect.bottom;
      right = elRect.right;
      height = elRect.height;
      width = elRect.width;
      if (check.parent && el.parentNode !== el.ownerDocument.body) {
        var parentRect,
          parentNode = el.parentNode;
        while (parentNode && parentNode.getBoundingClientRect && parentNode !== el.ownerDocument.body) {
          parentRect = parentNode.getBoundingClientRect();
          if (parentRect.height < height) {
            top = parentRect.top;
            left = parentRect.left;
            bottom = parentRect.bottom;
            right = parentRect.right;
            height = parentRect.height;
            width = parentRect.width;
            return {
              top: top,
              left: left,
              bottom: bottom,
              right: right,
              width: width,
              height: height
            };
          }
          parentNode = parentNode.parentNode;
        }
      }
    } else {
      top = 0;
      left = 0;
      bottom = window.innerHeight;
      right = window.innerWidth;
      height = window.innerHeight;
      width = window.innerWidth;
    }
    if ((check.block || check.relative) && el !== window) {
      // Adjust for translate()
      container = container || el.parentNode;

      // Not needed on <= IE11
      if (!IE11OrLess) {
        do {
          if (container && container.getBoundingClientRect && (css(container, 'transform') !== 'none' || check.relative && css(container, 'position') !== 'static')) {
            var containerRect = container.getBoundingClientRect();

            // Set relative to edges of padding box of container
            top -= containerRect.top + parseInt(css(container, 'border-top-width'));
            left -= containerRect.left + parseInt(css(container, 'border-left-width'));
            bottom = top + elRect.height;
            right = left + elRect.width;
            break;
          }
          /* jshint boss:true */
        } while (container = container.parentNode);
      }
    }
    return {
      top: top,
      left: left,
      bottom: bottom,
      right: right,
      width: width,
      height: height
    };
  }
  function closest(el, selector, ctx, includeCTX) {
    if (el) {
      ctx = ctx || document;
      do {
        if (selector == null) {
          var children = _toConsumableArray(Array.from(ctx.children));

          // If it can be found directly in the child element, return
          var index = children.indexOf(el);
          if (index > -1) return children[index];

          // When the dom cannot be found directly in children, need to look down
          for (var i = 0; i < children.length; i++) {
            if (containes(el, children[i])) return children[i];
          }
        } else if (selector[0] === '>' ? el.parentNode === ctx && matches(el, selector) : matches(el, selector) || includeCTX && el === ctx) {
          return el;
        }
      } while (el = el.parentNode);
    }
    return null;
  }

  /**
   * Check if child element is contained in parent element
   * @param {HTMLElement} el
   * @param {HTMLElement} root
   */
  function containes(el, root) {
    if (root.compareDocumentPosition) {
      return root === el || !!(root.compareDocumentPosition(el) & 16);
    }
    if (root.contains && el.nodeType === 1) {
      return root.contains(el) && root !== el;
    }
    while (el = el.parentNode) if (el === root) return true;
    return false;
  }

  /**
   * Gets the last child in the el, ignoring ghostEl or invisible elements (clones)
   * @param  {HTMLElement} el       Parent element
   * @param  {selector} selector    Any other elements that should be ignored
   * @return {HTMLElement}          The last child, ignoring ghostEl
   */
  function lastChild(el, helper, selector) {
    var last = el.lastElementChild;
    while (last && (last === helper || css(last, 'display') === 'none' || selector && !matches(last, selector))) {
      last = last.previousElementSibling;
    }
    return last || null;
  }

  /**
   * add or remove element's class
   * @param {HTMLElement} el element
   * @param {String} name class name
   * @param {Boolean} state true: add, false: remove
   */
  function toggleClass(el, name, state) {
    if (el && name) {
      if (el.classList) {
        el.classList[state ? 'add' : 'remove'](name);
      } else {
        var className = (' ' + el.className + ' ').replace(R_SPACE, ' ').replace(' ' + name + ' ', ' ');
        el.className = (className + (state ? ' ' + name : '')).replace(R_SPACE, ' ');
      }
    }
  }

  /**
   * Check if a DOM element matches a given selector
   * @param {HTMLElement} el
   * @param {String} selector
   * @returns
   */
  function matches(el, selector) {
    if (!selector) return;
    selector[0] === '>' && (selector = selector.substring(1));
    if (el) {
      try {
        if (el.matches) {
          return el.matches(selector);
        } else if (el.msMatchesSelector) {
          return el.msMatchesSelector(selector);
        } else if (el.webkitMatchesSelector) {
          return el.webkitMatchesSelector(selector);
        }
      } catch (error) {
        return false;
      }
    }
    return false;
  }

  /**
   * Check whether the front and rear positions are consistent
   */
  function offsetChanged(o1, o2) {
    return o1.top !== o2.top || o1.left !== o2.left;
  }
  function css(el, prop, val) {
    var style = el && el.style;
    if (style) {
      if (val === void 0) {
        if (document.defaultView && document.defaultView.getComputedStyle) {
          val = document.defaultView.getComputedStyle(el, '');
        } else if (el.currentStyle) {
          val = el.currentStyle;
        }
        return prop === void 0 ? val : val[prop];
      } else {
        if (!(prop in style) && prop.indexOf('webkit') === -1) {
          prop = '-webkit-' + prop;
        }
        style[prop] = val + (typeof val === 'string' ? '' : 'px');
      }
    }
  }
  function _nextTick(fn) {
    return setTimeout(fn, 0);
  }
  function randomCode() {
    return Number(Math.random().toString().slice(-3) + Date.now()).toString(32);
  }
  var expando = 'Sortable' + Date.now();

  var multiFromTo = {
    sortable: null,
    nodes: []
  };
  var multiFrom = _objectSpread2({}, multiFromTo),
    multiTo = _objectSpread2({}, multiFromTo),
    selectedElements = {};
  var getMultiDiffer = function getMultiDiffer() {
    return {
      from: _objectSpread2({}, multiFrom),
      to: _objectSpread2({}, multiTo)
    };
  };
  function Multiple(options) {
    this.options = options || {};
    this.groupName = options.group.name;
  }
  Multiple.prototype = {
    /**
     * Indicates whether the multi-drag mode is used
     * @returns {boolean}
     */
    allowDrag: function allowDrag(dragEl) {
      return this.options.multiple && selectedElements[this.groupName] && selectedElements[this.groupName].length && selectedElements[this.groupName].indexOf(dragEl) > -1;
    },
    getHelper: function getHelper() {
      var container = document.createElement('div');
      selectedElements[this.groupName].forEach(function (node, index) {
        var clone = node.cloneNode(true);
        var opacity = index === 0 ? 1 : 0.5;
        clone.style = "\n        opacity: ".concat(opacity, ";\n        position: absolute;\n        z-index: ").concat(index, ";\n        left: 0;\n        top: 0;\n        width: 100%;\n        height: 100%;\n      ");
        container.appendChild(clone);
      });
      return container;
    },
    /**
     * Collecting Multi-Drag Elements
     */
    select: function select(event, dragEl, from) {
      var _this = this;
      if (!dragEl) return;
      if (!selectedElements[this.groupName]) {
        selectedElements[this.groupName] = [];
      }
      var index = selectedElements[this.groupName].indexOf(dragEl);
      toggleClass(dragEl, this.options.selectedClass, index < 0);
      var params = _objectSpread2(_objectSpread2({}, from), {}, {
        event: event
      });
      if (index < 0) {
        selectedElements[this.groupName].push(dragEl);
        from.sortable._dispatchEvent('onSelect', params);
      } else {
        selectedElements[this.groupName].splice(index, 1);
        from.sortable._dispatchEvent('onDeselect', params);
      }
      selectedElements[this.groupName].sort(function (a, b) {
        return _this._sortByOffset(getOffset(a), getOffset(b));
      });
    },
    onDrag: function onDrag(sortable) {
      multiFrom.sortable = sortable;
      multiFrom.nodes = selectedElements[this.groupName].map(function (node) {
        return {
          node: node,
          rect: getRect(node),
          offset: getOffset(node)
        };
      });
      multiTo.sortable = sortable;
    },
    onTrulyStarted: function onTrulyStarted(dragEl, sortable) {
      sortable.animator.collect(dragEl, dragEl, dragEl.parentNode);
      selectedElements[this.groupName].forEach(function (node) {
        if (node == dragEl) return;
        node.parentNode.removeChild(node);
      });
      sortable.animator.animate(sortable.options.animation);
    },
    onChange: function onChange(dragEl, sortable) {
      var rect = getRect(dragEl);
      var offset = getOffset(dragEl);
      multiTo.sortable = sortable;
      multiTo.nodes = selectedElements[this.groupName].map(function (node) {
        return {
          node: node,
          rect: rect,
          offset: offset
        };
      });
    },
    onDrop: function onDrop(event, dragEl, downEvent, _emits) {
      var _this2 = this;
      multiTo.sortable.animator.collect(dragEl, dragEl, dragEl.parentNode);
      var index = selectedElements[this.groupName].indexOf(dragEl);
      selectedElements[this.groupName].forEach(function (node, i) {
        if (i < index) {
          dragEl.parentNode.insertBefore(node, dragEl);
        } else {
          var dropEl = i > 0 ? selectedElements[_this2.groupName][i - 1] : dragEl;
          dragEl.parentNode.insertBefore(node, dropEl.nextSibling);
        }
      });
      multiFrom.sortable = downEvent.sortable;
      multiTo.nodes = selectedElements[this.groupName].map(function (node) {
        return {
          node: node,
          rect: getRect(node),
          offset: getOffset(node)
        };
      });
      var changed = this._offsetChanged(multiFrom.nodes, multiTo.nodes);
      var params = _objectSpread2(_objectSpread2({}, _emits()), {}, {
        changed: changed,
        event: event
      });
      if (multiTo.sortable.el != multiFrom.sortable.el) {
        multiFrom.sortable._dispatchEvent('onDrop', params);
      }
      multiTo.sortable._dispatchEvent('onDrop', params);
      multiTo.sortable.animator.animate(multiTo.sortable.options.animation);
    },
    _sortByOffset: function _sortByOffset(o1, o2) {
      return o1.top == o2.top ? o1.left > o2.left : o1.top > o2.top;
    },
    _offsetChanged: function _offsetChanged(ns1, ns2) {
      return !!ns1.find(function (node) {
        var n = ns2.find(function (n) {
          return n.node === node.node;
        });
        return offsetChanged(n.offset, node.offset);
      });
    }
  };

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback) {
      return setTimeout(callback, 17);
    };
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
  }
  function AutoScroll() {
    this.autoScrollAnimationFrame = null;
    this.speed = {
      x: 10,
      y: 10
    };
  }
  AutoScroll.prototype = {
    clear: function clear() {
      if (this.autoScrollAnimationFrame == null) {
        return;
      }
      cancelAnimationFrame(this.autoScrollAnimationFrame);
      this.autoScrollAnimationFrame = null;
    },
    update: function update(scrollEl, scrollThreshold, downEvent, moveEvent) {
      var _this = this;
      cancelAnimationFrame(this.autoScrollAnimationFrame);
      this.autoScrollAnimationFrame = requestAnimationFrame(function () {
        var _getRect = getRect(scrollEl),
          top = _getRect.top,
          right = _getRect.right,
          bottom = _getRect.bottom,
          left = _getRect.left;
        var clientX = moveEvent.clientX,
          clientY = moveEvent.clientY;
        if (clientY < top || clientY > bottom || clientX < left || clientX > right) {
          return;
        }
        if (downEvent && moveEvent) {
          _this.autoScroll(scrollEl, scrollThreshold, moveEvent);
        }
        _this.update(scrollEl, scrollThreshold, downEvent, moveEvent);
      });
    },
    autoScroll: function autoScroll(scrollEl, scrollThreshold, evt) {
      if (!scrollEl) return;
      var clientX = evt.clientX,
        clientY = evt.clientY;
      if (clientX === void 0 || clientY === void 0) return;
      var rect = getRect(scrollEl);
      if (!rect) return;
      var scrollTop = scrollEl.scrollTop,
        scrollLeft = scrollEl.scrollLeft,
        scrollHeight = scrollEl.scrollHeight,
        scrollWidth = scrollEl.scrollWidth;
      var top = rect.top,
        right = rect.right,
        bottom = rect.bottom,
        left = rect.left,
        height = rect.height,
        width = rect.width;

      // check direction
      var toTop = scrollTop > 0 && clientY >= top && clientY <= top + scrollThreshold;
      var toLeft = scrollLeft > 0 && clientX >= left && clientX <= left + scrollThreshold;
      var toRight = scrollLeft + width < scrollWidth && clientX <= right && clientX >= right - scrollThreshold;
      var toBottom = scrollTop + height < scrollHeight && clientY <= bottom && clientY >= bottom - scrollThreshold;
      var scrollx = 0,
        scrolly = 0;
      if (toLeft) {
        scrollx = Math.floor(Math.max(-1, (clientX - left) / scrollThreshold - 1) * this.speed.x);
      } else if (toRight) {
        scrollx = Math.ceil(Math.min(1, (clientX - right) / scrollThreshold + 1) * this.speed.x);
      } else {
        scrollx = 0;
      }
      if (toTop) {
        scrolly = Math.floor(Math.max(-1, (clientY - top) / scrollThreshold - 1) * this.speed.y);
      } else if (toBottom) {
        scrolly = Math.ceil(Math.min(1, (clientY - bottom) / scrollThreshold + 1) * this.speed.y);
      } else {
        scrolly = 0;
      }
      if (scrolly) {
        scrollEl.scrollTop += scrolly;
      }
      if (scrollx) {
        scrollEl.scrollLeft += scrollx;
      }
    }
  };

  function Animation() {
    this.animations = [];
  }
  Animation.prototype = {
    collect: function collect(dragEl, dropEl, container, except) {
      var _this = this;
      if (!container) return;
      var children = _toConsumableArray(Array.from(container.children));
      var _this$_getRange = this._getRange(children, dragEl, dropEl, except),
        start = _this$_getRange.start,
        end = _this$_getRange.end;
      this.animations.length = 0;
      var offsetHeight = (dragEl || dropEl).offsetHeight;
      var max = Math.floor(container.scrollHeight / offsetHeight);
      var min = Math.min(children.length - 1, max);
      if (start < 0) {
        start = end;
        end = min;
      }
      if (end < 0) end = min;
      children.slice(start, end + 1).forEach(function (node) {
        if (node === except) return;
        _this.animations.push({
          node: node,
          rect: getRect(node)
        });
      });
    },
    animate: function animate(animation) {
      var _this2 = this;
      this.animations.forEach(function (state) {
        var node = state.node,
          rect = state.rect;
        _this2._excute(node, rect, animation);
      });
    },
    _excute: function _excute(el, _ref) {
      var left = _ref.left,
        top = _ref.top;
      var animation = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 150;
      var rect = getRect(el);
      var ot = top - rect.top;
      var ol = left - rect.left;
      setTransition(el, 'none');
      setTransform(el, "translate3d(".concat(ol, "px, ").concat(ot, "px, 0)"));

      // repaint
      el.offsetWidth;
      setTransition(el, "".concat(animation, "ms"));
      setTransform(el, 'translate3d(0px, 0px, 0px)');
      clearTimeout(el.animated);
      el.animated = setTimeout(function () {
        setTransition(el, '');
        setTransform(el, '');
        el.animated = null;
      }, animation);
    },
    _getRange: function _getRange(children, dragEl, dropEl) {
      var start = children.indexOf(dragEl);
      var end = children.indexOf(dropEl);
      if (start > end) {
        var _ref2 = [end, start];
        start = _ref2[0];
        end = _ref2[1];
      }
      return {
        start: start,
        end: end
      };
    }
  };

  function Helper() {
    this.helper = null;
  }
  Helper.prototype = {
    get node() {
      return this.helper;
    },
    destroy: function destroy() {
      if (this.helper && this.helper.parentNode) {
        this.helper.parentNode.removeChild(this.helper);
      }
      this.helper = null;
    },
    move: function move(x, y) {
      setTransform(this.helper, "translate3d(".concat(x, "px, ").concat(y, "px, 0)"));
    },
    init: function init(rect, element, container, options, distance) {
      if (this.helper) return;
      var fallbackOnBody = options.fallbackOnBody,
        ghostClass = options.ghostClass,
        _options$ghostStyle = options.ghostStyle,
        ghostStyle = _options$ghostStyle === void 0 ? {} : _options$ghostStyle;
      var helperContainer = fallbackOnBody ? document.body : container;
      this.helper = element.cloneNode(true);
      toggleClass(this.helper, ghostClass, true);
      var helperStyle = _objectSpread2({
        'box-sizing': 'border-box',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        position: 'fixed',
        opacity: '0.8',
        'z-index': 100000,
        'pointer-events': 'none'
      }, ghostStyle);
      for (var key in helperStyle) {
        css(this.helper, key, helperStyle[key]);
      }
      setTransition(this.helper, 'none');
      setTransform(this.helper, 'translate3d(0px, 0px, 0px)');
      helperContainer.appendChild(this.helper);
      var ox = distance.x / parseInt(this.helper.style.width) * 100;
      var oy = distance.y / parseInt(this.helper.style.height) * 100;
      css(this.helper, 'transform-origin', "".concat(ox, "% ").concat(oy, "%"));
      css(this.helper, 'transform', 'translateZ(0)');
    }
  };

  var FromTo = {
    sortable: null,
    group: null,
    node: null,
    rect: {},
    offset: {}
  };

  // -------------------------------- Sortable ----------------------------------
  var sortables = [];
  var rootEl,
    dragEl,
    dropEl,
    downEvent,
    moveEvent,
    touchEvent,
    isMultiple,
    autoScroller,
    dragStartTimer,
    // timer for start to drag
    helper = new Helper();
  var from = _objectSpread2({}, FromTo);
  var to = _objectSpread2({}, FromTo);
  var distance = {
    x: 0,
    y: 0
  };
  var lastPosition = {
    x: 0,
    y: 0
  };
  var _prepareGroup = function _prepareGroup(options, uniqueId) {
    var group = {};
    var originalGroup = options.group;
    if (!originalGroup || _typeof(originalGroup) != 'object') {
      originalGroup = {
        name: originalGroup,
        pull: true,
        put: true
      };
    }
    group.name = originalGroup.name || uniqueId;
    group.pull = originalGroup.pull;
    group.put = originalGroup.put;
    options.group = group;
  };

  /**
   * get nearest Sortable
   */
  var _nearestSortable = function _nearestSortable(evt) {
    if (dragEl) {
      var e = evt.touches ? evt.touches[0] : evt;
      var nearest = _detectNearestSortable(e.clientX, e.clientY);
      if (nearest) {
        rootEl = nearest;
        if (rootEl === downEvent.sortable.el) return;
        nearest[expando]._onMove(evt);
      }
    }
  };
  /**
   * Detects first nearest empty sortable to X and Y position using emptyInsertThreshold.
   * @param  {Number} x      X position
   * @param  {Number} y      Y position
   * @return {HTMLElement}   Element of the first found nearest Sortable
   */
  var _detectNearestSortable = function _detectNearestSortable(x, y) {
    var result;
    sortables.some(function (sortable) {
      var threshold = sortable[expando].options.emptyInsertThreshold;
      if (!threshold) return;
      var rect = getRect(sortable, {
          parent: true
        }),
        insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold,
        insideVertically = y >= rect.top - threshold && y <= rect.bottom + threshold;
      if (insideHorizontally && insideVertically) {
        return result = sortable;
      }
    });
    return result;
  };
  var _positionChanged = function _positionChanged(evt) {
    var clientX = evt.clientX,
      clientY = evt.clientY;
    var distanceX = clientX - lastPosition.x;
    var distanceY = clientY - lastPosition.y;
    lastPosition.x = clientX;
    lastPosition.y = clientY;
    if (clientX !== void 0 && clientY !== void 0 && Math.abs(distanceX) <= 0 && Math.abs(distanceY) <= 0) {
      return false;
    }
    return true;
  };
  var _emits = function _emits() {
    var result = {
      from: _objectSpread2({}, from),
      to: _objectSpread2({}, to)
    };
    if (isMultiple) {
      var ft = getMultiDiffer();
      result.from = _objectSpread2(_objectSpread2({}, ft.from), result.from);
      result.to = _objectSpread2(_objectSpread2({}, ft.to), result.to);
    }
    return result;
  };

  /**
   * @class  Sortable
   * @param  {HTMLElement}  el group element
   * @param  {Object}       options
   */
  function Sortable(el, options) {
    if (!(el && el.nodeType && el.nodeType === 1)) {
      throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(el));
    }
    el[expando] = this;
    this.el = el;
    this.ownerDocument = el.ownerDocument;
    this.options = options = Object.assign({}, options);
    var defaults = {
      group: '',
      animation: 150,
      multiple: false,
      draggable: null,
      handle: null,
      onDrag: null,
      onMove: null,
      onDrop: null,
      onChange: null,
      autoScroll: true,
      scrollThreshold: 25,
      delay: 0,
      delayOnTouchOnly: false,
      disabled: false,
      ghostClass: '',
      ghostStyle: {},
      chosenClass: '',
      selectedClass: '',
      fallbackOnBody: false,
      stopPropagation: false,
      supportPointer: 'onpointerdown' in window && !Safari,
      supportTouch: 'ontouchstart' in window,
      emptyInsertThreshold: 5
    };

    // Set default options
    for (var name in defaults) {
      !(name in this.options) && (this.options[name] = defaults[name]);
    }
    _prepareGroup(options, 'group_' + randomCode());

    // Bind all private methods
    for (var fn in this) {
      if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
        this[fn] = this[fn].bind(this);
      }
    }
    var _this$options = this.options,
      supportPointer = _this$options.supportPointer,
      supportTouch = _this$options.supportTouch;
    if (supportPointer) {
      on(el, 'pointerdown', this._onDrag);
    } else if (supportTouch) {
      on(el, 'touchstart', this._onDrag);
    } else {
      on(el, 'mousedown', this._onDrag);
    }
    sortables.push(el);
    this.multiplayer = new Multiple(this.options);
    this.animator = new Animation();
    autoScroller = new AutoScroll();
  }
  Sortable.prototype = {
    constructor: Sortable,
    get helper() {
      return helper.node;
    },
    // -------------------------------- public methods ----------------------------------
    /**
     * Destroy
     */
    destroy: function destroy() {
      this._dispatchEvent('destroy', this);
      this.el[expando] = null;
      for (var i = 0; i < events.start.length; i++) {
        off(this.el, events.start[i], this._onDrag);
      }

      // clear status
      this._clearState();
      sortables.splice(sortables.indexOf(this.el), 1);
      if (sortables.length == 0) autoScroller = null;
      this.el = null;
    },
    // -------------------------------- prepare start ----------------------------------
    _onDrag: function _onDrag( /** Event|TouchEvent */evt) {
      var _this = this;
      if (dragEl || this.options.disabled || !this.options.group.pull) return;
      if (/mousedown|pointerdown/.test(evt.type) && evt.button !== 0) return; // only left button and enabled

      var _getEvent = getEvent(evt),
        touch = _getEvent.touch,
        event = _getEvent.event,
        target = _getEvent.target;

      // Safari ignores further event handling after mousedown
      if (Safari && target && target.tagName.toUpperCase() === 'SELECT') return;
      if (target === this.el) return;
      var _this$options2 = this.options,
        draggable = _this$options2.draggable,
        handle = _this$options2.handle;
      if (typeof handle === 'function' && !handle(evt)) return;
      if (typeof handle === 'string' && !matches(target, handle)) return;
      if (typeof draggable === 'function') {
        // Function type must return a HTMLElement if used to specifies the drag el
        var element = draggable(evt);
        if (!element) return;
        // set drag element
        if (isHTMLElement(element)) dragEl = element;
      } else {
        // String use as 'TagName' or '.class' or '#id'
        dragEl = closest(target, draggable, this.el, false);
      }

      // No dragging is allowed when there is no dragging element
      if (!dragEl || dragEl.animated) return;

      // solve the problem that the mobile cannot be dragged
      if (touch) dragEl.style['touch-action'] = 'none';
      var parentEl = dragEl.parentNode;
      touchEvent = touch;
      downEvent = event;
      downEvent.sortable = this;
      downEvent.group = parentEl;
      isMultiple = this.options.multiple && this.multiplayer.allowDrag(dragEl);
      // multi-drag
      if (isMultiple) this.multiplayer.onDrag(this);

      // get the position of the dragEl
      var rect = getRect(dragEl);
      var offset = getOffset(dragEl);
      from = {
        sortable: this,
        group: parentEl,
        node: dragEl,
        rect: rect,
        offset: offset
      };
      to.group = parentEl;
      to.sortable = this;
      distance = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };

      // enable drag between groups
      if (this.options.supportPointer) {
        on(this.ownerDocument, 'pointermove', _nearestSortable);
      } else if (touch) {
        on(this.ownerDocument, 'touchmove', _nearestSortable);
      } else {
        on(this.ownerDocument, 'mousemove', _nearestSortable);
      }
      var _this$options3 = this.options,
        delay = _this$options3.delay,
        delayOnTouchOnly = _this$options3.delayOnTouchOnly;
      if (delay && (!delayOnTouchOnly || touch) && !(Edge || IE11OrLess)) {
        clearTimeout(dragStartTimer);
        // delay to start
        dragStartTimer = setTimeout(function () {
          return _this._onStart();
        }, delay);
      } else {
        this._onStart();
      }
    },
    _onStart: function _onStart() {
      rootEl = this.el;
      if (this.options.supportPointer) {
        on(this.ownerDocument, 'pointermove', this._onMove);
        on(this.ownerDocument, 'pointerup', this._onDrop);
        on(this.ownerDocument, 'pointercancel', this._onDrop);
      } else if (touchEvent) {
        on(this.ownerDocument, 'touchmove', this._onMove);
        on(this.ownerDocument, 'touchend', this._onDrop);
        on(this.ownerDocument, 'touchcancel', this._onDrop);
      } else {
        on(this.ownerDocument, 'mousemove', this._onMove);
        on(this.ownerDocument, 'mouseup', this._onDrop);
      }

      // clear selection
      try {
        if (document.selection) {
          // Timeout neccessary for IE9
          _nextTick(function () {
            document.selection.empty();
          });
        } else {
          window.getSelection().removeAllRanges();
        }
      } catch (error) {}
    },
    // -------------------------------- real started ----------------------------------
    _onTrulyStarted: function _onTrulyStarted() {
      if (!moveEvent) {
        // on-drag
        this._dispatchEvent('onDrag', _objectSpread2(_objectSpread2({}, _emits()), {}, {
          event: downEvent
        }));
        // on-multi-drag
        if (isMultiple) this.multiplayer.onTrulyStarted(dragEl, this);

        // Init in the move event to prevent conflict with the click event
        var element = isMultiple ? this.multiplayer.getHelper() : dragEl;
        helper.init(from.rect, element, this.el, this.options, distance);

        // add class for drag element
        toggleClass(dragEl, this.options.chosenClass, true);
        dragEl.style['will-change'] = 'transform';
        if (Safari) css(document.body, 'user-select', 'none');
      }
    },
    // -------------------------------- move ----------------------------------
    _onMove: function _onMove( /** Event|TouchEvent */evt) {
      this._preventEvent(evt);
      if (!downEvent || !dragEl) return;
      if (!_positionChanged(evt)) return;
      var _getEvent2 = getEvent(evt),
        event = _getEvent2.event,
        target = _getEvent2.target;
      // truly started
      this._onTrulyStarted();
      moveEvent = event; // sortable state move is active

      var x = evt.clientX - downEvent.clientX;
      var y = evt.clientY - downEvent.clientY;
      helper.move(x, y);

      // on-move
      this._dispatchEvent('onMove', _objectSpread2(_objectSpread2({}, _emits()), {}, {
        event: event
      }));
      if (!this.scrollEl) {
        // get the scroll element, fix display 'none' to 'block'
        this.scrollEl = getParentAutoScrollElement(this.el, true);
      }

      // auto scroll
      var _this$options4 = this.options,
        autoScroll = _this$options4.autoScroll,
        scrollThreshold = _this$options4.scrollThreshold;
      if (autoScroll) {
        autoScroller.update(this.scrollEl, scrollThreshold, downEvent, moveEvent);
      }
      if (!this._allowPut()) return;
      dropEl = closest(target, this.options.draggable, rootEl, false);
      if (dropEl === dragEl || dropEl && dropEl.animated) return;
      if (dropEl && containes(dropEl, dragEl)) return;
      if (rootEl !== from.sortable.el) {
        if (target === rootEl || !lastChild(rootEl, helper.node)) {
          this._onInsert(event, true);
        } else if (dropEl) {
          this._onInsert(event, false);
        }
      } else if (dropEl) {
        this._onChange(event);
      }
    },
    _allowPut: function _allowPut() {
      if (downEvent.group === this.el) {
        return true;
      } else if (!this.options.group.put) {
        return false;
      } else {
        var name = this.options.group.name;
        var fromGroup = downEvent.sortable.options.group;
        return fromGroup.name && name && fromGroup.name === name;
      }
    },
    _onInsert: function _onInsert( /** Event|TouchEvent */event, insert) {
      var target = insert ? dragEl : dropEl;
      var parentEl = insert ? rootEl : dropEl.parentNode;
      from.sortable.animator.collect(dragEl, null, dragEl.parentNode, dragEl);
      this.animator.collect(null, target, parentEl, dragEl);
      if (isMultiple) this.multiplayer.onChange(dragEl, this);
      to = {
        sortable: this,
        group: parentEl,
        node: target,
        rect: getRect(dragEl),
        offset: getOffset(dragEl)
      };
      from.sortable._dispatchEvent('onRemove', _objectSpread2(_objectSpread2({}, _emits()), {}, {
        event: event
      }));
      if (insert) {
        parentEl.appendChild(dragEl);
      } else {
        parentEl.insertBefore(dragEl, target);
      }
      this._dispatchEvent('onAdd', _objectSpread2(_objectSpread2({}, _emits()), {}, {
        event: event
      }));
      from.sortable.animator.animate();
      this.animator.animate();
      from.group = parentEl;
      from.sortable = this;
    },
    _onChange: function _onChange( /** Event|TouchEvent */event) {
      var parentEl = dropEl.parentNode;
      this.animator.collect(dragEl, dropEl, parentEl);
      if (isMultiple) this.multiplayer.onChange(dragEl, this);
      to = {
        sortable: this,
        group: parentEl,
        node: dropEl,
        rect: getRect(dropEl),
        offset: getOffset(dropEl)
      };
      this._dispatchEvent('onChange', _objectSpread2(_objectSpread2({}, _emits()), {}, {
        event: event
      }));

      // the top value is compared first, and the left is compared if the top value is the same
      var offset = getOffset(dragEl);
      if (offset.top < to.offset.top || offset.left < to.offset.left) {
        parentEl.insertBefore(dragEl, dropEl.nextSibling);
      } else {
        parentEl.insertBefore(dragEl, dropEl);
      }
      this.animator.animate();
      from.group = parentEl;
      from.sortable = this;
    },
    // -------------------------------- on drop ----------------------------------
    _onDrop: function _onDrop( /** Event|TouchEvent */evt) {
      this._unbindMoveEvents();
      this._unbindDropEvents();
      this._preventEvent(evt);
      autoScroller.clear();
      clearTimeout(dragStartTimer);

      // clear style, attrs and class
      if (dragEl) {
        toggleClass(dragEl, this.options.chosenClass, false);
        if (touchEvent) dragEl.style['touch-action'] = '';
        dragEl.style['will-change'] = '';
      }
      // drag and drop done
      if (dragEl && downEvent && moveEvent) {
        from.group = downEvent.group;
        from.sortable = downEvent.sortable;
        if (isMultiple) {
          this.multiplayer.onDrop(evt, dragEl, downEvent, _emits);
        } else {
          // re-acquire the offset and rect values of the dragged element as the value after the drag is completed
          to.rect = getRect(dragEl);
          to.offset = getOffset(dragEl);
          var changed = offsetChanged(from.offset, to.offset);
          var params = _objectSpread2(_objectSpread2({}, _emits()), {}, {
            changed: changed,
            event: evt
          });
          // on-drop
          if (to.sortable.el !== from.sortable.el) {
            from.sortable._dispatchEvent('onDrop', params);
          }
          to.sortable._dispatchEvent('onDrop', params);
        }
        if (Safari) css(document.body, 'user-select', '');
      } else if (this.options.multiple) {
        // click event
        this.multiplayer.select(evt, dragEl, _objectSpread2({}, from));
      }
      this._clearState();
    },
    // -------------------------------- event ----------------------------------
    _preventEvent: function _preventEvent(evt) {
      evt.preventDefault !== void 0 && evt.cancelable && evt.preventDefault();
      if (this.options.stopPropagation) evt.stopPropagation && evt.stopPropagation(); // prevent events from bubbling
    },

    _dispatchEvent: function _dispatchEvent(event, params) {
      var callback = this.options[event];
      if (typeof callback === 'function') callback(params);
    },
    // -------------------------------- clear ----------------------------------
    _clearState: function _clearState() {
      dragEl = dropEl = downEvent = moveEvent = touchEvent = isMultiple = dragStartTimer = Sortable.ghost = null;
      distance = lastPosition = {
        x: 0,
        y: 0
      };
      from = to = _objectSpread2({}, FromTo);
      helper.destroy();
    },
    _unbindMoveEvents: function _unbindMoveEvents() {
      for (var i = 0; i < events.move.length; i++) {
        off(this.ownerDocument, events.move[i], this._onMove);
        off(this.ownerDocument, events.move[i], _nearestSortable);
      }
    },
    _unbindDropEvents: function _unbindDropEvents() {
      for (var i = 0; i < events.end.length; i++) {
        off(this.ownerDocument, events.end[i], this._onDrop);
      }
    }
  };
  Sortable.prototype.utils = {
    getRect: getRect,
    getOffset: getOffset
  };

  return Sortable;

})));

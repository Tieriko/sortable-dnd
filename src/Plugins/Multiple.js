import {
  css,
  getRect,
  setRect,
  debounce,
  getIndex,
  getOffset,
  lastChild,
  unsetRect,
  getElement,
  toggleClass,
  getMouseRect,
  offsetChanged,
  isHTMLElement
} from '../utils';

const MultiFromTo = { sortable: null, group: null, nodes: [] };

/**
 * Difference before and after dragging
 */
class MultiDifference {
  constructor() {
    this.from = { ...MultiFromTo };
    this.to = { ...MultiFromTo };
  }
  destroy() {
    this.from = { ...MultiFromTo };
    this.to = { ...MultiFromTo };
  }
}

let selectedElements = [];

let multiDiffer = new MultiDifference();

const _emitMultiDiffer = function () {
  return { from: { ...multiDiffer.from }, to: { ...multiDiffer.to } };
};

const _offsetChanged = function (ns1, ns2) {
  return !!ns1.find((node) => {
    let n = ns2.find((n) => n.node === node.node);
    return offsetChanged(n.offset, node.offset);
  });
};

export default function Multiple() {
  return {
    _setMultiElements: function (event, group) {
      if (!this.options.multiple) return;

      let target;

      const { draggable } = this.options;
      if (typeof draggable === 'function') {
        const element = draggable(event);
        if (!element) return;
        if (isHTMLElement(element)) target = element;
      }
      if (!target) target = getElement(this.el, event.target, true);

      if (!target) return;

      toggleClass(target, this.options.selectedClass, !~selectedElements.indexOf(target));

      let params = {
        sortable: this,
        group,
        target,
        event,
        originalEvent: event
      };
      if (!~selectedElements.indexOf(target)) {
        selectedElements.push(target);
        this._dispatchEvent('onSelect', params);
      } else {
        selectedElements.splice(selectedElements.indexOf(target), 1);
        this._dispatchEvent('onDeselect', params);
      }

      // get each node's index in group
      selectedElements.forEach((node) => {
        node.sortableIndex = getIndex(this.el, node);
      });

      // sort
      selectedElements.sort((a, b) => a.sortableIndex - b.sortableIndex);
    },

    _allowMultiDrag: function (dragEl) {
      return this.options.multiple && selectedElements.length && selectedElements.includes(dragEl);
    },

    _getMultiGhostElement: function () {
      const ghost = document.createElement('div');
      selectedElements.forEach((node, index) => {
        let clone = node.cloneNode(true);
        let pos = index * 4 + 4;
        let opacity = index === 0 ? 1 : 0.5;
        clone.style = `opacity: ${opacity};position: absolute;z-index: ${index};bottom: -${pos}px;right: -${pos}px;width: 100%;height: 100%;`;
        ghost.appendChild(clone);
      });
      return ghost;
    },

    _setMultiDiffer: function (key) {
      multiDiffer[key] = {
        sortable: this,
        group: this.el,
        nodes: selectedElements.map((node) => {
          return { node, rect: getRect(node), offset: getOffset(node) };
        })
      };
    },

    _onMultiDrag: function () {
      this._setMultiDiffer('from');
    },

    _onMultiStarted: function ({ e, evt, dragEl }) {
      // on-muti-drag
      this._dispatchEvent('onDrag', {
        ..._emitMultiDiffer(),
        event: e,
        originalEvent: evt
      });

      // capture animate
      this._captureAnimationState(dragEl);

      selectedElements.forEach((node) => {
        if (node === dragEl) return;
        css(node, 'position', 'absolute');
      });

      let dragRect = getRect(dragEl, { relative: true });

      // hide selected elements
      selectedElements.forEach((node) => {
        if (node === dragEl) return;
        setRect(node, dragRect);
        css(node, 'display', 'none');
      });

      this._animate();
    },

    _onMultiMove: function ({ e, evt, dragEl, ghostEl }) {
      // on-multi-move
      this._dispatchEvent('onMove', {
        ..._emitMultiDiffer(),
        ghostEl,
        event: e,
        originalEvent: evt
      });

      let rect = getMouseRect(e);

      // move selected elements
      selectedElements.forEach((node) => {
        if (node === dragEl) return;
        css(node, 'top', rect.top);
        css(node, 'left', rect.left);
      });
    },

    _onMultiChange: debounce(function ({ dragEl, rootEl, target, e, evt }) {
      if (!multiDiffer.from.group) return;
      if (!lastChild(rootEl) || (target === rootEl && multiDiffer.from.group !== rootEl)) {
        multiDiffer.from.sortable._captureAnimationState(dragEl, dragEl);

        selectedElements.forEach((node) => {
          rootEl.appendChild(node);
        });

        this._setMultiDiffer('to');

        // on-remove
        multiDiffer.from.sortable._dispatchEvent('onRemove', {
          ..._emitMultiDiffer(),
          event: e,
          originalEvent: evt
        });
        // on-add
        this._dispatchEvent('onAdd', {
          ..._emitMultiDiffer(),
          event: e,
          originalEvent: evt
        });

        multiDiffer.from.sortable._animate();
      } else {
        const { el, rect, offset } = getElement(rootEl, target);
        if (!el || (el && el.animated) || el === dragEl) return;

        this._setMultiDiffer('to');

        const { clientX, clientY } = e;
        const { left, right, top, bottom } = rect;

        // swap when the elements before and after the drag are inconsistent
        if (clientX > left && clientX < right && clientY > top && clientY < bottom) {
          this._captureAnimationState(dragEl, el);

          if (multiDiffer.from.group !== multiDiffer.to.group) {
            multiDiffer.from.sortable._captureAnimationState(dragEl, el);

            selectedElements.forEach((node) => {
              rootEl.insertBefore(node, el);
            });

            // on-remove
            multiDiffer.from.sortable._dispatchEvent('onRemove', {
              ..._emitMultiDiffer(),
              event: e,
              originalEvent: evt
            });
            // on-add
            this._dispatchEvent('onAdd', {
              ..._emitMultiDiffer(),
              event: e,
              originalEvent: evt
            });

            multiDiffer.from.sortable._animate();
          } else {
            // the top value is compared first, and the left is compared if the top value is the same
            const _offset = getOffset(dragEl);
            if (_offset.top < offset.top || _offset.left < offset.left) {
              selectedElements.forEach((node) => {
                rootEl.insertBefore(node, el.nextSibling);
              });
            } else {
              selectedElements.forEach((node) => {
                rootEl.insertBefore(node, el);
              });
            }

            // on-change
            this._dispatchEvent('onChange', {
              ..._emitMultiDiffer(),
              event: e,
              originalEvent: evt
            });
          }
          this._animate();
        }
      }
      multiDiffer.from.sortable = this;
      multiDiffer.from.group = rootEl;
    }, 3),

    _onMultiDrop: function ({ fromGroup, fromSortable, dragEl, rootEl, evt }) {
      this._captureAnimationState(dragEl);

      selectedElements.forEach((node) => {
        if (node === dragEl) return;
        unsetRect(node);
      });

      let index = selectedElements.indexOf(dragEl);
      for (let i = 0; i < selectedElements.length; i++) {
        if (i < index) {
          rootEl.insertBefore(selectedElements[i], dragEl);
        } else {
          let dropEl = i > 0 ? selectedElements[i - 1] : dragEl;
          rootEl.insertBefore(selectedElements[i], dropEl.nextSibling);
        }
      }

      multiDiffer.to.nodes = selectedElements.map((node) => {
        return { node, rect: getRect(node), offset: getOffset(node) };
      });
      if (!multiDiffer.to.group) {
        multiDiffer.to.group = this.el;
        multiDiffer.to.sortable = this;
      }

      multiDiffer.from.group = fromGroup;
      multiDiffer.from.sortable = fromSortable;

      const changed = _offsetChanged(multiDiffer.from.nodes, multiDiffer.to.nodes);
      const params = {
        ..._emitMultiDiffer(),
        changed,
        event: evt,
        originalEvent: evt
      };

      // on-drop
      if (multiDiffer.to.group !== fromGroup) fromSortable._dispatchEvent('onDrop', params);
      this._dispatchEvent('onDrop', params);

      this._animate();
    }
  };
}
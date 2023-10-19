import { css, toggleClass, setTransform, setTransition } from './utils';

function Helper() {
  this.helper = null;
  this.distance = { x: 0, y: 0 };
  this.maximumDeltas = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  };
}

Helper.prototype = {
  get node() {
    return this.helper;
  },

  destroy() {
    if (this.helper && this.helper.parentNode) {
      this.helper.parentNode.removeChild(this.helper);
    }
    this.helper = null;
    this.distance = { x: 0, y: 0 };
    this.maximumDeltas = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    };
  },

  getRestrictedByContainerDeltas(x, y) {
    const getResultDelta = (delta, maximumDelta) => {
      return Math.min(Math.abs(delta), maximumDelta);
    };

    let xRestricted = x;
    let yRestricted = y;
    if (x < 0) {
      xRestricted = -1 * getResultDelta(x, this.maximumDeltas.left);
    }
    if (x >= 0) {
      xRestricted = getResultDelta(x, this.maximumDeltas.right);
    }

    if (y < 0) {
      yRestricted = -1 * getResultDelta(y, this.maximumDeltas.top);
    }
    if (y >= 0) {
      yRestricted = getResultDelta(y, this.maximumDeltas.bottom);
    }

    return {
      x: xRestricted,
      y: yRestricted,
    };
  },

  move(x, y) {
    if (!this.helper) return;

    const restrictedCoords = this.getRestrictedByContainerDeltas(x, y);
    setTransform(this.helper, `translate3d(${restrictedCoords.x}px, ${restrictedCoords.y}px, 0)`);
  },

  getCoordsAtCorners(element) {
    const { top, left, width, height } = element.getBoundingClientRect();
    return {
      leftTop: {
        x: Math.round(left),
        y: Math.round(top),
      },
      rightBottom: {
        x: Math.round(left + width),
        y: Math.round(top + height),
      },
    };
  },

  getMaximumDeltas(target, container) {
    const targetCoords = this.getCoordsAtCorners(target);
    const containerCoords = this.getCoordsAtCorners(container);
    return {
      left: Math.abs(containerCoords.leftTop.x - targetCoords.leftTop.x),
      right: Math.abs(containerCoords.rightBottom.x - targetCoords.rightBottom.x),
      top: Math.abs(containerCoords.leftTop.y - targetCoords.leftTop.y),
      bottom: Math.abs(containerCoords.rightBottom.y - targetCoords.rightBottom.y),
    };
  },

  init(rect, element, container, options) {
    if (this.helper) return;

    const { fallbackOnBody, ghostClass, ghostStyle, constraintContainerSelector } = options;
    const helperContainer = fallbackOnBody ? document.body : container;

    const constraintContainer = constraintContainerSelector
      ? document.querySelector(constraintContainerSelector)
      : document.body;
    this.maximumDeltas = this.getMaximumDeltas(element, constraintContainer);

    this.helper = element.cloneNode(true);
    toggleClass(this.helper, ghostClass, true);

    const helperStyle = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      position: 'fixed',
      opacity: '0.8',
      'z-index': 100000,
      'pointer-events': 'none',
      'box-sizing': 'border-box',
      ...ghostStyle,
    };

    for (const key in helperStyle) {
      css(this.helper, key, helperStyle[key]);
    }

    setTransition(this.helper, 'none');
    setTransform(this.helper, 'translate3d(0px, 0px, 0px)');

    helperContainer.appendChild(this.helper);

    let ox = (this.distance.x / parseInt(this.helper.style.width)) * 100;
    let oy = (this.distance.y / parseInt(this.helper.style.height)) * 100;
    css(this.helper, 'transform-origin', `${ox}% ${oy}%`);
    css(this.helper, 'transform', 'translateZ(0)');
    css(this.helper, 'will-change', 'transform');
  },
};

export default Helper;

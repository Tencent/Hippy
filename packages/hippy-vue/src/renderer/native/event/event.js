/* eslint-disable no-underscore-dangle */

class Event {
  constructor(eventName) {
    this.type = eventName;
    this.bubbles = true;
    this.cancelable = true;
    this.eventPhase = false;
    this.timeStamp = Date.now();
    // TODO: Should point to VDOM element.
    this.originalTarget = null;
    this.currentTarget = null;
    this.target = null;
    // Private properties
    this._canceled = false;
  }

  get canceled() {
    return this._canceled;
  }

  stopPropagation() {
    this.bubbles = false;
  }

  preventDefault() {
    if (!this.cancelable) {
      return;
    }
    this._canceled = true;
  }

  /**
   * Old fashioned compatible.
   */
  initEvent(eventName, bubbles = true, cancelable = true) {
    this.type = eventName;
    if (bubbles === false) {
      this.bubbles = false;
    }
    if (cancelable === false) {
      this.cancelable = false;
    }
    return this;
  }
}

export {
  Event,
};

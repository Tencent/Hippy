/**
 * Capitalize a word
 *
 * @param {string} str The word input
 * @returns string
 */
function capitalize(str) {
  if (typeof str !== 'string') {
    return '';
  }
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
}

/**
 * Get binding events redirector
 *
 * The function should be called with `getEventRedirector.call(this, [])`
 * for binding this.
 *
 * @param {string[] | string[][]} events events will be redirect
 * @returns Object
 */
function getEventRedirector(events) {
  const on = {};
  events.forEach((event) => {
    if (Array.isArray(event)) {
      // exposedEventName is used in vue declared, nativeEventName is used in native
      const [exposedEventName, nativeEventName] = event;
      if (Object.prototype.hasOwnProperty.call(this.$listeners, exposedEventName)) {
        // Use event handler first if declared
        if (this[`on${capitalize(nativeEventName)}`]) {
          // event will be converted like "dropped,pageSelected" which assigned to "on" object
          on[event] = this[`on${capitalize(nativeEventName)}`];
        } else {
          // if no event handler found, emit default exposedEventName.
          on[event] = evt => this.$emit(exposedEventName, evt);
        }
      }
    } else if (Object.prototype.hasOwnProperty.call(this.$listeners, event)) {
      if (this[`on${capitalize(event)}`]) {
        on[event] = this[`on${capitalize(event)}`];
      } else {
        on[event] = evt => this.$emit(event, evt);
      }
    }
  });
  return on;
}

export {
  capitalize,
  getEventRedirector,
};

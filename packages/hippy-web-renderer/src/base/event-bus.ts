
export class HippyWebEventBus {
  subscriptions = Object.create(null);

  subscribe(evt: string, func: Function) {
      if (typeof func !== 'function') {
          throw "Subscribers must be functions"
      }
      const oldSubscriptions = this.subscriptions[evt] || [];
      oldSubscriptions.push(func);
      this.subscriptions[evt] = oldSubscriptions;
  }
  publish(evt: string) {
      let args = Array.prototype.slice.call(arguments, 1);
      const subFunctions = this.subscriptions[evt] || [];
      for (let i = 0; i < subFunctions.length; i++) {
          subFunctions[i].apply(null, args)
      }
  }
  unsubscribe(evt, func) {
      const oldSubscriptions = this.subscriptions[evt] || [];
      const newSubscriptions = oldSubscriptions.filter((item) => item !== func);
      this.subscriptions[evt] = newSubscriptions;
  }
  cancel(evt: string) {
      delete this.subscriptions[evt];
  }
}

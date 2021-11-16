import HippyEventListener from './listener';

interface EventEmitterRevoker {
  callback: number | undefined;
  bindListener: HippyEventListener | undefined;
}

class EventEmitterRevoker implements EventEmitterRevoker {
  constructor(id: number, listener: HippyEventListener) {
    this.callback = id;
    this.bindListener = listener;
  }

  public remove() {
    if (typeof this.callback !== 'number' || !this.bindListener) {
      return;
    }

    this.bindListener.removeCallback(this.callback);
    this.bindListener = undefined;
  }
}

export default EventEmitterRevoker;

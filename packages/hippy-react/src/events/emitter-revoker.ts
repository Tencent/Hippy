import HippyEventListener from './listener';

interface EventEmitterRevoker {
  callback: number;
  bindListener: HippyEventListener;
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
    delete this.bindListener;
  }
}

export default EventEmitterRevoker;

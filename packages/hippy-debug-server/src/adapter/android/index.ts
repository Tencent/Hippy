import { ProtocolAdapter } from '../protocol';
import { AndroidTarget } from './target';

export class AndroidProtocol extends ProtocolAdapter {
  constructor(target: AndroidTarget) {
    super(target);
  }
}

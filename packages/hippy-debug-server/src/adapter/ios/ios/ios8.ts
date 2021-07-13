//
// Copyright (C) Microsoft. All rights reserved.
//

import { IOSProtocol } from './ios';
import { IosTarget } from '../target';

export class IOS8Protocol extends IOSProtocol {
  constructor(target: IosTarget) {
    super(target);

    this.target.addMessageFilter('target::error', (msg) => {
      console.error(`Error received (overriding) ${JSON.stringify(msg)}`);
      msg = {
        id: msg.id,
        result: {},
      };

      return Promise.resolve(msg);
    });
  }

  protected mapSelectorList(selectorList): void {
    const { range } = selectorList;

    for (let i = 0; i < selectorList.selectors.length; i++) {
      selectorList.selectors[i] = { text: selectorList.selectors[i] };

      if (range !== undefined) {
        selectorList.selectors[i].range = range;
      }
    }

    delete selectorList.range;
  }
}

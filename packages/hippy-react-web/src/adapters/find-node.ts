/**
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * This source code is based on react-native-web project.
 * https://github.com/necolas/react-native-web/blob/0.11.7/packages/react-native-web/src/exports/findNodeHandle/index.js
 *
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { findDOMNode } from 'react-dom';

const findNodeHandle = (component: Element) => {
  let node;

  try {
    /* eslint-disable-next-line react/no-find-dom-node */
    node = findDOMNode(component);
  } catch (e) {
    // pass
  }

  return node;
};

export default findNodeHandle;

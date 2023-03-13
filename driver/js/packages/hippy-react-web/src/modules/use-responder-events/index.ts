/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { useStable } from '../../utils';
import { TouchableProps } from '../../types';
import ResponderEvent from './responder-events';

let idCounter = 0;

export interface ResponderConfig extends TouchableProps {
  onScroll?: (e: any) => void;
};

const useResponderEvents = (ref: any, config: ResponderConfig = {}) => {
  const id = useStable(() => idCounter += 1);
  const isAttachedRef = React.useRef(false);

  React.useEffect(() => {
    ResponderEvent.attachListeners();
    return () => ResponderEvent.removeNode(id);
  }, [id]);

  React.useEffect(() => {
    const { onTouchDown, onTouchMove, onTouchEnd, onTouchCancel, onScroll } = config;
    const node = ref.current;

    const isNeedResponderEvent = [onTouchDown, onTouchMove, onTouchEnd, onTouchCancel, onScroll].some(v => v) && node;

    if (isNeedResponderEvent) {
      ResponderEvent.addNode(id, node, config);
      isAttachedRef.current = true;
    } else {
      ResponderEvent.removeNode(id);
      isAttachedRef.current = false;
    }
  }, [ref, config, id]);
};

export default useResponderEvents;

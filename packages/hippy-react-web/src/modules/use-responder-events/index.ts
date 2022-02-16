import React from 'react';
import { useStable } from '../../utils';
import ResponderEvent from './responder-events';
import { TouchEvent } from './types';

let idCounter = 0;

export interface ResponderConfig {
  onTouchDown?: (e: TouchEvent) => void;
  onTouchMove?: (e: TouchEvent) => void;
  onTouchEnd?: (e: TouchEvent) => void;
  onTouchCancel?: (e: TouchEvent) => void;
  onScroll?: (e: any) => void;
};

const useResponderEvents = (ref: any, config: ResponderConfig = {}) => {
  const id = useStable(() => idCounter += 1);
  const isAttachedRef = React.useRef(false);

  React.useEffect(() => {
    ResponderEvent.attachListerers();
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

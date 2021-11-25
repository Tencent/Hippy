import reactReconciler from 'react-reconciler';
import * as hostConfigs from './host-configs';

const hippyReconciler = reactReconciler({
  ...hostConfigs,
  // @ts-ignore compatible for React 16 and React latest
  clearTimeout,
  setTimeout,
  isPrimaryRenderer: true,
  noTimeout: -1,
  supportsMutation: true,
  supportsHydration: false,
  supportsPersistence: false,
  now: Date.now,
  scheduleDeferredCallback: () => {},
  cancelDeferredCallback: () => {},
});

export default hippyReconciler;

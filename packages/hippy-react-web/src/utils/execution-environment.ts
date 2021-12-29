export const canUseDOM = !!(
  typeof window !== 'undefined'
  && window.document
  && window.document.createElement
);

export const canUseClipboard = !!(
  typeof window !== 'undefined'
  && window.navigator
  && window.navigator.clipboard
);


export const canUseCopyCommand = !!(
  typeof document !== 'undefined'
  && document.queryCommandSupported
  && document.queryCommandSupported('copy')
);

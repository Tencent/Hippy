export const canUseDOM = !!(window?.document?.createElement);

export const canUseClipboard = !!(window?.navigator?.clipboard);


export const canUseCopyCommand = !!(document?.queryCommandSupported && document?.queryCommandSupported('copy'));

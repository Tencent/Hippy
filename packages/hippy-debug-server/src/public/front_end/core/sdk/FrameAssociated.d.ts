import type { PageResourceLoadInitiator } from './PageResourceLoader.js';
export interface FrameAssociated {
    createPageResourceLoadInitiator: () => PageResourceLoadInitiator;
}

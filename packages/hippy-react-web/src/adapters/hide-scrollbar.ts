import { canUseDOM } from '../utils/execution-environment';

export const HIDE_SCROLLBAR_CLASS = '__hippy-react-hide-scrollbar';
const hideScrollbarKey = '__hippyReactHideScrollbarActive';

export const shouldHideScrollBar = (isHideScrollBar: boolean) => {
  if (canUseDOM) {
    if (isHideScrollBar && !window[hideScrollbarKey]) {
      window[hideScrollbarKey] = true;
      document.styleSheets[0].addRule(`.${HIDE_SCROLLBAR_CLASS}::-webkit-scrollbar`, 'display: none');
      document.styleSheets[0].addRule(`.${HIDE_SCROLLBAR_CLASS}`, '-ms-overflow-style: none; scrollbar-width: none;');
    }
  }
};

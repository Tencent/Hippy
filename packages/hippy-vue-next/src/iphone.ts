import { HippyElement } from './runtime/element/hippy-element';
import { Native } from './runtime/native';

import type { HippyAppOptions } from './index';

/**
 * 绘制iOS的状态栏
 *
 * @param appOptions - hippy app 创建选项
 */
export function drawIphoneStatusBar(appOptions: HippyAppOptions): HippyElement | null {
  const { iPhone } = appOptions;
  let statusBarOpts;
  if (iPhone?.statusBar) {
    statusBarOpts = iPhone.statusBar;
  }
  if (statusBarOpts?.disabled) {
    return null;
  }
  const statusBar = new HippyElement('div');
  const { statusBarHeight } = Native.dimensions.screen;

  // 初始化iOS状态栏
  if (Native.isVerticalScreen) {
    statusBar.setStyle('height', statusBarHeight);
  } else {
    statusBar.setStyle('height', 0);
  }

  // Set safe area background color
  // 默认设置Vue的绿色
  let backgroundColor = 4282431619;

  if (Number.isInteger(backgroundColor)) {
    ({ backgroundColor } = statusBarOpts);
  }
  statusBar.setStyle('backgroundColor', backgroundColor);

  // Set safe area background image if defined
  if (typeof statusBarOpts.backgroundImage === 'string') {
    const statusBarImage = new HippyElement('img');
    statusBarImage.setStyle('width', Native.dimensions.screen.width);
    statusBarImage.setStyle('height', statusBarHeight);
    statusBarImage.setAttribute(
      'src',
      appOptions.iPhone?.statusBar?.backgroundImage,
    );
    statusBar.appendChild(statusBarImage);
  }

  // Listen the screen rotate event
  statusBar.addEventListener('layout', () => {
    if (Native.isVerticalScreen) {
      statusBar.setStyle('height', statusBarHeight);
    } else {
      statusBar.setStyle('height', 0);
    }
  });

  return statusBar;
}

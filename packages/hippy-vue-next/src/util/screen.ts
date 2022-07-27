// 屏幕尺寸信息类型
export interface ScreenSize {
  width: number;
  height: number;
}

/**
 * 设置屏幕尺寸数据
 *
 * @param newScreenSize - 要设置的新屏幕尺寸数据
 *
 * @public
 */
export function setScreenSize(newScreenSize: ScreenSize): void {
  if (newScreenSize.width && newScreenSize.height) {
    const { screen } = global?.Hippy?.device;
    if (screen) {
      screen.width = newScreenSize.width;
      screen.height = newScreenSize.height;
    }
  }
}

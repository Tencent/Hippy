import { registerHippyTag } from '../runtime/component';

/**
 * 注册Native的模态对话框组件
 */
export function registerDialog(): void {
  registerHippyTag('dialog', {
    name: 'Modal',
    defaultNativeProps: {
      transparent: true,
      immersionStatusBar: true,
    },
  });
}

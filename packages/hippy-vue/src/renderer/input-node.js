import ElementNode from './element-node';
import Native from '../runtime/native';

/**
 * Input and Textarea Element
 */
class InputNode extends ElementNode {
  /**
   * Get text input value
   */
  getValue() {
    return new Promise(resolve => Native.callUIFunction(this, 'getValue', r => resolve(r.text)));
  }

  /**
   * Set text input value
   */
  setValue(value) {
    Native.callUIFunction(this, 'setValue', [value]);
  }


  /**
   * Focus
   */
  focus() {
    Native.callUIFunction(this, 'focusTextInput', []);
  }

  /**
   * Blur
   */
  blur() {
    Native.callUIFunction(this, 'blurTextInput', []);
  }

  /**
   * Clear
   */
  clear() {
    Native.callUIFunction(this, 'clear', []);
  }

  /**
   * Show input method selection dialog.
   */
  showInputMethod() {
    Native.callUIFunction(this, 'showInputMethod', []);
  }

  /**
   * hideInputMethod
   */
  hideInputMethod() {
    Native.callUIFunction(this, 'hideInputMethod', []);
  }
}

export default InputNode;

/* eslint-disable import/prefer-default-export */
/* eslint-disable camelcase */

interface LayoutEvent {
  /**
   * The event data of layout event
   */
  nativeEvent: {
    /**
     * The position X of component
     */
    x: number;

    /**
     * The position Y of component
     */
    y: number;

    /**
     * The width of component
     */
    width: number;

    /**
     * The height of component
     */
    height: number;
  };
}

interface TouchEvent {
  /**
   * Touch coordinate X
   */
  page_x: number;

  /**
   * Touch coordinate Y
   */
  page_y: number;
}

interface FocusEvent {

  /**
   * Focus status
   */
  focus: boolean;
}

export {
  LayoutEvent,
  TouchEvent,
  FocusEvent,
};

import React from 'react';
import Style from '@localTypes/style';
import { LayoutEvent } from '@localTypes/event';

declare module 'react' {
  interface HTMLAttributes<T> extends React.AriaAttributes, React.DOMAttributes<T> {
    nativeName: string;
    style?: Style; // FIXME: Typescript compile error.

    // Ul
    initialListReady?(): void;
  }
}

export type Type = string;
export type Props = any;
export type Container = number;
export type UpdatePayload = any;
export type Context = {};
export type TextInstance = number;

export interface LayoutableProps {
  /**
   * Invoked on mount and layout changes with:
   *
   * `{nativeEvent: { layout: {x, y, width, height}}}`
   *
   * This event is fired immediately once the layout has been calculated,
   * but the new layout may not yet be reflected on the screen
   * at the time the event is received, especially if a layout animation is in progress.
   *
   * @param {Object} evt - Layout event data
   * @param {number} evt.nativeEvent.x - The position X of component
   * @param {number} evt.nativeEvent.y - The position Y of component
   * @param {number} evt.nativeEvent.width - The width of component
   * @param {number} evt.nativeEvent.hegiht - The height of component
   */
  onLayout?(evt: LayoutEvent): void;
}

export interface ClickableProps {
  /**
   * Called when the touch is released.
   */
  onClick?(): void;

  /**
   * Called when the touch with longer than about 1s is released.
   */
  onLongClick?(): void;
}

export interface TouchableProps {

  /**
   * The touchdown event occurs when the user touches an component.
   *
   * @param {Object} evt - Touch event data
   * @param {number} evt.page_x - Touch coordinate X
   * @param {number} evt.page_y = Touch coordinate Y
   */
  onTouchDown?(evt: TouchEvent): void;

  /**
   * The touchmove event occurs when the user moves the finger across the screen.

   *
   * @param {Object} evt - Touch event data
   * @param {number} evt.page_x - Touch coordinate X
   * @param {number} evt.page_y = Touch coordinate Y
   */
  onTouchMove?(evt: TouchEvent): void;

  /**
   * The touchend event occurs when the user removes the finger from an component.
   *
   * @param {Object} evt - Touch event data
   * @param {number} evt.page_x - Touch coordinate X
   * @param {number} evt.page_y = Touch coordinate Y
   */
  onTouchEnd?(evt: TouchEvent): void;

  /**
   * The touchcancel event occurs when the touch event gets interrupted.
   *
   * @param {Object} evt - Touch event data
   * @param {number} evt.page_x - Touch coordinate X
   * @param {number} evt.page_y = Touch coordinate Y
   */
  onTouchCancel?(evt: TouchEvent): void;
}

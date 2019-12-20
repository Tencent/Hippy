/* eslint-disable no-underscore-dangle */

import React from 'react';
import Style from '@localTypes/style';
import View from './view';
import * as StyleSheet from '../modules/stylesheet';
import { HippyEventListener } from '../events';
import { Device } from '../native';

type ModalOrientation = 'portrait' | 'portrait-upside-down' | 'landscape' | 'landscape-left' | 'landscape-right';

interface ModalProps {
  /**
   * Show or hide
   *
   * Default false
   */
  visible: boolean;

  /**
   * Primary key
   * > iOS only
   */
  primaryKey: string;

  /**
   * Background is transparent or not
   * Default: true
   */
  transparent?: boolean;

  /**
   * Enable animation to popup or hide
   *
   * Default: true
   *
   * > Deprecated, use animationType to instance of
   */
  animated?: boolean;

  /**
   * Be text color in statusbar dark theme.
   * Default: false
   */
  darkStatusBarText?: boolean;

  /**
   * Make the Modal content be under of statusbar.
   * > Android Only
   *
   * Default: false
   */
  immersionStatusBar?: boolean;

  /**
   * Hide statusbar texts when Modal is showing
   *
   * Default: false
   */
  autoHideStatusBar?: boolean;

  /**
   * The animation effect when toggle
   *
   * Default: 'slide'
   */
  animationType?: 'none' | 'slide' | 'fade' | 'slide_fade';

  /**
   * Modal supports orientations
   */
  supportedOrientations?: ModalOrientation[];

  style?: Style;

  /**
   * Trigger when hardware button pressed
   * > Android Only
   */
  onRequestClose?(): void;

  /**
   * Trigger when the Modal will show
   */
  onShow?(): void;

  /**
   * Trigger when the Modal will hide
   */
  onDismiss?(): void;

  /**
   * Trigger when the device orientation changed.
   */
  onOrientationChange?(): void;
}

const styles = StyleSheet.create({
  modal: {
    position: 'absolute',
  },
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});

/**
 * The Modal component is a basic way to present content above an enclosing view.
 * @noInheritDoc
 */
class Modal extends React.Component<ModalProps, {}> {
  private eventSubscription: null | HippyEventListener;

  /**
   * @ignore
   */
  constructor(props: ModalProps) {
    super(props);
    this.eventSubscription = null;
  }

  /**
   * @ignore
   */
  public componentDidMount() {
    if (Device.platform.OS === 'ios') {
      this.eventSubscription = new HippyEventListener('modalDismissed');
      this.eventSubscription.addCallback((params: any) => {
        const { primaryKey, onDismiss } = this.props;
        if (params.primaryKey === primaryKey && typeof onDismiss === 'function') {
          onDismiss();
        }
      });
    }
  }

  /**
   * @ignore
   */
  public componentWillUnmount() {
    if (Device.platform.OS === 'ios') {
      if (this.eventSubscription) {
        this.eventSubscription.unregister();
      }
    }
  }

  /**
   * @ignore
   */
  public render() {
    const {
      children,
      visible,
      transparent,
      animated,
    } = this.props;
    let {
      animationType,
    } = this.props;
    if (visible === false) {
      return null;
    }

    const containerStyles = {
      backgroundColor: transparent ? 'transparent' : 'white',
    };

    if (!animationType) {
      // manually setting default prop here to keep support for the deprecated 'animated' prop
      animationType = 'none';
      if (animated) {
        animationType = 'slide';
      }
    }

    return (
      <div
        nativeName="Modal"
        animationType={animationType}
        transparent={transparent}
        style={styles.modal}
        {...this.props}
      >
        <View style={[styles.container, containerStyles]}>
          {children}
        </View>
      </div>
    );
  }
}

/**
* @ignore
*/
Modal.defaultProps = {
  visible: true,
};

export default Modal;

/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useEffect, createElement } from 'react';
import ReactDOM from 'react-dom';
import { canUseDOM } from '../utils';
import { formatWebStyle } from '../adapters/transfer';
import StyleSheet from '../modules/stylesheet';

const ANIMATION_DURATION = 300;
const styles = StyleSheet.create({
  modal: {
    position: 'absolute',
    width: '100%',
  },
  container: {
    // @ts-ignore
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 9999,
  },
  darkText: {
    color: '#fff',
    background: '#000',
  },
  lightText: {
    color: '#000',
    background: '#fff',
  },
  animatedIn: {
    animationDuration: `${ANIMATION_DURATION}ms`,
    animationTimingFunction: 'ease-in',
  },
  animatedOut: {
    pointerEvents: 'none',
    animationDuration: `${ANIMATION_DURATION}ms`,
    animationTimingFunction: 'ease-out',
  },
  fadeIn: {
    opacity: 1,
    animationName: 'fadein',
  },
  fadeOut: {
    opacity: 0,
    animationName: 'fadeout',
  },
  slideIn: {
    // @ts-ignore
    transform: 'translateY(0%)',
    animationName: 'slidein',
  },
  slideOut: {
    // @ts-ignore
    transform: 'translateY(100%)',
    animationName: 'slideout',
  },
  hidden: {
    opacity: 0,
  },
});
const fadeIn = '@keyframes fadein { from { opacity: 0; } to { opacity: 1; } }';
const fadeOut = '@keyframes fadeout { from { opacity: 1; } to { opacity: 0; } }';
const slideIn = '@keyframes slidein { from { transform: translateY(100%); } to { transform: translateY(0%); } }';
const slideOut = '@keyframes slideout { from { transform: translateY(0%); } to { transform: translateY(100%); } }';

const setModalAnimationKeyFrame = () => {
  const sheets = document.styleSheets;
  const lastSheet = sheets[sheets.length - 1] as CSSStyleSheet;
  lastSheet.insertRule(fadeIn);
  lastSheet.insertRule(fadeOut);
  lastSheet.insertRule(slideIn);
  lastSheet.insertRule(slideOut);
};

const animatedSlideInStyles = formatWebStyle([styles.container, styles.animatedIn, styles.slideIn]);
const animatedSlideOutStyles = formatWebStyle([styles.container, styles.animatedOut, styles.slideOut]);
const animatedFadeInStyles = formatWebStyle([styles.container, styles.animatedIn, styles.fadeIn]);
const animatedFadeOutStyles = formatWebStyle([styles.container, styles.animatedOut, styles.fadeOut]);

export type AnimationType = 'none' | 'slide' | 'fade' | 'slide_fade';
export interface ModalProps {
  animated?: boolean;
  animationType?: AnimationType;
  supportedOrientations?: 'portrait' | 'portrait-upside-down' | 'landscape' | 'landscape-left' | 'landscape-right';
  immersionStatusBar?: boolean;
  darkStatusBarText?: boolean;
  onShow?: Function;
  onOrientationChange?: Function;
  onRequestClose?: Function;
  primaryKey?: string;
  onDismiss?: Function;
  transparent?: boolean;
  visible?: boolean;
}
type AnimationModalProps = Pick<ModalProps, 'animationType' | 'onDismiss' | 'visible' | 'onShow' | 'transparent' | 'darkStatusBarText'> & { children: any };

const getAnimationStyle = (animationType: AnimationType, visible: boolean) => {
  if (animationType === 'slide' || animationType === 'slide_fade') {
    return visible ? animatedSlideInStyles : animatedSlideOutStyles;
  }
  if (animationType === 'fade') {
    return visible ? animatedFadeInStyles : animatedFadeOutStyles;
  }
  return visible ? styles.container : styles.hidden;
};
export type ModalPortalProps = {
  children: any
};

function ModalPortal(props: ModalPortalProps) {
  const { children } = props;
  const elementRef = React.useRef<HTMLDivElement | null>(null);

  if (canUseDOM && !elementRef.current) {
    const element = document.createElement('div');

    if (element && document.body) {
      document.body.appendChild(element);
      elementRef.current = element;
    }
  }

  React.useEffect(() => {
    if (canUseDOM) {
      return () => {
        if (document.body && elementRef.current) {
          document.body.removeChild(elementRef.current);
          elementRef.current = null;
        }
      };
    }
  }, []);

  return elementRef.current && canUseDOM
    ? ReactDOM.createPortal(children, elementRef.current)
    : null;
}
const AnimationModal = (props: AnimationModalProps) => {
  const { animationType = 'none', onDismiss, onShow, visible = false, children, transparent, darkStatusBarText } = props;

  const [isRendering, setIsRendering] = React.useState(false);
  const wasVisible = React.useRef(false);

  const isAnimated = animationType !== 'none';

  let styleOfProps: Record<string, any> = styles.lightText;
  if (transparent) {
    styleOfProps.backgroundColor = 'transparent';
  }
  if (darkStatusBarText) {
    styleOfProps = { ...styleOfProps, ...styles.darkText };
  }

  const animationEndCallBack = React.useCallback((e: any) => {
    if (e && e.currentTarget !== e.target) {
      return;
    }

    if (visible) {
      if (onShow) {
        onShow();
      }
    } else {
      setIsRendering(false);
      if (onDismiss) {
        onDismiss();
      }
    }
  }, [onDismiss, onShow, visible]);

  React.useEffect(() => {
    if (visible) {
      setIsRendering(true);
    }
    if (visible !== wasVisible.current && !isAnimated) {
      animationEndCallBack(null);
    }
    wasVisible.current = visible;
  }, [isAnimated, visible, animationEndCallBack]);
  const animationStyle = isAnimated ? getAnimationStyle(animationType, visible) : styles.container;
  // eslint-disable-next-line react/no-children-prop
  return isRendering || visible ? createElement('div', {
    style: isRendering ? formatWebStyle([styleOfProps, animationStyle]) : formatWebStyle(styles.hidden),
    onAnimationEnd: animationEndCallBack,
    children,
  }) : null;
};


/**
 * The Modal component is a basic way to present content above an enclosing view.
 * @noInheritDoc
 */
const Modal: React.FC<ModalProps> = (props) => {
  const {
    visible = false,
    darkStatusBarText = false,
    transparent,
    children,
    onRequestClose,
    onShow,
    onDismiss,
    animationType,
  } = props;

  useEffect(() => {
    setModalAnimationKeyFrame();
  }, []);

  useEffect(() => {
    if (visible) {
      if (typeof onShow === 'function') {
        onShow();
      }
    }
  }, [visible]);
  useEffect(() => {
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (onRequestClose) {
          onRequestClose();
        }
      }
    };
    document.addEventListener('keyup', closeOnEscape, false);
    return () => document.removeEventListener('keyup', closeOnEscape, false);
  }, [onRequestClose]);

  return (
    <ModalPortal>
      <AnimationModal
        transparent={transparent}
        darkStatusBarText={darkStatusBarText}
        animationType={animationType}
        onDismiss={onDismiss}
        onShow={onShow}
        visible={visible}
      >
        {children}
      </AnimationModal>
    </ModalPortal>
  );
};

Modal.displayName = 'Modal';

export default Modal;

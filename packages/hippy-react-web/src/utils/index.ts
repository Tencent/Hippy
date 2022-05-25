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

import React from 'react';

/**
 * Warning information output
 */
function warn(...context: any[]) {
  // In production build
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  /* eslint-disable-next-line no-console */
  console.warn(...context);
}

export const error = (...context: any[]) => {
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  console.error(...context);
};

export const warnWhenUseUnsupportedProp = (param: {
  moduleProps: Record<string, any>,
  unsupportedProps: string[],
  moduleName: string,
}) => {
  const { moduleProps, moduleName, unsupportedProps } = param;
  unsupportedProps.forEach((unsupportedProp) => {
    if (moduleProps[unsupportedProp] !== undefined) {
      warn(`prop ${unsupportedProp} does not support in ${moduleName}`);
    }
  });
};

const useStable = <T>(getInitialValue: () => T): T => {
  const ref = React.useRef<T | null>(null);
  if (ref.current === null) {
    ref.current = getInitialValue();
  }
  return ref.current;
};

const getViewRefNode = (ref: any) => {
  if (ref) {
    if (ref?.current) {
      return ref.current as HTMLElement;
    }
    if (ref?.node) {
      return ref.node as HTMLElement;
    }
    if (ref?.current?.node) {
      return ref.current.node as HTMLElement;
    }
  }
  return ref;
};

export const noop = () => {};

export * from './validation';
export * from './execution-environment';
export {
  warn,
  useStable,
  getViewRefNode,
};

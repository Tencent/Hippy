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
import BackAndroid from '../modules/back-android';
import Hippy from '../hippy';
import { callUIFunction } from '../modules/ui-manager-module';
import { Device } from '../native';
import Element from '../dom/element-node';

interface Top {
  data: any;
  next: Top
}

interface Route {
  routeName: string;
  component?: string | React.FunctionComponent<any> | React.ComponentClass<any, any>;
  initProps?: any;
  animated?: boolean
}

interface NavigatorProps {
  /**
   * Initial page option, the option object should contains.
   *
   * * {string} routeName - Router name
   * * {React.Component} component - Initial react component
   * * {Object} initProps - Initial props for initial react component
   * * {boolean} animated - Use animation effect to switch to new page
   */
  initialRoute: Route;
}

class Stack {
  public top: Top | null = null;
  public size = 0;

  /**
   * Push into a new page/component.
   *
   * @param {Object} route - New router
   */
  public push(route: Route) {
    (this.top as Top) = {
      data: route,
      next: this.top as Top,
    };
    this.size += 1;
  }

  /**
   * Returns latest push router.
   */
  public peek() {
    return this.top === null ? null : this.top.data;
  }

  /**
   * Return back to previous page.
   */
  public pop() {
    if (this.top === null) {
      return null;
    }

    const out = this.top;

    this.top = this.top.next;

    if (this.size > 0) {
      this.size -= 1;
    }

    return out.data;
  }

  /**
   * Clear history stack
   */
  public clear() {
    this.top = null;
    this.size = 0;
  }

  /**
   * Returns all of routes
   */
  public displayAll() {
    const arr: any[] = [];
    if (this.top === null) {
      return arr;
    }

    let current = this.top;

    for (let i = 0, len = this.size; i < len; i += 1) {
      arr[i] = current.data;
      current = current.next;
    }

    return arr;
  }
}

/**
 * Simply router component for switch in multiple Hippy page.
 * @noInheritDoc
 */
class Navigator extends React.Component<NavigatorProps, {}> {
  private stack = new Stack();

  private instance: HTMLDivElement | Element | null = null;

  private routeList: {
    [key: string]: boolean;
  } = {};

  private backListener?: ReturnType<typeof BackAndroid.addListener>;

  /**
   * @ignore
   */
  public constructor(props: NavigatorProps) {
    super(props);
    const { initialRoute } = props;
    if (initialRoute?.component) {
      const hippy = new Hippy({
        appName: initialRoute.routeName,
        entryPage: initialRoute.component,
      });

      hippy.regist();

      this.routeList[initialRoute.routeName] = true;
    }
    this.handleAndroidBack = this.handleAndroidBack.bind(this);
  }

  /**
   * @ignore
   */
  public componentWillMount() {
    if (Device.platform.OS === 'android') {
      this.backListener = BackAndroid.addListener(this.handleAndroidBack);
    }
  }

  /**
   * @ignore
   */
  public componentDidMount() {
    const { initialRoute } = this.props;
    this.stack.push({
      routeName: initialRoute.routeName || '',
      component: initialRoute.component || '',
      initProps: initialRoute.initProps || '',
    });
  }

  /**
   * @ignore
   */
  public componentWillUnmount() {
    if (this.backListener) {
      this.backListener.remove();
    }
  }

  public getCurrentPage() {
    return this.stack.peek();
  }

  public handleAndroidBack() {
    if (this.stack.size > 1) {
      this.pop({
        animated: true,
      });
    }
  }

  /**
   * Push into a new page/component.
   *
   * @param {Object} route - New router
   */
  public push(route: Route) {
    if (route?.component) {
      if (!this.routeList[route.routeName]) {
        const hippy = new Hippy({
          appName: route.routeName,
          entryPage: route.component,
        });
        hippy.regist();
        this.routeList[route.routeName] = true;
      }
      // eslint-disable-next-line no-param-reassign
      delete route.component;
    }

    const routes = [route];
    this.stack.push(route);
    callUIFunction(this.instance as Element, 'push', routes);
  }

  /**
   * Return back to previous page.
   */
  public pop(option: { animated: boolean }) {
    if (this.stack.size > 1) {
      const options = [option];
      this.stack.pop();
      callUIFunction(this.instance as Element, 'pop', options);
    }
  }

  /**
   * Clear history stack
   */
  public clear() {
    this.stack.clear();
  }

  /**
   * @ignore
   */
  public render() {
    const {
      initialRoute: {
        /* eslint-disable @typescript-eslint/no-unused-vars */
        component,
        ...otherInitialRoute
      },
      ...nativeProps
    } = this.props;
    (nativeProps as NavigatorProps).initialRoute = otherInitialRoute;
    return (
      <div nativeName="Navigator" ref={(ref) => {
        this.instance = ref;
      }} {...nativeProps} />
    );
  }
}

export default Navigator;

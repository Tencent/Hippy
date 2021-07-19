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
  top: Top | null = null;

  size = 0;

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
  clear() {
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
  constructor(props: NavigatorProps) {
    super(props);
    const { initialRoute } = props;
    if (initialRoute && initialRoute.component) {
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
    if (route && route.component) {
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

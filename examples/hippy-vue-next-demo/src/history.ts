/**
 * hippy history implement, reference memory history of vue-router
 *
 * https://github.com/vuejs/router/blob/main/packages/router/src/history/memory.ts
 */
import { RouterHistory } from 'vue-router';

export type HippyRouterHistory = RouterHistory & {
  position: number;
};

declare type HistoryLocation = string;

enum NavigationType {
  pop = 'pop',
  push = 'push',
}

enum NavigationDirection {
  back = 'back',
  forward = 'forward',
  unknown = '',
}

interface NavigationInformation {
  type: NavigationType
  direction: NavigationDirection
  delta: number
}

type NavigationCallback = (
  to: HistoryLocation,
  from: HistoryLocation,
  information: NavigationInformation
) => void;

const TRAILING_SLASH_RE = /\/$/;
const removeTrailingSlash = (path: string) => path.replace(TRAILING_SLASH_RE, '');

// remove any character before the hash
const BEFORE_HASH_RE = /^[^#]+#/;
function createHref(base: string, location: HistoryLocation): string {
  return `${base.replace(BEFORE_HASH_RE, '#')}${location}`;
}

/**
 * normalize router path base
 *
 * @param rawBase
 */
function normalizeBase(rawBase?: string) {
  let base = rawBase;
  if (!base) {
    base = '/';
  }

  // ensure leading slash when it was removed by the regex above avoid leading
  // slash with hash because the file could be read from the disk like file://
  // and the leading slash would cause problems
  if (base[0] !== '/' && base[0] !== '#') {
    base = `/${base}`;
  }

  // remove the trailing slash so all other method can just do `base + fullPath`
  // to build a href
  return removeTrailingSlash(base);
}

/**
 * Create an in-memory based history. similar with memory history in vue-router.
 * the only different is this history mode support hardware back press for android.
 */
export function createHippyHistory(rawBase = ''): HippyRouterHistory {
  const START: HistoryLocation = '';
  // history queue
  let queue: HistoryLocation[] = [START];
  // current position
  let position = 0;
  let listeners: NavigationCallback[] = [];
  // normalize base
  const base = normalizeBase(rawBase);

  function setLocation(location: HistoryLocation): void {
    position += 1;

    if (position === queue.length) {
      // we are at the end, we can simply append a new entry
      queue.push(location);
    } else {
      // we are in the middle, we remove everything from here in the queue
      queue.splice(position);
      queue.push(location);
    }
  }

  function triggerListeners(
    to: HistoryLocation,
    from: HistoryLocation,
    { direction, delta }: Pick<NavigationInformation, 'direction' | 'delta'>,
  ): void {
    const info: NavigationInformation = {
      direction,
      delta,
      type: NavigationType.pop,
    };

    for (const callback of listeners) {
      callback(to, from, info);
    }
  }

  const routerHistory: HippyRouterHistory = {
    // rewritten by Object.defineProperty
    location: START,
    state: {},
    base,
    createHref: createHref.bind(null, base),
    replace(to) {
      queue.splice(position, 1);
      position -= 1;
      setLocation(to);
    },
    push(to: HistoryLocation) {
      setLocation(to);
    },
    listen(callback: NavigationCallback) {
      listeners.push(callback);

      return () => {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
    },
    destroy() {
      listeners = [];
      queue = [START];
      position = 0;
    },
    go(delta: number, shouldTrigger = true) {
      const from = this.location;
      const direction: NavigationDirection = delta < 0 ? NavigationDirection.back : NavigationDirection.forward;
      position = Math.max(0, Math.min(position + delta, queue.length - 1));
      if (shouldTrigger) {
        triggerListeners(this.location, from, {
          direction,
          delta,
        });
      }
    },
    get position(): number {
      return position;
    },
  };

  Object.defineProperty(routerHistory, 'location', {
    enumerable: true,
    get: () => queue[position],
  });

  return routerHistory;
}

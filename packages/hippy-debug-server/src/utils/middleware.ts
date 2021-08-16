import { MiddleWare } from '../middlewares';

/**
 * 中间件数组 -> 链式调用的一个中间件
 * @param middlewareList
 * @returns
 */
export const compose = (middlewareList: MiddleWare[]) => {
  if (!Array.isArray(middlewareList)) throw new TypeError('Middleware stack must be an array!');
  for (const fn of middlewareList) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!');
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */

  return function (context, next = noop) {
    // last called middleware #
    let index = -1;
    return dispatch(0);
    function dispatch(i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'));
      index = i;
      let fn = middlewareList[i];
      if (i === middlewareList.length) fn = next;
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
};

function noop() {}

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

import { getRandomColor } from './render-utils';
import FlameGraph from './index';

function memoizeWeak<TArg, TRet>(fn: (arg: TArg) => TRet, cache: WeakMap<any, any>): (arg: TArg) => TRet {
  return (arg: any) => {
    if (!cache.has(arg)) {
      cache.set(arg, fn(arg));
    }
    return cache.get(arg) || fn(arg);
  };
}

class RenderCache {
  private cache = new WeakMap();

  public getTraceColor(traceMeasure: FlameGraph.TraceMeasure) {
    return memoizeWeak(() => getRandomColor(), this.cache)(traceMeasure);
  }

  public getTraceColorRGB(traceMeasure: FlameGraph.TraceMeasure) {
    return memoizeWeak(() => {
      const color = this.getTraceColor(traceMeasure);
      const transparency = 0.8;
      return `rgba(${color[0]},${color[1]},${color[2]}, ${transparency})`;
    }, this.cache)(traceMeasure);
  }

  public getMaxStackIndex(renderTraces: FlameGraph.RenderTrace[]) {
    return memoizeWeak(
      () => renderTraces.reduce((acc, item) => Math.max(item.stackIndex, acc), 0),
      this.cache,
    )(renderTraces);
  }
}

const renderCache = new RenderCache();

export default renderCache;

/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2023 THL A29 Limited, a Tencent company.
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

import { isFunc } from '../utils';

interface Requests {
  [key: string]: any;
}
type SizeSuccess = (width: number, height: number) => void;
type SizeFailure = () => void;
type LoadSuccess = (ev: Event) => void;
export type LoadError = (event: { nativeEvent: { error: string } }) => void;

let id = 0;
const requests: Requests = {};

const ImageLoader = {
  load(url: string, onLoad: LoadSuccess, onError: LoadError) {
    id += 1;
    const image = new window.Image();
    image.setAttribute('crossOrigin', 'Anonymous');
    image.src = url;
    image.onerror = (e) => {
      // @ts-ignore
      onError(e);
    };
    image.onload = (e) => {
      // avoid blocking the main thread
      const onDecode = () => onLoad(e);
      if (typeof image.decode === 'function') {
        // Safari currently throws exceptions when decoding svgs.
        // We want to catch that error and allow the load handler
        // to be forwarded to the onLoad handler in this case
        image.decode()
          .then(onDecode, onDecode);
      } else {
        setTimeout(onDecode, 0);
      }
    };
    requests[`${id}`] = image;
    return id;
  },
  prefetch(url: string) {
    if (typeof url !== 'string') {
      throw new TypeError('Image.prefetch first argument must be a string url');
    }
    ImageLoader.load(url, () => {}, () => {});
  },
  abort(requestId: number) {
    let image = requests[`${requestId}`];
    if (image) {
      image.onerror = null;
      image.onload = null;
      image = null;
      delete requests[`${requestId}`];
    }
  },
  getSize(url: string, success: SizeSuccess, failure: SizeFailure) {
    if (typeof url !== 'string') {
      throw new TypeError('Image.getSize first argument must be a string url');
    }
    const image = new window.Image();
    image.setAttribute('crossOrigin', 'Anonymous');
    image.src = url;

    image.onload = () => {
      if (isFunc(success)) {
        success(image.width, image.height);
      }
    };
    image.onerror = () => {
      if (isFunc(failure)) {
        failure();
      }
    };
  },
};
export const ImageLoaderModule = {
  prefetch: ImageLoader.prefetch,
  getSize(url: string) {
    if (typeof url !== 'string') {
      throw new TypeError('ImageLoaderModule.getSize first argument must be a string url');
    }
    return new Promise((resolve, reject) => {
      const image = new window.Image();
      image.setAttribute('crossOrigin', 'Anonymous');
      image.src = url;
      image.onload = () => {
        resolve({ width: image.width, height: image.height });
      };
      image.onerror = () => {
        reject({ width: null, height: null });
      };
    });
  },
};
export default ImageLoader;

/**
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * This source code is based on react-native-web project.
 * https://github.com/necolas/react-native-web/blob/0.11.7/packages/react-native-web/src/modules/ImageLoader/index.js
 *
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

type LoadSuccess = (ev: Event) => void;
export type LoadError = (event: { nativeEvent: { error: string } }) => void;

const ImageLoader = {
  load(url: string, onLoad: LoadSuccess, onError: LoadError) {
    const image = new window.Image();
    image.setAttribute('crossOrigin', 'Anonymous');
    image.src = url;
    image.onerror = (e) => {
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
  },
  prefetch(url: string) {
    return new Promise((resolve, reject) => {
      ImageLoader.load(url, resolve, reject);
    });
  },
  getSize(url: string) {
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

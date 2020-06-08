import React from 'react';
import Style from '@localTypes/style';
import { LayoutableProps, ClickableProps } from '../types';
import View from './view';
import { prefetch, getSize } from '../modules/image-loader-module';
import { Device } from '../native';
import { colorParse, colorArrayParse } from '../color';
import { warn } from '../utils';

interface Size {
  width: number;
  height: number;
}

interface ImageSource {
  uri: string;
}

interface ImageProps extends LayoutableProps, ClickableProps {
  /**
   * Single image source
   */
  src?: string;

  /**
   * Image source object
   */
  source?: ImageSource | ImageSource[];

  srcs?: string[];
  sources?: ImageSource[];

  /**
   * Image placeholder when image is loading.
   * Support base64 image only.
   */
  defaultSource?: string;

  /**
   * Fill color to the image
   */
  tintColor?: number | string;
  tintColors?: number[] | string[];

  /**
   * Image style when `Image` have other children.
   */
  imageStyle?: Style;

  /**
   * Image ref when `Image` have other children.
   */
  imageRef?: React.ReactNode;

  /**
   * Image resize mode, as same as containMode
   */
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';

  /**
   * When the image is resized, the corners of the size specified by capInsets
   * will stay a fixed size, but the center content and borders of the image will be stretched.
   * This is useful for creating resizable rounded buttons, shadows, and other resizable assets.
   */
  capInsets?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };

  style: Style;

  /**
   * Invoked on `Image` is loaded.
   */
  onLoad?(): void;

  /**
   * Invoke on `Image` is end of loading.
   */
  onLoadEnd?(): void;

  /**
   * Invoke on `Image` is start to loading.
   */
  onLoadStart?(): void;

  /**
   * Invoke on loading of `Image` get error.
   *
   * @param {Object} evt - Loading error data.
   * @param {string} evt.nativeEvent.error - Loading error message.
   */
  onError?(evt: { nativeEvent: { error: string }}): void;

  /**
   * Invoke on Image is loading.
   *
   * @param {Object} evt - Image loading progress data.
   * @param {number} evt.nativeEvent.loaded - The image is loaded.
   * @param {number} evt.nativeEvent.total - The loadded progress.
   */
  onProgress?(evt: { nativeEvent: { loaded: number; total: number }}): void;
}

function handleImgUrl(url: string): string {
  if (url && !/^(http|https):\/\//.test(url) && url.indexOf('assets') > -1) {
    if (process.env.NODE_ENV === 'development') {
      const addStr1 = 'http://'; // do not change this, otherwise js-min went wrong
      return `${addStr1}127.0.0.1:${process.env.PORT}/${url}`;
    }
    const addStr2 = 'hpfile://'; // do not change this, otherwise js-min went wrong
    return `${addStr2}./${url}`;
  }
  return url;
}

/**
 * A React component for displaying different types of images, including network images,
 * static resources, temporary local images, and images from local disk, such as the camera roll.
 * @noInheritDoc
 */
class Image extends React.Component<ImageProps, {}> {
  static get resizeMode() {
    return {
      contain: 'contain',
      cover: 'cover',
      stretch: 'stretch',
      center: 'center',
      repeat: 'repeat', // iOS Only
    };
  }

  static getSize(
    url: string,
    success: (width: number, height: number) => void,
    failure: (err: typeof Error) => void,
  ) {
    if (typeof url !== 'string') {
      throw new TypeError('Image.getSize first argument must be a string url');
    }
    const size = getSize(url);
    if (typeof success === 'function') {
      size.then((result: Size) => success(result.width, result.height));
    }
    if (typeof failure === 'function') {
      size.catch(failure);
    } else {
      size.catch((err: Error) => warn(`Failed to get size for image: ${url}`, err));
    }
    return size;
  }

  static prefetch = prefetch;

  /**
   * @ignore
   */
  public render() {
    const {
      children,
      style,
      imageStyle,
      imageRef,
      source,
      sources,
      src,
      srcs,
      tintColor,
      tintColors,
      ...nativeProps
    } = this.props;

    /**
     * Image source prop
     */

    // Define the image source url array.
    let imageUrls: string[] = [];
    if (typeof src === 'string') {
      imageUrls.push(src);
    }
    if (Array.isArray(srcs)) {
      imageUrls = [...imageUrls, ...srcs];
    }
    if (source) {
      if (typeof source === 'string') {
        imageUrls.push(source);
      } else if (typeof source === 'object' && source !== null) {
        const { uri } = source as ImageSource;
        if (uri) {
          imageUrls.push(uri);
        }
      }
    }

    if (sources) {
      if (Array.isArray(sources)) {
        sources.forEach((imageSrc) => {
          if (typeof imageSrc === 'string') {
            imageUrls.push(imageSrc);
          } else if (typeof imageSrc === 'object' && imageSrc !== null && imageSrc.uri) {
            imageUrls.push(imageSrc.uri);
          }
        });
      }
    }

    if (imageUrls.length) {
      imageUrls = imageUrls.map(url => handleImgUrl(url));
    }

    // Set sources props by platform specification
    if (Device.platform.OS === 'ios') {
      if (imageUrls.length) {
        (nativeProps as ImageProps).source = imageUrls.map(uri => ({ uri }));
      }
    } else if (Device.platform.OS === 'android') {
      if (imageUrls.length === 1) {
        [(nativeProps as ImageProps).src] = imageUrls;
      } else if (imageUrls.length > 1) {
        (nativeProps as ImageProps).srcs = imageUrls;
      }
    }

    /**
     * defaultSource prop
     */
    if (typeof nativeProps.defaultSource === 'string') {
      if (nativeProps.defaultSource.indexOf('data:image/') !== 0) {
        warn('[Image] defaultSource prop must be a local base64 image');
      }
      nativeProps.defaultSource = handleImgUrl(nativeProps.defaultSource);
    }

    /**
     * tintColor(s)
     */
    const nativeStyle = { ...style };
    if (tintColor) {
      nativeStyle.tintColor = colorParse(tintColor);
    }
    if (Array.isArray(tintColors)) {
      nativeStyle.tintColors = colorArrayParse(tintColors);
    }
    (nativeProps as ImageProps).style = nativeStyle;

    if (children) {
      return (
        <View style={style}>
          <img
            {...nativeProps}
            nativeName="Image"
            alt=""
            ref={imageRef}
            style={[{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              width: style.width,
              height: style.height,
            }, imageStyle]}
          />
          {children}
        </View>
      );
    }
    return (
      <img
        {...nativeProps}
        nativeName="Image"
        alt=""
        ref={imageRef}
      />
    );
  }
}
export default Image;

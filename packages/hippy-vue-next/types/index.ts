/**
 * @public
 */
type NeedToTyped = any;

/**
 * @public
 */
type CallbackType = Function;

/**
 * @public
 */
interface CommonMapParams {
  [key: string]: NeedToTyped;
}

// global type
export {
  NeedToTyped,
  CallbackType,
  CommonMapParams,
};

// native node type
export {
  NativeNode,
  NativeNodeProps,
} from './native-node';

// native interface map type
export {
  AnimationStyle,
  NativeInterfaceMap,
} from './native-modules';

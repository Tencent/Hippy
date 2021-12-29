import React from 'react';
import { canUseDOM } from '../utils/execution-environment';
import StyleSheet from '../modules/stylesheet';
import { formatWebStyle } from '../adapters/transfer';
import View, { ViewProps } from './view';


const cssFunction = (): 'contant' | 'env' => {
  if (canUseDOM && window.CSS && window.CSS.supports && window.CSS.supports('top: constants(safe-area-inset-top)')) {
    return 'contant';
  }
  return 'env';
};

const styles = StyleSheet.create({
  root: {
    paddingTop: `${cssFunction}(safe-area-inset-top)`,
    paddingRight: `${cssFunction}(safe-area-inset-right)`,
    paddingBottom: `${cssFunction}(safe-area-inset-bottom)`,
    paddingLeft: `${cssFunction}(safe-area-inset-left)`,
  },
});

const SafeAreaView: React.FC<ViewProps> = React.forwardRef((props, ref) => {
  const { style = {}, children, ...rest } = props;
  let newStyle = StyleSheet.compose(style, styles.root);
  newStyle = formatWebStyle(newStyle);
  return (<View {...rest} ref={ref} style={newStyle}>{ children}</View>);
});
SafeAreaView.displayName = 'SafeAreaView';

export default SafeAreaView;

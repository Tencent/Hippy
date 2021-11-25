import React from 'react';
import { formatWebStyle } from '../adapters/transfer';
import StyleSheet from '../modules/stylesheet';
import View from './view';

const side = 'left';
const styles = StyleSheet.create({
  modal: {
    position: 'absolute',
    width: '100%',
  },
  container: {
    position: 'absolute',
    [side]: '25%',
    top: 0,
  },
});

/**
 * The Modal component is a basic way to present content above an enclosing view.
 * @noInheritDoc
 */
function Modal(props) {
  const {
    visible,
    transparent,
    children,
    onRequestClose,
    onShow,
    supportedOrientations,
    onOrientationChange,
  } = props;

  if (visible === false) {
    return <View />;
  }

  const containerStyles = {
    backgroundColor: transparent ? 'transparent' : 'white',
  };

  const newStyle = formatWebStyle(styles.modal);

  return (
    <div
      transparent={transparent}
      onRequestClose={onRequestClose}
      onShow={onShow}
      style={newStyle}
      supportedOrientations={supportedOrientations}
      onOrientationChange={onOrientationChange}
    >
      <View style={[styles.container, containerStyles]}>
        {children}
      </View>
    </div>
  );
}
Modal.defaultProps = {
  visible: true,
};

export default Modal;

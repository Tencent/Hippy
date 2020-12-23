import React from 'react';
import { formatWebStyle } from '../adapters/transfer';
import applyLayout from '../adapters/apply-layout';

const styles = {
  initial: {
    borderWidth: 0,
    boxSizing: 'border-box',
    color: 'inherit',
    fontFamily: 'System',
    fontSize: 14,
    fontStyle: 'inherit',
    fontVariant: ['inherit'],
    fontWeight: 'inherit',
    lineHeight: 'inherit',
    margin: 0,
    padding: 0,
    textDecorationLine: 'none',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  },
  isInAParentTextFontStyle: {
    // inherit parent font styles
    fontFamily: 'inherit',
    fontSize: 'inherit',
    whiteSpace: 'inherit',
    // display: 'inline',
  },
  singleLineStyle: {
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'block',
  },
};


/**
 * A React component for displaying text.
 *
 * `Text` doesn't support nesting.
 * @noInheritDoc
 */
export class Text extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }


  getChildContext() {
    return { isInAParentText: true };
  }

  render() {
    let { style } = this.props;
    const { isInAParentText } = this.context;
    const { numberOfLines, ellipsizeMode } = this.props;
    if (style) {
      style = formatWebStyle(style);
    }

    const textOverflow = ellipsizeMode === 'clip' ? 'clip' : 'ellipsis';
    const baseStyle = {
      textOverflow,
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: numberOfLines ? numberOfLines.toString() : '0',
    };
    const newStyle = Object.assign({}, style, baseStyle);
    const newProps = Object.assign({}, this.props, {
      style: formatWebStyle([styles.initial,
        isInAParentText === true && styles.isInAParentText,
        newStyle,
        numberOfLines === 1 && Object.assign({}, styles.singleLineStyle, { textOverflow }),
        isInAParentText === true && { display: 'inline' },
      ]),
    });
    delete newProps.numberOfLines;
    delete newProps.onLayout;
    delete newProps.ellipsizeMode;

    if (isInAParentText) return <span {...newProps} />;
    return (
      <div {...newProps} />
    );
  }
}

export default applyLayout(Text);

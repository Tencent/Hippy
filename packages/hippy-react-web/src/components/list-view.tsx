import React from 'react';
import { formatWebStyle } from '../adapters/transfer';

function ListViewItem(props) {
  const { style } = props;
  const newProps = Object.assign({}, props, {
    style: formatWebStyle(style),
  });

  return (
    <li {...newProps} />
  );
}

/**
 * Recyclable list for better performance, and lower memory usage.
 * @noInheritDoc
 */
export class ListView extends React.Component {
  constructor(props) {
    super(props);
    this.handleScroll = this.handleScroll.bind(this);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll() {
    const { scrollY } = window;
    const { onEndReached } = this.props;
    const windowHeight = document.documentElement.clientHeight;
    const bodyHeight = document.body.clientHeight;
    if (bodyHeight - scrollY - windowHeight <= 120 && onEndReached) {
      onEndReached();
    }
  }

  render() {
    const {
      numberOfRows,
      renderRow,
      getRowType,
      getRowStyle,
      dataSource,
    } = this.props;
    const itemList = [];

    for (let index = 0; index < numberOfRows; index += 1) {
      let renderRowParam;

      if (dataSource) {
        renderRowParam = dataSource[index];
      } else {
        renderRowParam = index;
      }

      let itemStyle = {};
      if (typeof getRowStyle === 'function') {
        itemStyle = getRowStyle(index);
      }

      itemList.push((
        <ListViewItem
          style={itemStyle}
          type={typeof getRowType === 'function' ? `${getRowType(index)}` : '0'}
          // iSticky={rowShouldSticky ? rowShouldSticky(index) : false}
          // itemViewType={getRowType ? getRowType(index) : 0}
          // sticky={rowShouldSticky ? rowShouldSticky(index) : false}
        >
          {renderRow(renderRowParam)}
        </ListViewItem>
      ));
    }

    const nativeProps = Object.assign({}, this.props);

    delete nativeProps.renderRow;
    delete nativeProps.getRowType;
    delete nativeProps.getRowHeight;
    delete nativeProps.numberOfRows;

    const newProps = Object.assign({}, nativeProps, {
      style: formatWebStyle(nativeProps.style),
    });

    return (
      <ul {...newProps}>
        {itemList}
      </ul>
    );
  }
}
export default ListView;

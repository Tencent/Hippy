import React from 'react';
import Style from '@localTypes/style';

interface ListViewItemProps {
  type?: string;
  key?: string;
  itemViewType?: string;
  sticky?: boolean;
  style?: Style;
  onLayout?: (evt: any) => void;
}

function ListViewItem(props: ListViewItemProps) {
  return (
    <li nativeName="ListViewItem" {...props} />
  );
}

export default ListViewItem;
export {
  ListViewItemProps,
};

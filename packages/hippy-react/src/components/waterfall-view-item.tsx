import React from 'react';
import Style from '@localTypes/style';

interface WaterfallViewItemProps {}

function WaterfallViewItem(props: WaterfallViewItemProps) {
  return (
    <li nativeName="WaterfallItem" {...props} />
  );
}

export default WaterfallViewItem;
export {
    WaterfallViewItemProps,
};
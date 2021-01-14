import React from 'react';
import Style from '@localTypes/style';
import PullHeader from './pull-header';
import PullFooter from './pull-footer';
import WaterfallViewItem, { WaterfallViewItemProps } from './waterfall-view-item';
import { callUIFunction } from '../modules/ui-manager-module';

type DataItem = any;

interface WaterfallViewProps {
    numberOfColumns: number;
    numberOfRows: number;
    dataSource: DataItem[];
    initialListSize?: number;
    renderPullHeader?(): React.ReactElement;
    renderPullFooter?(): React.ReactElement;
    onEndReached?(): void;
}

class WaterfallView extends React.Component<WaterfallViewProps> {
    private instance: HTMLUListElement | null = null;
    private pullHeader: PullHeader | null = null;
    private pullFooter: PullFooter | null = null;

    static defaultProps = {
      numberOfRows: 20,
      numberOfColumns: 2
    };

    constructor(props: WaterfallViewProps) {
        super(props);
        this.state = {
          initialListReady: false,
        };
    }

    private handleInitialListReady() {
      this.setState({ initialListReady: true });
    }

    public render() {
        const {
            numberOfRows,
            initialListSize,
            numberOfColumns,
            columnSpacing,
            contentInset,
            bannerView,
            onScrollForReport,
            onExposureReport,
            style,
            renderRow,
            renderPullHeader,
            renderPullFooter,
            onHeaderPulling,
            onHeaderReleased,
            onFooterPulling,
            onFooterReleased,
        } = this.props;

        const { initialListReady } = this.state;
        let pullHeader = null;
        let pullFooter = null;

        if (typeof renderPullHeader === 'function') {
            pullHeader = (
              <PullHeader
                ref={(ref) => { this.pullHeader = ref; }}
                onHeaderPulling={onHeaderPulling}
                onHeaderReleased={onHeaderReleased}
              >
                { renderPullHeader() }
              </PullHeader>
            );
        }
    
        if (typeof renderPullFooter === 'function') {
            pullFooter = (
              <PullFooter
                ref={(ref) => { this.pullFooter = ref; }}
                onFooterPulling={onFooterPulling}
                onFooterReleased={onFooterReleased}
              >
                { renderPullFooter() }
              </PullFooter>
            );
        }
      
        let currentRowCount;
        if (!initialListReady) {
          currentRowCount = Math.min(numberOfRows, initialListSize);
        } else {
          currentRowCount = numberOfRows;
        }

        const nativeProps = { ...this.props, style: [{ overflow: 'scroll' }, style] };
        delete nativeProps.numberOfRows;

        nativeProps.numberOfRows = currentRowCount;

        nativeProps.enableOnScrollForReport = !!onScrollForReport;
        nativeProps.enableExposureReport = !!onExposureReport;

        const itemList = [];
        const itemStyle = {};

        // const itemWidth = (Dimensions.get('window').width
        const itemWidth = (428
            - contentInset.left
            - contentInset.right
            - ((numberOfColumns - 1) * columnSpacing)
        ) / numberOfColumns;
        itemStyle.width = itemWidth;

        if (pullHeader) {
          itemList.unshift(pullHeader);
          nativeProps.containPullHeader = true;
        }

        if (pullFooter) {
          itemList.push(pullFooter);
          nativeProps.containPullFooter = true;
        }

        if (typeof bannerView === 'function') {
          const banner = bannerView();
          if (banner) {
            itemList.push((
              <WaterfallViewItem key="bannerView" type="bannerView">
                {React.cloneElement(banner)}
              </WaterfallViewItem>
            ));
            nativeProps.containBannerView = true;
            nativeProps.numberOfRows += 1;
          }
        }

        for (let index = 0; index < currentRowCount; index += 1) {
          itemList.push((
            <WaterfallViewItem style={itemStyle}>
              { renderRow(index) }
            </WaterfallViewItem>
          ));
        }

        delete nativeProps.renderRow;

      nativeProps.numberOfRows = itemList.length;
      (nativeProps as WaterfallViewProps).initialListSize = initialListSize;

        return (
          <ul
            nativeName={'WaterfallView'}
            ref={ref => this.instance = ref}
            initialListReady={this.handleInitialListReady.bind(this)}
            {...nativeProps}
          >
            { itemList }
          </ul>
        );
  }    
}

export default WaterfallView;

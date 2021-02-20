import React from 'react';
import { 
    ListView, 
    Text, 
    View, 
    StyleSheet, 
    Image, 
    HippyEventEmitter,
    Platform, 
    callNative, 
    UIManagerModule } from '@hippy/react';
import defaultAlbum from '!!url-loader?modules!./default_album.png';
import likeImgSrc from '!!url-loader?modules!./liked.png';
import unlikeImgSrc from '!!url-loader?modules!./unliked.png';
import commentImgSrc from '!!url-loader?modules!./comment.png';
import shareImgSrc from '!!url-loader?modules!./share.png';
import moreImgSrc from '!!url-loader?modules!./more.png';
import TKDWormhole from '../../shared/TKDWormhole';
import RefreshBtn from './RefreshBtn';
const STYLE_LOADING = 2;

const MAX_FETCH_TIMES = 10;
const mockDataArray = [
    {
        title: "《告白气球》",
        coverUrl: "http://5b0988e595225.cdn.sohucs.com/images/20180725/378a8a5ddbf244bcbad9b6f7dcf51df3.jpeg",
        author: "周杰伦",
        likeNum: 10240,
        commentsNum: 980,
    },
    {
        title: "《See You Again》",
        coverUrl: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=2117625005,1468394464&fm=26&gp=0.jpg",
        author: "Wiz Khalifa & Charlie Puth",
        likeNum: 600,
        commentsNum: 321,
        isSelfLiked: true,
    },
    {
        title: "[广告]--Nike,永不止步！",
        coverUrl: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1596476976953&di=296ecd6b4a91719a814bfc0ff8d44904&imgtype=0&src=http%3A%2F%2Fimg1.imgtn.bdimg.com%2Fit%2Fu%3D756258046%2C2809017249%26fm%3D214%26gp%3D0.jpg",
        templateType: 1,
        type: 6,
    },
    {
        title: "《Lose Yourself》",
        coverUrl: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1599196375734&di=c527ee65ed5fd572ab5b7349f234540d&imgtype=0&src=http%3A%2F%2Fimg3.doubanio.com%2Flpic%2Fs11134430.jpg",
        author: "Eminem",
        likeNum: 1001,
        commentsNum: 232,
    },
    {
        title: "《双节棍》",
        coverUrl: "http://5b0988e595225.cdn.sohucs.com/images/20180725/533f52fc83e449e5999728c8dbab5557.jpeg",
        author: "周杰伦",
        likeNum: 998,
        commentsNum: 72,
    },
    {
        title: "《以父之名》",
        coverUrl: "http://5b0988e595225.cdn.sohucs.com/images/20180725/aaeac67fc73746f09105631617153cad.jpeg",
        author: "周杰伦",
        likeNum: 2345,
        commentsNum: 234,
    },
    {
        title: "《一无所有》",
        coverUrl: "https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=971826730,4128820166&fm=26&gp=0.jpg",
        author: "崔健",
        likeNum: 666,
        commentsNum: 130,
    },
    {
        title: "[广告]--Tencent，科技向善！",
        coverUrl: "https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=1426117495,2816876964&fm=26&gp=0.jpg",
        templateType: 2,
        type: 6,
    },
];

function NormalStyle({ index, data, surpriseText }) {
    const { likeNum = 0 } = data;
    const { commentsNum = 0 } = data;
    const likeNumStr = formatNum(likeNum);
    const commentsNumStr = formatNum(commentsNum);
    const likeImgIcon = (data.isSelfLiked) ? likeImgSrc : unlikeImgSrc;
    return <View style={styles.container}>
        <Text style={[styles.title, { color: '#242424' }]}>
            <Text >排行榜 #{index + 1}</Text>
            <Text style={{ color: 'red', fontSize: 14 }}> {surpriseText} </Text>
        </Text>
        <Text style={[styles.subtitle, { color: '#242424' }]}>{data.title}</Text>
        <Image style={styles.albumCover} defaultSource={defaultAlbum} source={{ uri: data.coverUrl }} resizeMode={Image.resizeMode.cover}></Image>
        <View style={styles.interactBar}>
            <View style={styles.interactBarSubItem}>
                <Image style={styles.interactBarIcon} defaultSource={likeImgIcon}></Image>
                <Text style={{ marginLeft: 5 }}>{likeNumStr}</Text>
            </View>
            <View style={styles.interactBarSubItem}>
                <Image style={styles.interactBarIcon} defaultSource={commentImgSrc}></Image>
                <Text style={{ marginLeft: 5 }}>{commentsNumStr}</Text>
            </View>
            <Image style={styles.interactBarIcon} defaultSource={shareImgSrc}></Image>
            <Image style={styles.interactBarIcon} defaultSource={moreImgSrc}></Image>
        </View>
    </View>
}

function DynamicStyle({ index, data }) {

}

function formatNum(num) {
    if (num < 1000) {
        return num.toString();
    } else {
        return (num / 1000).toFixed(1).toString() + 'K';
    }
}

export default class FeedsExpo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: mockDataArray,
            fetchingDataFlag: false,
            surpriseText: '',
        };

        this.fetchTimes = 0;
        this.mockFetchData = this.mockFetchData.bind(this);
        this.getRenderRow = this.getRenderRow.bind(this);
        this.onEndReached = this.onEndReached.bind(this);
        this.getRowType = this.getRowType.bind(this);
        this.getRowKey = this.getRowKey.bind(this);
        this.wormholeEnabled = this.wormholeEnabled.bind(this);

        const hippyEventEmitter = new HippyEventEmitter();
        this.call = hippyEventEmitter.addListener('onWormholeMessageReceived', (message) => {
            if (message.eventName == "wormholeCardDidClick" && message.rootTag == this.props.rootTag) {
                this.setState({
                    surpriseText: '[ click from Wormhole:' + message.extData.wormholeId + ']',
                });
            } else {

            }
        });
        this.wormholes = {};
    }

    componentWillUnmount() {
        this.call.remove();
    }

    mockFetchData() {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.setState({
                    fetchingDataFlag: false
                });
                if (this.fetchTimes++ >= MAX_FETCH_TIMES) {
                    return resolve([]);
                }
                return resolve(mockDataArray);
            }, 1000);
        });
    }

    wormholeEnabled(index) {
        // 由业务方决定，该listItem是否开启虫洞能力
        return ((index - 2) % 8 === 0) || ((index - 7) % 8 === 0);  // 只是测试使用，实际以业务data判断为准
    }

    getRenderRow(index) {
        let rowView = null;
        let rowData = this.state.dataSource[index];
        let isLastItem = this.state.dataSource.length === index + 1;
        const { surpriseText, fetchingDataFlag } = this.state;
        const { title } = rowData;

        if (rowData.type === STYLE_LOADING) {
            rowView = <Text style={styles.loading}>Loading now...</Text>;
        } else {
            if (this.isRefreshing && fetchingDataFlag) {
                index--;
            }
            if (this.wormholeEnabled(index)) {
                // 通过params传递虫洞数据
                rowView = <TKDWormhole ref={ref => this.wormholes[index] = ref} style={{ width: 0, height: 0 }} params={{ data: rowData, index }}></TKDWormhole>
                console.log('TKDWormhole!!!' + 'title:' + title + ', index:' + index);
            } else {
                rowView = <NormalStyle index={index} data={rowData} surpriseText={surpriseText} />;
            }
        }

        return (
            <View style={styles.container} onClick={() => this.onCellClick(index, title)}>
                <View style={styles.itemContainer}>
                    {rowView}
                </View>
                {!isLastItem && <View style={styles.separatorLine} />}
            </View>
        );
    }

    onCellClick(index, title) {
        if (index % 2 == 0) {
            callNative("EventObserver", "postWormholeMessage", {"fromModule": "Feeds", "toModule": "wormhole", "rootTag": this.props.rootTag, "eventName": "feedsCardDidClick",
            "extData":{ "index": index, "title": title}});
        }
        else {
            UIManagerModule.callUIFunction(this.wormholes[2], 'sendEventToWormholeView', { message: "message from feeds" });
        }
    }

    async onEndReached() {
        let { dataSource, fetchingDataFlag } = this.state;
        // ensure that only one fetching task would be running
        if (fetchingDataFlag) return;
        this.setState({
            fetchingDataFlag: true,
            dataSource: dataSource.concat([{ type: STYLE_LOADING }])
        });
        let newData = await this.mockFetchData();
        let lastLineItem = dataSource[dataSource.length - 1];
        if (lastLineItem && lastLineItem.type === STYLE_LOADING) {
            dataSource.pop();
        }
        let newDataSource = dataSource.concat(newData);
        this.setState({ dataSource: newDataSource });
    }

    getRowType(index) {
        let self = this;
        let item = self.state.dataSource[index];
        return item.type;
    }

    getRowKey(index) {
        return `row-${index}`;
    }

    onClickRefresh = async () => {
        if (this.isRefreshing) { // 这里对标志位二次控制防止动画的反复执行
            return;
        }
        if (this.refreshBtn) {
            this.refreshBtn.startAnim();
        }
        // 拉取数据
        await this.refreshData();
        if (this.refreshBtn) {
            this.refreshBtn.stopAnim();
        }
    }

    refreshData = async () => {
        if (this.isRefreshing) {
            return;
        }

        this.isRefreshing = true;

        this.listView.scrollToIndex(0, 0, true);

        let { dataSource, fetchingDataFlag } = this.state;
        if (fetchingDataFlag) return;
        let tmpLoading = [{ type: STYLE_LOADING }];
        this.setState({
            fetchingDataFlag: true,
            dataSource: tmpLoading.concat(dataSource),
        });
        let newData = await this.mockFetchData();
        let firstItem = dataSource[0];
        if (firstItem && firstItem.type === STYLE_LOADING) {
            dataSource.shift();
        }

        dataSource = [];
        this.fetchTimes = 0;
        let newDataSource = dataSource.concat(newData);
        this.setState({ dataSource: newDataSource });

        this.isRefreshing = false;
    }

    render() {
        return (
            <View style={{ flex: 1, alignSelf: 'stretch' }}>
                <ListView style={{ flex: 1, overflow: 'hidden' }}
                    ref={ref => this.listView = ref}
                    numberOfRows={this.state.dataSource.length}
                    renderRow={this.getRenderRow}
                    onEndReached={this.onEndReached}
                    getRowType={this.getRowType}
                    getRowKey={this.getRowKey}
                />
                <RefreshBtn onClick={this.onClickRefresh} ref={ref => this.refreshBtn = ref} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#ffffff",
    },
    itemContainer: {
        padding: 12,
    },
    separatorLine: {
        marginLeft: 12,
        marginRight: 12,
        height: 0.5,
        backgroundColor: "#e5e5e5"
    },
    loading: {
        fontSize: 11,
        color: "#aaaaaa",
        alignSelf: "center"
    },
    albumCover: {
        width: 300,
        height: Platform.OS === 'ios' ? 180 : 100,
        margin: 10,
        borderColor: '#4c9afa',
        borderWidth: 1,
        borderRadius: 2,
    },
    title: {
        paddingHorizontal: 12,
        paddingBottom: 6,
        fontWeight: 'bold',
        fontSize: 22,
        lineHeight: 26,
        numberOfLines: 1,
        color: '#242424',
    },
    subtitle: {
        fontSize: 18,
        lineHeight: 22,
        numberOfLines: 1,
        paddingHorizontal: 6,
    },
    interactBar: {
        marginTop: 6,
        paddingHorizontal: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    interactBarSubItem: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    interactBarIcon: {
        width: 20,
        height: 20,
    },
});
import React, { Component } from "react";
import { Animation, View, Text, StyleSheet } from "@hippy/react";

// const bigTabSize = $.os.ios ? 18 : 22;
// const smallTabSie = $.os.ios ? 18 : 16;
const bigTabSize = 14;
const smallTabSie = 14;
const opacityMax = 1;
const opacityMin = 0.4;
const ttmarginBottom = 8;
const smallBoldSize = 400;

const bigBoldSize = 700;
let wrapperPaddingLeft = 16;

export default class Tab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      progress: 0,
      showMaskLine: false,
      showMsgIcon: false,
      tabTextSizes: [bigTabSize, smallTabSie, smallTabSie],
      tabTextMarginBottoms: [0, ttmarginBottom, ttmarginBottom],
      tabTextBolds: [bigBoldSize, smallBoldSize, smallBoldSize],
      opacities: [opacityMax, opacityMin, opacityMin],
      boldIndex: this.props.curIndx
    };
    // this.initPositions();
    this.opacityAnimation = new Animation({
      startValue: 0, // 动画开始值
      toValue: 1, // 动画结束值
      duration: 500, // 动画持续时长
      delay: 0, // 至动画真正开始的延迟时间
      mode: "timing", // 动画模式，现在只支持timing
      timingFunction: "ease-in-out" // 动画缓动函数
    });
    this.debounceFlag = false;
    this.layOuts = [];
    this.slidebarWidth = 26;
  }
  componentWillReceiveProps(nextProps) {
    this.update(nextProps);
  }
  tabChangeHandle = (item, index) => {
    if (this.debounceFlag) {
      console.log("debounceFlag true ..................");
      return;
    }
    this.debounceFlag = true;
    setTimeout(() => {
      this.debounceFlag = false;
    }, 300);
    this.props.changeTab && this.props.changeTab(index);
  };
  tabTouchHandle(index) {
    console.log("tabTouchHandle====>", index);
    if (!this.lastTouchTime) {
      this.lastTouchIndex = index;
      this.lastTouchTime = Date.now();
      return;
    }
    const now = Date.now();
    if (now - this.lastTouchTime < 30 && index === this.lastTouchIndex) {
      console.log("===>双击事件");
    }
    this.lastTouchIndex = index;
  }
  update(props) {
    let { offset, position } = props;
    let startPosition = 0;
    if (offset > 0) { // 正向
      startPosition = position - 1;
    } else if (offset < 0) { // 反向
      startPosition = position + 1;
    }  else if (offset === 0) {
      startPosition = position;
    }
    let endPosition = position;
    let endOffset = 1 - Math.abs(offset); // 与opacity反比
    let opacities = Object.assign([], this.state.opacities);
    console.info("[[]]]][[][][][]startPosition:", startPosition, "offset:", offset, "endPosition:", endPosition, "endOffset:", endOffset);
    let deltaOpacity = opacityMax - opacityMin;
    opacities[startPosition] = opacityMax - Math.abs(offset) * deltaOpacity;
    opacities[endPosition] = opacityMax - endOffset * deltaOpacity;
    if (offset === 0) {
      opacities[startPosition] = opacityMax;
      this.notSelectedTabsCompat(startPosition, opacities);
    }
    console.info("[[]]]][[][][][]opacities:", opacities);
    this.setState({
      opacities
    });
  }

  notSelectedTabsCompat(objPosition, opacities) {
    const { tabs } = this.props;
    for (let i = 0; i < tabs.length; i++) {
      if (i === objPosition) {
        continue;
      }
      opacities[i] = opacityMin;
    }
  }

  getLeftOffset() {
    if (this.layOuts.length < 3 && !this.isLayOutsInited()) {
      return 0;
    }
    let { offset, position, tabs } = this.props;
    let startPosition = 0;
    // 根据方向换算成坐标轴数据
    if (offset > 0) { // 正向
      startPosition = position - 1;
    } else if (offset < 0) { // 反向
      startPosition = position + 1;
    }  else if (offset === 0) {
      startPosition = position;
    }
    let _offset = startPosition + offset; // x坐标轴方向偏移
    let _pos = Math.ceil(_offset); // 
    console.info("{}{}{}{}{}{}{}{}",offset, startPosition, _offset, _pos);
    let leftRes = this.layOuts[0].slideWidth + (wrapperPaddingLeft - this.slidebarWidth / 2); // 最左侧（起始位置）
    for (let i = _pos - 1; i >= 1; i--) {
      leftRes += this.layOuts[i].slideWidth;
    }
    if (offset === 0 && _pos > 0) {
      leftRes += this.layOuts[_pos].slideWidth; // 切换完成停在某一页位置计算
    } else {
      leftRes += ((_offset) % 1) * this.layOuts[_pos].slideWidth; // 移动过程中需要根据比例和当前slideWidth计算滑块位置
    }
    return leftRes;
  }
  // onLayout有延时，可能不会按顺序执行导致this.layOuts不按顺序初始化
  isLayOutsInited() {
    if (this.layOuts.length === this.props.tabs.length) {
      for (let i = 0; i < this.layOuts.length; i++) {
        let item = this.layOuts[i];
        if (!item) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
  onLayout(e, ind) {
    // 动态获取每个tab按钮尺寸，用于计算滑块位置
    if (!this.layOuts[ind]) {
      this.layOuts[ind] = e.layout;
    }
    if (this.isLayOutsInited()) {
      console.error("(((((())))))))))", this.layOuts)
      this.layOuts.forEach((item, i) => {
        if (i === 0) {
          item.slideWidth = item.width / 2;
        } else if(this.layOuts[i - 1]) {
          this.layOuts[i].slideWidth = this.layOuts[i].x + this.layOuts[i].width / 2 - (this.layOuts[i - 1].x + this.layOuts[i - 1].width / 2);
        }
      });
      this.layOuts[this.layOuts.length] = { slideWidth: this.layOuts[this.layOuts.length - 1].slideWidth };
      this.layOuts[-1] = { slideWidth: this.layOuts[0].slideWidth };
    }
  }
  // eslint-disable-next-line complexity
  render() {
    debugger;
    let { tabTextSizes, opacities } = this.state;
    const { tabs } = this.props;
    const tabHeight = 44;
    return (
      <View style={[styles.wrap, { height: tabHeight }]}>
        <View
          style={[
            {
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              height: tabHeight
            }
          ]}
          collapsable={false}
        >
          {tabs &&
            tabs.map((item, i) => {
              return (
                <View
                  key={"btn" + i + "_" + tabTextSizes[i]}
                  onClick={() => this.tabChangeHandle(item, i)}
                  style={{ height: tabHeight, justifyContent: "center", alignItems: "center", marginRight: 20 }}
                  onLayout={e => this.onLayout(e, i)}
                >
                  <Text
                    collapsable={false}
                    style={{
                      fontSize: tabTextSizes[i],
                      // paddingLeft: 10,
                      // paddingRight: 10,
                      opacity: opacities[i],
                      // paddingBottom: $.os.ios ? tabTextMarginBottoms[i] : 0,
                      color: "rgba(48,50,52,1)",
                      fontWeight: "700" // String(boldIndex === i ? 700 : Math.round(tabTextBolds[i] / 100) * 100)
                    }}
                  >
                    {item}
                  </Text>
                </View>
              );
            })}
        </View>
        <View 
          key="sliderbar"
          style={{
            position: "absolute",
            bottom: 0,
            left: this.getLeftOffset(),
            height: 4,
            borderRadius: 6,
            width: this.slidebarWidth,
            backgroundColor: "blue",
          }}
        ></View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: {
    height: 50,
    paddingLeft: wrapperPaddingLeft,
    paddingRight: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    transfrom: [{ translatZ: 0 }]
  },
  bigTitte: {
    color: "#303032"
  }
});

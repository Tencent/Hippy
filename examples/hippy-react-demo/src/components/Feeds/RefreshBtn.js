import React from "react";
import { Animation, StyleSheet, View, Image } from '@hippy/react';
import refreshBgSrc from '!!url-loader?modules!./refreshBg.png';
import refreshTipsSrc from '!!url-loader?modules!./refreshTips.png';
export default class RefreshBtn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            refreshAnimation: null,
        };
    }

    startAnim = () => {
        const refreshAnimation = new Animation({
            startValue: 0, // 开始值
            toValue: 360, // 动画结束值
            duration: 520, // 动画持续时长
            valueType: 'deg',
            repeatCount: 'loop',
            delay: 0, // 至动画真正开始的延迟时间
            mode: 'timing', // 动画模式，现在只支持timing
            timingFunction: 'linear', // 动画缓动函数
        });
        this.setState({
            refreshAnimation,
        }, () => {
            refreshAnimation.start();
        });
    }

    stopAnim = () => {
        const { refreshAnimation } = this.state;
        if (refreshAnimation) {
            refreshAnimation.destory();
        }
        this.setState({ refreshAnimation: null });
    }

    render() {
        const { onClick } = this.props;
        const { refreshAnimation } = this.state;
        return (
            <View style={styles.refreshBtn} onClick={onClick}>
                <Image
                    defaultSource={refreshBgSrc}
                    style={styles.refreshBg}
                    resizeMode="cover"
                    oPicMode={{ enable: false }}
                    nightMode={{ enable: false }}
                    accessibilityLabel="刷新背景"
                    accessible
                />
                <Image
                    defaultSource={refreshTipsSrc}
                    style={[styles.refreshTips, refreshAnimation ? { transform: [{ rotate: '45deg' }] } : {}]}
                    resizeMode="cover"
                    oPicMode={{ enable: false }}
                    nightMode={{ enable: false }}
                    accessibilityLabel="刷新"
                    accessible
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    refreshBtn: {
        position: 'absolute',
        bottom: 9,
        right: 6,
        width: 56,
        height: 56,
    },
    refreshBg: {
        width: 56,
        height: 56,
    },
    refreshTips: {
        width: 22,
        height: 22,
        zIndex: 1,
        marginTop: 17,
        marginLeft: 17,
        position: 'absolute',
    },
});
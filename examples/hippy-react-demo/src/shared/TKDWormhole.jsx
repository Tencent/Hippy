import React, {Component} from "react";
import { StyleSheet, View, HippyEventEmitter } from '@hippy/react';

export default class TKDWormhole extends Component {
    constructor(props) {
        super(props);
        this.state = {
            style: {
                width: props.width || 0,
                height: props.height || 0,
            }
        };

        const { params } = props;
        this.onServerBatchComplete = this.onServerBatchComplete.bind(this);
        console.log('TKDWormhole.constructor.');
    }

    componentDidMount() {
        console.log('TKDWormhole.componentDidMount.');
    }

    render() {
        const {
            style,
            ...nativeProps
        } = this.props;
        const nativeStyle = {
            ...style,
            ...this.state.style, // 强制用样式状态覆盖掉用户自己定义的样式
        };
        return (
            <div
                nativeName="TKDWormhole"  // **必须：**将前端组件与终端组件进行绑定
                style={nativeStyle}
                onServerBatchComplete={this.onServerBatchComplete}
                {...nativeProps}
            />
        )
    }

    onServerBatchComplete(params) {
        const { width, height } = params; // 这里是终端下发的 map，可以改一下结构对应 map 里的宽高
        this.setState({
            style: {
                width,
                height,
            },
        });
    }
} 
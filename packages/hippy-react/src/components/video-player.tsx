import React from 'react';
import Style from '@localTypes/style';
import { LayoutableProps, ClickableProps } from '../types';
import View from './view';
import { Device } from '../native';
import { colorParse, colorArrayParse } from '../color';
import { warn } from '../utils';

interface VideoPlayerProps {

}

class VideoPlayer extends React.Component<VideoPlayerProps> {

    public render() {
        const {
            style,
            ...nativeProps
          } = this.props;
        return 
            <View style={style}>
                <VideoPlayer
                {...nativeProps}
                nativeName="VideoPlayer"
                ></VideoPlayer>
            </View>
    }
}
export default VideoPlayer;
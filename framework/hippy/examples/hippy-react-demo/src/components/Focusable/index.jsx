import React from 'react';
import {
  Focusable,
  ScrollView,
  Text,
  View,
} from '@hippy/react';

export default class FocusableExpo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clickindex: 0,
    };
  }

  onClick(index) {
    this.setState({ clickindex: index });
  }

  getRenderRow(index) {
    const { clickindex } = this.state;
    return (
      <View>
        <Focusable
          style={{ height: 80 }}
          onClick={() => this.onClick(index)}
          requestFocus={index === 0}
          focusStyle={{ backgroundColor: 'red' }}
          noFocusStyle={{ backgroundColor: 'blue' }}
        >
          <Text style={{ color: 'white' }}>
            {clickindex === index ? `我被点击了${index}` : `没有被点击${index}`}
          </Text>
        </Focusable>
      </View>
    );
  }

  render() {
    return (
      <ScrollView>
        {this.getRenderRow(0)}
        {this.getRenderRow(1)}
        {this.getRenderRow(2)}
        {this.getRenderRow(3)}
        {this.getRenderRow(4)}
        {this.getRenderRow(5)}
        {this.getRenderRow(6)}
        {this.getRenderRow(7)}
        {this.getRenderRow(8)}
        {this.getRenderRow(9)}
        {this.getRenderRow(10)}
        {this.getRenderRow(11)}
        {this.getRenderRow(12)}
        {this.getRenderRow(13)}
        {this.getRenderRow(14)}
        {this.getRenderRow(15)}
        {this.getRenderRow(16)}
        {this.getRenderRow(17)}
        {this.getRenderRow(18)}
      </ScrollView>
    );
  }
}

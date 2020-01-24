import React from 'react';
import { UIManagerModule } from '@hippy/react';


export default class MyView extends React.Component {
  changeColor(color) {
    UIManagerModule.callUIFunction(this.mytext, "changeColor", [color]);
  }
  render() {
    return (
      <div
        nativeName="MyView"
        ref={ref => {
          this.mytext = ref;
        }}
        {...this.props}
      />
    );
  }
}

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {
  View,
} from '@hippy/react';


export class Gallery extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { history } = this.props;
    window.e2eHistory = history;

  }


  render() {
    return (
      <View/>
    );
  }
}

export default withRouter(Gallery);

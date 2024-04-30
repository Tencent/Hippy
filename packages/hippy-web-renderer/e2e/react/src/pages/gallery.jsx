/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

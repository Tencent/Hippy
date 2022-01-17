/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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

/* eslint-disable class-methods-use-this */

import React from 'react';
import { formatWebStyle } from '../adapters/transfer';

/**
 * Simply router component for switch in multiple Hippy page.
 * @noInheritDoc
 */
class Navigator extends React.Component {
  public pop() {
    // noop
  }

  public push() {
    // noop
  }

  public render() {
    const { style } = this.props as any;
    const newProps = Object.assign({}, this.props, {
      style: formatWebStyle(style),
    });
    return (
      <div {...newProps} />
    );
  }
}

export default Navigator;

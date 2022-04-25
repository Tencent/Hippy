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

import oldWebpack from 'webpack';
import { Logger } from '@debug-server-next/utils/log';
import { getBundleVersionId } from '@debug-server-next/utils/bundle-version';
import { normalizeWebpackConfig } from '@debug-server-next/utils/webpack';

const log = new Logger('app-dev-server');

export const webpack = async (webpackConfig, cb?) => {
  if (!webpackConfig) {
    log.error('you must config webpack.config file path to start webpack-dev-server!');
    return process.exit(0);
  }
  const id = getBundleVersionId();
  normalizeWebpackConfig(id, webpackConfig);
  if (webpackConfig.devServer) {
    webpackConfig.devServer.id = id;
  }
  const compiler = oldWebpack(webpackConfig);
  const WebpackDevServer = (await import('./webpack-dev-server/lib/Server')).default;
  const webpackDevServer = new WebpackDevServer(webpackConfig.devServer, compiler, (err, stats) => {
    if (cb) cb(err, stats);
    if (webpackConfig.devServer?.cb) webpackConfig.devServer.cb();
  });
  await webpackDevServer.start();
  return compiler;
};

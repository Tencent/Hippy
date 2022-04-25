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

import { ChromeCommand } from '@hippy/devtools-protocol/dist/types';
import { uniq } from 'lodash';

export const CDP_DOMAIN_LIST = uniq(
  (Object.values(ChromeCommand) as string[]).map((command: string) => command.split('.')[0]),
);

export const isCDPDomains = (domain) => CDP_DOMAIN_LIST.indexOf(domain) !== -1;

/**
 * get protocol domain by command
 */
export const getDomain = (method: string) => {
  let domain = method;
  const group = method.match(/^(\w+)(\.\w+)?$/);
  if (group) {
    [, domain] = group;
  }
  return domain;
};

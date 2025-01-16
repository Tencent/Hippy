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

export class HippyException extends Error {
  constructor(message: string) {
    super()
    this.message = message
  }

  static safeBuild(exception: Object): HippyException {
    if (exception instanceof HippyException) {
      return exception
    } else if (exception instanceof Error) {
      let ex = new HippyException('')
      ex.message = `${exception.name}, ${exception.message}`
      ex.stack = exception.stack
      return ex
    }
    return new HippyException('')
  }
}

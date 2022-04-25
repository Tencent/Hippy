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

import { initDevTools } from '@vue-devtools'
import { Bridge } from '@vue-devtools/shared-utils'

const VueDevtoolsEvent = {
  DevtoolsDisconnect: 'vue-devtools-disconnect-devtools',
  Init: 'vue-devtools-init',
  Message: 'vue-message',
}

const getUrlParam = (key) => new URL(location.href).searchParams.get(key) || ''

const url = new URL(window.parent.location.href)
const wsParam = url.searchParams.get('ws')
const wssParam = url.searchParams.get('wss')
const newUrl = new URL(wsParam ? `ws://${wsParam}` : `wss://${wssParam}`)
newUrl.searchParams.set('extensionName', `vue-devtools`)
newUrl.searchParams.set('role', `vue_devtools`)
newUrl.searchParams.set('hash', getUrlParam('hash'))
const wsUrl = newUrl.toString()
console.info(wsUrl)

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (_params) => {}
let devtoolsHandler = noop
let reload
let introTimer
const ws = new WebSocket(wsUrl)
ws.onopen = () => {
  console.info('vue-devtools open')
}

const $ = document.querySelector.bind(document)
const $intro = $('#intro')

clearTimeout(introTimer)
$intro!.classList.add('hidden')

// Reset attached listeners
devtoolsHandler = noop

// If new page is opened reload devtools
// if (reload) return reload()

initDevTools({
  connect(callback) {
    const wall = {
      listen(fn) {
        devtoolsHandler = fn
      },
      send(data) {
        ws.send(JSON.stringify([VueDevtoolsEvent.Message, data]))
      },
    }
    const bridge = new Bridge(wall)

    callback(bridge)
  },
  onReload(fn) {
    reload = fn
  },
})

ws.onmessage = (event) => {
  const res = JSON.parse(event.data)
  if (res[0] === VueDevtoolsEvent.DevtoolsDisconnect) {
    introTimer = setTimeout(() => {
      $intro!.classList.remove('hidden')
    }, 2000)
  } else if (res[0] === VueDevtoolsEvent.Message) {
    devtoolsHandler(res[1])
  }
}

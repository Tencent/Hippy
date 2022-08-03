<template>
  <div id="websocket-demo">
    <div>
      <p class="demo-title">
        Url:
      </p>
      <input
        ref="wsUrlRef"
        value="wss://echo.websocket.org"
      >
      <div class="row">
        <button @click.stop="onClickConnect">
          <span>Connect</span>
        </button>
        <button @click.stop="onClickDisconnect">
          <span>Disconnect</span>
        </button>
      </div>
    </div>
    <div>
      <p class="demo-title">
        Message:
      </p>
      <input
        ref="messageRef"
        value="Rock it with Hippy WebSocket"
      >
      <button @click.stop="onClickSendMessage">
        <span>Send</span>
      </button>
    </div>
    <div>
      <p class="demo-title">
        Log:
      </p>
      <div class="output fullscreen">
        <div>
          <p
            v-for="(line, index) in output"
            :key="index"
          >
            {{ line }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, type Ref } from '@vue/runtime-core';

/** 数据类型 */
export interface DemoWebsocketData {
    output: string[];
    ws: WebSocket | null;
  }

  /** Hippy输入框类型 */
  interface HippyInput {
    getValue: () => Promise<string>;
  }

// websocket 实例
let wsInstance: WebSocket | null = null;
// 输出内容
const output: Ref<string[]> = ref([]);

/**
   * 往输出区域添加内容
   *
   * @param message
   */
const appendOutput = (message: string) => {
  output.value.unshift(message);
};

/**
   * 断开 websocket 连接
   */
const disconnect = () => {
  // 如果当前状态是已连接，则关闭连接
  if (wsInstance && wsInstance.readyState === 1) {
    wsInstance.close();
  }
};

/**
   * 建立 websocket 连接
   *
   * @param url
   */
const connect = (url: string) => {
  // 首先关闭已有连接
  disconnect();
  // 创建实例并绑定事件回调
  wsInstance = new WebSocket(url);
  wsInstance.onopen = () => appendOutput(`[Opened] ${wsInstance?.url}`);
  wsInstance.onclose = () => appendOutput(`[Closed] ${wsInstance?.url}`);
  wsInstance.onerror = (error) => {
    const newError: Event & { reason?: string } = error;
    appendOutput(`[Error] ${newError.reason}`);
  };
  wsInstance.onmessage = message => appendOutput(`[Received] ${message.data}`);
};

/**
   * 发送 websocket 消息
   */
const sendMessage = (message) => {
  appendOutput(`[Sent] ${message}`);
  if (wsInstance) {
    wsInstance.send(message);
  }
};

export default defineComponent({
  setup() {
    const wsUrlRef = ref(null);
    const messageRef = ref(null);

    /**
       * 点击建立 websocket 连接
       */
    const onClickConnect = () => {
      // 获取输入框的 url 并建立 ws 连接
      const wsUrlInput = wsUrlRef.value;

      if (wsUrlInput) {
        (wsUrlInput as HippyInput).getValue().then((url) => {
          connect(url);
        });
      }
    };

    /**
       * 点击关闭 ws 连接
       */
    const onClickDisconnect = () => {
      disconnect();
    };

    /**
       * 点击发送输入框内容到 ws
       */
    const onClickSendMessage = () => {
      // 获取输入框的消息内容发送消息
      const messageInput = messageRef.value;

      if (messageInput) {
        (messageInput as HippyInput).getValue().then((message) => {
          sendMessage(message);
        });
      }
    };
    return {
      output,
      wsUrlRef,
      messageRef,
      onClickConnect,
      onClickDisconnect,
      onClickSendMessage,
    };
  },
});
</script>

<style>
  #websocket-demo .demo-title {
    color: #ccc;
  }

  #websocket-demo .output {
    overflow-y: scroll;
  }

  #websocket-demo button {
    background-color: #40b883;
    border-color: #5dabfb;
    border-style: solid;
    border-width: 1px;
    padding-horizontal: 20px;
    font-size: 16px;
    color: #fff;
    margin: 10px;
  }

  #websocket-demo button span {
    height: 56px;
    line-height: 56px;
  }

  #websocket-demo input {
    color: black;
    flex: 1;
    height: 36px;
    line-height: 36px;
    font-size: 14px;
    border-bottom-color: #40b883;
    border-bottom-width: 1px;
    padding: 0;
  }
</style>

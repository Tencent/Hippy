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

export interface DemoWebsocketData {
    output: string[];
    ws: WebSocket | null;
  }

  interface HippyInput {
    getValue: () => Promise<string>;
  }

// websocket instance
let wsInstance: WebSocket | null = null;
// output content
const output: Ref<string[]> = ref([]);

/**
   * Add content to the output area
   *
   * @param message
   */
const appendOutput = (message: string) => {
  output.value.unshift(message);
};

/**
   * disconnect websocket connection
   */
const disconnect = () => {
  // If the current state is connected, close the connection
  if (wsInstance && wsInstance.readyState === 1) {
    wsInstance.close();
  }
};

/**
   * Establish a websocket connection
   *
   * @param url
   */
const connect = (url: string) => {
  // First close the existing connection
  disconnect();
  // Create instance and bind event callback
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
   * Send websocket message
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
       * Click to establish a websocket connection
       */
    const onClickConnect = () => {
      // Get the url of the input box and establish a websocket connection
      const wsUrlInput = wsUrlRef.value;

      if (wsUrlInput) {
        (wsUrlInput as HippyInput).getValue().then((url) => {
          connect(url);
        });
      }
    };

    /**
       * Click to close the websocket connection
       */
    const onClickDisconnect = () => {
      disconnect();
    };

    /**
       * Click to send the content of the input box to websocket
       */
    const onClickSendMessage = () => {
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

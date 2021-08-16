<template>
  <div id="websocket-demo">
    <div>
      <p class="demo-title">
        Url:
      </p>
      <input
        ref="inputUrl"
        value="wss://echo.websocket.org"
      >
      <div class="row">
        <button @click="connect">
          <span>Connect</span>
        </button>
        <button @click="disconnect">
          <span>Disconnect</span>
        </button>
      </div>
    </div>
    <div>
      <p class="demo-title">
        Message:
      </p>
      <input
        ref="inputMessage"
        value="Rock it with Hippy WebSocket"
      >
      <button @click="sendMessage">
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

<script>
export default {
  data() {
    return {
      output: [],
    };
  },
  methods: {
    connect() {
      this.$refs.inputUrl.getValue().then((url) => {
        this.disconnect();
        const ws = new WebSocket(url);
        ws.onopen = () => this.appendOutput(`[Opened] ${ws.url}`);
        ws.onclose = () => this.appendOutput(`[Closed] ${ws.url}`);
        ws.onerror = error => this.appendOutput(`[Error] ${error.reason}`);
        ws.onmessage = message => this.appendOutput(`[Received] ${message.data}`);
        this.ws = ws;
      });
    },
    disconnect() {
      if (this.ws && this.ws.readyState === 1) {
        this.ws.close();
      }
    },
    appendOutput(message) {
      this.output.unshift(message);
    },
    sendMessage() {
      this.$refs.inputMessage.getValue().then((message) => {
        this.appendOutput(`[Sent] ${message}`);
        this.ws.send(message);
      });
    },
  },
};
</script>

<style scoped>
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
  border-bottom-style: solid;
  border-bottom-width: 1px;
  padding: 0;
}
</style>

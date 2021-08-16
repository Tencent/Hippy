/* eslint-disable react/no-array-index-key */

import React, { useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
} from '@hippy/react';

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  title: {
    color: '#ccc',
  },
  button: {
    height: 56,
    backgroundColor: '#4c9afa',
    borderColor: '#5dabfb',
    borderStyle: 'solid',
    borderWidth: 1,
    paddingHorizontal: 20,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 56,
    color: '#fff',
    margin: 10,
  },
  input: {
    color: 'black',
    flex: 1,
    height: 36,
    lineHeight: 36,
    fontSize: 14,
    borderBottomColor: '#4c9afa',
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
    padding: 0,
  },
  output: {
    color: 'black',
  },
});

const input = {
  url: 'wss://echo.websocket.org',
  message: 'Rock it with Hippy WebSocket',
};

let ws;
function WebSocketDemo() {
  const inputUrl = useRef(null);
  const inputMessage = useRef(null);

  // Initial output state.
  const [output, setOutput] = useState([]);

  /**
   * Append text to output area.
   * @param {string} message - message will append.
   */
  const appendOutput = (message) => {
    setOutput(oldMessages => [message, ...oldMessages]);
  };

  /**
   * Connect to new WebSocket server.
   */
  const connect = () => {
    inputUrl.current.getValue().then((url) => {
      if (ws && ws.readyState === 1) {
        ws.close();
      }
      ws = new WebSocket(url);
      ws.onopen = () => appendOutput(`[Opened] ${ws.url}`);
      ws.onclose = () => appendOutput(`[Closed] ${ws.url}`);
      ws.onerror = error => appendOutput(`[Error] ${error.reason}`);
      ws.onmessage = message => appendOutput(`[Received] ${message.data}`);
    });
  };

  /**
   * Send message to WebSocket server.
   */
  const sendMessage = () => inputMessage.current.getValue().then((message) => {
    appendOutput(`[Sent] ${message}`);
    ws.send(message);
  });

  return (
    <View style={styles.fullScreen}>
      <View>
        <Text style={styles.title}>Url:</Text>
        <TextInput ref={inputUrl} value={input.url} style={styles.input} />
        <View style={styles.row}>
          <Text onClick={connect} style={styles.button}>Connect</Text>
          <Text onClick={() => ws.close()} style={styles.button}>Disconnect</Text>
        </View>
      </View>
      <View>
        <Text style={styles.title}>Message:</Text>
        <TextInput ref={inputMessage} value={input.message} style={styles.input} />
        <Text onClick={sendMessage} style={styles.button}>Send</Text>
      </View>
      <View>
        <Text style={styles.title}>Log:</Text>
        <ScrollView style={styles.fullScreen}>
          { output.map((line, index) => <Text key={index} style={styles.output}>{line}</Text>)}
        </ScrollView>
      </View>
    </View>
  );
}

export default WebSocketDemo;

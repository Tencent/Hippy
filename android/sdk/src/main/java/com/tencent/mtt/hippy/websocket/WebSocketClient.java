/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.tencent.mtt.hippy.websocket;

import android.os.Handler;
import android.os.HandlerThread;
import android.text.TextUtils;
import android.util.Base64;
import android.util.Log;

import javax.net.SocketFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLException;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import java.io.EOFException;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.net.ConnectException;
import java.net.Socket;
import java.net.URI;
import java.util.concurrent.atomic.AtomicBoolean;
import java.security.KeyManagementException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;

@SuppressWarnings({"unused", "FieldCanBeLocal"})
public class WebSocketClient {

  private static final String TAG = "WebSocketClient";
  private static final int SC_SWITCHING_PROTOCOLS = 101;
  private static TrustManager[] sTrustManagers;
  private final Object mSendLock = new Object();
  private final URI mURI;
  private final WebSocketListener mListener;
  private Socket mSocket;
  private Thread mThread;
  private final HandlerThread mHandlerThread;
  private final Handler mHandler;
  private final List<Header> mExtraHeaders;
  private final HybiParser mParser;
  private AtomicBoolean mConnected;

  public WebSocketClient(URI uri, WebSocketListener listener, List<Header> extraHeaders) {
    mURI = uri;
    mListener = listener;
    mExtraHeaders = extraHeaders;
    mConnected = new AtomicBoolean(false);
    mParser = new HybiParser(this);

    mHandlerThread = new HandlerThread("websocket-thread");
    mHandlerThread.start();
    mHandler = new Handler(mHandlerThread.getLooper());
  }

  public static void setTrustManagers(TrustManager[] tm) {
    sTrustManagers = tm;
  }


  public void connect() {
    if (mThread != null && mThread.isAlive()) {
      return;
    }

    mThread = new Thread(new Runnable() {
      @Override
      public void run() {
        try {
          int port = (mURI.getPort() != -1) ? mURI.getPort()
              : ((mURI.getScheme().equals("wss") || mURI.getScheme().equals("https")) ? 443
                  : 80);

          String path = TextUtils.isEmpty(mURI.getPath()) ? "/" : mURI.getPath();
          if (!TextUtils.isEmpty(mURI.getQuery())) {
            path += "?" + mURI.getQuery();
          }

          String originScheme = mURI.getScheme().equals("wss") ? "https" : "http";
          URI origin = new URI(originScheme, "//" + mURI.getHost(), null);

          SocketFactory factory =
              (mURI.getScheme().equals("wss") || mURI.getScheme().equals("https"))
                  ? getSSLSocketFactory()
                  : SocketFactory.getDefault();
          mSocket = factory.createSocket(mURI.getHost(), port);

          PrintWriter out = new PrintWriter(mSocket.getOutputStream());
          String secretKey = createSecret();
          out.print("GET " + path + " HTTP/1.1\r\n");
          out.print("Upgrade: websocket\r\n");
          out.print("Connection: Upgrade\r\n");
          out.print("Host: " + mURI.getHost() + "\r\n");
          out.print("Origin: " + origin.toString() + "\r\n");
          out.print("Sec-WebSocket-Key: " + secretKey + "\r\n");
          out.print("Sec-WebSocket-Version: 13\r\n");
          if (mExtraHeaders != null) {
            for (Header pair : mExtraHeaders) {
              out.print(String.format("%s: %s\r\n", pair.getName(), pair.getValue()));
            }
          }
          out.print("\r\n");
          out.flush();

          HybiParser.HappyDataInputStream stream = new HybiParser.HappyDataInputStream(
              mSocket.getInputStream());

          // Read HTTP response status line.
          StatusLine statusLine = parseStatusLine(readLine(stream));
          if (statusLine == null) {
            throw new ConnectException("WebSocketClient received no reply from server.");
          } else if (statusLine.code != SC_SWITCHING_PROTOCOLS) {
            throw new ConnectException(
                "WebSocketClient connect error: code=" + statusLine.code + ",message="
                    + statusLine.message);
          }

          // Read HTTP response headers.
          String line;
          while (!TextUtils.isEmpty(line = readLine(stream))) {
            assert line != null;
            Header header = parseHeader(line);
            if (header.getName().equals("Sec-WebSocket-Accept")) {
              String expected = expectedKey(secretKey);
              if (expected == null) {
                throw new ConnectException("SHA-1 algorithm not found");
              } else if (!expected.equals(header.getValue().trim())) {
                throw new ConnectException(
                    "Invalid Sec-WebSocket-Accept, expected: " + expected + ", got: " + header
                        .getValue());
              }
            }
          }

          mListener.onConnect();

          mConnected.set(true);

          // Now decode websocket frames.
          mParser.start(stream);

        } catch (EOFException ex) {
          Log.d(TAG, "WebSocket EOF!", ex);
          mListener.onDisconnect(0, "EOF");
          mConnected.set(false);
        } catch (SSLException ex) {
          // Connection reset by peer
          Log.d(TAG, "Websocket SSL error!", ex);
          mListener.onDisconnect(0, "SSL");
          mConnected.set(false);
        } catch (Throwable ex) {
          mListener.onError(new Exception(ex));
        } finally {
          if (!mConnected.get() && mSocket != null) {
            try {
              mSocket.close();
            } catch (Throwable ex) {
              Log.d(TAG, "Error while disconnecting", ex);
              mListener.onError(new Exception(ex));
            }
          }
        }
      }
    });
    mThread.start();
  }

  public void disconnect() {
    if (mSocket != null) {
      mHandler.post(new Runnable() {
        @Override
        public void run() {
          if (mSocket != null) {
            try {
              mSocket.close();
            } catch (Throwable ex) {
              Log.d(TAG, "Error while disconnecting", ex);
              mListener.onError(new Exception(ex));
            }
            mListener.onDisconnect(0, "closed");
            mSocket = null;
          }
          mConnected.set(false);
        }
      });
    }
  }

  public void send(String data) {
    sendFrame(mParser.frame(data));
  }

  public void send(byte[] data) {
    sendFrame(mParser.frame(data));
  }

  public void requestClose(int code, String reason) {
    mParser.close(code, reason);
    disconnect();
  }

  public boolean isConnected() {
    return mConnected.get();
  }

  private StatusLine parseStatusLine(String line) throws IOException {
    if (TextUtils.isEmpty(line)) {
      return null;
    }
    return StatusLine.parse(line);
  }

  private Header parseHeader(String line) {
    int index = line.indexOf(":");
    if (index == -1) {
      throw new IllegalArgumentException("WebSocketClient Unexpected header: " + line);
    }
    return new Header(line.substring(0, index).trim(), line.substring(index + 1));
  }

  // Can't use BufferedReader because it buffers past the HTTP data.
  private String readLine(HybiParser.HappyDataInputStream reader) throws IOException {
    int readChar = reader.read();
    if (readChar == -1) {
      return null;
    }
    StringBuilder string = new StringBuilder();
    while (readChar != '\n') {
      if (readChar != '\r') {
        string.append((char) readChar);
      }

      readChar = reader.read();
      if (readChar == -1) {
        return null;
      }
    }
    return string.toString();
  }

  private String expectedKey(String secret) {
    //concatenate, SHA1-hash, base64-encode
    try {
      final String GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
      final String secretGUID = secret + GUID;
      MessageDigest md = MessageDigest.getInstance("SHA-1");
      byte[] digest = md.digest(secretGUID.getBytes());
      return Base64.encodeToString(digest, Base64.DEFAULT).trim();
    } catch (NoSuchAlgorithmException e) {
      return null;
    }
  }

  private String createSecret() {
    byte[] nonce = new byte[16];
    for (int i = 0; i < 16; i++) {
      nonce[i] = (byte) (Math.random() * 256);
    }
    return Base64.encodeToString(nonce, Base64.DEFAULT).trim();
  }

  void sendFrame(final byte[] frame) {
    mHandler.post(new Runnable() {
      @Override
      public void run() {
        try {
          synchronized (mSendLock) {
            OutputStream outputStream = mSocket.getOutputStream();
            outputStream.write(frame);
            outputStream.flush();
          }
        } catch (Throwable e) {
          mListener.onError(new Exception(e));
        }
      }
    });
  }

  private SSLSocketFactory getSSLSocketFactory()
      throws NoSuchAlgorithmException, KeyManagementException {
    SSLContext context = SSLContext.getInstance("TLS");
    context.init(null, sTrustManagers, null);
    return context.getSocketFactory();
  }

  public WebSocketListener getListener() {
    return mListener;
  }

  public interface WebSocketListener {

    void onConnect();

    void onMessage(String message);

    @SuppressWarnings("EmptyMethod")
    void onMessage(byte[] data);

    void onDisconnect(int code, String reason);

    void onError(Exception error);
  }
}

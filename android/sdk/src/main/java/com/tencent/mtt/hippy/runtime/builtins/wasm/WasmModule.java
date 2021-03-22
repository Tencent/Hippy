package com.tencent.mtt.hippy.runtime.builtins.wasm;

import com.tencent.mtt.hippy.runtime.builtins.JSValue;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class WasmModule extends JSValue {
  static final short MAX_DUMP_LENGTH = 1024;

  private final byte[] buffer;
  private final String sourceUrl;
  private final byte wireBytes;

  public WasmModule(byte[] buffer, String sourceUrl, byte wireBytes) {
    super();
    this.buffer = buffer;
    this.sourceUrl = sourceUrl;
    this.wireBytes = wireBytes;
  }

  public byte[] getBuffer() {
    return buffer;
  }

  public byte getWireBytes() {
    return wireBytes;
  }

  public String getSourceUrl() {
    return sourceUrl;
  }

  @Override
  public Object dump() throws JSONException {
    JSONObject json = new JSONObject();
    json.put("wireBytes", wireBytes);
    json.put("sourceUrl", sourceUrl);
    JSONArray bufferView = new JSONArray();
    for (short i = 0; i < buffer.length && i < MAX_DUMP_LENGTH; i++) {
      bufferView.put(buffer[i]);
    }
    json.put("buffer", bufferView);
    return json;
  }
}

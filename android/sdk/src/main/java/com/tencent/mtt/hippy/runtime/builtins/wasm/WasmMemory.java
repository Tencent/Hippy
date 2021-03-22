package com.tencent.mtt.hippy.runtime.builtins.wasm;

import com.tencent.mtt.hippy.runtime.builtins.JSSharedArrayBuffer;
import com.tencent.mtt.hippy.runtime.builtins.JSValue;

import org.json.JSONException;
import org.json.JSONObject;

public class WasmMemory extends JSValue {
  private final JSSharedArrayBuffer buffer;
  private final long maximumPages;

  public WasmMemory(long maximumPages, JSSharedArrayBuffer buffer) {
    super();
    this.buffer = buffer;
    this.maximumPages = maximumPages;
  }

  public JSSharedArrayBuffer getMemory() {
    return buffer;
  }

  public long getMaximumPages() {
    return maximumPages;
  }

  @Override
  public Object dump() throws JSONException {
    JSONObject json = new JSONObject();
    json.put("maximumPages", maximumPages);
    json.put("memory", buffer.dump());
    return json;
  }
}

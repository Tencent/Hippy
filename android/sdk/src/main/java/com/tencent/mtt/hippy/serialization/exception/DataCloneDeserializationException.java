package com.tencent.mtt.hippy.serialization.exception;

public class DataCloneDeserializationException extends RuntimeException {
  public DataCloneDeserializationException() {
    super("Unable to deserialize cloned data");
  }
}

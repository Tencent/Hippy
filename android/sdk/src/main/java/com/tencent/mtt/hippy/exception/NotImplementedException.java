package com.tencent.mtt.hippy.exception;

@SuppressWarnings({"unused"})
public class NotImplementedException extends UnsupportedOperationException {

  public NotImplementedException(String message) {
    super("Not implemented: " + message);
  }
}

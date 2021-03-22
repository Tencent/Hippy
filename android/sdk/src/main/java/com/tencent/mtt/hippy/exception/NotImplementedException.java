package com.tencent.mtt.hippy.exception;

public class NotImplementedException extends UnsupportedOperationException {
  public NotImplementedException(String message) {
    super("Not implemented: " + message);
  }
}

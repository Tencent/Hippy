package com.tencent.mtt.hippy.exception;

public class UnexpectedException extends IllegalStateException {
  public UnexpectedException() {
    super();
  }

  public UnexpectedException(String message) {
    super(message);
  }
}

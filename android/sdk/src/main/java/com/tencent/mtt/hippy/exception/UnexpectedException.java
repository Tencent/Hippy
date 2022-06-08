package com.tencent.mtt.hippy.exception;

@SuppressWarnings({"unused"})
public class UnexpectedException extends IllegalStateException {

  public UnexpectedException() {
    super();
  }

  public UnexpectedException(String message) {
    super(message);
  }
}

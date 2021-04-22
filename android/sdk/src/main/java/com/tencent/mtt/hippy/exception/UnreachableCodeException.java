package com.tencent.mtt.hippy.exception;

public class UnreachableCodeException extends IllegalStateException {
  private static final String TIPS_MESSAGE = "Should NOT reach here";

  public UnreachableCodeException() {
    super(TIPS_MESSAGE);
  }

  public UnreachableCodeException(String message) {
    super(TIPS_MESSAGE + message);
  }

  public UnreachableCodeException(Throwable exception) {
    super(TIPS_MESSAGE, exception);
  }
}

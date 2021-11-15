package com.tencent.mtt.hippy.exception;

@SuppressWarnings({"unused"})
public class UnexpectedTypeException extends UnexpectedException {

  private static String getClassName(Object object) {
    return (object instanceof Class ? (Class<?>) object : object.getClass()).getName();
  }

  public UnexpectedTypeException(Object excepted, Object received) {
    super(String.format("Excepted [%s], but received [%s]", getClassName(excepted),
        getClassName(received)));
  }
}

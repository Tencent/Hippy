package com.tencent.mtt.hippy.serialization.exception;

public class DataCloneOutOfRangeException extends DataCloneOutOfValueException {
  public DataCloneOutOfRangeException(int excepted) {
    super(excepted);
  }
}

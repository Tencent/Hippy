package com.tencent.mtt.hippy.example.module.turbo;

import androidx.annotation.NonNull;

import com.tencent.mtt.hippy.annotation.HippyTurboObj;
import com.tencent.mtt.hippy.annotation.HippyTurboProp;

// 标明这个类的实例引用可以暴露给js使用
@HippyTurboObj
public class TurboConfig {

  private String info = "info from turboConfig";

  //  标明该方法可以被js调用
  @HippyTurboProp(expose = true)
  public String getInfo() {
    return info;
  }

  @HippyTurboProp(expose = true)
  public void setInfo(String info) {
    this.info = info;
  }

  @NonNull
  @Override
  public String toString() {
    return "info:" + info;
  }
}

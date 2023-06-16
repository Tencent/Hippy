package com.tencent.mtt.hippy.example;

import android.os.Bundle;
import android.view.Window;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

/**
 * Demo调用封装HippyHandler
 *
 * @author 793383996
 * Copyright (C) 2023 THL A29 Limited, a Tencent company.
 * All rights reserved.
 */
public class TestHippyActivity extends AppCompatActivity {
  final HippyHandler mHandler = new HippyHandler();

  @Override
  protected void onCreate(@Nullable Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    getWindow().requestFeature(Window.FEATURE_NO_TITLE);
    mHandler.createAssetsJS(
        getLifecycle(), getApplication(), "index.android.js", this::setContentView);
  }

  @Override
  public void onBackPressed() {
    mHandler.onBackPressed(super::onBackPressed);
  }
}

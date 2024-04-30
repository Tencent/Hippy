/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.tencent.mtt.hippy.utils;

import static org.junit.Assert.*;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

@SuppressWarnings("unused")
@RunWith(PowerMockRunner.class)
@PrepareForTest(UrlUtils.class)
@PowerMockIgnore({
    "org.mockito.*",
    "org.robolectric.*",
    "androidx.*",
    "android.*",
})
public class UrlUtilsTest {
  private final String URL_HTTPS = "https://hippyjs.org/";
  private final String URL_HTTP = "http://hippyjs.org/";
  private final String URL_FILE = "file://vendor.android.js";

  @Before
  public void setUp() throws Exception {
  }

  @After
  public void tearDown() throws Exception {
  }

  @Test
  public void isHttpUrl() {
    assertFalse(UrlUtils.isHttpUrl(null));
    assertFalse(UrlUtils.isHttpUrl(URL_HTTPS));
    assertFalse(UrlUtils.isHttpUrl(URL_FILE));
    assertTrue(UrlUtils.isHttpUrl(URL_HTTP));
  }

  @Test
  public void isHttpsUrl() {
    assertFalse(UrlUtils.isHttpsUrl(null));
    assertFalse(UrlUtils.isHttpsUrl(URL_FILE));
    assertFalse(UrlUtils.isHttpsUrl(URL_HTTP));
    assertTrue(UrlUtils.isHttpsUrl(URL_HTTPS));
  }

  @Test
  public void isFileUrl() {
    assertFalse(UrlUtils.isFileUrl(null));
    assertFalse(UrlUtils.isFileUrl(URL_HTTP));
    assertFalse(UrlUtils.isFileUrl(URL_HTTPS));
    assertTrue(UrlUtils.isFileUrl(URL_FILE));
  }

  @Test
  public void isWebUrl() {
    assertTrue(UrlUtils.isWebUrl(URL_HTTPS));
    assertTrue(UrlUtils.isWebUrl(URL_HTTP));
    assertFalse(UrlUtils.isWebUrl(URL_FILE));
  }
}

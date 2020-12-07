# Hippy 概述

Hippy 可以理解为一个精简版的浏览器，从底层做了大量工作，抹平了 iOS 和 Android 双端差异，提供了接近 Web 的开发体验，目前上层支持了 React 和 Vue 两套界面框架，前端开发人员可以通过它，将前端代码转换为终端的原生指令，进行原生终端 App 的开发。

同时，Hippy 从底层进行了大量优化，在启动速度、可复用列表组件、渲染效率、动画速度、网络通信等等都提供了业内顶尖的性能表现。

## 功能对比

Hippy 从底层增加了很多和浏览器相同的接口，方便了开发者使用，这里有几个 Hippy 的独有功能。

| 分类 | 特性                     | 说明                     | 支持情况 |
| ---- | ------------------------ | ------------------------ | -------- |
| 接口 | fetch                    | Http/Https 协议请求      | ✅ 支持   |
|      | WebSocket                | 基于 Http 协议的即时通讯 | ✅ 支持   |
| 事件 | onClick                  | 点击事件                 | ✅ 支持   |
|      | onTouchStart/onTouchDown | 触屏开始事件             | ✅ 支持   |
|      | onTouchMove              | 触屏移动事件             | ✅ 支持   |
|      | onTouchEnd               | 触屏结束事件             | ✅ 支持   |
|      | onTouchCancel            | 触屏取消事件             | ✅ 支持   |
| 样式 | zIndex                   | 界面层级                 | ✅ 支持   |
|      | backgroundImage          | 背景图片                 | ✅ 支持   |

## 包体积

Hippy 的包体积在业内也是非常具有竞争力的。

![包体积1](//res.imtt.qq.com/hippydoc/img/out/baodaxiao.png)

上图是一个空的APK，在引入后终端包大小对比。

![包体积2](//res.imtt.qq.com/hippydoc/img/out/jsbao.png)

上图是在前端搭建了一个最简单的 ListView 后，前端打出的 JS 的包大小对比。

## 渲染性能

ListView 在滑动时的性能对比，Hippy 可以一直保持十分流畅的状态

![渲染性能](//res.imtt.qq.com/hippydoc/img/out/listxingneng.png)

## 内存占用

而在内存占用上，初始化 List 时 Hippy 就略占优势，在滑动了几屏后内存开销的差距越来越大。

![内存占用](//res.imtt.qq.com/hippydoc/img/out/listmeicun.png)

## 跟 Web 接近的开发体验

Hippy 在开发体验上也进行了大量优化，包含但不限于，跟浏览器一样的 onClick、onTouch 系列触屏事件，更加简单的动画方案，hippy-vue 提供了和 Vue 的完全兼容等等。

## 大家都在用

<div style="display:flex;flex-direction:row;flex-wrap:wrap;justify-content:flex-start">
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_11384_1543315194/128" alt="QQ浏览器" width="50"/>
  <p style="font-size:16px"><a target="_blank" style="text-decoration:none;color:#34495e" href="https://mb.qq.com/" title="QQ浏览器">QQ浏览器</a></p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_6633_1603250105/128" width="50" alt="手机QQ" />
  <p style="font-size:16px"><a target="_blank" style="text-decoration:none;color:#34495e" href="https://im.qq.com/mobileqq/" title="手机QQ">手机QQ</a></p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_10966186_1533019715/128" alt="全民K歌" width="50" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://kg.qq.com/html/contest/kg-intro.html" title="全民K歌">全民K歌</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_6259_1533003792/128" width="50" alt="QQ音乐" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://y.qq.com/download/download.html" title="QQ音乐">QQ音乐</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//res.imtt.qq.com/hippydoc/img/tv.png" width="50" alt="云视听极光" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://tv.qq.com/" title="云视听极光">云视听极光</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_10261931_1551433926/128" width="50" alt="微视" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://weishi.qq.com/" title="微视">微视</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_5848_1558087382/128" width="50" alt="应用宝" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://www.myapp.com" title="应用宝">应用宝</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_42270933_1551941158/128" width="50" alt="NOW直播" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://now.qq.com/" title="NOW直播">NOW直播</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//res.imtt.qq.com/res_mtt/hippydoc/voov.png" width="50" alt="VOOV直播" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://www.voovlive.com/" title="VOOV直播">VOOV直播</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_52445834_1548053409/128" width="50" alt="心悦俱乐部" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://xinyue.qq.com" title="心悦俱乐部">心悦俱乐部</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_42287337_1556173463/128" width="50" alt="王者营地" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://sj.qq.com/myapp/detail.htm?apkName=com.tencent.gamehelper.smoba" title="王者营地">王者营地</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_12082013_1545355964/128" width="50" alt="天天快报" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://kuaibao.qq.com/download.html" title="天天快报">天天快报</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_12259403_1545708417/128" width="50" alt="WiFi管家" />
   <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://wifi.qq.com/" title="WiFi管家">WiFi管家</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_206354_1558415148/128" width="50" alt="腾讯自选股" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://sj.qq.com/myapp/detail.htm?apkName=com.tencent.portfolio" title="腾讯自选股">腾讯自选股</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_52754761_1557837008/128" width="50" alt="大丰满满" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://sj.qq.com/myapp/detail.htm?apkName=com.taifung.broker" title="大丰满满">大丰满满</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_52797852_1545191305/128" width="50" alt="企鹅号" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://android.myapp.com/myapp/detail.htm?apkName=com.tencent.omapp" title="企鹅号">企鹅号</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_52802703_1546489662/128" width="50" alt="马克思主义" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://sj.qq.com/myapp/detail.htm?apkName=com.rmlt.marxism" title="马克思主义">马克思主义</a>
  </p>
 </span>
 </div>

## 团队贡献

<div style="display:flex;flex-direction:row;flex-wrap:wrap;justify-content:flex-start">
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;width:130px;margin:5px 10px 5px 10px">
  <img src="//pp.myapp.com/ma_icon/0/icon_10966186_1533019715/128" width="50" alt="TME 全民K歌团队" />
  <p style="font-size:16px">TME 全民K歌团队</p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;width:130px;margin:5px 10px 5px 10px">
  <img src="//pp.myapp.com/ma_icon/0/icon_6259_1533003792/128" width="50" alt="TME QQ音乐团队" />
  <p style="font-size:16px">TME QQ音乐团队</p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;width:130px;margin:5px 10px 5px 10px">
  <img src="//pp.myapp.com/ma_icon/0/icon_52754761_1555775310/96" width="50" alt="CDG大丰满满/自选股团队" />
  <p style="font-size:16px">CDG大丰满满/自选股团队</p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;width:130px;margin:5px 10px 5px 10px">
  <img src="//res.imtt.qq.com/res_mtt/hippydoc/qg-team.png" width="50" alt="QGraphics团队" />
  <p style="font-size:16px">QGraphics团队</p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;width:130px;margin:5px 10px 5px 10px">
  <img src="//res.imtt.qq.com/res_mtt/hippydoc/IVW_23.png" width="50" alt="IVWEB团队" />
  <p style="font-size:16px">IVWEB团队</p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;width:130px;margin:5px 10px 5px 10px">
  <img src="//res.imtt.qq.com/res_mtt/hippydoc/hippy-logo-small.gif" width="50" alt="腾讯信息流平台部团队" />
  <p style="font-size:16px">腾讯信息流平台部团队</p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;width:130px;margin:5px 10px 5px 10px">
  <img src="//res.imtt.qq.com/hippydoc/img/wii-team.png" width="50" alt="游云南WII团队" />
  <p style="font-size:16px">游云南WII团队</p>
 </span>
 </div>

## 贡献者

<div style="display:flex;flex-direction:row;flex-wrap:wrap;justify-content:flex-start">
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 10px;">
  <img src="//avatars1.githubusercontent.com/u/1575008?s=400&u=fe4f576c0792716f671022158bc16bcafdb591f7&v=4" alt="Super Zheng" width="40" style="border-radius:50%;"/>
  <p style="font-size:16px"><a target="_blank" style="text-decoration:none;color:#34495e" href="https://github.com/medns" title="Super Zheng">Super Zheng</a></p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 10px;">
  <img src="//avatars2.githubusercontent.com/u/32739?s=60&v=4" alt="xuqingkuang" width="40" style="border-radius:50%;"/>
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://github.com/xuqingkuang" title="XQ Kuang">XQ Kuang</a></p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 10px;">
  <img src="//avatars3.githubusercontent.com/u/41660591?s=60&v=4" alt="siguangli2018" width="40" style="border-radius:50%;"/>
  <p style="font-size:16px"><a target="_blank" style="text-decoration:none;color:#34495e" href="https://github.com/siguangli2018" title="siguangli2018">siguangli2018</a></p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 10px;">
  <img src="//avatars0.githubusercontent.com/u/4134361?s=60&v=4" alt="luomy" width="40" style="border-radius:50%;"/>
  <p style="font-size:16px"><a target="_blank" style="text-decoration:none;color:#34495e" href="https://github.com/ozonelmy/" title="luomy">luomy</a></p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 10px;">
  <img src="//avatars3.githubusercontent.com/u/6326472?s=60&v=4" alt="churchill-zhang" width="40" style="border-radius:50%;"/>
  <p style="font-size:16px"><a target="_blank" style="text-decoration:none;color:#34495e" href="https://github.com/churchill-zhang" title="churchill-zhang">churchill-zhang</a></p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 10px;">
  <img src="//avatars0.githubusercontent.com/u/3583095?s=460&u=39f249007eaee1a2767eba83b5bcc6b313820247&v=4" alt="old kidd" width="40" style="border-radius:50%;"/>
  <p style="font-size:16px"><a target="_blank" style="text-decoration:none;color:#34495e" href="https://github.com/xxs665" title="old kidd">old kidd</a></p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 10px;">
  <img src="//avatars1.githubusercontent.com/u/12878546?s=460&u=ecc7c69d01b4ba492d30f31a103504333007a27c&v=4" alt="Zoom Chan" width="40" style="border-radius:50%;"/>
  <p style="font-size:16px"><a target="_blank" style="text-decoration:none;color:#34495e" href="https://github.com/zoomchan-cxj" title="Zoom Chan">Zoom Chan</a></p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 10px;"><img src="//avatars1.githubusercontent.com/u/12274498?s=460&v=4" alt="ilikethese" width="40" style="border-radius:50%;"/>
  <p style="font-size:16px"><a target="_blank" style="text-decoration:none;color:#34495e" href="https://github.com/ilikethese" title="ilikethese">ilikethese</a></p>
  </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 10px;"><img src="//avatars3.githubusercontent.com/u/6027456?s=460&u=11f9f04e7b322b1e7fe5050d6f48210795854b77&v=4" alt="Box Tsang" width="40" style="border-radius:50%;"/>
  <p style="font-size:16px"><a target="_blank" style="text-decoration:none;color:#34495e" href="https://github.com/boxizen" title="Box Tsang">Box Tsang</a></p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 10px;"><img src="//avatars2.githubusercontent.com/u/19773879?s=460&u=e63253a19e0efe6d30261ab3f70080dc082df8a7&v=4" alt="jerome han" width="40" style="border-radius:50%;"/>
  <p style="font-size:16px"><a target="_blank" style="text-decoration:none;color:#34495e" href="https://github.com/jeromehan" title="jerome han">jerome han</a></p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 10px;"><img src="//avatars0.githubusercontent.com/u/1677665?s=460&u=cd8e99f28be73cf89e58bf0f520bf6d09f634d03&v=4" alt="tsangint" width="40" style="border-radius:50%;"/><p style="font-size:16px"><a target="_blank" style="text-decoration:none;color:#34495e" href="https://github.com/tsangint" title="tsangint">tsangint</a></p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 10px;"><img src="//avatars1.githubusercontent.com/u/20040674?s=460&u=019012bab60527f9841eca6086b378d37a04a2ef&v=4" alt="RonkTsang" width="40" style="border-radius:50%;"/><p style="font-size:16px"><a target="_blank" style="text-decoration:none;color:#34495e" href="https://github.com/RonkTsang" title="RonkTsang">RonkTsang</a></p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 10px;"><img src="//avatars1.githubusercontent.com/u/526008?s=460&v=4" alt="ElfSundae" width="40" style="border-radius:50%;"/><p style="font-size:16px"><a target="_blank" style="text-decoration:none;color:#34495e" href="https://github.com/ElfSundae" title="ElfSundae">Elf Sundae</a></p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 10px;"><img src="//avatars1.githubusercontent.com/u/6047274?s=460&v=4" alt="zousandian" width="40" style="border-radius:50%;"/><p style="font-size:16px"><a target="_blank" style="text-decoration:none;color:#34495e" href="https://github.com/zousandian" title="zousandian">三点</a></p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 10px;"><img src="//avatars0.githubusercontent.com/u/5770443?s=460&u=a8bce363477b32f2fd4b3b56807a689ab35422d7&v=4" alt="dequanzhu" width="40" style="border-radius:50%;"/><p style="font-size:16px"><a target="_blank" style="text-decoration:none;color:#34495e" href="https://github.com/dequan1331" title="zousandian">dequanzhu</a></p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 10px;"><img src="//avatars1.githubusercontent.com/u/1104051?s=460&v=4" alt="kassadin" width="40" style="border-radius:50%;"/><p style="font-size:16px"><a target="_blank" style="text-decoration:none;color:#34495e" href="https://github.com/kassadin" title="kassadin">kassadin</a></p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 10px;"><img src="//avatars3.githubusercontent.com/u/4516541?s=460&v=4" alt="Arylo Yeung" width="40" style="border-radius:50%;"/><p style="font-size:16px"><a target="_blank" style="text-decoration:none;color:#34495e" href="https://github.com/Arylo" title="Arylo Yeung">Arylo Yeung</a></p>
 </span>
 </div>

## 交流链接

* [文章专栏](https://cloud.tencent.com/developer/column/84006)
* QQ 群：[784894901](//shang.qq.com/wpa/qunwpa?idkey=7bff52aca3aac75a4f1ba96c1844a5e3b62000351890182eb60311542d75fa1a) - 点击链接启动 QQ 加入，或者复制群号码手工加入
* QQ群二维码，使用手机QQ扫描加入

 ![QQ群二维码](https://puui.qpic.cn/vupload/0/1578363513271_py0yktxq7x.png/0)

## 总结

如果您准备好了，那就 [开始接入 Hippy](guide/integration.md) 吧。

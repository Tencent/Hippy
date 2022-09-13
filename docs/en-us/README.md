<div id='custom-homepage'>
    <div><img alt="logo" data-origin="_media/hippy-logo.png" src="/_media/hippy-logo.png" style="min-width: 165px;min-height: 165px;max-height: 22vh;max-width: 22vw"></div>
    <div class="custom-homepage-container">
        <h1 id="hippy">
            <a class="anchor" data-id="hippy" href="#/?id=hippy">
                <span>Hippy</span>
            </a>
        </h1>
        <div class="sub-title"><span>Cross-Platform Framework for Developers</span></div>
        <a href="https://github.com/Tencent/Hippy/stargazers" rel="noopener" target="_blank"><img
                alt="GitHub Repo stars" src="https://img.shields.io/github/stars/Tencent/Hippy?color=50c52a"></a>
        <a href="https://github.com/Tencent/Hippy/releases"
           rel="noopener" target="_blank">
            <img
                alt="GitHub release (latest SemVer)"
                data-origin="https://img.shields.io/github/v/release/Tencent/Hippy"
                src="https://img.shields.io/github/v/release/Tencent/Hippy" />
        </a>
        <p class="btn-container">
            <a href="//github.com/Tencent/Hippy" rel="noopener" target="_blank">GitHub</a>
            <a href="#/guide/integration">Get Started</a>
        </p>
    </div>
    <div class="features">
        <div class="feature"><h2>⚡ High Performance</h2>
            <p>Reusable ListView with ultimate smoothness experience, efficient data communication via binding mode</p></div>
        <div class="feature"><h2>📱 Cross Platform</h2>
            <p>Different platforms maintain the same interface, support smooth migration to Web</p></div>
        <div class="feature"><h2>📚 Easy to Learn</h2>
            <p>React / Vue driven framework and full Flex Layout supported.</p></div>
    </div>
</div>
<hr>

# Hippy overview

Hippy is like a simplified browser, which has done a lot of work from the bottom layer, smoothed out the differences between iOS and Android, and provided a development experience close to the Web. At present, the upper layer supports two sets of interface frameworks, React and Vue, through which front-end developers can convert front-end codes into native instructions to develop native apps.

At the same time, Hippy has made a lot of optimization from the bottom layer, providing top performance in startup speed, reusable list components, rendering efficiency, animation speed, network communication, etc.

## Feature Comparison

Hippy implemented a lot of interfaces according to browser, convenient for developers to use, here are a few Hippy unique features.

| Classifications| Properties                     | Description                     | Support|
| ---- | ------------------------ | ------------------------ | -------- |
| Interface|  fetch                    | Http/Https protocol request      | ✅    |
|      | WebSocket                | Instant Messaging Based on Http | ✅   |
| Events|  onClick                  | Click Event                 | ✅    |
|      | onTouchStart/onTouchDown | Triggered when start to touch screen             | ✅   |
|      | onTouchMove              | Triggered when move on screen             | ✅   |
|      | onTouchEnd               | Triggered when end to touch screen             | ✅   |
|      | onTouchCancel            | Triggered when touch screen canceled           | ✅   |
| Style|  zIndex                   | Layer level                 | ✅    |
|      | backgroundImage          | Background image                | ✅   |

## Package Volume

Hippy's package volume is also very competitive in the industry.

![Pack Volume 1](assets/img/baodaxiao.png)

The above figure is an empty APK, showing the comparison of package size among different native SDKs.

![Pack Volume2](assets/img/jsbao.png)

The above figure shows the comparison of package size of JS bundle with the simplest ListView.

## Rendering Performance

Comparison of ListView performance when sliding, Hippy can always maintain a very smooth state.

<img src="assets/img/listxingneng.png" alt="Rendering Performance" width="50%"/>

## Memory Consumption

In terms of memory consumption, Hippy has a slight advantage when initializing the List, and the difference in memory consumption is getting bigger and bigger after sliding a few screens.

![Memory footprint](assets/img/listmeicun.png)

## Web-like development experience

Hippy has also made a lot of optimizations in the development experience, including but not limited to onClick, onTouch series touch screen events like browsers, simpler animation schemes, hippy-vue provides full compatibility with Vue, etc.

## Who Using it

<div style="display:flex;flex-direction:row;flex-wrap:wrap;justify-content:flex-start">
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_11384_1543315194/128" alt="QQ Brower" width="50"/>
  <p style="font-size:16px"><a target="_blank" style="text-decoration:none;color:#34495e" href="https://mb.qq.com/" title="QQ Brower">QQ Browser</a></p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_6633_1603250105/128" width="50" alt="Mobile QQ" />
  <p style="font-size:16px"><a target="_blank" style="text-decoration:none;color:#34495e" href="https://im.qq.com/mobileqq/" title="Mobile QQ">Mobile QQ</a></p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_5613_1660103898/96" width="50" alt="Tencent News" />
  <p style="font-size:16px"><a target="_blank" style="text-decoration:none;color:#34495e" href="https://news.qq.com/mobile/" title="Tencent News">Tencent News</a></p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_10966186_1533019715/128" alt="WeSing" width="50" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://kg.qq.com/html/contest/kg-intro.html" title="WeSing">WeSing</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_6259_1533003792/128" width="50" alt="QQ Music" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://y.qq.com/download/download.html" title="QQ Music">QQ Music</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_10237_1659521178/256" width="50" alt="Tencent Map" />
  <p style="font-size:16px"><a target="_blank" style="text-decoration:none;color:#34495e" href="https://map.qq.com/mobile/index.html" title="Tencent Map">Tencent Map</a></p>
</span>
<span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_42287337_1659540466/96" width="50" alt="Camps of Kings" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://sj.qq.com/myapp/detail.htm?apkName=com.tencent.gamehelper.smoba" title="Camps of Kings">Camps of Kings</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_54036620_1658836879/96" width="50" alt="shanxian" />
  <p style="font-size:16px"><a target="_blank" style="text-decoration:none;color:#34495e" href="https://shanxian.qq.com/" title="shanxian">ShanXian</a></p>
</span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="assets/img/tv.png" width="50" alt="Tencent TV" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://tv.qq.com/" title="Tencent TV">Tencent TV</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_54136949_1658385381/256" width="50" alt="Tencent Start(TV)" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://start.qq.com/download.html?terminal=tv" title="Tencent Start(TV)">Tencent Start(TV)</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_10261931_1551433926/128" width="50" alt="Weishi" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://weishi.qq.com/" title="Weishi">Weishi</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_5848_1558087382/128" width="50" alt="Tencent App Market" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://www.myapp.com" title="Tencent App Market">Tencent App Market</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_52775028_1660135770/256" width="50" alt="Tencent Wealth Management" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://a.app.qq.com/o/simple.jsp?pkgname=com.tencent.fortuneplat" title="Tencent Wealth Management">Tencent WM</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_206354_1558415148/128" width="50" alt="Tencent ZXG App" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://sj.qq.com/myapp/detail.htm?apkName=com.tencent.portfolio" title="Tencent ZXG App">Tencent ZXG App</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_42270933_1551941158/128" width="50" alt="NOW Live" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://now.qq.com/" title="NOW Live">NOW Live</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_52445834_1548053409/128" width="50" alt=">Tencent Joy Club" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://xinyue.qq.com" title=">Tencent Joy Club">Tencent Joy Club</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_12259403_1545708417/128" width="50" alt="Wi-Fi Butler" />
   <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://wifi.qq.com/" title="Wi-Fi Butler">Wi-Fi Butler</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_52754761_1557837008/128" width="50" alt="DaFeng App" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://www.dafenghk.com/hk_web/download.shtml" title="DaFeng App">DaFeng App</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="//pp.myapp.com/ma_icon/0/icon_52797852_1545191305/128" width="50" alt="Tencent OM" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://android.myapp.com/myapp/detail.htm?apkName=com.tencent.omapp" title="Tencent OM">Tencent OM</a>
  </p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
  <img src="assets/img/voov.png" width="50" alt="VOOV Live" />
  <p style="font-size:16px">
  <a target="_blank" style="text-decoration:none;color:#34495e" href="https://www.voovlive.com/" title="VOOV Live">VOOV Live</a>
  </p>
 </span>
 </div>

## Team Contribution

<div style="display:flex;flex-direction:row;flex-wrap:wrap;justify-content:flex-start">
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;width:130px;margin:5px 10px 5px 10px">
  <img src="//pp.myapp.com/ma_icon/0/icon_10966186_1533019715/128" width="50" alt="TME WeSing Team" />
  <p style="font-size:16px">TME WeSing Team</p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;width:130px;margin:5px 10px 5px 10px">
  <img src="//pp.myapp.com/ma_icon/0/icon_6259_1533003792/128" width="50" alt="TME QQ Music Team" />
  <p style="font-size:16px">TME QQ Music Team</p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;width:130px;margin:5px 10px 5px 10px">
  <img src="//pp.myapp.com/ma_icon/0/icon_52754761_1555775310/96" width="50" alt="CDG Finance Team" />
  <p style="font-size:16px">CDG Finance Team</p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;width:130px;margin:5px 10px 5px 10px">
  <img src="assets/img/qg-team.png" width="50" alt="QGraphics Team" />
  <p style="font-size:16px">QGraphics Team</p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;width:130px;margin:5px 10px 5px 10px">
  <img src="assets/img/IVW_23.png" width="50" alt="IVWEB Team" />
  <p style="font-size:16px">IVWEB Team</p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;width:130px;margin:5px 10px 5px 10px">
  <img src="assets/img/wii-team.png" width="50" alt="Tour Yunnan WII team" />
  <p style="font-size:16px">Tour Yunnan WII team</p>
 </span>
 </div>

## Contributors

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
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 10px;"><img src="//avatars1.githubusercontent.com/u/6047274?s=460&v=4" alt="zousandian" width="40" style="border-radius:50%;"/><p style="font-size:16px"><a target="_blank" style="text-decoration:none;color:#34495e" href="https://github.com/zousandian" title="zousandian">Three O 'clock.</a></p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 10px;"><img src="//avatars0.githubusercontent.com/u/5770443?s=460&u=a8bce363477b32f2fd4b3b56807a689ab35422d7&v=4" alt="dequanzhu" width="40" style="border-radius:50%;"/><p style="font-size:16px"><a target="_blank" style="text-decoration:none;color:#34495e" href="https://github.com/dequan1331" title="zousandian">dequanzhu</a></p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 10px;"><img src="//avatars1.githubusercontent.com/u/1104051?s=460&v=4" alt="kassadin" width="40" style="border-radius:50%;"/><p style="font-size:16px"><a target="_blank" style="text-decoration:none;color:#34495e" href="https://github.com/kassadin" title="kassadin">kassadin</a></p>
 </span>
 <span style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 10px;"><img src="//avatars3.githubusercontent.com/u/4516541?s=460&v=4" alt="Arylo Yeung" width="40" style="border-radius:50%;"/><p style="font-size:16px"><a target="_blank" style="text-decoration:none;color:#34495e" href="https://github.com/Arylo" title="Arylo Yeung">Arylo Yeung</a></p>
 </span>
 </div>

## Communication

* [Article Column](https://cloud.tencent.com/developer/column/84006)
* WeCom Group, use WeChat or WeCom scan to join.

 ![WeCom Group QR code](assets/img/wechat-group.jpeg)

## Summary

If you're ready, [Getting start to Hippy](guide/integration.md).

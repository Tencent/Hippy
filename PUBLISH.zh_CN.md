# Hippy 发布文档

Hippy版本管理遵循所有模块使用同一版本原则

## 1. 更新版本号

前端使用 [lerna](https://lerna.js.org/) 进行版本管理和 CHANGELOG 生成，但因为需要更新终端包所以不能使用它的发布功能。

更新版本和 CHANGELOG 使用：

```bash
lerna version [VERSION] --conventional-commits --tag-version-prefix='' --no-push
```

* `[VERSION]` - 要发布的版本号，如2.1.0。
* `--conventional-commits` - 生成基于 conventional 提交规范的 CHANGELOG。
* `--tag-version-prefix` - 改为空字符，这样生成的版本号 tag 前面就不会带上默认的 `v`。
* `--no-push` - 不会将tag推动到远程。

## 2. 回退 commit 并删除自动生成的 tag

lerna 生成版本号和 CHANGELOG 后，需要回退一下版本，所有发布改动需要合并到一个 commit 中。

```bash
git reset --soft HEAD^
```

同时删除 tag，一会儿更新后需要重新生成 tag

```bash
git tag -d [VERSION]
```

## 3. 更新终端版本号

终端版本号主要位于以下几个文件，都需要更新到即将发布的版本号

iOS

* [hippy.podspec](https://github.com/Tencent/Hippy/blob/master/hippy.podspec#L11)
* [HippyBridge.mm](https://github.com/Tencent/Hippy/blob/master/ios/sdk/base/HippyBridge.mm#L45)

Android

* [gradle.properties](https://github.com/Tencent/Hippy/blob/master/android/sdk/gradle.properties#L25)

## 4. 更新内置包并校验功能正常

随后编译新的前端 SDK

```bash
npm run build
```

如果有 `core/js` 下的代码更新，则需要编译一下 core 代码

```bash
npm run buildcore
```

随后更新目标 `examples` 下的依赖并更新终端内置包，一般而言默认内置 hippy-react-demo，但务必检查一下 hippy-vue-demo 的功能正常。

```bash
npm run buildexample -- hippy-react-demo
```

> 注意：buildexample 可能会使用旧版本的前端 SDK，需要手工更新 node_modules 下的文件后再更新内置包，buildexample 也需要将 npm install 那一步暂时注释掉。

## 5. 一切准备完毕后重新提交

再一次检查所有文件都正确修改

```bash
git status
```

提交文件修改

```bash
git add [FILES]
```

输入符合 [Convention Commit](https://conventionalcommits.org/) 规范的 commit message

```bash
git commit -m 'chore(release): released [VERSION]'
```

打上 tag

```bash
git tag [VERSION]
```

提交代码，并准备发布 PR 合并到 master 分支。

```bash
git push        # 提交代码
git push --tags # 提交 tag
```

## 6. 发布

* 前端发布到 npmjs.com

  ```bash
  lerna exec "npm publish"
  ```

  > 如果开启了 npm 二次验证会一直问你一次性密码，正常输入即可。

* iOS 发布到 cocoapods.org
  
  * 如果没有cocoapod账户，先进行注册

  ```bash
    pod trunk register [EMAIL] [NAME]
  ```

  * 然后发布

  ```bash
  pod trunk push hippy.podspec
  ```

  > 如果发布时参数检查失败，可以在`pod`命令前面加上 `COCOAPODS_VALIDATOR_SKIP_XCODEBUILD=1` 参数

* Android 发布到 Maven Central，原有jCenter仓库已经废弃 [版本查询](https://search.maven.org/search?q=com.tencent.hippy)。
  
  * 参照 [发布 Maven Central](https://zhuanlan.zhihu.com/p/362205023) 的步骤，并注册 [sonatype](https://oss.sonatype.org) 的账号。
  * 增加系统环境变量配置

    ```bash
    SIGNING_KEY_ID=gpg公钥key后8位
    SIGNING_PASSWORD=gpg密钥对密码
    SIGNING_SECRET_KEY_RING_FILE=gpg文件存放路径, 如/Users/user/.gnupg/secring.gpg
    OSSRH_USERNAME=sonatype账号
    OSSRH_PASSWORD=sonatype密码
    ```

  * 执行 build `Clean Project`
  * `Android gradle.properties` 将 `#PUBLISH_ARTIFACT_ID=hippy-debug` 注释打开，Gradle Task 先执行 `other` => `assembleDebug`, 再执行 `publishing` => `publish`
  * `Android gradle.properties` 将 `#PUBLISH_ARTIFACT_ID=hippy-common` 注释打开，Gradle Task 先执行 `other` => `assembleRelease`, 再执行 `publishing` => `publish`
  * 发布成功后 SDK 会在 sonatype 的 `staging`状态，在 sonatype 左边 `Staging Repositories` 里找到刚发布的 repository，如果想Release前进行测试，可以在 `Content` 下将 `aar` 下载，替换`examples` => `android-demo` => `example` => `libs` 下的 aar(名字改成 `android-sdk-release.aar`)

    ```bash
      // 注释 `setting.gradle` 本地 SDK 的引用
      // include 'android-sdk'
      // project(':android-sdk').projectDir = new File('../../android/sdk')

      --------------

      // `android-demo` => `example` => `build.gradle` 的 dependencies 修改如下，这样就会默认采用本地 aar
      if (1) {
        api (name: 'android-sdk-release', ext: 'aar')
      } else {
         api project(path: ':android-sdk')
      }
    ```

  * 验证成功后， 将 `Staging Repositories` 的 repository `Close`，再点击 `Release`。
  * Release 成功后就可以在 Repository 里 搜索到对应版本的aar，Maven主页需要等待2个小时以上才会同步
  
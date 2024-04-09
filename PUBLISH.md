# Hippy publish document

Hippy version management follows principle that all modules use same version.

## 1. Update Version Number

The front-end Uses [lerna](https://lerna.js.org/) for versioning and CHANGELOG generation, but cannot use its publishing functionality because it needs to update the terminal package.

Update version and CHANGELOG usage:

```bash
npx lerna version [VERSION] --force-publish --conventional-commits --tag-version-prefix='' --no-push
```

* `[version]` - The version number to be released, such as 2.1.0.
* `--conventional-commits` - Generates a CHANGELOG based on the conventional commit specification.
* `--tag-version-prefix` - it is changed to a null character, so that the generated version number tag is not preceded by the default `v`
* `--no-push` - it does not push tags to remote.

## 2. Rollback commit and delete auto-generated tag

After Lerna generates the version number and CHANGELOG, it needs to roll back the version, and all the published changes need to be merged into a commit.

```bash
git reset --soft HEAD^
```

Delete the tag at the same time, after a while update need to regenerate the tag

```bash
git tag -d [VERSION]
```

## 3. Update native version number

The native version number is mainly located in the following files, which need to be updated to the version number to be released

iOS

* [hippy.podspec](https://github.com/Tencent/Hippy/blob/master/hippy.podspec#L11)
* [HippyBridge.mm](https://github.com/Tencent/Hippy/blob/master/ios/sdk/base/HippyBridge.mm#L45)

Android

* [gradle.properties](https://github.com/Tencent/Hippy/blob/master/android/sdk/gradle.properties#L25)

修改安卓的abi配置，支持armeabi-v7a和arm64-v8a
```
INCLUDE_ABI_ARMEABI_V7A=true
INCLUDE_ABI_ARM64_V8A=true
```

## 4. Update built-in packages and verify functionality

The new front-end SDK is then compiled with

```bash
npm run build
```

If some code updated under `core/js`, you need to compile the core code with

```bash
npm run buildcore
```

Then update the dependencies under the target `examples` and update the built-in packages of the native. Generally speaking, the built-in hippy-react-demo is the default, but be sure to check that hippy-vue-demo functions properly.

```bash
npm run buildexample hippy-react-demo
```

## 5. Resubmit when everything is ready

Check again that all files have been modified correctly

```bash
git status
```

Submit document modification

```bash
git add [FILES]
```

Enter a commit message that conforms to [Convention Commit](https://conventionalcommits.org/) specifications

```bash
git commit -m 'chore(release): released [VERSION]'
```

tag (如果是大版本, 在主干打tag, 如果是hotfix，在hotfix分支打tag，然后把changelog合回主干)

```bash
git tag -a [VERSION] -m "version release xxx"
```

Commit the code and prepare to publish the PR merge into the master branch.

```bash
git push origin branch       # 提交代码
git push origin tag          # 提交 tag
```

## 6. Publish

* Front End Publishing to npmjs.com

  ```bash
  npx lerna exec "npm publish"
  ```

  > If npm secondary authentication is active, you will be asked to input a one-time password.

* iOS published to CocoaPods.org

  * If you do not have a CocoaPod account, register first

  ```bash
    pod trunk register [EMAIL] [NAME]
  ```

  * Then publish

  ```bash
   pod trunk push hippy.podspec
  ```

  > If the parameter check fails when publishing, you can prefix the `pod` command `COCOAPODS_VALIDATOR_SKIP_XCODEBUILD=1` parameter

* Android released to Maven Central, the original jCenter repository has been abandoned [version query](https://search.maven.org/search?q=com.tencent.hippy).

  * Follow [the steps for publishing Maven Central](https://zhuanlan.zhihu.com/p/362205023) and sign up for [sonatype](https://oss.sonatype.org).
  * Increase the system environment variable configuration

    ```bash
    SIGNING_KEY_ID=gpg公钥key后8位
    SIGNING_PASSWORD=gpg密钥对密码
    SIGNING_SECRET_KEY_RING_FILE=gpg文件存放路径, 如/Users/user/.gnupg/secring.gpg
    OSSRH_USERNAME=sonatype账号
    OSSRH_PASSWORD=sonatype密码
    ```

  * Run build `Clean Project`
  * `Android gradle.properties` turns on the `#PUBLISH_ARTIFACT_ID=hippy-debug` comment, and the Gradle Task executes `other` => `assembleDebug` before `publishing` => `publish`
  * `Android gradle.properties` turns on the `#PUBLISH_ARTIFACT_ID=hippy-common` comment, and the Gradle Task executes `other` => `assembleRelease` before `publishing` => `publish`
  * After the success of the release of the SDK will be in the `staging` state of Sonatype, in the left side `Staging Repositories` of the Sonatype Staging Repositories to find just released repository, if you want to test before Release, can be under the `Content` will `aar` download, replace `examples` => `android-demo` => `example` => `libs` under the aar(name to `android-sdk-release.aar`)

    ```bash
      // annotation local reference in `setting.gradle` 
      // include 'android-sdk'
      // project(':android-sdk').projectDir = new File('../../ android/sdk')

      --------------

      // `android-demo` => `example` => `build.gradle` dependencies can be changed as follow to use local aar file
      if (1) {
        api (name: 'android-sdk-release', ext: 'aar')
      } else {
         api project(path: ':android-sdk')
      }
    ```

  * After successful verification, Close the repository of `Staging Repositories``Close` and click `Release`.
  * After the success of the Release can be searched in the Repository to the corresponding version of aar, Maven home page need to wait for more than 2 hours to synchronize

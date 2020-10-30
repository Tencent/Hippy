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
git rebase -i HEAD^
```

进入 vim 或者编辑器后选择最后一个版本的 commit，并将要修改的 `pick` 修改成 `edit`，如果是 vim 则输入 `:` 并输入 `wq` 保存退出 vim。

此时进入 rebase 状态。

首先需要更新一下 commit message，因为自动生成的无法通过自动代码检查。

```bash
git commit --amend -S
```

输入符合 [Convention Commit](https://conventionalcommits.org/) 规范的 commit message，版本发布一般推荐使用：`chore(release): released [VERSION]` 这样的 commit message。

同时删除 tag，一会儿更新后需要重新生成 tag

```bash
git tag -d [VERSION]
```

## 3. 更新终端版本号

终端版本号主要位于以下几个文件，都需要更新到即将发布的版本号

iOS

* [hippy.podspec](https://github.com/Tencent/Hippy/blob/master/hippy.podspec#L11)
* [HippyBridge.mm](https://github.com/Tencent/Hippy/blob/master/ios/sdk/base/HippyBridge.mm#L43)

Android

* [build.gradle](https://github.com/Tencent/Hippy/blob/master/android/sdk/build.gradle#L518)

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
git rebase --continue
```

会结束 rebase 状态，然后再次检查 commit 中的内容正确。

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

  ```bash
  pod trunk push hippy.podspec
  ```

* Android 发布到 [bintray](https://bintray.com/beta/#/hippy/Hippy/hippy-release?tab=overview)
 在 Android Studio 中打开 `examples/android-demo` 项目，在`local.properties`添加`bintrayUser=[user]`和`bintrayKey=[key]`，其中`[user]`和`[key]` 分别对应用户在bintray的 `账号名`和 `API key` ，添加完后字旁边的 Gradle 面板中运行 `android-demo` > `android-sdk` > `publishing` > `:android-sdk:bintrayUpload` 即可发布.

# Hippy publish document

Hippy version management follows principle that all modules use same version.

## 1. Update Version Number

The front-end Uses [lerna](https://lerna.js.org/) for versioning and CHANGELOG generation, but cannot use its publishing functionality because it needs to update the terminal package.

Update version and CHANGELOG usage:

```bash
npx lerna version [VERSION] --conventional-commits --tag-version-prefix='' --no-push
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

* [hippy.podspec](https://github.com/Tencent/Hippy/blob/master/hippy.podspec) [s.version]
* [HippyBridge.mm](https://github.com/Tencent/Hippy/blob/master/ios/sdk/base/HippyBridge.mm) [_HippySDKVersion]

Android

* [gradle.properties](https://github.com/Tencent/Hippy/blob/master/android/sdk/gradle.properties)  [VERSION_NAME]

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

tag

```bash
git tag [VERSION]
```

Commit the code and tag.

```bash
git push origin vxxx - branch
git push origin [VERSION] - tag
```

## 6. Publish

Run [Release Workflow](https://github.com/Tencent/Hippy/actions/workflows/project_artifact_release.yml) to publish all packages.

### Android

* sign up for [sonatype](https://oss.sonatype.org).
* After successful verification, Close the repository of `Staging Repositories` through clicking `Close` and then click `Release` to release hippy maven packages.
* After the success of the Release can be searched in the Repository to the corresponding version of aar, Maven home page need to wait for more than 2 hours to synchronize

# SDK工程主要介绍

## AnroidHippySDK工程[java工程]
--------------------------
### GIT地址：[http://git.code.oa.com/hippy/Android.git](http://git.code.oa.com/hippy/Android.git)
### 描述：
    这个工程里面的代码是HippySDK的主要核心代码库，开源给外部业务的hippysdk也是这个工程
### 依赖工程：
####    [supportui](http://git.code.oa.com/support_ui/support_ui.git)
### 主要分支：
    master分支:开源给外部业务用的hippysdk的分支 robinsli
    for_qb940_v8_upgrade：v8升级的分支，这个分支是qb9.4时基于master拉出来的分支做v8升级的，后面两个分支就没有同步过。---polly&kunluo
    HippyCoreLab2:当前QB98在用的分支,这个分支是for_qb940_v8_upgrade分支做的hippycore的升级，也是没通不过master的代码----polly&kunluo
#### 现状：
    这些分支代码都在并发使用，还没进行同步。也就是对外开源的hippysdk还不支持hippycore。

### 子目录：
    sdk目录：存放sdk核心代码的目录
    example目录：测试sdk功能的目录，主要在MyActivity.java这个测试类里面。
### 版本：
    master对外发布的分支：经历了三个发布版本，第一个版本和后面的版本不兼容，升级见对应升级文档。 1.1*,1.2*,1.3*
### 版本发布：
#### 对于QB：
    如果修改了java代码：
        需要手动打出hippy.jar,然后手动把hippy.jar拷贝到UI的HippyForQB字工程的libs目录下。编译方法见README.md， 编译完成后将hippy.jar提交到HippyForQB工程。
        Hippy.jar位于sdk/build/outputs/aar目录. 【如果需要在QB里面调试sdk相关bug，需要编译出debug版本的hippy.jar,目前只有release任务能编译出hippy.jar】
        QB发版本后，需要拉分支或tag, 便于后续查问题。
        如果修改了native代码， 需要将libhippybridge.so提交到HippyForQB。  ----hippybridge维护人，pollyzhang
        Libmttv8.so和libmtt_shared.so是由内核同学维护的。----维护人：王勇

#### 对于外部sdk：---外部业务以Marven的形式引用sdk
        代码先提交到master，然后拉发布分支。
        之前的分支格式为：Branch_Release_Hippy_1.*.*， 目前最新的版本为1.3.7. 修改maven.gradle里的版本号以及使用的support-ui的版本号。
        执行:sdk:uploadArchives即可。
        会将aar提交到这个maven地址：
        http://maven.oa.com/nexus/content/repositories/thirdparty/
        
        
## AnroidHippySDKDemo工程[java工程]
### Git地址：[http://git.code.oa.com/hippy/AndroidDemo.git](http://git.code.oa.com/hippy/AndroidDemo.git)
### 描述：提供给业务接入调试hippy业务的demo工程，可以理解为没有sdk目录的AndroidHippySdk工程


## Support-ui[java工程]
### Git地址：[http://git.code.oa.com/support_ui/support_ui.git](http://git.code.oa.com/support_ui/support_ui.git)
### 工程描述：
    屏蔽android各个版本uiView差异性的工程，QB大部分View以及Hippy View的基类， 已经剥离了QB特有的部分。
        注意：`共用一份代码：目前供QB使用和供外部使用的都是master分支`
                    供外部使用是指非QB业务在使用Hippy时， 也需要引入support-ui.
                    之前外部业务需要在gradle文件里指明support-ui版本， 现在可以通过maven间接引入。
### 发布流程：-----`在提交代码前，需要考虑两侧的兼容性。`
        Step1。在发布时，需要先拉对应的分支， 在分支上修改版本号，再发布到maven.
        Step2。供QB使用的分支格式：Branch_release_qb_1.*.*,目前最新的版本号是1.1.14
               如何让QB使用到对应发布的新的发布：修改浏览器主工程下，文件external.properties文件下support-ui=com.tencent.mtt:对应的版本号即可。
              （如果本地打开了子工程在开发调试，子工程也依赖了supportui，修改子工程下相应的supportui版本号即可）

####              `一定要把maven地址和版本号配置对：`

              拉分支后，删除sdk/maven_public.gradle, 修改maven.gradle中pom.version, 执行:sdk:uploadArchives
              供QB使用的 support-ui的aar,  maven地址为：http://maven.oa.com/nexus/content/repositories/qqbrowser/

        Step3。供外部发布的分支格式：Branch_release_hippy_1.*.*,  目前最新的版本号是1.2.3
            备注：hippysdk 1.3之前的版本，需要同时告知业务对应的hippysdk版本和匹配的supportui版本，1.3过后，有关联依赖，你需要去AnroidHippySDK工程maven.gradle设置依赖的supportui版本


####            `一定要把maven地址和版本号配置对：`


            拉分之后，删除sdk/maven_public.gradle, 修改maven.gradle中pom.version, 执行:sdk:uploadArchives
            供外部使用的support-ui的aar, maven地址为：
            http://maven.oa.com/nexus/content/repositories/thirdparty/

## HippyForQB[java工程]
### Git地址：[http://git.code.oa.com/hippy/HippyForQB.git](http://git.code.oa.com/hippy/HippyForQB.git)
### 工程描述 `浏览器的子工程`
    Hippy工程在浏览器工程里面的扩展
    ps：Hippy给qb的定制需求一般都是在这个工程里面开发支撑。
### 依赖工程
    libs目录下的hippy.jar，依赖HippyAndroidsdk工程的输出
    libs目录下的so：bridgeso依赖HippyAndroidsdk工程的输出，另外v8的so依赖内核内核找王勇
    jsbundle：asset目录下bunldes.common存放的是commonjsbundle。对应是由
#### [hippy-react-qb](http://git.code.oa.com/hippy/hippy-react-qb.git)目前由xqkuang输出对应的jsbundle
####  `目前只支持RN的jsbundle，如果要支持vue，vue的jsbundle也会放到这个目录下。`
####   `commonjsbundle是要随浏览器集成发布的，不能动态更新。`
####    注意：`目前这里还是手动拷贝，更新打包发布需要细心点，避免拷贝错误`
    
##  hippy-base[js工程]
### Git地址：
####    [http://git.code.oa.com/hippy/hippy-base.git](http://git.code.oa.com/hippy/hippy-base.git)
### 工程描述
    commonjsbundle的基础工程
### 发布方式 `xqkuang`
    外部业务：maven 版本号的方式
    qb使用的是hippy-react-qb，不直接依赖这个工程
    
##  hippy-react-qb[js工程]
### Git地址：
####    [http://git.code.oa.com/hippy/hippy-react-qb.git](http://git.code.oa.com/hippy/hippy-react-qb.git)
### 工程描述
    QB的commonjsbundle工程
### 依赖工程
#### [父工程hippy-base](http://git.code.oa.com/hippy/hippy-base.git)
### 发布方式 `xqkuang`
    外部业务：无
    qb使用的是hippy-react-qb，一般是xqkuang打包给出对应的jsbundle，拷贝到hippyforqb的assets目录下。
    
    
---------------------
# 其他业务工程
## FeedsSdkDemo工程[Java]
### Git地址：[http://git.code.oa.com/FeedsSDK/FeedsSdkDemo.git](http://git.code.oa.com/FeedsSDK/FeedsSdkDemo.git)
### 工程描述
    这只是一个demo工程，验证只有feed的hippy能力的工程
### 依赖工程
    无
### 发布方式
    直接run包跑起来就是，但是需要依赖后台发布的feed页面，如果需要跑起来体验可以找`pollyzhang`
    
## svg能力支持工程--native能力
### Git地址：[http://git.code.oa.com/hippy-contrib/hippy-android-svg.git](http://git.code.oa.com/hippy-contrib/hippy-android-svg.git)
### 工程描述
    支持svg能力的native的实现
#### `这个svg只之前同学实现（edsheng），采用的是自定义实现，没有开源的svg实现，原因估计是为了减包大小`
### 依赖工程
    无
### 发布方式
    1.hippy以组件的这个方式集成这个能力
    2.qb没有业务场景使用svg这个能力，所以没有集成。9.8feeds需要使用svg，但是因为场景少，增加包大小（40多k）而没集成转而自实现
    3.外部有个音乐的业务使用是基于源码级的使用
 
## svg能力支持工程--jsbundle能力
### Git地址：[http://git.code.oa.com/hippy-contrib/hippy-react-svg](http://git.code.oa.com/hippy-contrib/hippy-react-svg)
### 工程描述
    支持svg能力的jsbundle库
### 依赖工程
    无
### 发布方式

 
 
## Lottie能力支持工程
### Git地址：[http://git.code.oa.com/hippy/AndroidSDK_Lottie.git](http://git.code.oa.com/hippy/AndroidSDK_Lottie.git)
### 工程描述
    支持lottie动画能力的native实现
### 依赖工程
### 发布方式
    









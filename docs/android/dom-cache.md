# 节点缓存

缓存上一次页面打开 DOM Node 节点的数据，序列化保存至本地，当下次打开页面时反序列化本地节点数据，调用 SDK create node 接口创建节点完成上屏。SDK统一提供对外接口，由接入方完成节点数据的存储与读取(序列化，反序列化)，同样数据的缓存有效期也是由接入方自行决定，SDK 负责首屏节点数据的获取与首屏界面的创建还原。

## 接口

### HippyThirdPartyAdapter 新增接口

+ `public void saveInstanceState(ArrayList<DomNodeRecord> recordList)`

    这个接口由接入方实现，通过根节点遍历获取每个节点数据，序列化并保存，获取节点数据可以调用 `node.getDomainData()` 接口返回 `DomDomainData` 对象。

### HippyEngine 新增接口

+ `public void saveInstanceState()`

    该接口会转发消息到 dom 线程，最终获取 root dom node 节点并调用 `ThirdPartyAdapter` 的 `saveInstanceState`。

+ `public void HippyRootView restoreInstanceState(ArrayList<DomNodeRecord> domNodeRecordList, HippyEngine.ModuleLoadParams loadParams, Callback<Boolean> callback)`

    接入方提前读取好本地节点数据，并反序列化为 `DomNodeRecord` list 输入参数，**转换时需要注意把 node id 都转成负数**，不然会和正式JS页面节点有冲突。

+ `public void destroyInstanceState(HippyRootView rootView)`

    最终真实JS页面显示后，需要销毁首屏页面释放内存。

## 使用方式

+ `saveInstanceState` 调用时机
  
  可以由接入方决定，比如在页面退出调用引擎 `destroy` 方法前。

+ `restoreInstanceState` 调用时机

  按正常初始化引擎流程，在 Hippy engine 初始化完成后调用 `rootView = mHippyEngine.restoreInstanceState(recordList, loadParams);`

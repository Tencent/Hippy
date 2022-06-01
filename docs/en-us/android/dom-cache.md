# Dom Cache

Cache the data of DOM node opened on the last page, serialize and save it to local, deserialize local node data when opening the next page, call SDK create node interface to create the node to finish the screen. The SDK is responsible for acquiring the data of the first screen node and creating the first screen interface.

## Interface

### HippyThirdPartyAdapter new interface

+ `public void saveInstanceState(ArrayList<DomNodeRecord> recordList)`

  This interface is implemented by the accessor and gets each node data through the root node traversal, serializes and saves it, and gets the node data by calling the `node.getDomainData()` interface to return the `DomDomainData` object.

### HippyEngine new interface

+ `public void saveInstanceState()`

  This interface forwards messages to the dom thread, eventually gets the root dom node and calls `ThirdPartyAdapter`'s `saveInstanceState`.

+ `public void HippyRootView restoreInstanceState(ArrayList<DomNodeRecord> domNodeRecordList, HippyEngine.ModuleLoadParams loadParams, Callback<Boolean> callback)`

  The access party reads the local node data in advance and deserializes it into `DomNodeRecord` list input parameters, **conversion requires attention that all node ids should be converted to negative numbers**, otherwise there will be conflicts with the real JS page nodes.

+ `public void destroyInstanceState(HippyRootView rootView)`

  After the final real JS page is displayed, the first screen page needs to be destroyed to free up memory.

## Usage

+ `saveInstanceState` call timing

  can be decided by the accessor, for example, before the page exits to call the engine `destroy` method.

+ `restoreInstanceState` call timing

  In accordance with the normal initialization of the engine process, after the Hippy engine initialization is complete, call `rootView = mHippyEngine.restoreInstanceState(recordList, loadParams);`

# Snapshot

Snapshot is a technical solution provided by v8 to quickly create isolate and context. It can greatly speed up the startup speed of v8.

---

## using v8 Snapshot

### 1. Create a Snapshot file

Modify the onCreate of the MyActivity.java file.
change

``` java
HippyEngine.V8SnapshotType initType = HippyEngine.V8SnapshotType.NoSnapshot; 
``` 

to

``` java
HippyEngine.V8SnapshotType initType = HippyEngine.V8SnapshotType.CreateSnapshot;
```

Run the example to generate the Snapshot file

### 2. Use the generated Snapshot file

Modify the onCreate of the MyActivity.java file.
change

``` java
HippyEngine.V8SnapshotType initType = HippyEngine.V8SnapshotType.CreateSnapshot; 
``` 

to

``` java
HippyEngine.V8SnapshotType initType = HippyEngine.V8SnapshotType.UseSnapshot;
```

Run the example, you can use the Snapshot to speed up the startup of the example

## Introduction to the principle of Snapshot

Snapshot is a technique for quickly creating isolates and contexts using in-memory data. It will serialize and store the data on the v8 js heap at the moment of Snapshot creation.
When using Snapshot, you only need to deserialize the corresponding content and load it into memory. This can significantly reduce the time to initialize isolates and contexts, thus speeding up the startup process.

## Snapshot limitations explained

v8 can serialize js data when creating a Snapshot, but the c++ method bound to js by Hippy does not know how to serialize, so Hippy is required to cooperate.
The corresponding external_references need to be passed in when creating and restoring the Snapshot isolate. If it is an external address that can be determined during the Hippy startup phase, the SDK will be responsible for collecting and injecting it.
However, the third-party Module SDK for business expansion cannot determine the C++ address bound to the Module in advance. Therefore, there are certain restrictions on using snapshots for business use.

## Snapshot limits

1. Bridge cannot be called before creating a Snapshot. Because the Bridge address cannot be determined in advance, once the Bridge is called, it will lead to an uncertain external address and cause v8 Crash. Therefore create a Snapshot
   It is a special startup process. Once a Bridge is called, it will cause an exception and fail to create a Snapshot.
2. Before creating a Snapshot, there cannot be unexpected delayed tasks, including SetTimeout, SetInterval, RequestIdleCallback, etc.
   Because the delayed task cannot be restored when restoring the Snapshot, it may cause abnormal logic.
3. The Hippy version of the Snapshot created must be the same as the Hippy version of the Snapshot used. Once the SDK version changes, the external address may change, causing v8 to fail to map normally, causing Crash.
4. The version of the bundle that creates the Snapshot needs to be consistent with the version of the bundle that uses the Snapshot.
5. If the user uses the ability to dynamically load Bundles, the correct address of the directory where the main Bundle is located must be passed in when creating a Snapshot (note that the protocol header is included).
   Otherwise, when using Snapshot, the SDK will not be able to determine the actual address of the sub-bundle due to the lack of the main Bundle directory path.


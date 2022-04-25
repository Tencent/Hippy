# Introduction
Chrome Devtools Protocol based on JSON-RPC. You can view verbose protocol on [website](https://devtools.qq.com/devtools-protocol/)

this repo is fork from [ChromeDevTools/devtools-protocol](https://github.com/ChromeDevTools/devtools-protocol) and add some [custom debug protocol](./json/tdf_protocol.json) of Hippy framework

# Hot to start

## add custom protocol

1. modify JSON protocol definition in `./json/tdf_protocol.json`

2. auto generate all typescript declaration, docs: `npm run build`

3. preview devtools protocol site on [page](http://localhost:8696/devtools-protocol): `npm run site:serve`

## use by other project

```bash
npm i @hippy/devtools-protocol
```

usage: add reference to the typescript declaration of @hippy/devtools-protocol by:

```ts
// file: index.d.ts
/// <reference types="@hippy/devtools-protocol" />
```

```ts
registerModuleCallback(TdfCommand.TDFInspectorDumpDomTree, (error, msg) => {
  const { itree } = msg as ProtocolTdf.TDFInspector.DumpDomTreeResponse;
  this.handleReceiveDomTree(itree);
});

```

# @hippy/vue-next demo


### Introduction
This package is the demo project for @hippy/vue-next. Project include most use case for
@hippy/vue-next. Just try it.

### Usage
Read the hippy framework [doc](https://github.com/Tencent/Hippy/blob/master/README.md#-getting-started) and learn
how to use.

### How To Use SSR

we were support SSR for @hippy/vue-next. here is only how to use SSR. how to use vue-next doc is [here](https://hippyjs.org/en-us/#/hippy-vue/vue3)

1. Before running vue-next-ssr-demo, you should run `npm run init` at root directory to install dependencies and build front-end sdk packages.
2. Then run `cd examples/hippy-vue-next-demo` and `npm install --legacy-peer-deps` to install demo dependencies.

Now determine which environment you want build 

> Because our server listening port 8080, so if you are using android device, you should run `adb reverse tcp:8080 tcp:8080`
> to forward mobile device port to pc port, iOS simulator doesn't need this step.

ensure you were at `examples/hippy-vue-next-demo`.

#### Development

1. run `npm run ssr:dev-build` to build client entry & client bundle, then running hippy debug server
2. run `npm run ssr:dev-server` to build server bundle and start SSR web server to listen port **8080**.
3. debug your app with [reference](https://hippyjs.org/en-us/#/guide/debug)
> You can change server listen port 8080 in `server.ts` by your self, but you also need change request port 8080 in
> `src/main-client.ts` and modify the adb reverse port, ensure port is same at three place

#### Production

1. run `npm run ssr:prod-build` to build client entry, server bundle, client bundle
2. run `npm run ssr:prod-server` to start SSR web server to listen port **8080**.
3. test your app
> In production, you can use process manage tool to manage your NodeJs process, like pm2.
> 
> And you should deploy you web server at real server with real domain, then you can request
> SSR cgi like https://xxx.com/getSsrFirstScreenData
>

#### Tips
> Usage of non SSR is [here](https://hippyjs.org/en-us/#/guide/integration)

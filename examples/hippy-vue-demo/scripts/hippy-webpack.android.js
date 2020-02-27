const path = require("path");
const webpack = require("webpack");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const pkg = require("../package.json");
const manifest = require("../dist/android/vendor-manifest.json");
const SimpleProgressWebpackPlugin = require("simple-progress-webpack-plugin");
const platform = "android";
module.exports = {
  mode: "production",
  bail: true,
  entry: {
    index: [path.resolve(pkg.nativeMain)]
  },
  output: {
    filename: `[name].${platform}.js`,
    path: path.resolve(`./dist/${platform}/`),
    globalObject: '(0, eval)("this")'
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production"),
      __PLATFORM__: JSON.stringify(platform)
    }),
    new CaseSensitivePathsPlugin(),
    new VueLoaderPlugin(),
    new webpack.DllReferencePlugin({
      context: path.resolve(__dirname, ".."),
      manifest
    }),
    new SimpleProgressWebpackPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: ["vue-loader", "unicode-loader"]
      },
      {
        test: /\.css$/,
        use: ["@hippy/vue-css-loader"]
      },
      {
        test: /\.(js)$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    targets: {
                      chrome: 57
                    }
                  }
                ]
              ]
            }
          },
          "unicode-loader"
        ]
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "assets/"
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [".js", ".vue", ".json"],
    alias: {
      vue: "@hippy/vue",
      "@": path.resolve("./src"),
      "vue-router": "@hippy/vue-router"
    }
  }
};

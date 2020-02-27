const path = require("path");
const webpack = require("webpack");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const pkg = require("../package.json");
const manifest = require("../dist/ios/vendor-manifest.json");
const SimpleProgressWebpackPlugin = require("simple-progress-webpack-plugin");
const platform = "ios";
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
module.exports = {
  mode: "production",
  bail: true,
  entry: {
    index: [path.resolve(pkg.nativeMain)]
  },
  output: {
    filename: `[name].${platform}.js`,
    path: path.resolve(`./dist/${platform}/`),
    globalObject: '(0, eval)("this")',
    chunkFilename: `[name].${platform}.js`
  },
  optimization: {
    splitChunks: {
      chunks: "async",
      minSize: 30000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: "~",
      name: true,
      cacheGroups: {
        commons: {
          name: "commons",
          chunks: "initial",
          test: ({ resource } = {}) => resource && /demos/.test(resource)
        },
        default: {
          minChunks: 2,
          reuseExistingChunk: true
        }
      }
    }
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
    // new BundleAnalyzerPlugin()
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
                      ios: 8
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

const path = require("path");
const webpack = require("webpack");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const pkg = require("../package.json");
// eslint-disable-next-line import/no-dynamic-require
const manifest = require(path.resolve("./dist/ios/vendor-manifest.json"));
const SimpleProgressWebpackPlugin = require("simple-progress-webpack-plugin");
const platform = "ios";

module.exports = {
  mode: "production",
  bail: true,
  entry: {
    index: ["regenerator-runtime", path.resolve(pkg.main)]
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
    new webpack.DllReferencePlugin({
      context: process.cwd(),
      manifest
    }),
    new SimpleProgressWebpackPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.(jsx?)$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-react",
                [
                  "@babel/preset-env",
                  {
                    targets: {
                      ios: 8
                    }
                  }
                ]
              ],
              plugins: ["@babel/plugin-proposal-class-properties"]
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
    extensions: [".js", ".jsx", ".json"],
    modules: [path.resolve(__dirname, "../node_modules")],
    alias: {
      "hippy-react": path.resolve(__dirname, "../node_modules/hippy-react")
    }
  }
};

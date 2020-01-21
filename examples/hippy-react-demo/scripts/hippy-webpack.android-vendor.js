const path = require("path");
const webpack = require("webpack");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");

const platform = "android";
const SimpleProgressWebpackPlugin = require("simple-progress-webpack-plugin");
module.exports = {
  mode: "production",
  bail: true,
  entry: {
    vendor: [path.resolve(__dirname, "./vendor.js")]
  },
  output: {
    filename: `[name].${platform}.js`,
    path: path.resolve(`./dist/${platform}/`),
    globalObject: '(0, eval)("this")',
    library: "hippyReactBase"
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production"),
      __PLATFORM__: JSON.stringify(platform)
    }),
    new CaseSensitivePathsPlugin(),
    new webpack.DllPlugin({
      context: path.resolve(".."),
      path: path.resolve(`./dist/${platform}/[name]-manifest.json`),
      name: "hippyReactBase"
    }),
    new SimpleProgressWebpackPlugin()
  ],
  module: {
    rules: [
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

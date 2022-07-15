const path = require("path");
const webpack = require("webpack");

// const vscodefs = require("vscode").workspace.fs;

/** @typedef {import('webpack').Configuration} WebpackConfig **/
/** @type WebpackConfig */
const webExtensionConfig = {
  mode: "none", // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
  target: "webworker", // extensions run in a webworker context
  entry: {
    extension: "./src/web/extension.ts", // source of the web extension main file
    // "test/suite/index": "./src/web/test/suite/index.ts", // source of the web extension test runner
  },
  output: {
    filename: "[name].js",
    path: path.join(__dirname, "./dist/web"),
    libraryTarget: "commonjs",
    devtoolModuleFilenameTemplate: "../../[resource-path]",
  },
  resolve: {
    mainFields: ["browser", "module", "main"], // look for `browser` entry point in imported node modules
    extensions: [".ts", ".js"], // support ts-files and js-files
    alias: {
      // provides alternate implementation for node module and source files
    },
    fallback: {
      // Webpack 5 no longer polyfills Node.js core modules automatically.
      // see https://webpack.js.org/configuration/resolve/#resolvefallback
      // for the list of Node.js core module polyfills.
      assert: require.resolve("assert"),
      path: require.resolve("path-browserify"),
      process: require.resolve("process/browser"),
      os: require.resolve("os-browserify/browser"),
      crypto: require.resolve("crypto-browserify"),
      domain: require.resolve("domain-browser"),
      util: require.resolve("util"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      constants: require.resolve("constants-browserify"),
      // fs: vscodefs, // TODO: This will likely cause a lot of breaks. See def of vscode's FS at `export interface FileSystem`
    },
  },
  module: {
    rules: [
      {
        // test: /\.ts$/,
        exclude: /node_modules/,
        include: path.resolve(__dirname, "src/web/"),
        use: [
          {
            loader: "ts-loader",
            options: {
              ignoreDiagnostics: [
                6196,
                // never read
                6133,
                // import not used
                6192,
                // cannot find namespace jest
                2503,
              ],
              configFile: "tsconfig.build.json",
              transpileOnly: true,
              compilerOptions: {
                module: "es6", // override `tsconfig.json` so that TypeScript emits native JavaScript modules.
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: "process/browser", // provide a shim for the global `process` variable
    }),
  ],
  externals: {
    vscode: "commonjs vscode", // ignored because it doesn't exist
  },
  performance: {
    hints: false,
  },
  devtool: "nosources-source-map", // create a source map that points to the original source file
};
module.exports = [webExtensionConfig];

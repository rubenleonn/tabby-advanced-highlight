import * as path from "path";
import * as url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

export default () => ({
  target: "node",
  entry: "src/index.ts",
  context: __dirname,
  mode: "production",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    pathinfo: true,
    libraryTarget: "umd",
  },
  resolve: {
    modules: [".", "src", "node_modules"].map((x) => path.join(__dirname, x)),
    extensions: [".ts", ".js", ".html", ".scss", ".css"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        options: {
          configFile: path.resolve(__dirname, "tsconfig.json"),
        },
      },
      {
        test: /\.html$/,
        type: "asset/source",
      },
      {
        test: /\.(scss|css)$/,
        type: "asset/source",
      },
    ],
  },
  externals: ["fs", /^rxjs/, /^@angular/, /^@ng-bootstrap/, /^tabby-/],
});

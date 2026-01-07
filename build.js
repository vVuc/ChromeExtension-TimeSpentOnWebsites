import esbuild from "esbuild";

const common = {
  bundle: true,
  target: "es2020",
};

await Promise.all([
  esbuild.build({
    ...common,
    entryPoints: ["src/main.ts"],
    format: "iife",
    outfile: "dist/main.js",
  })
  // ,  esbuild.build({
  //   ...common,
  //   entryPoints: ["src/content.ts"],
  //   format: "iife",
  //   outfile: "dist/content.js",
  // }),

  // esbuild.build({
  //   ...common,
  //   entryPoints: ["src/background.ts"],
  //   format: "esm",
  //   outfile: "dist/background.js",
  // }),

//   esbuild.build({
//     ...common,
//     entryPoints: ["src/popup.ts"],
//     format: "esm",
//     outfile: "dist/popup.js",
//   }),
]);

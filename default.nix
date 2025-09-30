{ mkBunDerivation, ... }:
mkBunDerivation {
  packageJson = ./package.json;

  src = ./.;

  bunNix = ./bun.nix;

  buildFlags = [
    "--compile"
    "--minify"
    "--sourcemap"
  ];
}

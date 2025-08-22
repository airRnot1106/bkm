{ mkBunDerivation, ... }:
mkBunDerivation {
  pname = "bkm";
  version = "0.0.1";

  src = ./.;

  bunNix = ./bun.nix;

  index = "src/index.ts";
}

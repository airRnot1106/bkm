{ mkBunDerivation, ... }:
mkBunDerivation {
  pname = "default-bun-app";
  version = "0.0.1";

  src = ./.;

  bunNix = ./bun.nix;

  index = "index.ts";
}

{
  inputs = {
    bun2nix = {
      url = "github:baileyluTCD/bun2nix?tag=1.5.1";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.systems.follows = "systems";
    };
    flake-parts.url = "github:hercules-ci/flake-parts";
    git-hooks = {
      url = "github:cachix/git-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    systems.url = "github:nix-systems/default";
    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  nixConfig = {
    extra-substituters = [
      "https://cache.nixos.org"
      "https://cache.garnix.io"
    ];
    extra-trusted-public-keys = [
      "cache.nixos.org-1:6NCHdD59X431o0gWypbMrAURkbJ16ZPMQFGspcDShjY="
      "cache.garnix.io:CTFPyKSLcx5RMJKfLo5EEPUObbA78b0YQ2DTCJXqr9g="
    ];
  };

  outputs =
    { flake-parts, ... }@inputs:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        inputs.git-hooks.flakeModule
        inputs.treefmt-nix.flakeModule
      ];
      systems = import inputs.systems;

      perSystem =
        {
          config,
          lib,
          pkgs,
          system,
          ...
        }:
        {
          packages = {
            default = pkgs.callPackage ./default.nix {
              inherit (inputs.bun2nix.lib.${system}) mkBunDerivation;
            };
          };
          devShells.default = pkgs.mkShell {
            packages = with pkgs; [
              bun
              git
              nil
              typescript-language-server

              inputs.bun2nix.packages.${system}.default
            ];
            shellHook = ''
              ${config.pre-commit.installationScript}
            '';
          };
          pre-commit = import ./nix/pre-commit {
            inherit config;
            inherit pkgs;
          };
          treefmt = import ./nix/treefmt;
        };
    };
}

{
  inputs = {
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

  outputs =
    {
      self,
      git-hooks,
      nixpkgs,
      systems,
      treefmt-nix,
      ...
    }:
    let
      eachSystem =
        f:
        nixpkgs.lib.genAttrs (import systems) (
          system:
          f {
            inherit system;
            pkgs = nixpkgs.legacyPackages.${system};
          }
        );
    in
    {
      devShells = eachSystem (
        { pkgs, system }:
        {
          default = pkgs.mkShell {
            inherit (self.checks.${system}.pre-commit-check) shellHook;

            packages = with pkgs; [
              cobra-cli
              go
              gofumpt
              golangci-lint
              gopls
              gotest
            ];
          };
        }
      );
      formatter = eachSystem (
        { pkgs, ... }:
        treefmt-nix.lib.mkWrapper pkgs {
          projectRootFile = "flake.nix";
          programs = {
            gofumpt.enable = true;
            nixfmt.enable = true;
          };
        }
      );
      checks = eachSystem (
        { pkgs, system, ... }:
        {
          pre-commit-check = git-hooks.lib.${system}.run {
            src = ./.;
            hooks = {
              golangci-lint = {
                enable = true;
                extraPackages = with pkgs; [ go ];
              };
              treefmt = {
                enable = true;
                package = self.formatter.${system};
              };
            };
          };
        }
      );
      packages = eachSystem (
        { pkgs, ... }:
        {
          default = pkgs.callPackage ./default.nix { };
        }
      );
    };
}

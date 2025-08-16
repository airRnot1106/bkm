{
  projectRootFile = "flake.nix";
  programs = {
    biome = {
      enable = true;
      settings = builtins.fromJSON (builtins.readFile ../../biome.json);
    };
    nixfmt.enable = true;
  };
}

{
  lib,
  buildGoModule,
}:
buildGoModule {
  pname = "bkm";
  version = "dev";

  src = ./.;

  vendorHash = "sha256-1P+hUg9MhkeN40Mc63tbtWHpLCWvOtrP6BSTSEFsD/g=";

  ldflags = [
    "-s"
    "-w"
  ];

  doCheck = false;

  meta = {
    description = "";
    homepage = "https://github.com/airRnot1106/bkm";
    license = lib.licenses.mit;
    mainProgram = "bkm";
  };
}

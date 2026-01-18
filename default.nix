{
  lib,
  buildGoModule,
}:
buildGoModule {
  pname = "bkm";
  version = "dev";

  src = ./.;

  vendorHash = "sha256-QRixhOMcYd0FENifqzSyakM/9UgXOAaZtwKoaJUEshI=";

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

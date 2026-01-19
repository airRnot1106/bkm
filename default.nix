{
  lib,
  buildGoModule,
}:
buildGoModule (finalAttrs: {
  pname = "bkm";
  version = "dev";

  src = ./.;

  vendorHash = "sha256-QRixhOMcYd0FENifqzSyakM/9UgXOAaZtwKoaJUEshI=";

  ldflags = [
    "-s"
    "-w"
    "-X github.com/airRnot1106/bkm/cmd.version=${finalAttrs.version}"
  ];

  doCheck = false;

  meta = {
    description = "Bookmark manager for CLI";
    homepage = "https://github.com/airRnot1106/bkm";
    license = lib.licenses.mit;
    mainProgram = "bkm";
  };
})

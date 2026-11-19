{
  lib,
  buildGoModule,
}:
buildGoModule (finalAttrs: {
  pname = "bkm";
  version = "0.1.0";

  src = ./.;

  vendorHash = "sha256-Vt+nUlRMPcR6zrhq7B22qhy+rwFqB1MWaSEfJjne3MY=";
  proxyVendor = true;

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

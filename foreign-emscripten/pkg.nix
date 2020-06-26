{ mkDerivation, base, ghcjs-base, stdenv }:
mkDerivation {
  pname = "ffi-emscripten";
  version = "0.1";
  src = ./.;
  libraryHaskellDepends = [ base ghcjs-base ];
  doHaddock = false;
  homepage = "https://github.com/k0001/ghcjs-ccall-emscripten";
  description = "GHCJS FFI to Emscripten";
  license = stdenv.lib.licenses.asl20;
}

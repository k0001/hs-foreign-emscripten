{ mkDerivation, base, ghcjs-base, stdenv }:
mkDerivation {
  pname = "foreign-emscripten";
  version = "0.1";
  src = ./.;
  libraryHaskellDepends = [ base ghcjs-base ];
  homepage = "https://github.com/k0001/hs-foreign-emscripten";
  description = "Dispatch GHCJS FFI CCALLs to code compiled with Emscripten";
  license = stdenv.lib.licenses.asl20;
}

let pkgs = import ./nix;
in {
  ghcjs86 = pkgs._here.ghcjs86.foreign-emscripten;
}

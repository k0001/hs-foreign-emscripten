let
  sources = import ./sources.nix;

  pkgs-overlay = self: super: {
    _here = {
      _shell = self.mkShell {
        buildInputs = [
          self.emscripten
          self.nodejs
          self.haskell.packages.ghc865.ghc
          self.haskell.packages.ghcjs86.ghc
        ];
      };
    };
  };

in import sources.nixpkgs { overlays = [ pkgs-overlay ]; }

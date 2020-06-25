let
  sources = import ./sources.nix;

  ghc-overrides = pkgs: self: super: {
    ffi-emscripten = super.callPackage ../hs/pkg.nix { };
    #      extra = hs.dontCheck super.extra;
    #      quickcheck-assertions = hs.dontCheck super.quickcheck-assertions;
    #      QuickCheck = hs.dontCheck super.QuickCheck;
    #      tasty-quickcheck = hs.dontCheck super.tasty-quickcheck;
    #      terminal-size =
    #        super.callCabal2nix "terminal-size" sources.terminal-size { };
    #      time-compat = hs.dontCheck super.time-compat;
  };

  ghcjs-overrides = pkgs: self: super:
    let hs = pkgs.haskell.lib;
    in {
      ffi-emscripten = super.callPackage ../hs/pkg.nix { };
      extra = hs.dontCheck super.extra;
      quickcheck-assertions = hs.dontCheck super.quickcheck-assertions;
      QuickCheck = hs.dontCheck super.QuickCheck;
      tasty-quickcheck = hs.dontCheck super.tasty-quickcheck;
      terminal-size =
        super.callCabal2nix "terminal-size" sources.terminal-size { };
      time-compat = hs.dontCheck super.time-compat;
    };

  pkgs-overlay = self: super: {
    _here = {
      ghc865 = super.haskell.packages.ghc865.override {
        overrides = ghc-overrides self;
      };
      ghcjs86 = super.haskell.packages.ghcjs.override {
        overrides = ghcjs-overrides self;
      };
      _shell = self.mkShell {
        buildInputs = [
          self.emscripten
          self.nodejs
          self._here.ghc865.ghc
          (self._here.ghcjs86.ghcWithPackages (p: [ p.ghcjs-base ]))
        ];
      };
    };
  };

in import sources.nixpkgs { overlays = [ pkgs-overlay ]; }

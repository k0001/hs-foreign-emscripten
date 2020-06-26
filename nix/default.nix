let
  sources = import ./sources.nix;

  ghcjs-overrides = pkgs: self: super:
    let hs = pkgs.haskell.lib;
    in {
      foreign-emscripten = super.callPackage ../foreign-emscripten/pkg.nix { };

      extra = hs.dontCheck super.extra;
      quickcheck-assertions = hs.dontCheck super.quickcheck-assertions;
      QuickCheck = hs.dontCheck super.QuickCheck;
      tasty-quickcheck = hs.dontCheck super.tasty-quickcheck;
      terminal-size =
        super.callCabal2nix "terminal-size" sources.terminal-size { };
      time-compat = hs.dontCheck super.time-compat;

      _shell = super.shellFor {
        withHoogle = false;
        packages = p: [ p.foreign-emscripten ];
        nativeBuildInputs = [ pkgs.emscripten pkgs.nodejs ];
      };
    };

  pkgs-overlay = self: super: {
    _here = {
      ghcjs86 = super.haskell.packages.ghcjs.override {
        overrides = ghcjs-overrides self;
      };
    };
  };

in import sources.nixpkgs { overlays = [ pkgs-overlay ]; }

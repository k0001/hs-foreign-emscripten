# DISPATCH GHCJS CCALL TO EMSCRIPTEN

__WARNING__ Proper packaging as a Haskell library coming soon.

__WARNING__ Proper packaging as a JavaScript library coming soon.

__WARNING__ Proper documentation coming soon.

Want to see this running? `nix-shell --run ./test`


## What the C?

As described in the [GHCJS FFI documentation](https://github.com/ghcjs/ghcjs/blob/master/doc/foreign-function-interface.md),
Haskell performing a CCALL to a C function named `foo` gets
replaced with an application of a JavaScript function called `h$foo` to
a number of arguments mangled to fit JavaScript expectations (e.g., `Word64`
values are split in half and passed as two separate arguments).

Emscripten is a C compiler that generates JavaScript code using its
conventions, different from GHCJS's, for receiving CCALLs. It also has a memory
heap separate from the one GHCJS code uses.

`ghcjs-ccall-emscripten` is a set of tools for generating the `h$foo` definition
automatically, based on the expected CCALL type and the Emscripted-compiled C
implementation of `foo`. All argument mangling back and forth between GHCJS,
Emscripten and JavaScript happens safely behind the scenes.

## Example

The `test.c` file, which is compiled with Emscripten, has this:

```c
/* Copy the C-string in `src` to `dst`, return its length */
int fun9(char *dst, char *src) { … }
```

In `test.hs`, is compiled with GHCJS, we have a CCALL for `fun9`:

```haskell
foreign import ccall "fun9" c_fun9 :: CString -> CString -> IO CInt
```

When we use `c_fun9` in `test.hs`, GHCJS will apply `h$fun9` to the mangled
versions of the two `CString`s. `h$fun9` is defined in `test.js` using
`wrap` from `index.ts`.

```javascript
const w = require('$this-very-awesome-library');
const t = require('$the-emscripten-compiled-code');

h$fun9 = w.wrap({
    mod: t,             // This is the module where the Emscripten heap lives.
    fun: t._fun9,       // This is the Emscripten-compiled function.
    ret: w.Ret.VAL,     // Return type is an int, a simple JavaScript value.
    args: [ w.Arg.BUFW  // First CCALL parameter (dst) is a buffer for writing.
          , w.Arg.BUFR  // Second CCALL parameter (src) is a buffer for reading.
          ]
});
````

More documentation and decent packaging coming soon.



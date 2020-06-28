# foreign-emscripten

Dispatch GHCJS FFI CCALLs to code compiled by Emscripten.

__WARNING__ This probably doesn't cover all cases it should.

__WARNING__ This is not optimized for performance yet.

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

A `.c` file, which is compiled with Emscripten, has this:

```c
/* Copy the C-string in `src` to `dst`, return its length */
int fun(char *dst, char *src) { … }
```

A `.hs` file, compiled with GHCJS, we have a CCALL to `fun`:

```haskell
foreign import ccall "fun" c_fun :: CString -> CString -> IO CInt
```

When we use `c_fun` in the `.hs` file, GHCJS will apply `h$fun` to the mangled
versions of the two `CString`s in JavaScript. `h$fun` is defined using
in the tools from `Foreign.Emscripten`.

This works in Node and in web browsers.



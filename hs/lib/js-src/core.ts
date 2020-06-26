/* Possible argument types for a ccall */
export enum Arg {
    VAL = 1,    // Single JS value.
    I64 = 2,    // 64-bit integer.
    BUFR = 4,   // Pointer to data to be read. GhcjsBuf.
    BUFW = 8,   // Pointer to data to be written to. GhcjsBuf.
    BUFZ = 16,  // Poniter to sensitive data to be zeroed after use. GhcjsBuf.
}

/* Possible return types from a ccall */
export enum Ret {
    VOID = 1, // Void.
    VAL = 2,  // Single JS value.
    I64 = 4,  // 64-bit integer.
    STR = 8,  // NUL-terminated C string.
}

export type Size = number;

type Offset = number;

/* Argument for an Emscripten ccall */
export type EmArg = any;

/* Return from an Emscripten ccall */
export type EmRet = any;

/* A pointer in Emscripten's address space */
export type EmPtr = number;

/* An Emscripten module */
export interface EmMod {
    readonly _malloc: (s: Size) => EmPtr;
    readonly _free: (ep: EmPtr) => void;
    HEAPU8: Uint8Array;
    readonly getTempRet0: () => any; // Second part of size-2 return values
                                     // (e.g., high bits in 64 bit integers).
}

/* Global variables we use */
interface Global {
    h$newByteArray: (s: Size) => GhcjsBuf;
    h$ret1: any; // Second part of size-2 ccall return values in GHCJS.
                 // (e.g., low bits in 64 bit ints, offset in pointers).
    [prop: string]: any;
}

declare const h$newByteArray: Global['h$newByteArray'];
declare let h$ret1: Global['h$ret1'];

/* Options used as parameters to 'wrap' */
export interface Opts {
    /* The Emscripten function we wrap. */
    readonly fun: (...emArgs: EmArg[]) => EmRet;
    /* The ccall return type. */
    readonly ret: Ret;
    /* The ccall argument types. */
    readonly args: Arg[];
    /* The Emscripten module. */
    readonly mod: EmMod;
}

function checkOpts(opts : Opts) : void {
    if (typeof opts.fun  === 'undefined') throw "Undefined fun";
    if (typeof opts.ret  === 'undefined') throw "Undefined ret";
    if (typeof opts.mod  === 'undefined') throw "Undefined mod";
    if (typeof opts.args === 'undefined') throw "Undefined args";
}

/* Argument to a GHCJS ccall */
export type GhcjsArg = any;

/* Return from an GHCJS ccall */
export type GhcjsRet = any;

/* The thing returned by GHCJS's h$newByteArray, more or less */
interface GhcjsBuf {
    u8: Uint8Array;
}

/* This probably doesn't cover all scenarios, but it works for us so far */
export interface GhcjsPtr {
    buf: GhcjsBuf;
    off: Offset;
}

export function mkGhcjsPtr(buf: GhcjsBuf, off: Offset): GhcjsPtr {
    if (typeof buf.u8 === 'undefined') throw "Undefined buf";
    if (off !== 0) throw "Unexpected off";
    return { buf, off };
}

/* Internal state for a single 'wrap'ped call */
interface State {
    /* Functions to be called before the Emscripten ccall */
    readonly pre: (() => void)[];
    /* Functions to be called after successfully performing the ccall */
    readonly post: (() => void)[];
    /* Functions to be called before returning, no matter what */
    readonly clean: (() => void)[];
}

function newState(): State { return { pre: [], post: [], clean: [] }; }

function addPre(s: State, f: () => void): void { s.pre.push(f); }
function runPre(s: State): void {
    for (;;) {
        const f = s.pre.shift();
        if (typeof f !== 'undefined') { f(); } else { break; }
    }
}

function addPost(s: State, f: () => void): void { s.post.push(f); }
function runPost(s: State): void {
    for (;;) {
        const f = s.post.shift();
        if (typeof f !== 'undefined') { f(); } else { break; }
    }
}

function addClean(s: State, f: () => void): void { s.clean.unshift(f); }
function runClean(s: State): void {
    for (;;) {
        try {
            const f = s.clean.shift();
            if (typeof f !== 'undefined') { f(); } else { break; }
        } catch { };
    }
}

/* TODO mkMkEmArgs */
function mkEmArgs(s: State, opts: Opts, ghcjsArgs: GhcjsArg[]): EmArg[] {
    const emArgs: EmArg[] = [];
    for (let i = 0; i < opts.args.length; i++) {
        const arg: Arg = opts.args[i];

        if (arg & Arg.VAL) {
            emArgs.push(ghcjsArgs.shift());

        } else if (arg & Arg.I64) {
            const hi : number = ghcjsArgs.shift();
            const lo : number = ghcjsArgs.shift();
            emArgs.push(lo);
            emArgs.push(hi);

        } else if (arg & (Arg.BUFR | Arg.BUFW | Arg.BUFZ)) {
            const ghBuf : GhcjsBuf = ghcjsArgs.shift();
            const ghOff : Offset = ghcjsArgs.shift();
            const ghPtr : GhcjsPtr = mkGhcjsPtr(ghBuf, ghOff);

            const size: Size = ghBuf.u8.byteLength;
            const emPtr: EmPtr = opts.mod._malloc(size);
            addClean(s, () => {
                opts.mod._free(emPtr);
            });

            if (arg & Arg.BUFR) {
                addPre(s, () => {
                    const emData: Uint8Array =
                        new Uint8Array(opts.mod.HEAPU8.buffer, emPtr, size);
                    emData.set(ghBuf.u8);
                });
            }
            if (arg & Arg.BUFW) {
                addPost(s, () => {
                    const emData: Uint8Array =
                       new Uint8Array(opts.mod.HEAPU8.buffer, emPtr, size);
                    ghBuf.u8.set(emData);
                });
            }
            if (arg & Arg.BUFZ) {
                addClean(s, () => {
                    opts.mod.HEAPU8.fill(0, emPtr, emPtr + size);
                });
            }
            emArgs.push(emPtr);

        } else { throw "Unhandled Arg"; }
    }

    if (ghcjsArgs.length !== 0) {
        throw "Unhandled args remain";
    }

    return emArgs;
}

function mkMkGhcjsRet(opts: Opts): (s: State, emRet: EmRet) => GhcjsRet {
    switch (opts.ret) {
        case Ret.VOID: return (s, ignore: undefined) => { };
        case Ret.VAL: return (s, emRet: any) => { return emRet; };
        case Ret.I64:
            return (s, lo: number) => {
                const hi: number = opts.mod.getTempRet0();
                h$ret1 = lo; // lo
                return hi;
            };
        case Ret.STR:
            return (s, emPtr: EmPtr) => {
                const emData: Uint8Array =
                   new Uint8Array(opts.mod.HEAPU8.buffer, emPtr);
                let ixNul: number = emData.indexOf(0);
                if (ixNul < 0) throw "C string is not NUL terminated!"
                const bufSize : Size = ixNul + 1;
                const emCStr: Uint8Array =
                   new Uint8Array(opts.mod.HEAPU8.buffer, emPtr, bufSize);
                const ghcjsBuf: GhcjsBuf = h$newByteArray(bufSize);
                ghcjsBuf.u8.set(emCStr);
                h$ret1 = 0; // GhcjsPtr.off
                return ghcjsBuf; // GhcjsPtr.off
            };
        default:
            throw "Unhandled Ret";
    };
};

/* Intended usage:

     h$foo = wrap({ mod: m, fun: m._foo, ret: Ret.VAL, args: [Arg.I64] });

   Or something along those lines.
*/
export function wrap(opts : Opts): (...ghcjsArgs: GhcjsArg[]) => GhcjsRet {
    checkOpts(opts);
    const mkGhcjsRet: (s: State, emRet: EmRet) => GhcjsRet = mkMkGhcjsRet(opts);
    return (...ghcjsArgs: GhcjsArg[]) => {
        const s: State = newState();
        const emArgs: EmArg[] = mkEmArgs(s, opts, ghcjsArgs);
        var ghcjsRet: GhcjsRet;
        try {
            runPre(s);
            const emRet: EmRet = opts.fun.apply(null, emArgs);
            ghcjsRet = mkGhcjsRet(s, emRet);
        } catch(e) { runClean(s); throw e; }
        try { runPost(s); } finally { runClean(s); }
        return ghcjsRet;
    }
}


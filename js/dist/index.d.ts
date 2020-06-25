export declare enum Arg {
    VAL = 1,
    I64 = 2,
    BUFR = 4,
    BUFW = 8,
    BUFZ = 16
}
export declare enum Ret {
    VOID = 1,
    VAL = 2,
    I64 = 4,
    STR = 8
}
export declare type Size = number;
declare type Offset = number;
export declare type EmArg = any;
export declare type EmRet = any;
export declare type EmPtr = number;
export interface EmMod {
    readonly _malloc: (s: Size) => EmPtr;
    readonly _free: (ep: EmPtr) => void;
    HEAPU8: Uint8Array;
    readonly getTempRet0: () => any;
}
export interface Opts {
    readonly fun: (...emArgs: EmArg[]) => EmRet;
    readonly ret: Ret;
    readonly args: Arg[];
    readonly mod: EmMod;
}
export declare type GhcjsArg = any;
export declare type GhcjsRet = any;
interface GhcjsBuf {
    u8: Uint8Array;
}
export interface GhcjsPtr {
    buf: GhcjsBuf;
    off: Offset;
}
export declare function mkGhcjsPtr(buf: GhcjsBuf, off: Offset): GhcjsPtr;
export declare function wrap(opts: Opts): (...ghcjsArgs: GhcjsArg[]) => GhcjsRet;
export {};
//# sourceMappingURL=index.d.ts.map
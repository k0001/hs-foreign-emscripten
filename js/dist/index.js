"use strict";
exports.__esModule = true;
exports.wrap = exports.mkGhcjsPtr = exports.Ret = exports.Arg = void 0;
/* Possible argument types for a ccall */
var Arg;
(function (Arg) {
    Arg[Arg["VAL"] = 1] = "VAL";
    Arg[Arg["I64"] = 2] = "I64";
    Arg[Arg["BUFR"] = 4] = "BUFR";
    Arg[Arg["BUFW"] = 8] = "BUFW";
    Arg[Arg["BUFZ"] = 16] = "BUFZ";
})(Arg = exports.Arg || (exports.Arg = {}));
/* Possible return types from a ccall */
var Ret;
(function (Ret) {
    Ret[Ret["VOID"] = 1] = "VOID";
    Ret[Ret["VAL"] = 2] = "VAL";
    Ret[Ret["I64"] = 4] = "I64";
    Ret[Ret["STR"] = 8] = "STR";
})(Ret = exports.Ret || (exports.Ret = {}));
function checkOpts(opts) {
    if (typeof opts.fun === 'undefined')
        throw "Undefined fun";
    if (typeof opts.ret === 'undefined')
        throw "Undefined ret";
    if (typeof opts.mod === 'undefined')
        throw "Undefined mod";
    if (typeof opts.args === 'undefined')
        throw "Undefined args";
}
function mkGhcjsPtr(buf, off) {
    if (typeof buf.u8 === 'undefined')
        throw "Undefined buf";
    if (off !== 0)
        throw "Unexpected off";
    return { buf: buf, off: off };
}
exports.mkGhcjsPtr = mkGhcjsPtr;
function newState() { return { pre: [], post: [], clean: [] }; }
function addPre(s, f) { s.pre.push(f); }
function runPre(s) {
    for (;;) {
        var f = s.pre.shift();
        if (typeof f !== 'undefined') {
            f();
        }
        else {
            break;
        }
    }
}
function addPost(s, f) { s.post.push(f); }
function runPost(s) {
    for (;;) {
        var f = s.post.shift();
        if (typeof f !== 'undefined') {
            f();
        }
        else {
            break;
        }
    }
}
function addClean(s, f) { s.clean.unshift(f); }
function runClean(s) {
    for (;;) {
        try {
            var f = s.clean.shift();
            if (typeof f !== 'undefined') {
                f();
            }
            else {
                break;
            }
        }
        catch (_a) { }
        ;
    }
}
/* TODO mkMkEmArgs */
function mkEmArgs(s, opts, ghcjsArgs) {
    var emArgs = [];
    var _loop_1 = function (i) {
        var arg = opts.args[i];
        if (arg & Arg.VAL) {
            emArgs.push(ghcjsArgs.shift());
        }
        else if (arg & Arg.I64) {
            var hi = ghcjsArgs.shift();
            var lo = ghcjsArgs.shift();
            emArgs.push(lo);
            emArgs.push(hi);
        }
        else if (arg & (Arg.BUFR | Arg.BUFW | Arg.BUFZ)) {
            var ghBuf_1 = ghcjsArgs.shift();
            var ghOff = ghcjsArgs.shift();
            var ghPtr = mkGhcjsPtr(ghBuf_1, ghOff);
            var size_1 = ghBuf_1.u8.byteLength;
            var emPtr_1 = opts.mod._malloc(size_1);
            addClean(s, function () {
                opts.mod._free(emPtr_1);
            });
            if (arg & Arg.BUFR) {
                addPre(s, function () {
                    var emData = new Uint8Array(opts.mod.HEAPU8.buffer, emPtr_1, size_1);
                    emData.set(ghBuf_1.u8);
                });
            }
            if (arg & Arg.BUFW) {
                addPost(s, function () {
                    var emData = new Uint8Array(opts.mod.HEAPU8.buffer, emPtr_1, size_1);
                    ghBuf_1.u8.set(emData);
                });
            }
            if (arg & Arg.BUFZ) {
                addClean(s, function () {
                    opts.mod.HEAPU8.fill(0, emPtr_1, emPtr_1 + size_1);
                });
            }
            emArgs.push(emPtr_1);
        }
        else {
            throw "Unhandled Arg";
        }
    };
    for (var i = 0; i < opts.args.length; i++) {
        _loop_1(i);
    }
    if (ghcjsArgs.length !== 0) {
        throw "Unhandled args remain";
    }
    return emArgs;
}
function mkMkGhcjsRet(opts) {
    switch (opts.ret) {
        case Ret.VOID: return function (s, ignore) { };
        case Ret.VAL: return function (s, emRet) { return emRet; };
        case Ret.I64:
            return function (s, lo) {
                var hi = opts.mod.getTempRet0();
                h$ret1 = lo; // lo
                return hi;
            };
        case Ret.STR:
            return function (s, emPtr) {
                var emData = new Uint8Array(opts.mod.HEAPU8.buffer, emPtr);
                var ixNul = emData.indexOf(0);
                if (ixNul < 0)
                    throw "C string is not NUL terminated!";
                var bufSize = ixNul + 1;
                var emCStr = new Uint8Array(opts.mod.HEAPU8.buffer, emPtr, bufSize);
                var ghcjsBuf = h$newByteArray(bufSize);
                ghcjsBuf.u8.set(emCStr);
                h$ret1 = 0; // GhcjsPtr.off
                return ghcjsBuf; // GhcjsPtr.off
            };
        default:
            throw "Unhandled Ret";
    }
    ;
}
;
/* Intended usage:

     h$foo = wrap({ mod: m, fun: m._foo, ret: Ret.VAL, args: [Arg.I64] });

   Or something along those lines.
*/
function wrap(opts) {
    checkOpts(opts);
    var mkGhcjsRet = mkMkGhcjsRet(opts);
    return function () {
        var ghcjsArgs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            ghcjsArgs[_i] = arguments[_i];
        }
        var s = newState();
        var emArgs = mkEmArgs(s, opts, ghcjsArgs);
        var ghcjsRet;
        try {
            runPre(s);
            var emRet = opts.fun.apply(null, emArgs);
            ghcjsRet = mkGhcjsRet(s, emRet);
        }
        catch (e) {
            runClean(s);
            throw e;
        }
        try {
            runPost(s);
        }
        finally {
            runClean(s);
        }
        return ghcjsRet;
    };
}
exports.wrap = wrap;
//# sourceMappingURL=index.js.map
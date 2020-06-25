const w = require('./gce.js');
const t = require('./test.em.js');

export const h$fun1 = w.wrap({
    mod: t,
    fun: t._fun1,
    ret: w.Ret.VAL,
    args: []
});

export const h$fun2 = w.wrap({
    mod: t,
    fun: t._fun2,
    ret: w.Ret.VAL,
    args: [w.Arg.VAL]
});

export const h$fun3 = w.wrap({
    mod: t,
    fun: t._fun3,
    ret: w.Ret.VAL,
    args: [w.Arg.VAL, w.Arg.VAL]
});

export const h$fun4 = w.wrap({
    mod: t,
    fun: t._fun4,
    ret: w.Ret.I64,
    args: []
});

export const h$fun5 = w.wrap({
    mod: t,
    fun: t._fun5,
    ret: w.Ret.I64,
    args: [w.Arg.I64]
});

export const h$fun6 = w.wrap({
    mod: t,
    fun: t._fun6,
    ret: w.Ret.I64,
    args: [w.Arg.I64, w.Arg.I64]
});

export const h$fun7 = w.wrap({
    mod: t,
    fun: t._fun7,
    ret: w.Ret.VOID,
    args: []
});

export const h$fun8 = w.wrap({
    mod: t,
    fun: t._fun8,
    ret: w.Ret.VAL,
    args: [w.Arg.BUFR | w.Arg.BUFZ]
});

export const h$fun9 = w.wrap({
    mod: t,
    fun: t._fun9,
    ret: w.Ret.VAL,
    args: [ w.Arg.BUFW | w.Arg.BUFZ
          , w.Arg.BUFR | w.Arg.BUFZ ]
});

export const h$fun10 = w.wrap({
    mod: t,
    fun: t._fun10,
    ret: w.Ret.STR,
    args: []
});

export const h$fun11 = w.wrap({
    mod: t,
    fun: t._fun11,
    ret: w.Ret.STR,
    args: [w.Arg.BUFR]
});

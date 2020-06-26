const m = require('./core.ts');

export const { Ret, Arg } = m;

export function wrap(mod, fun, ret, args) {
    return m.wrap({ mod: mod, fun: fun, ret: ret, args: args });
}

export function setGlobal(name, value) {
    global[name] = value;
}

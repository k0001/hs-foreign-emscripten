const m = require('./core.ts');

export const { Ret, Arg, wrap } = m;

export function setGlobal(name, value) {
    global[name] = value;
}

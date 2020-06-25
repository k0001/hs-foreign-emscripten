export { Ret, Arg, wrap } from '../../js/dist/index.js';

export function setGlobal(name, value) { global[name] = value; }

/*
var g;
if (typeof globalThis !== 'undefined') { g = globalThis; }
else if (typeof global !== 'undefined') { g = global; }
else if (typeof window !== 'undefined') { g = window; }
else { throw "No globalThis, global or window"; }
*/

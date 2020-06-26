const mkM = require('./funz.js');
const m = mkM();

export const { HEAPU8, getTempRet0, _malloc, _free,
               _fun1, _fun2, _fun3, _fun4, _fun5, _fun6,
               _fun7, _fun8, _fun9, _fun10, _fun11 } = m;

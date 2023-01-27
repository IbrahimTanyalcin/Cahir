(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Chain = factory());
})(this, (function () { 'use strict';

    var orCall = Function.prototype.call;

    function Chain(o) {
        const pChain = Object.assign(
            Object.create(Chain.prototype),
            o?.__proto__,
            o
        ),
            chain = o?.__init__ || function () { return this },
            prx = new Proxy(chain, Object.assign({
                apply: function (trgt, that, args) {
                    return orCall.call(trgt, prx, ...args);
                },
                get: function (trgt, prop, receiver) {
                    if (prop === "__self__") {
                        return trgt;
                    } else if (prop === "__proxy__") {
                        return prx;
                    }
                    return trgt[prop]?.bind?.(prx) ?? trgt[prop];
                }
            }, o?.__handler__));
        chain.__proxy__ = prx;
        Object.setPrototypeOf(chain, pChain);
        return prx;
    }

    Chain.prototype = Object.create(Function.prototype);

    Chain.tagify = (
        {
            delim = " ",
            strTransform = str => str.trim(),
            valTransform = (thisArg, strings, stringsTransformed) =>
                (val, index, vals) =>
                    typeof val === "function"
                        ? val({
                            thisArg,
                            self: val,
                            index,
                            values: vals,
                            strings,
                            stringsTransformed
                        })
                        : val
        } = {}
    ) => (f) => function (...args) {
        if (args?.[0]?.raw && Object.isFrozen(args[0])) {
            const strs = args[0].map(strTransform),
                vals = args.slice(1).map(valTransform(this, args[0], strs));
            for (let i = 0, fields, strs_i, spread, len = vals.length; i < len; ++i, spread = 0) {
                strs_i = strs[i];
                if (strs_i.slice(-3) === "...") {
                    strs_i = strs_i.slice(0, -3);
                    spread = 1;
                }
                fields = strs_i.split(delim).filter(d => d);
                switch ((spread << 1) + (fields.length > 1)) {
                    case 0:
                        this[fields[0]](vals[i]);
                        break;
                    case 1:
                        this[fields[0]](fields[1], vals[i]);
                        break;
                    case 2:
                        this[fields[0]](...vals[i]);
                        break;
                    case 3:
                        this[fields[0]](fields[1], ...vals[i]);
                        break;
                }
            }
            return this;
        }
        return f?.call?.(this, ...args);
    };

    Chain.lambda = (f) => function (...args) {
        f?.call?.(...args);
        return this;
    };

    return Chain;

}));

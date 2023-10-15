(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Cahir = factory());
})(this, (function () { 'use strict';

    var orCall = Function.prototype.call;

    function Chain(o) {
        const pChain = Object.assign(
            Object.create(Chain.prototype),
            o?.__pr0t0__,
            o
        ),
            chain = o?.__init__ || function () { return this },
            prx = new Proxy(chain, Object.assign({
                apply: function (trgt, that, args) {
                    let next = () => {next = false;},
                        ceptor;
                    if (ceptor = trgt.__interceptApply__){
                        ceptor = orCall.call(ceptor, prx, next, ...args);
                        if(next){return ceptor}
                    }
                    return orCall.call(trgt, prx, ...args);
                },
                get: function (trgt, prop, receiver) {
                    let next = () => {next = false;},
                        ceptor;
                    if (ceptor = trgt.__interceptGet__){
                        ceptor = orCall.call(ceptor, prx, next, prop, receiver);
                        if(next){return ceptor}
                    }
                    if (prop === "__self__") {
                        return trgt;
                    } else if (prop === "__proxy__") {
                        return prx;
                    }
                    return trgt[prop]?.bind?.(prx) ?? trgt[prop];
                }
            }, o?.__handler__));
        chain.__proxy__ = prx;
        chain.__origin__ = o;
        Object.setPrototypeOf(chain, pChain);
        return prx;
    }

    Chain.prototype = Object.create(Function.prototype);

    const symbols = {
        isPickle: Symbol("isPickle")
    };
    const {isPickle} = symbols;

    var defaultParams = {
        delim: " ",
        strTransform: str => str.trim(),
        valTransform: (thisArg, strings, stringsTransformed, rawVals) => {
            const 
                rawValsLen = rawVals.length,
                isNamedParam = /(?<param>[A-Z]+):$/gi;
            stringsTransformed.forEach(function(d,i,a){
                if (i >= rawValsLen) {
                    return;
                }
                const [{groups:{param}} = {groups:{}}] = [
                    ...d.matchAll(isNamedParam)
                ];
                if (param){
                    rawVals[param] = rawVals[i];
                    stringsTransformed[i] = d.slice(0, d.lastIndexOf(param));
                }
            },thisArg);
            return (val, index, vals) =>
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
        }
    };

    var errors = Object.defineProperties(
        {},
        {
            _noTTError: {
                enumerable: false,
                configurable: false,
                get: function(){return new Error("Pickle method only accepts a tagged template");}
            }
        }
    );

    Chain.tagify = (
        {
            delim = defaultParams.delim,
            strTransform = defaultParams.strTransform,
            valTransform = defaultParams.valTransform
        } = {}
    ) => (f) => {
        const
            fname = "taggified " + f.name, 
            namespace = {
            [fname]: function (...args) {
                let strs,
                    vals;
                if (args?.[0]?.raw && Object.isFrozen(args[0])) {
                    ({strs, vals} = this.pickle(...args));
                } else if (args?.[0]?.hasOwnProperty(isPickle)) {
                    ({strs, vals} = args[0]);
                } else {
                    return f?.call?.(this, ...args);
                }
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
        };
        namespace[fname].pickle = function(...args){
            if (args?.[0]?.raw && Object.isFrozen(args[0])) {
                const
                    rawVals = args.slice(1),
                    strs = args[0].map(strTransform),
                    vals = rawVals.map(valTransform(this, args[0], strs, rawVals));
                return {strs, vals, [isPickle]: true}
            } else {
                throw errors._noTTError
            }
        };
        return namespace[fname];
    };

    Chain.lambda = (f) => function (...args) {
        f?.call?.(...args);
        return this;
    };

    return Chain;

}));

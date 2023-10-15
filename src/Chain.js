import orCall from "./originalCall.js";

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
                    ceptor = orCall.call(ceptor, prx, next, ...args)
                    if(next){return ceptor}
                }
                return orCall.call(trgt, prx, ...args);
            },
            get: function (trgt, prop, receiver) {
                let next = () => {next = false;},
                    ceptor;
                if (ceptor = trgt.__interceptGet__){
                    ceptor = orCall.call(ceptor, prx, next, prop, receiver)
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

export {Chain}
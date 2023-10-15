import { Chain } from "./Chain.js"
import {isPickle} from "./symbols.js";
import defaultParams from "./defaults.js";
import errors from "./errors.js";

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
    }
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
    }
    return namespace[fname];
};
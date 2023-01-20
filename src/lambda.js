import { Chain } from "./Chain.js"

Chain.lambda = (f) => function (...args) {
    f?.call?.(...args);
    return this;
}
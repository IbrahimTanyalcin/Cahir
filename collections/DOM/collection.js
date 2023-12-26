import { __init__ } from "./init";
import select from "./select";

const ch = new Cahir({
    __init__,
    select
});

try {
    const attr = document.currentScript.getAttribute("global-name");
    window[attr] = ch;
} catch {}

export default ch
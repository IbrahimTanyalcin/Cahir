import {render as render_inner} from "./render_card.js";
function gamecard({name, attrs, styles, props, data, el}){
    const {values, d} = data;
    ch`
    -> ${el}
    >> innerHTML ${render_inner(values, d)}
    style ${[
        ["width", `calc(100% - ${
            2 * values.itemMargin
        }px)`],
        ["border-radius", "1rem"],
        ["padding", "0.5rem"],
        ["text-align", "center"],
        ["margin", values.itemMargin + "px"],
        ["cursor", "pointer"],
        ["transition", "all 1s ease"]
    ]}
    addClass ${"item"}
    => ${() => () => {
        let node = ch.selected;
        requestAnimationFrame(() => {
            ch.addClass(
                ["animated", "fadeInUp"],
                node
            )
        })
    }}
    animate ...${[[],{duration:1000}]}
    >> dataRef ${d}
    `
}

export const render = gamecard;
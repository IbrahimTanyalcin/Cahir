import ch from "../../collections/DOM/ch.0.0.10.es.js";
function bioinfoInput({name, attrs, styles, props, data, el, proto}) {
    if (!el.initialized){
      proto.initialized = true;
      proto.value = function(){
        const val = ch(this.shadowRoot).select("input").get("value");
        if (this.anycase) {return val}
        return val.toUpperCase()
      }
      proto.disable = function(){
        ch(this.shadowRoot).select("input").satr("disabled","");
        return this;
      }
      proto.enable = function(){
        this.shadowRoot.querySelector("input").removeAttribute("disabled");
        return this;
      }
    }
    const shadow = el.attachShadow({ mode: "open" });
    ch(el)`
    style ${[
      ["display", "block"],
      ["position", "relative"],
      ["margin", "auto"],
      ["transition", "all 1s ease"],
      ["box-sizing", "border-box"]
    ]}
    => ${({values:v}) => () => {
      v.label = el.label = ch.gatr("data-label") || "placeholder";
      v.fadein = el.fadein = (ch.gatr("data-fadein") ?? null) !== null ? 1 : 0;
      v.anycase = el.anycase = (ch.gatr("data-anycase") ?? null) !== null ? 1 : 0;
      v.colors = el.colors = Object.fromEntries((ch.gatr("data-colors") ?? "").split(",").filter(Boolean).reduce((ac,d,i,a) => {
        if(!(i % 2)){
          ac.push([d, a[i+1]])
        }
        return ac;
      },[]));
      v.title = el.title = ch.gatr("data-title") || "";
    }}
    -> ${shadow}
    => ${({values:v}) => () => {
      ch`+> ${ch.dom`
        <style data-for="bioinfo-input">
          .container {
            flex: 1 1 auto;
            width:100%;
            padding-top: 1rem;
            padding-bottom: 1rem;
            ${
              v.fadein 
              ? "animation: fadein-translate-y 0.75s ease-in-out 0s 1 normal forwards running;"
              : ""
            }
          }
          .container > *:first-child {
            display:block;
            width:100%;
            height:100%;
          }
          * {
            box-sizing: border-box;
          }
          .inp {
            position: relative;
            margin: auto;
            width: 100%;
          }
          .inp .label {
            position: absolute;
            top: 16px;
            left: 0;
            font-size: 16px;
            color: ${v.colors.heading || "var(--heading-color, #9098a9)"};
            font-weight: 500;
            transform-origin: 0 0;
            transition: all 0.2s ease;
            pointer-events: none;
          }
          .inp .border {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 2px;
            width: 100%;
            background: ${v.colors.border || "var(--border-color, #07f)"};
            transform: scaleX(0);
            transform-origin: 0 0;
            transition: all 0.15s ease;
          }
          .inp input {
            -webkit-appearance: none;
            width: 100%;
            border: 0;
            font-family: inherit;
            padding: 12px 0;
            height: 48px;
            font-size: 16px;
            font-weight: 500;
            border-bottom: 2px solid ${v.colors.shadow || "var(--shadow-color, #c8ccd4)"};
            background: none;
            border-radius: 0;
            color: ${v.colors.font || "var(--font-color, DarkSlateGray)"};
            text-transform: ${v.anycase ? "none" : "uppercase"};
            cursor: pointer;
            transition: all 0.15s ease;
          }
          .inp input:hover {
            background: ${v.colors.hover || "var(--hover-color , var(--bg-color-transparent, rgba(34,50,84,0.03)))"};
          }
          .inp input:not(:placeholder-shown) + span {
            color: ${v.colors.border || "var(--border-color, #5a667f)"};
            transform: translateY(-26px) scale(0.75);
            opacity: 0.5
          }
          .inp input:not(:-ms-input-placeholder) + span {
            color: ${v.colors.border || "var(--border-color, #5a667f)"};
            transform: translateY(-26px) scale(0.75);
            opacity: 0.5
          }
          .inp input:focus {
            background: none;
            outline: none;
          }
          .inp input:focus + span {
            color: ${v.colors.border || "var(--border-color, #07f)"};
            transform: translateY(-26px) scale(0.75);
          }
          .inp input:focus + span + .border {
            transform: scaleX(1);
          }
          @keyframes fadein-translate-y {
            0% {
              visibility: visible;
              transform: translate(0%, 50%);
              opacity: 0;
            }
            100% {
              transform: translate(0%,0%);
              opacity: 1;
              visibility: visible;
            }
          }
          </style>
        `}
        +-> ${ch.dom`
          <div class="container">
            <label for="inp" class="inp">
              <input ${v.title ? `title="${v.title}"` : ""} type="text" placeholder="&nbsp;">
              <span class="label">${v.label}</span>
              <span class="border"></span>
            </label>
          </div>
        `}`
    }}
    `
  }
  
  ch.adopt("bioinfo-input", bioinfoInput)`<bioinfo-input ${{}}/>`
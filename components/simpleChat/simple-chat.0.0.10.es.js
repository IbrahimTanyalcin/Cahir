import ch from "../../collections/DOM/ch.0.0.10.es.js";
const simpleChat = ((symbols) => {
    "use strict";
    const wk = new WeakMap(),
          noOp = () => {},
          setShift = set => {
              const [firstItem] = set;
              set.delete(firstItem);
              return firstItem;
          },
          setGetLast = set => [...set].at(-1), 
          isNearBot = function(element, epsilon = 16){
            return element.scrollHeight - element.scrollTop - element.clientHeight <= epsilon;
          },
          /*
            TODO, backport this to https://github.com/IbrahimTanyalcin/Cahir/blob/master/collections/DOM/
            DO NOT forget to uncomment 'this.lastOP = '
          */
          throttle_v2 = function(f, {thisArg = void(0), delay=100, defer=true} = {}){
              const 
                  that = this,
                  settle = (args) => {
                      resolver?.(f.apply(thisArg, args));
                      resolver = prom = null;
                      tmstmp = performance.now();
                  };
              let timeout,
                  prom,
                  resolver,
                  tmstmp = performance.now();
              return /*this.lastOp = */function(...args) {
                  clearTimeout(timeout);
                  thisArg = thisArg ?? that;
                  let elapsed = performance.now() - tmstmp;
                  if (resolver) {
                      if (defer || (!defer && elapsed < delay)) {
                          timeout = setTimeout(() => {
                              settle(args);
                          }, delay);
                      } else {
                          settle(args);
                      }
                      return prom;
                  }
                  return prom = new Promise(res => {
                      resolver = res;
                      timeout = setTimeout(() => {
                          settle(args);
                      }, delay);
                  })
              }
          },
          defDangerousParser = ({current, incoming, parent, bubble, chat, component}) => {
            ch(parent)`+> ${ch.dom`${incoming}`} -> ${bubble} +< ${chat}`
          },
          defParser = ({current, incoming, parent, bubble, chat, component}) => {
            ch(parent)`+-> ${ch.span} >> textContent ${incoming} style word-break ${"break-word"} -> ${bubble} +< ${chat}`
          },
          mimeImg = [/^image\/[\w+-]+$/i],
          mimeVid = [/^video\/[\w+-]+$/i, /^application\/vnd\.apple\.mpegurl$/i],
          isImg = (file) => mimeImg.some(r => r.test(file.type)),
          isVid = (file) => mimeVid.some(r => r.test(file.type)),
          isFile = (file) => !isImg(file) && !isVid(file),
          attachFile = function({event:e, values:v}){
            const inp = ch[`input{
              "prop": [["type", "file"], ["multiple", "true"]]
            }`];
            ch(inp).on("change", function(){
              const files = this.files;
              if(!files.length){return}
              for(const file of files){
                const button = ch.dom`<button type="button" title="${file.name}" class="msger-file"></button>`;
                ch(button).set(symbols.file, file).on("click", function(){this.remove()});
                switch (true) {
                  case isImg(file): 
                    if(file.size <= 5242880) {
                      const _url = URL.createObjectURL(file);
                      ch(ch.img).satr("src", _url)
                      .on("load", function(){
                        URL.revokeObjectURL(_url);
                      })
                      .on("error", function(){
                        URL.revokeObjectURL(_url);
                        this.remove();
                        button.innerHTML = `<i class="fa fa-warning"></i>`;
                        button.title = "error preview"
                      })
                      .appendTo(button);
                    } else {
                      button.innerHTML = `<i class="fa fa-image"></i>`;
                    }
                    break;
                  case isVid(file):
                    button.innerHTML = `<i class="fa fa-video-camera"></i>`;
                    break;
                  case isFile(file):
                  default:
                    button.innerHTML = `<i class="fa fa-file"></i>`;
                }
                v.upload.appendChild(button);
              }
            });
            inp.click();
          },
          getInputContents = function(el){
            const v = wk.get(el); //values
            return [...v.input.children].map(d => d.textContent).join("\n");
          },
          getAttachedFiles = function(el){
            const v = wk.get(el); //values
            return [...v.upload.children].map(d => d[symbols.file])
          },
          _onsend = function(f, namespace = ""){
            const v = wk.get(this),
                  state = ch.state(),
                  send = this[symbols.send];
            if(!send){return}
            ch(send).on(`click@${namespace}`, () => this.send(f)).state(state);
            return this;
          },
          _offsend = function(namespace = ""){
            //if(!namespace){return}
            const v = wk.get(this),
                  state = ch.state(),
                  send = this[symbols.send];
            if(!send){return}
            ch(send).off(`@${namespace}`).state(state);
            return this;
          },
          _onready = function(f, ...args){
            this.ready().then(() => f.apply(this, args));
            return this;
          }; 
  return function simpleChat({name, attrs, styles, props, data, el, proto}) {
    if (!el[symbols.initialized]){
      proto[symbols.initialized] = true;
      proto[symbols.nuf] = [null, void(0), false];
      proto[symbols.nue] = [null, void(0), ""];
      proto.remove = function(){
        return ch(this).animate([{
          transform: "translate(0%, -100%)",
          opacity: 0
        }], {duration:1000, easing: "ease-in-out", fill: "both"}).lastOp.then(() => (this.parentNode.removeChild(this), this));
      }
      proto.color = function(f, v) {
        if (f instanceof Array){
          f.forEach(([f,v]) => this.color(f, v))
          return this;
        }
        const colors = Object.fromEntries(
          (ch(this).gatr("data-colors") ?? "")
          .split(",")
          .filter(Boolean)
          .reduce((ac,d,i,a) => {
            if(!(i % 2)){
              ac.push([d, a[i+1]])
            }
            return ac;
        },[]));
        colors[f] = v;
        return ch.satr("data-colors", `${Object.entries(colors).flat()}`).selected;
      }
      proto.css = function (str, pos) {
        const shadow = this.shadowRoot,
              style = shadow.querySelector("style[data-for=simple-chat]"),
              sheet = style.sheet;
        pos = pos ?? sheet.cssRules.length;
        sheet.insertRule(str, pos);
        return this;
      }
      proto.enable = proto.play = function() {
        this.removeAttribute("data-disabled"); return this;
      }
      proto.disable = proto.pause = function() {
        this.setAttribute("data-disabled", ""); return this;
      }
      proto.hideHeader = function() {
        this.setAttribute("data-hide-header", ""); return this;
      }
      proto.showHeader = function() {
        this.removeAttribute("data-hide-header"); return this;
      }
      proto.showTyping = function(ms){ this.setAttribute("data-typing", ms); return this; }
      proto.hideTyping = function(){ this.removeAttribute("data-typing"); return this; }
      proto.setHeaderTitle = function(title){ this.setAttribute("data-title", title ?? ""); return this; }
      proto.disableFile = function(){ this.setAttribute("data-file", "false"); return this; }
      proto.enableFile = function(){ this.removeAttribute("data-file"); return this; }
      proto.changeBackground = function(bg) {
        const v = wk.get(this); //values
        switch (true) {
          case typeof bg === "string":
            v.svg.parentNode.replaceChild(ch.dom`${bg}`, v.svg);
            break;
          case bg?.nodeType === 1:
            v.svg.parentNode.replaceChild(bg, v.svg);
            break;
          default:
            throw new Error("background can be a DOM string or an svg node");
        }
        return this;
      }
      proto.defParser = defParser;
      proto.defDangerousParser = defDangerousParser;
      proto.addBubble = async function({
        side = "left" ,
        avatar = null, 
        name = "anonymous", 
        time = null, 
        content = "", 
        parser = defParser,
        cb = noOp
      }) { 
        const values = wk.get(this);
        if(!values){return}
        let _return, prev = values.chat[symbols.busy];
        let r,j;
        values.chat[symbols.busy] = new Promise((_r, _j) => {[r, j] = [_r, _j]})
        try {
          prev = await prev;
        } catch (err) {
          prev = err
        }
        if(!time){
          time = new Date();
          time = `${time.getHours()}:${time.getMinutes()}`
        }
        switch (true) {
          case !avatar:
            avatar = ch.dom`<i class="fa fa-user"></i>`
            break;
          case typeof avatar === "string":
            avatar = ch.dom`${avatar}`;
            break;
          case avatar?.nodeType === 1:
            break;
          default:
            //throw new Error("avatar can only be a string or element");
            j(_return = new Error("avatar can only be a string or element"));
            return _return;
        }
        const node = ch.dom`
          <div class="msg ${side}-msg">
            <div class="msg-img"></div>
  
            <div class="msg-bubble">
              <div class="msg-info">
                <div class="msg-info-name">${name}</div>
                <div class="msg-info-time">${time}</div>
              </div>
  
              <div class="msg-text"></div>
            </div>
          </div>`,
          msgText = node.querySelector(".msg-text");
        ch(node)`>> ...${[symbols.raw, ""]} @> ${".msg-img"} +> ${avatar}`
        const hSet = (values[symbols.history] = values[symbols.history] || new Set()).add(node);
        while(hSet.size > values.historyLength){setShift(hSet).remove()}
        try {
          const 
          retVal = await parser({current: "", incoming: content, parent: msgText, bubble: node, chat: values.chat, prev, component: this}),
          next = await cb({current: "", incoming: content, parent: msgText, bubble: node, chat: values.chat, prev, component: this, retVal});
          node[symbols.raw] += content;
          r(_return = next);
        } catch (err) {
          j(_return = err)
        }
        if (isNearBot(values.main, Math.max(600, values.main._clH))) {
          this[symbols.scrollToBottom](values.main);
        }
        return _return;
      }
      proto.extendBubble = async function({
        content = "", 
        parser = defParser,
        cb = noOp
      }) {
        const values = wk.get(this);
        if(!values?.[symbols.history]){return}
        let _return, prev = values.chat[symbols.busy];
        let r,j;
        values.chat[symbols.busy] = new Promise((_r, _j) => {[r, j] = [_r, _j]})
        try {
          prev = await prev;
        } catch (err) {
          prev = err
        }
        const node = setGetLast(values[symbols.history]),
              msgText = node?.querySelector(".msg-text");
        if(!node){
          j(_return = new Error("no bubbles to extend"));
          return _return;
        }
        try {
          const 
          retVal = await parser({current: node[symbols.raw], incoming: content, parent: msgText, bubble: node, chat: values.chat, prev, component: this}),
          next = await cb({current: node[symbols.raw], incoming: content, parent: msgText, bubble: node, chat: values.chat, prev, component: this, retVal});
          node[symbols.raw] += content;
          r(_return = next);
        } catch (err) {
          j(_return = err)
        }
        if (isNearBot(values.main, Math.max(600, values.main._clH))) {
          this[symbols.scrollToBottom](values.main);
        }
        return _return;
      }
      proto.clear = function() {
        if(!this[symbols.input]){return}
        this[symbols.input].textContent = ""; return this;
      }
      proto[symbols.upAttrs] = async function({values:v, el}){
        ch(el);
        v.colors = el.colors = Object.fromEntries(
          (ch.gatr("data-colors") ?? "")
          .split(",")
          .filter(Boolean)
          .reduce((ac,d,i,a) => {
            if(!(i % 2)){
              ac.push([d, a[i+1]])
            }
            return ac;
        },[]));
        v.border = ch.gatr("data-border");
        v.borderRadius = ch.gatr("data-border-radius");
        v.backgroundOpacity = ch.gatr("data-background-opacity");
        v.boxShadow = ch.gatr("data-box-shadow");
        v.headingBackgroundOpacity = ch.gatr("data-heading-background-opacity");
        v.widthRatio = ch.gatr("data-width-ratio");
        v.aspectRatio = ch.gatr("data-aspect-ratio");
        v.margin = ch.gatr("data-margin");
        v.padding = ch.gatr("data-padding");
        v.fadein = el.fadein = (ch.gatr("data-fadein") ?? null) !== null ? 1 : 0;
        v.disabled = el.hasAttribute("data-disabled"); //TODO: add to ch 'hatr'
        v.headerHidden = el.hasAttribute("data-hide-header");
        v.historyLength = +ch.gatr("data-history-length") || 100;
        [v.typingMs = 0, v.typingName = "anonymous"] = `${ch.gatr("data-typing") || ""}`.split(",").filter(Boolean);
        v.typingMs = +v.typingMs || 0;
        v.headerTitle = ch.gatr("data-title");
        v.fileDisabled = (ch.gatr("data-file") ?? "").toLowerCase() === "false";
        return v;
      };
      /*
        TODO
        extend below to accept array selectors so that nested cssRules can be styled
      */
      proto[symbols.upStyle] = function({values:v, el, selector, prop, val}){
        //console.log("upStyle", el);
        selector = selector.trim();
        el[symbols.stylesheet] = el[symbols.stylesheet] || el?.shadowRoot?.styleSheets?.[0];
        if (!el[symbols.stylesheet]){return proto[symbols.upStyle]}
        for (const {style, selectorText} of el[symbols.stylesheet].cssRules){
          if (selectorText?.trim() !== selector){continue}
          if (el[symbols.nuf].includes(val)) {
            style.removeProperty(prop);
          } else {
            style.setProperty(prop, val);
          }
          break;
        }
        return proto[symbols.upStyle];
      }
      /*
        TODO
        cleanup unused ones and update the list to include nested styles
      */
      proto[symbols.upStyles] = function({values:v, el, state}){
        //console.log("upStyles", el, state);
        el[symbols.upStyle]
        ({values:v, el, selector: ":host", prop: "color", val:`${v.colors.font || "var(--font-color, DarkSlateGray)"}`})
        ({values:v, el, selector: ":host", prop: "background-color", val:`${v.colors.background || "var(--bg-color, #f9f9f9)"}`})
        ({values:v, el, selector: ":host", prop: "border-radius", val:`${v.borderRadius || "var(--border-radius, 4px)"}`})
        ({values:v, el, selector: ":host", prop: "animation", val:`${
          v.fadein 
          ? "animation: fadein-translate-y 0.4s ease-in-out 0s 1 normal forwards running;"
          : false
        }`})
        ({values:v, el, selector: ":host", prop: "--state", val:`${state}`})
        ({values:v, el, selector: ":host", prop: "transform", val:`translate(0px, ${(1 - state) * -100}px)`})
        ({values:v, el, selector: ":host", prop: "opacity", val:`${state}`})
        ({values:v, el, selector: "pattern > g", prop: "stroke", val:`${v.colors.stroke || "none"}`})
        ({values:v, el, selector: "pattern > g", prop: "fill", val:`hsl(from ${v.colors.fill || v.colors.background || "var(--bg-color, #f9f9f9)"} h s calc(l - 15) / alpha)`})
        ({values:v, el, selector: ".msger-header", prop: "display", val:`${v.headerHidden ? "none" : "flex"}`})
        ({values:v, el, selector: "#typing-indicator", prop: "visibility", val:`${v.typingMs ? "visible" : "hidden"}`})
      };
      proto[symbols.upSvg] = async function({values:v, el}){
        //console.log("upSvg", el);
        if(!v.svg){return}
        //svg updates here
        v.calcResize?.();
      };
      proto[symbols.upHTML] = async function({values:v, el}){
        el[symbols.send] = el[symbols.send] || v.section.querySelector(".msger-send-btn");
        el[symbols.input] = el[symbols.input] || v.input;
        el[symbols.typing] = el[symbols.typing] || v.main.querySelector("#typing-indicator");
        el[symbols.header] = el[symbols.header] || el[symbols.shadow].querySelector("header");
        el[symbols.headerTitle] = el[symbols.headerTitle] || el[symbols.header]?.querySelector(".msger-header-title")?.lastChild;
        if(v.disabled){
          v.input.removeAttribute("contenteditable");
          el[symbols.send].innerHTML = `<i class="fa fa-stop"></i>`;
          el[symbols.send].disabled = true;
        } else {
          v.input.setAttribute("contenteditable", "true");
          el[symbols.send].innerHTML = `<i class="fa fa-send"></i>`
          el[symbols.send].disabled = false;
        }
        if(v.fileDisabled) {
          v.attach.disabled = true;
        } else {
          v.attach.disabled = false;
        }
        if (!v[symbols.typing] && v.typingMs) {
          el[symbols.typing].firstElementChild.textContent = v.typingName;
          if (isFinite(v.typingMs)) {
            v[symbols.typing] = setTimeout(() => {
              el.removeAttribute("data-typing");
              v[symbols.typing] = void(0);
            }, v.typingMs);
          }
        }
        if (v.headerTitle) {
          el[symbols.headerTitle].textContent = ` ${v.headerTitle} `;
        }
      };
      proto.update = async function({values, el, state}, mList, obs){
        //console.log("update", el);
        //prevent recursion
        if (mList.every(d => d.attributeName === "style")) {
          return;
        }
        LOOP:
        for (const mutRec of mList) {
          //console.log(mList);
          switch (`${mutRec.type}-${mutRec?.target?.assignedSlot ? "slot" : "host"}` ) {
            case "childList-host":
              //console.log("childList-host");
              //update child somehow
              break;
            case "attributes-host":
              //console.log("attributes-host");
              await el[symbols.upAttrs]({values, el});
              await el[symbols.upStyles]({values, el, state});
              await el[symbols.upSvg]({values, el});
              await el[symbols.upHTML]({values, el});
              break;
            case "characterData-host":
              //console.log("characterData-host");
              break;
            case "childList-slot":
              //console.log("childList-slot");
              break;
            case "attributes-slot":
              //console.log("attributes-slot");
              break;
            case "characterData-slot":
              //console.log("characterData-slot");
              break;
            default:
              continue LOOP;
          }
        }
      };
      proto.send = function(f){
        const files = getAttachedFiles(this),
              textContent = getInputContents(this);
        f.call(this, {files, textContent, text: textContent});
        return this;
      };
      Object.defineProperties(proto, {
        onsend: {
          get: function(){ return _onsend },
          set: function(f){ this.onsend(f) },
          configurable: false
        },
        offsend: {
          get: function(){ return _offsend},
          set: function(namespace){ this.offsend(namespace)},
          configurable: false
        },
        onready: {
          get: function(){return _onready },
          set: function(f){ this.onready(f)},
          configurable: false
        }
      });
      proto.ready = function(){
        const v = wk.get(this); //values
        return v.readyPromise;
      }
    }
    const shadow = el[symbols.shadow] = el.attachShadow({ mode: "open" });
    el[symbols.scrollToBottom] = throttle_v2(function(el){
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth',
      });
    }, {delay: 50});
    let state = 0,
        toggle,
        calcResize;
    ch(el)`
    => ${({values:v}) => () => {
      const updateDelay = +ch.gatr("data-update-delay") || 50,
            resizeDelay = +ch.gatr("data-resize-delay") || 500,
            toggleDelay = +ch.gatr("data-toggle-delay") || 50;
      v.resizeDelay = resizeDelay;
      v.toggleDelay = toggleDelay;
      el[symbols.upAttrs] = ch.throttle(el[symbols.upAttrs], {delay: updateDelay});
      el[symbols.upStyles] = ch.throttle(el[symbols.upStyles], {delay: updateDelay});
      el[symbols.upSvg] = ch.throttle(el[symbols.upSvg], {delay: updateDelay});
      /*ready mechanism*/
      v.readyPromise = new Promise(r => v.ready = r);
    }}
    => ${({values}) => async () => {
      if (!wk.has(el)){wk.set(el, values)}
      return el[symbols.upAttrs]({values, el})
    }}
    |> await ${({values:v}) => async () => {
      v.mutObs = el.mutObs ?? new MutationObserver(el.update.bind(el, {values:v, el, get state(){return state}}))
    }}
    |> await ${({values:v}) => async () => {
      calcResize = v.calcResize = ch.throttle(function(){
         const parent = el?.parentElement;
         el[symbols.header] = el[symbols.header] || shadow.querySelector("header");
         el[symbols.main] = el[symbols.main] || shadow.querySelector("main");
         el[symbols.form] = el[symbols.form] || shadow.querySelector("form");
         //if(!(parent && el[symbols.header] && el[symbols.form])){return}
         if(!parent){return}
         if(el[symbols.main]){el[symbols.main]._clH = el[symbols.main].clientHeight}
         const
          scrollBarWidth = parent.offsetWidth - parent.clientWidth,
          scrollBarHeight = parent.offsetHeight - parent.clientHeight,
          {width: w, height: h} = el?.parentElement?.getBoundingClientRect();
         ch(el).style("--currWidth", (w - scrollBarWidth) * (+v.widthRatio || 0.95))
         .style("--currHeight", (h - scrollBarHeight))
         .style("--currChatHeight", (h - scrollBarHeight - (el[symbols.header]?.offsetHeight ?? 40) - (el[symbols.form]?.offsetHeight ?? 60)) | 0);
      }, {delay: v.resizeDelay ?? 500});
      (v.robserver = new ResizeObserver(calcResize)).observe(el?.parentElement, {box: "border-box"});
    }}
    |> await ${({values:v}) => async () => calcResize()}
    |> await ${({values:v}) => async () => {
      ch(shadow)`
      +> ${ch.dom`
        <style data-for="simple-chat">
            *,
            *:after,
            *:before {
              box-sizing: border-box;
            }
            :host {
              box-sizing: border-box;
              width: calc(var(--currWidth) * 1px);
              margin: auto;
              //margin: 25px 10px;
              color: ${v.colors.font || "var(--font-color, DarkSlateGray)"};
              background-color: ${v.colors.background || "var(--bg-color, #f9f9f9)"};
              border: ${v.border || " var(--border, 2px solid #ddd)"}
              border-radius: ${v.borderRadius || "var(--border-radius, 4px)"};
              display: flex;
              flex-flow: column wrap;
              justify-content: space-between;
              position: relative;
              font-size: 1rem;
              font-family: Helvetica, sans-serif;
              container: component-container;
              container-type: inline-size;
              ${
                v.fadein 
                ? "animation: fadein-translate-y 0.4s ease-in-out 0s 1 normal forwards running;"
                : ""
              }
              --state: ${state};
              transform: translate(0px, ${(1 - state) * -100}px);
              opacity: ${state};
              box-shadow: ${v.boxShadow || "var(--box-shadow, 0 15px 15px -5px rgba(0, 0, 0, 0.2))"};
            }
            .msger {
              width: calc(var(--currWidth) * 1px);
              //height: auto;
              height: calc(var(--currHeight) * 1px);
              position: relative;
              display: flex;
              flex-direction: column;
            }
            .msger-header {
              display: flex;
              align-items: center;
              flex-wrap: wrap;
              justify-content: space-between;
              padding: ${v.padding || "var(--padding, 10px)"};
              border-bottom: ${v.border || " var(--border, 2px solid #ddd)"};
              background: #eeeeee;
              background: hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} h s calc(l - 10) / alpha);
              color: SlateGray;
              color: hsl(from ${v.colors.font || "var(--font-color, DarkSlateGray)"} h s calc(l + 10) / alpha);
              & button {
                padding: 0;
                height: auto;
                aspect-ratio: 1 / 1;
                width: 2rem;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #eeeeee;
                background: hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} h s calc(l - 10) / alpha);
                color: SlateGray;
                color: hsl(from ${v.colors.font || "var(--font-color, DarkSlateGray)"} h s calc(l + 10) / alpha);
                font-weight: bold;
                cursor: pointer;
                transition: background 0.23s, opacity 0.23s;
                border:none;
                border-radius: calc(${v.borderRadius || "var(--border-radius, 4px)"} * 0.75);
                font-size: 1em;
                &:disabled {
                  opacity: 0.5;
                }
                &:not(:disabled):hover {
                  background: hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} calc(h + 140) calc(s + 30) clamp(25, calc(l - 40), 90) / alpha);
                }
              }
            }
            .msger-chat {
              //flex: 1;
              flex-grow: 1;
              flex-shrink: 1;
              overflow-y: auto;
              padding: ${v.padding || "var(--padding, 10px)"};
              position: relative;
              height: calc(var(--currChatHeight) * 1px);
            }
            .msger-chat::-webkit-scrollbar {
              width: 6px;
            }
            .msger-chat::-webkit-scrollbar-track {
              background: #ddd;
            }
            .msger-chat::-webkit-scrollbar-thumb {
              background: #bdbdbd;
            }
            .msg {
              display: flex;
              align-items: flex-end;
              margin-bottom: ${v.margin || "var(--margin, 10px)"};
            }
            .msg:last-of-type {
              margin: 0;
            }
            .msg-img {
              width: 50px;
              height: 50px;
              margin-right: ${v.margin || "var(--margin, 10px)"};
              background: #dddddd;
              background: hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} h s calc(l - 30) / alpha);
              background-repeat: no-repeat;
              background-position: center;
              background-size: cover;
              border-radius: 50%;
              overflow: hidden;
              display: flex;
              justify-content: center;
              align-items: center;
              text-overflow: ellipsis;
              word-break: break-word;
              font-size: 2rem;
              flex-shrink: 0;
            }
            .msg-bubble {
              flex-shrink: 1;
              max-width: clamp(0px, calc(100% - 50px), 1024px);
              padding: calc(${v.padding || "var(--padding, 10px)"} * 1.5);
              border-radius: calc(${v.borderRadius || "var(--border-radius, 4px)"} * 4);
              background: #ececec;
              background: hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} h s calc(l - 20) / alpha);
              
              & img {
                width: clamp(0px, 100%, 320px);
                object-fit: cover;
                aspect-ratio: 1 / 1;
                display: block;
                margin: auto;
              }
            }
            .msg-info {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: ${v.margin || "var(--margin, 10px)"};
            }
            .msg-info-name {
              margin-right: ${v.margin || "var(--margin, 10px)"};
              font-weight: bold;
            }
            .msg-info-time {
              font-size: 0.85em;
            }
            .left-msg .msg-bubble {
              border-bottom-left-radius: 0;
              color: hsl(from var(--font-color, DarkSlateGray) h s calc(l + 10) / alpha)
            }
            .right-msg {
              flex-direction: row-reverse;
            }
            .right-msg .msg-bubble { 
              background: #579ffb;
              background: hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} calc(h - 120) calc(s + 270) calc(l - 10) / alpha);
              color: #e1e1ff;
              color: hsl(from ${v.colors.font || "var(--font-color, DarkSlateGray)"} h s calc(l + 100) / alpha);
              border-bottom-right-radius: 0;
            }
            .right-msg .msg-img {
              margin: 0 0 0 ${v.margin || "var(--margin, 10px)"};
            }
            .msger-inputarea {
              //flex-grow: 1;
              position: relative;
              flex-wrap: wrap;
              flex-basis: 2rem;
              display: flex;
              padding: ${v.padding || "var(--padding, 10px)"};
              border-top: ${v.border || " var(--border, 2px solid #ddd)"}
              background: #eeeeee;
              background: hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} h s calc(l - 5) / alpha);
              & :is(.msger-upload, .msger-extra) {
                position: relative;
                width: 100%;
                flex-shrink: 1;
                display: flex;
                align-items: center;
                justify-content: start;
                gap: 4px;
                padding: 0;
                &:empty {
                  max-height: 0;
                  padding: 0;
                }
                & button {
                  position: relative;
                  border-top-left-radius: 0;
                  border-top-right-radius: 0;
                  padding: 0;
                  height: auto;
                  aspect-ratio: 1 / 1;
                  width: 2rem;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background: #dddddd;
                  background: hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} h s clamp(30, calc(l - 45), 90) / alpha);
                  color: #e1e1ff;
                  color: hsl(from ${v.colors.font || "var(--font-color, DarkSlateGray)"} h s calc(l + 100) / alpha);
                  font-weight: bold;
                  cursor: pointer;
                  transition: background 0.23s, opacity 0.23s;
                  
                  &:disabled {
                    opacity: 0.5;
                  }
                  &:not(.msger-file):not(:disabled):hover {
                    background: hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} calc(h + 140) calc(s + 30) clamp(25, calc(l - 40), 90) / alpha)
                  }
                  &.msger-file:not(:disabled):hover {
                    opacity: 0.6;
                  }
                  &.msger-file:not(:disabled):hover:after {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #000000cc;
                    position: absolute;
                    inset: 0;
                    font: normal normal normal 14px/1 FontAwesome;
                    font-size: inherit;
                    text-rendering: auto;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    content: "\\f1f8";
                  }
                }
                &.msger-upload button {
                  border-bottom-left-radius: 0;
                  border-bottom-right-radius: 0;
                  width: 2.5rem;
                  overflow: hidden;
                  & img {
                    width: 100%;
                    object-fit: cover;
                    aspect-ratio: 1 / 1;
                    display: block;
                    margin: auto;
                    padding: 2px;
                  }
                }
              }
            }
            .msger-inputarea * {
              padding: ${v.padding || "var(--padding, 10px)"};
              border: none;
              border-radius: calc(${v.borderRadius || "var(--border-radius, 4px)"} * 0.75);
              font-size: 1em;
            }
            .msger-upload:has(button) + .msger-input {
              border-top-left-radius: 0;
            }
            .msger-input {
              //width: 100%;
              width: calc(100% - clamp(calc(2 * var(--padding, 10px)), 8%, 64px) - var(--margin, 10px));
              flex-shrink: 1;
              background: #dddddd;
              background: hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} h s clamp(30, calc(l - 45), 90) / alpha);
              color: #e1e1ff;
              color: hsl(from ${v.colors.font || "var(--font-color, DarkSlateGray)"} h s calc(l + 70) / alpha);
              //max-height: 25dvh;
              overflow-y: auto;
              border-bottom-left-radius: 0;
              &:focus {
                outline: none;
                border: 3px solid hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} calc(h + 140) calc(s + 30) clamp(25, calc(l - 40), 90) / alpha);
                border-bottom: none;
                border-left: none;
              }
            }
            .msger-input[contenteditable=true]:empty:before {
              content: attr(data-placeholder);
              pointer-events: none;
              display: block; 
            }
            .msger-input p {
              margin: 0;
              padding: 0;
              & * {
                margin: 0;
                padding: 0;
              }
            }
            .msger-input::-webkit-scrollbar {
              width: 6px;
            }
            .msger-input::-webkit-scrollbar-track {
              background: #ddd;
            }
            .msger-input::-webkit-scrollbar-thumb {
              background: #bdbdbd;
            }
            .msger-input::placeholder {
              color: #e1e1ff;
              color: hsl(from ${v.colors.font || "var(--font-color, DarkSlateGray)"} h s calc(l + 50) / alpha);
            }
            .msger-send-btn {
              align-self: end;
              height: auto;
              aspect-ratio: 1 / 1;
              width: clamp(calc(2 * var(--padding, 10px)), 8%, 64px);
              display: flex;
              align-items: center;
              justify-content: center;
              margin-left: ${v.margin || "var(--margin, 10px)"};
              background: hsl(160, 100%, 25%);
              background: hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} calc(h + 140) calc(s + 30) clamp(25, calc(l - 40), 90) / alpha);
              color: #e1e1ff;
              color: hsl(from ${v.colors.font || "var(--font-color, DarkSlateGray)"} h s calc(l + 100) / alpha);
              font-weight: bold;
              cursor: pointer;
              transition: background 0.23s;
            }
            .msger-send-btn:hover {
              background: hsl(160, 100%, 15%);
              background: hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} calc(h + 140) calc(s + 30) clamp(10, calc(l - 60), 90) / alpha);
            }
            #main-container > svg:first-of-type {
              width: 100%;
              height: 100%;
              pointer-events: none;
              user-select: none;
              position: absolute;
              z-index: -1;
            }
            pattern > g {
              fill: hsl(from ${v.colors.fill || v.colors.background || "var(--bg-color, #f9f9f9)"} h s calc(l - 15) / alpha);
              stroke: none;
              opacity: 0.3;
            }
            #main-container {
              position: relative;
              overflow: hidden;
              min-height: 100%;
            }
            #typing-indicator {
              position: sticky;
              bottom: 0;
              left: 0;
              display: inline-flex;
              justify-content: start;
              align-items: center;
              overflow: hidden;
              opacity: 0.5;
              gap: 20px;
              background: #dddddd;
              background: hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} h s clamp(30, calc(l - 45), 90) / alpha);
              color: #e1e1ff;
              color: hsl(from ${v.colors.font || "var(--font-color, DarkSlateGray)"} h s calc(l + 70) / alpha);
              border-radius: calc(${v.borderRadius || "var(--border-radius, 4px)"} * 1.25);
              border-top-left-radius: 0;
              padding: calc(${v.padding || "var(--padding, 10px)"} * 0.5);
              padding-right: calc(${v.padding || "var(--padding, 10px)"} * 2);
              white-space: nowrap;
              pointer-events: none;
              
              #typing-indicator-name {
                flex-shrink: 1;
                overflow: hidden;
              }
              .dot-flashing {
                flex-shrink: 0;
              }
              /**
               * ==============================================
               * Dot Flashing
               * https://codepen.io/nzbin/pen/GGrXbp
               * ==============================================
               */
              .dot-flashing {
                position: relative;
                width: 10px;
                height: 10px;
                border-radius: 5px;
                animation: dot-flashing 1s infinite linear alternate;
                animation-delay: 0.5s;
                background: hsl(from ${v.colors.font || "var(--font-color, DarkSlateGray)"} h s calc(l + 70) / alpha);
              }
              .dot-flashing::before, .dot-flashing::after {
                content: "";
                display: inline-block;
                position: absolute;
                width: 10px;
                height: 10px;
                border-radius: 5px;
                top: 0;
                animation: dot-flashing 1s infinite alternate;
                background: hsl(from ${v.colors.font || "var(--font-color, DarkSlateGray)"} h s calc(l + 70) / alpha);
              }
              .dot-flashing::before {
                left: -15px;
                animation-delay: 0s;
              }
              .dot-flashing::after {
                left: 15px;
                animation-delay: 1s;
              }
              /**
               * ==============================================
               * Dot Flashing
               * ==============================================
               */
            }
            .fa {
              display: inline-block;
              font: normal normal normal 14px/1 FontAwesome;
              font-size: inherit;
              text-rendering: auto;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            .fa-gear:before,
            .fa-cog:before {
              content: "\\f013";
            }
            .fa-comment:before {
              content: "\\f075";
            }
            .fa-user:before {
              content: "\\f007";
            }
            .fa-send:before,
            .fa-paper-plane:before {
              content: "\\f1d8";
            }
            .fa-stop:before {
              content: "\\f04d";
            }
            .fa-paperclip:before {
              content: "\\f0c6";
            }
            .fa-microphone:before {
              content: "\\f130";
            }
            .fa-file:before {
              content: "\\f15b";
            }
            .fa-video-camera:before {
              content: "\\f03d";
            }
            .fa-trash:before {
              content: "\\f1f8";
            }
            .fa-photo:before,
            .fa-image:before,
            .fa-picture-o:before {
              content: "\\f03e";
            }
            .fa-warning:before,
            .fa-exclamation-triangle:before {
              content: "\\f071";
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
            @keyframes dot-flashing {
              0% {
                opacity: 1;
              }
              50%, 100% {
                opacity: 0.2;
              }
            }
            @container component-container (min-width: 0px) {
              .msger-input {
                max-height: 30cqh;
              }
              #typing-indicator {
                max-width: calc(max(20cqw, 50px) + calc(${v.padding || "var(--padding, 10px)"} * 2.5));
              }
              #typing-indicator-name {
                max-width: calc(max(20cqw, 50px) + calc(${v.padding || "var(--padding, 10px)"} * 2.5) - 50px);
              }
            }
         </style>
      `}`
    }}
    |> await ${({values:v}) => async () => ch(shadow).append(v.section = ch.dom`
      <section class="msger">
        <header class="msger-header">
          <div class="msger-header-title">
            <i class="fa fa-comment"></i> ${v.headerTitle || "SimpleChat"}
          </div>
          <button class="msger-header-options" disabled>
            <span><i class="fa fa-cog"></i></span>
          </button>
        </header>
  
        <main class="msger-chat">
          <div id="main-container">
          </div>
          <div id="typing-indicator">
            <div id="typing-indicator-name">test</div>
            <div class="dot-flashing"></div>
          </div>
        </main>
  
        <form class="msger-inputarea">
          <!--<input type="text" class="msger-input" placeholder="Enter your message...">-->
          <div class="msger-upload"></div>
          <div class="msger-input" data-placeholder="Message..." contenteditable=true spellcheck="false" translate="no"></div>
          <button type="button" class="msger-send-btn"><i class="fa fa-send"></i></button>
          <div class="msger-extra">
            <button type="button"><i class="fa fa-paperclip"></i></button>
            <button type="button" disabled><i class="fa fa-microphone"></i></button>
          </div>
        </form>
      </section>
    `)}
    |> await ${({values:v}) => async() => {
      const editable = v.input = v.section.querySelector(".msger-input[contenteditable]");
      ch(editable).on("input", function(e){
        if(!(this.textContent ?? "").length){
          if(this.hasChildNodes()){
            for (let node of this.childNodes){
              if(node.tagName.toLowerCase() !== "p"){
                this.replaceChild(ch[`p{
                  "prop": [["innerHTML", "<br>"]]
                }`], node);
              }
            }
          }
          return
        }
        if(this.firstElementChild?.tagName.toLowerCase() !== "p"){
          const 
            content = this.textContent,
            p = ch.p;
          p.textContent = content;
          this.replaceChildren(p);
          const range = document.createRange();
          const selection = window.getSelection();
          range.selectNodeContents(p);
          range.collapse(false); // Collapse the range to the end
          selection?.removeAllRanges();
          selection?.addRange(range);
          //selection?.collapseToEnd?.();
          this.focus();
        }
      });
    }}
    |> await ${({values:v}) => async() => {
      v.upload = ch.select(".msger-upload", v.section).selected;
      v.extra = ch.select(".msger-extra", v.section).selected;
      v.attach = ch.select("button:has(i[class~=fa-paperclip])").selected;
      ch.on("click", function(e){return attachFile.call(this, {event:e, values:v})});
    }} 
    |> await ${({values:v}) => async() => v.main = v.section.querySelector("main")}
    |> await ${({values:v}) => async () => ch(v.chat = v.main.firstElementChild).prepend(v.svg = ch.dom`
      <svg id="main-svg" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <foreignObject>
            <slot></slot>
          </foreignObject>
          <pattern id="bgPattern" patternTransform="scale(3)" patternContentUnits="userSpaceOnUse" patternUnits="userSpaceOnUse" width="95" height="74">
            <g>
                <path d="m16 46c0.15-0.24 0.54-0.35 0.77-0.22 0.41 0.23 0.32 0.98-0.12 1.1-0.49 0.13-0.92-0.44-0.65-0.88zm0.25 0.61c0.2 0.17 0.51 0.075 0.6-0.18 0.15-0.46-0.42-0.75-0.67-0.35-0.14 0.23-0.13 0.37 0.075 0.53zm1.5 2.7c0.16-0.71 0.98-0.73 1.2-0.028 0.14 0.53 0.017 0.81-0.42 0.93-0.43 0.12-0.86-0.4-0.75-0.9zm0.46 0.69c0.26 0.14 0.5 0.019 0.56-0.29 0.1-0.47-0.16-0.81-0.54-0.71-0.42 0.11-0.44 0.78-0.025 1zm0.83-3.7c-0.099-1.8 1.1-3 3-3.1 0.63-0.0048 0.63-0.0048 0.29-0.51-2.4-3.6 1.2-8.1 4.8-6.1 3.6 2 1.1 8.5-2.8 7.1-0.34-0.12-0.34-0.12-0.092 0.32 1 1.8 0.94 3.2-0.22 5.3-0.45 0.79-1.1 0.59-1.1-0.32 0.0073-0.14-0.015-0.16-0.17-0.11-0.27 0.072-0.62 0.0025-1.4-0.27-0.68-0.25-0.68-0.25-0.73-0.065-0.25 1.1-1.6-0.72-1.7-2.3zm0.67 1.6c0.47 0.83 0.77 1 0.82 0.51 0.025-0.24 0.19-0.25 0.73-0.039 1.3 0.49 1.9 0.53 2 0.12 0.025-0.14 0.089-0.32 0.14-0.4 0.053-0.082 0.09-0.18 0.081-0.21-0.019-0.069-1.2-0.9-1.5-1.1-0.25-0.13-1.2-0.81-1.5-1.1-0.28-0.27-0.36 0.11-0.18 0.82 0.16 0.61 0.44 0.89 1.1 1.1 0.25 0.09 0.68 0.25 0.96 0.35 0.5 0.18 0.78 0.38 0.72 0.5-0.046 0.08-0.3 8.1e-4 -1-0.33-0.34-0.15-0.78-0.33-0.98-0.41-0.42-0.16-0.88-0.63-0.98-1-0.16-0.6-0.086-1.5 0.13-1.5 0.051-0.014 0.17 0.059 0.26 0.16 0.3 0.34 0.99 0.88 1.6 1.3 0.33 0.2 0.76 0.48 0.95 0.62 0.35 0.25 0.35 0.25 0.43 0.075 0.13-0.29-0.53-0.96-1.5-1.5-0.23-0.13-0.6-0.38-0.84-0.55-0.23-0.17-0.45-0.32-0.48-0.32-0.4-0.051 0.015-0.62 0.56-0.76 1.7-0.44 3.3 1.4 2.7 2.9-0.065 0.15-0.16 0.42-0.2 0.59-0.047 0.17-0.17 0.46-0.27 0.64-0.3 0.56-0.32 1.1-0.027 1.2 0.28 0.066 0.76-0.71 1.2-2 0.44-1.2 0.18-2.4-0.89-4-0.14-0.21 0.1-0.23 0.54-0.05 3.7 1.6 6.3-4.7 2.8-6.7-3.5-2-7 2.6-4.4 6 0.48 0.64 0.48 0.76 0.033 0.69-2.7-0.41-4.3 2-2.9 4.4zm2.8-7.4c-0.04-0.54 0.079-0.61 0.43-0.26 0.41 0.41 1.6 1.3 2.5 1.8 1 0.61 1 0.68 0.14 0.92-1.4 0.38-3-0.84-3.1-2.5zm0.61 1.3c0.55 0.7 2 1.2 2.7 0.92 0.25-0.11 0.25-0.11-0.48-0.56-0.76-0.46-2.1-1.4-2.4-1.7-0.23-0.22-0.27-0.19-0.22 0.19 0.024 0.18 0.047 0.37 0.051 0.43 0.013 0.17 0.16 0.47 0.36 0.72zm-0.38-2.9c0.21-1 0.34-1 1.6-0.031 0.56 0.43 1.5 1 2.2 1.5 1.4 0.8 1.3 0.69 1.1 1.1-0.36 0.75-0.56 0.78-1.5 0.23-0.78-0.44-3.4-2.4-3.4-2.5-0.0017-0.0095 0.018-0.12 0.043-0.24zm2 1.6c1.7 1.3 2.3 1.5 2.6 0.99 0.24-0.39 0.24-0.39-0.87-1-0.61-0.36-1.6-1-2.2-1.4-0.57-0.43-1.1-0.76-1.1-0.73-0.5 0.53-0.29 0.84 1.5 2.2zm-0.72-3.1c1.4-1.1 3.7 0.25 3.9 2.2 0.078 0.82-0.53 0.61-2.7-0.97-1.5-1.1-1.5-1.1-1.2-1.3zm1.1 0.99c0.93 0.69 2.5 1.6 2.6 1.6 0.2-0.053-0.15-1.2-0.51-1.6-0.9-1.1-2-1.5-2.9-0.93-0.29 0.17-0.34 0.11 0.81 0.96zm-3.1 7.2c0.48 0.28 1.4 1 1.5 1.3 0.3 0.45 0.38-0.86 0.082-1.4-0.47-0.9-2.3-1.5-2.8-0.86-0.13 0.15 0.31 0.55 1.2 1zm1.6 1.8c0.058-0.15 0.1-0.29 0.093-0.3-0.023-0.069-0.24 0.42-0.22 0.5 0.011 0.041 0.068-0.046 0.13-0.19zm7.1-9.1c0.23-2 3.2 0.43 1.1 0.99-0.6 0.16-1.1-0.35-1.1-0.99zm0.52 0.73c2 1.1 0.4-2.8-0.31-0.83-0.1 0.28 0.051 0.69 0.31 0.83z" stroke-width=".4"/>
                <path d="m47 24c0.15-0.24 0.54-0.35 0.77-0.22 0.41 0.23 0.32 0.98-0.12 1.1-0.49 0.13-0.92-0.44-0.65-0.88zm0.25 0.61c0.2 0.17 0.51 0.075 0.6-0.18 0.15-0.46-0.42-0.75-0.67-0.35-0.14 0.23-0.13 0.37 0.075 0.53zm1.5 2.7c0.16-0.71 0.98-0.73 1.2-0.028 0.14 0.53 0.017 0.81-0.42 0.93-0.43 0.12-0.86-0.4-0.75-0.9zm0.46 0.69c0.26 0.14 0.5 0.019 0.56-0.29 0.1-0.47-0.16-0.81-0.54-0.71-0.42 0.11-0.44 0.78-0.025 1zm0.83-3.7c-0.099-1.8 1.1-3 3-3.1 0.63-0.0048 0.63-0.0048 0.29-0.51-2.4-3.6 1.2-8.1 4.8-6.1 3.6 2 1.1 8.5-2.8 7.1-0.34-0.12-0.34-0.12-0.092 0.32 1 1.8 0.94 3.2-0.22 5.3-0.45 0.79-1.1 0.59-1.1-0.32 0.0073-0.14-0.015-0.16-0.17-0.11-0.27 0.072-0.62 0.0025-1.4-0.27-0.68-0.25-0.68-0.25-0.73-0.065-0.25 1.1-1.6-0.72-1.7-2.3zm0.67 1.6c0.47 0.83 0.77 1 0.82 0.51 0.025-0.24 0.19-0.25 0.73-0.039 1.3 0.49 1.9 0.53 2 0.12 0.025-0.14 0.089-0.32 0.14-0.4 0.053-0.082 0.09-0.18 0.081-0.21-0.019-0.069-1.2-0.9-1.5-1.1-0.25-0.13-1.2-0.81-1.5-1.1-0.28-0.27-0.36 0.11-0.18 0.82 0.16 0.61 0.44 0.89 1.1 1.1 0.25 0.09 0.68 0.25 0.96 0.35 0.5 0.18 0.78 0.38 0.72 0.5-0.046 0.08-0.3 8.1e-4 -1-0.33-0.34-0.15-0.78-0.33-0.98-0.41-0.42-0.16-0.88-0.63-0.98-1-0.16-0.6-0.086-1.5 0.13-1.5 0.051-0.014 0.17 0.059 0.26 0.16 0.3 0.34 0.99 0.88 1.6 1.3 0.33 0.2 0.76 0.48 0.95 0.62 0.35 0.25 0.35 0.25 0.43 0.075 0.13-0.29-0.53-0.96-1.5-1.5-0.23-0.13-0.6-0.38-0.84-0.55-0.23-0.17-0.45-0.32-0.48-0.32-0.4-0.051 0.015-0.62 0.56-0.76 1.7-0.44 3.3 1.4 2.7 2.9-0.065 0.15-0.16 0.42-0.2 0.59-0.047 0.17-0.17 0.46-0.27 0.64-0.3 0.56-0.32 1.1-0.027 1.2 0.28 0.066 0.76-0.71 1.2-2 0.44-1.2 0.18-2.4-0.89-4-0.14-0.21 0.1-0.23 0.54-0.05 3.7 1.6 6.3-4.7 2.8-6.7-3.5-2-7 2.6-4.4 6 0.48 0.64 0.48 0.76 0.033 0.69-2.7-0.41-4.3 2-2.9 4.4zm2.8-7.4c-0.04-0.54 0.079-0.61 0.43-0.26 0.41 0.41 1.6 1.3 2.5 1.8 1 0.61 1 0.68 0.14 0.92-1.4 0.38-3-0.84-3.1-2.5zm0.61 1.3c0.55 0.7 2 1.2 2.7 0.92 0.25-0.11 0.25-0.11-0.48-0.56-0.76-0.46-2.1-1.4-2.4-1.7-0.23-0.22-0.27-0.19-0.22 0.19 0.024 0.18 0.047 0.37 0.051 0.43 0.013 0.17 0.16 0.47 0.36 0.72zm-0.38-2.9c0.21-1 0.34-1 1.6-0.031 0.56 0.43 1.5 1 2.2 1.5 1.4 0.8 1.3 0.69 1.1 1.1-0.36 0.75-0.56 0.78-1.5 0.23-0.78-0.44-3.4-2.4-3.4-2.5-0.0017-0.0095 0.018-0.12 0.043-0.24zm2 1.6c1.7 1.3 2.3 1.5 2.6 0.99 0.24-0.39 0.24-0.39-0.87-1-0.61-0.36-1.6-1-2.2-1.4-0.57-0.43-1.1-0.76-1.1-0.73-0.5 0.53-0.29 0.84 1.5 2.2zm-0.72-3.1c1.4-1.1 3.7 0.25 3.9 2.2 0.078 0.82-0.53 0.61-2.7-0.97-1.5-1.1-1.5-1.1-1.2-1.3zm1.1 0.99c0.93 0.69 2.5 1.6 2.6 1.6 0.2-0.053-0.15-1.2-0.51-1.6-0.9-1.1-2-1.5-2.9-0.93-0.29 0.17-0.34 0.11 0.81 0.96zm-3.1 7.2c0.48 0.28 1.4 1 1.5 1.3 0.3 0.45 0.38-0.86 0.082-1.4-0.47-0.9-2.3-1.5-2.8-0.86-0.13 0.15 0.31 0.55 1.2 1zm1.6 1.8c0.058-0.15 0.1-0.29 0.093-0.3-0.023-0.069-0.24 0.42-0.22 0.5 0.011 0.041 0.068-0.046 0.13-0.19zm7.1-9.1c0.23-2 3.2 0.43 1.1 0.99-0.6 0.16-1.1-0.35-1.1-0.99zm0.52 0.73c2 1.1 0.4-2.8-0.31-0.83-0.1 0.28 0.051 0.69 0.31 0.83z" stroke-width=".4"/>
                <path d="m4.5 11 3.1-8.2h1.2l3.3 8.2h-1.2l-0.95-2.5h-3.4l-0.9 2.5zm2.4-3.3h2.8l-0.85-2.3q-0.39-1-0.58-1.7-0.16 0.78-0.44 1.6z" style="white-space:pre" aria-label="A"/>
                <path d="m16 27v-7.2h-2.7v-0.96h6.5v0.96h-2.7v7.2z" style="white-space:pre" aria-label="T"/>
                <path d="m64 9.2v-7.2h-2.7v-0.96h6.5v0.96h-2.7v7.2z" style="white-space:pre" aria-label="T"/>
                <path d="m38 49 3.1-8.2h1.2l3.3 8.2h-1.2l-0.95-2.5h-3.4l-0.9 2.5zm2.4-3.3h2.8l-0.85-2.3q-0.39-1-0.58-1.7-0.16 0.78-0.44 1.6z" style="white-space:pre" aria-label="A"/>
                <path d="m63 43 1.1 0.27q-0.34 1.3-1.2 2-0.88 0.7-2.2 0.7-1.3 0-2.1-0.53-0.82-0.54-1.3-1.6-0.43-1-0.43-2.2 0-1.3 0.48-2.2 0.49-0.95 1.4-1.4 0.9-0.5 2-0.5 1.2 0 2.1 0.62 0.83 0.62 1.2 1.8l-1.1 0.25q-0.28-0.89-0.82-1.3t-1.4-0.41q-0.94 0-1.6 0.45-0.63 0.45-0.88 1.2-0.26 0.76-0.26 1.6 0 1 0.3 1.8 0.31 0.77 0.95 1.2t1.4 0.38q0.91 0 1.5-0.52 0.63-0.52 0.85-1.6z" style="white-space:pre" aria-label="C"/>
                <path d="m37 28v-0.96l3.5-0.0056v3q-0.8 0.63-1.6 0.96-0.85 0.32-1.7 0.32-1.2 0-2.2-0.51-0.98-0.52-1.5-1.5-0.5-0.97-0.5-2.2 0-1.2 0.5-2.2 0.5-1 1.4-1.5 0.93-0.5 2.2-0.5 0.88 0 1.6 0.29 0.72 0.28 1.1 0.8 0.41 0.51 0.62 1.3l-0.97 0.27q-0.18-0.62-0.46-0.98-0.27-0.36-0.78-0.57-0.51-0.22-1.1-0.22-0.74 0-1.3 0.23-0.54 0.22-0.87 0.59-0.33 0.37-0.51 0.81-0.31 0.76-0.31 1.6 0 1.1 0.37 1.8 0.38 0.73 1.1 1.1 0.72 0.36 1.5 0.36 0.7 0 1.4-0.27 0.67-0.27 1-0.58v-1.5z" style="white-space:pre" aria-label="G"/>
                <path d="m8.1 42v-0.96l3.5-0.0056v3q-0.8 0.63-1.6 0.96-0.85 0.32-1.7 0.32-1.2 0-2.2-0.51-0.98-0.52-1.5-1.5-0.5-0.97-0.5-2.2 0-1.2 0.5-2.2 0.5-1 1.4-1.5 0.93-0.5 2.2-0.5 0.88 0 1.6 0.29 0.72 0.28 1.1 0.8 0.41 0.51 0.62 1.3l-0.97 0.27q-0.18-0.62-0.46-0.98-0.27-0.36-0.78-0.57-0.51-0.22-1.1-0.22-0.74 0-1.3 0.23-0.54 0.22-0.87 0.59-0.33 0.37-0.51 0.81-0.31 0.76-0.31 1.6 0 1.1 0.37 1.8 0.38 0.73 1.1 1.1 0.72 0.36 1.5 0.36 0.7 0 1.4-0.27 0.67-0.27 1-0.58v-1.5z" style="white-space:pre" aria-label="G"/>
                <path d="m37 15c-0.55-0.33-0.46-1.3 0.14-1.5 0.55-0.18 1 0.15 1 0.72 0 0.69-0.61 1.1-1.2 0.73zm0.74-0.15c0.35-0.22 0.39-0.77 0.065-1-0.41-0.34-0.99-0.084-0.99 0.44 0 0.6 0.46 0.91 0.93 0.61zm2.4-0.37c-0.3-0.18-0.39-0.5-0.42-1.5-0.031-0.97 2.7e-4 -0.92-0.48-0.81-3.2 0.74-5.8-1.1-6-4.4-0.041-0.62-0.041-0.62-0.8-0.59-1.1 0.033-1.8-0.16-2.2-0.55-0.31-0.31-0.067-0.91 0.37-0.91 0.15 0 0.19-0.028 0.21-0.16 0.064-0.32 1.4-1.5 1.7-1.5 0.66 0 0.56 0.32-0.38 1.2-0.88 0.87-0.88 0.87 0.089 0.92 1.1 0.055 1.1 0.054 1.1-0.8-0.039-0.89-0.17-1.6-0.4-2.1-0.32-0.68-0.23-1.1 0.23-1.1 0.59 0 1 1 1.2 2.8 0.038 0.41 0.074 0.76 0.081 0.77 0.0067 0.0094 0.29-0.029 0.62-0.086 3.3-0.55 5.2 0.91 5.6 4.2 0.1 1 0.1 1 0.46 0.93 0.83-0.18 1.3-0.025 1.2 0.41-0.071 0.33-0.14 0.37-0.97 0.52-0.65 0.12-0.59 0.033-0.59 0.81 0 0.38 0.042 0.94 0.094 1.2 0.13 0.74-0.084 0.97-0.6 0.66zm0.46-0.3c-0.16-2.4-0.17-2.4 0.44-2.5 0.87-0.14 1-0.21 1-0.5 0-0.24-0.26-0.29-0.85-0.18-0.72 0.14-0.74 0.12-0.74-0.34 0-3.5-2-5.3-5.4-4.7-0.88 0.15-0.86 0.16-0.86-0.41-0.0021-0.92-0.29-2.2-0.62-2.7-0.47-0.72-0.94-0.39-0.57 0.41 1.1 2.4 0.19 3.9-1.9 2.9-0.47-0.22-0.58-0.23-0.76-0.036-0.51 0.54 1.2 1.2 2.5 0.98 0.49-0.081 0.48-0.085 0.54 0.71 0.21 3.1 2.5 4.8 5.6 4.3 0.39-0.069 0.74-0.12 0.77-0.12 0.03 0 0.072 0.38 0.093 0.84 0.056 1.2 0.22 1.7 0.63 1.6 0.13-0.015 0.15-0.042 0.13-0.22zm-2.7-2.8c0-0.17 0.24-0.45 1.1-1.3 0.66-0.66 0.68-0.64 0.75 0.57 0.044 0.72 0.066 0.68-0.45 0.77-1 0.16-1.4 0.15-1.4-0.016zm1-0.1c0.35-0.039 0.66-0.1 0.68-0.14 0.049-0.064-0.026-1.3-0.083-1.3-0.033-0.033-1.4 1.3-1.4 1.5-0.05 0.089-0.038 0.1 0.077 0.078 0.075-0.015 0.42-0.06 0.77-0.099zm-2.5-0.034c-0.41-0.15-0.37-0.2 1.1-1.7 1.7-1.8 1.6-1.7 1.9-1 0.11 0.33 0.11 0.33-0.38 0.78-0.57 0.52-1.1 1.1-1.6 1.6-0.35 0.41-0.48 0.45-0.98 0.27zm0.85-0.39c0.36-0.44 1.6-1.7 1.9-1.9 0.17-0.12 0.17-0.12 0.065-0.4-0.14-0.36-0.0089-0.45-1.5 1.1-1.5 1.5-1.5 1.4-0.73 1.6 0.019 0.0035 0.17-0.16 0.34-0.36zm-2.1-0.35c-0.36-0.37-0.36-0.38-0.018-0.65 0.35-0.28 2.7-2.7 2.7-2.8 0-0.19 0.71 0.15 0.8 0.39 0.022 0.057-0.38 0.51-1.2 1.3-0.67 0.68-1.4 1.4-1.5 1.6-0.36 0.46-0.39 0.46-0.76 0.074zm1-0.64c0.23-0.24 0.83-0.87 1.3-1.4 0.94-0.95 0.94-0.95 0.73-1.1-0.27-0.2-0.12-0.31-1.5 1.1-0.65 0.67-1.3 1.3-1.4 1.4-0.3 0.27-0.3 0.27-0.031 0.54 0.22 0.21 0.22 0.21 0.34 0.047 0.065-0.091 0.3-0.36 0.53-0.61zm-1.8-0.33c-0.31-0.48-0.34-0.92-0.063-0.99 0.17-0.042 1.8-1.7 1.9-1.9 0.065-0.2 1-0.067 1 0.15 0 0.082-0.38 0.53-0.76 0.91-0.12 0.11-0.58 0.6-1 1.1-0.91 0.97-0.92 0.99-1.1 0.76zm1-0.94c0.45-0.49 1-1.1 1.2-1.3 0.47-0.48 0.47-0.51-0.0014-0.57-0.25-0.034-0.26-0.027-0.42 0.2-0.24 0.34-1.8 1.8-1.9 1.8-0.075 0-0.089 0.032-0.059 0.13 0.063 0.21 0.26 0.65 0.28 0.63 0.0099-0.013 0.39-0.42 0.84-0.91zm-1.4-0.43c-0.053-0.019-0.074-0.21-0.074-0.7 0-0.49 0.02-0.68 0.074-0.69 1.7-0.46 1.9-0.18 0.48 0.96-0.16 0.13-0.32 0.29-0.35 0.35-0.034 0.061-0.095 0.099-0.14 0.085zm0.72-0.88c0.62-0.63 0.65-0.68 0.25-0.58-0.17 0.045-0.45 0.11-0.62 0.15-0.31 0.064-0.31 0.064-0.31 0.53 0 0.57 0.0035 0.57 0.67-0.1zm-3.7-1.3c-0.022-0.022-0.057-0.022-0.078 0-0.022 0.022-0.0039 0.039 0.039 0.039 0.043 0 0.061-0.018 0.039-0.039zm-0.16-0.049c0-0.016-0.013-0.029-0.029-0.029s-0.029 0.013-0.029 0.029c0 0.016 0.013 0.029 0.029 0.029s0.029-0.013 0.029-0.029zm-0.12-0.059c0-0.016-0.013-0.029-0.029-0.029s-0.029 0.013-0.029 0.029c0 0.016 0.013 0.029 0.029 0.029s0.029-0.013 0.029-0.029zm1.1-0.66c0.81-0.8 0.96-1.1 0.45-1-0.28 0.071-1.6 1.5-1.4 1.5 0.22 0.16 0.34 0.091 0.99-0.55zm-0.66 4.4c-0.33-0.18-0.36-0.58-0.048-0.84 0.22-0.19 0.46-0.19 0.69 0.0054 0.48 0.4-0.083 1.1-0.64 0.83zm0.57-0.23c0.17-0.16 0.17-0.23 0.014-0.42-0.22-0.27-0.7-0.11-0.7 0.23 0 0.29 0.45 0.41 0.69 0.19z" stroke-width=".35"/>
            </g>
          </pattern>
        </defs>
        <rect id="bg-rect" width="100%" height="100%" fill="url(#bgPattern)" />
      </svg>
    `)}
    |> await ${({values:v}) => async () => {
      v.svg = shadow.querySelector("svg");
      toggle = v.toggle = el.toggle = ch.throttle(function(){
        //console.log("toggle", el);
        state = state ? 0 : 1;
        const display = ["none", "flex"][state];
        ch(el).style("--state", state)
        `=> ${() => () => (!state || el.getAnimations().filter(a => a.playState !== "finished").length) && ch.cancelAnimate({commit: ["transform", "opacity"]})}`
        `=> ${() => () => state && el.style.setProperty("display", display, "important")}`
        .animate([{
            transform: `translate(0px, ${(1 - state) * -100}px)`,
            opacity: state,
            display
        }], {duration: 400, fill:"both", easing: "ease-in-out"})
        .lastOp
        .then(() => el.style.setProperty("display", display, "important"))
        .catch(() => {})
      }, {delay: v.toggleDelay ?? 50})
    }}
    |> await ${({values}) => async() => {
       return Promise.all([
        el[symbols.upStyles]({values, el, state}),
        el[symbols.upSvg]({values, el}),
        el[symbols.upHTML]({values, el})
      ]);
    }}
    |> await ${({values:v}) => async () => v.toggle()}
    |> await ${({values:v}) => async () => {shadow.querySelector("style").sheet.cssRules[1].style.setProperty("transition", "all 0.4s ease")}}
    |> await ${({values:v}) => async () => v.mutObs.observe(el, {childList: true, subtree: true, attributes: true, characterData: true})}
    |> await ${({values:v}) => async () => v.main.scrollTop = v.main.scrollHeight}
    |> await ${({values:v}) => async () => v.ready(true)}
    `
  }})(
    {
      initialized: Symbol("initialized"),
      shadow: Symbol("shadow"),
      upAttrs: Symbol("upAttrs"),
      upHTML: Symbol("upHTML"),
      upSvg: Symbol("upSvg"),
      upStyle: Symbol("upStyle"),
      upStyles: Symbol("upStyles"),
      stylesheet: Symbol("stylesheet"),
      header: Symbol("header"),
      headerTitle: Symbol("headerTitle"),
      main: Symbol("main"),
      form: Symbol("form"),
      input: Symbol("input"),
      send: Symbol("send"),
      typing: Symbol("typing"),
      isPaused: Symbol("isPaused"),
      history: Symbol("history"),
      busy: Symbol("busy"),
      file: Symbol("file"),
      raw: Symbol("raw"),
      nuf: Symbol("nuf"),
      nue: Symbol("nue"),
      scrollToBottom: Symbol("scrollToBottom")
    }
  )
  
  ch.adopt("simple-chat", simpleChat)`<simple-chat ${{}}/>`
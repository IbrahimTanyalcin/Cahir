const simpleUpload = ((symbols) => {
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
            createFileListIcons(files, v.upload);
          });
          inp.click();
        },
        createFileListIcons = function(fileList, target){
          for(const file of fileList){
            createFileIcon(file, target);
          }
        },
        createFileIcon = function(file, target){
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
          target.appendChild(button);
        },
        getInputContents = function(el){
          const v = wk.get(el); //values
          //return [...v.input.children].map(d => d.textContent).join("\n");
          //TODO grab the contents of the textarea and provide that
          return v.input.value;
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
        },
        genHexStr = (function(){
          const ceil = Math.ceil,
                log = Math.log,
                min = Math.min,
                rand = Math.random,
                log10b16 = log(10) / log(16),
                maxPow10 = Math.log(Number.MAX_SAFE_INTEGER) / Math.log(10) | 0;
          return function (complexity = 6, reps =2, prefix = "", postfix = "") {
              let padding = "0".repeat(ceil(complexity * log10b16)),
                  ceiling = 10 ** min(maxPow10, complexity);
              return prefix 
              + Array.from({length: reps}, d => (
                  padding 
                  + (+(rand() * ceiling).toFixed(0)).toString(16)
              ).slice(-padding.length)).join("").replace(/^0/,"f")
              + postfix
          }
        })(),
        messageTypes = {
          "info": {
            attrClass: "info-msg",
            attrFaClass: "fa-info-circle",
          },
          "prompt": {
            attrClass: "prompt-msg",
            attrFaClass: "fa-question-circle",
            main_div: `
              <bioinfo-input
                data-title="Enter a suitable file name"
                data-label="File name" 
                data-fadein
                data-anycase
                data-colors="font,var(--base-font-color)"
              ></bioinfo-input>
            `,
            footer: `<button><i class="fa fa-check-circle"></i></button>`
          },
          "warning": {
            attrClass: "warning-msg",
            attrFaClass: "fa-warning"
          },
          "success": {
            attrClass: "success-msg",
            attrFaClass: "fa-thumbs-up"
          },
          "error": {
            attrClass: "error-msg",
            attrFaClass: "fa-warning"
          },
          "progress": {
            attrClass: "progress-msg",
            attrFaClass: "fa-cogs",
            main_div: `
              <div data-value="000%" data-indefinite class="progress-bar" style="width: 100%; display: flex; position: relative;">
                <div style="flex-grow: 1; overflow: hidden; width: auto; padding: 4px; background-color: rgba(0, 0, 0, 0.1); box-shadow: inset 0px 1px 2px rgba(0, 0, 0, 0.2); border-radius: 3px;">
                  <div style="width: 55%; transition: none; height: 16px; border-radius: 3px; background-size: 35px 35px; background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.125) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.125) 50%, rgba(255, 255, 255, 0.125) 75%, transparent 75%, transparent); display: block; float: left; box-shadow: inset 0px -1px 2px rgba(0, 0, 0, 0.1);">
                  </div>
                </div>
              </div>
            `
          },
          "confirm": {
            attrClass: "confirm-msg",
            attrFaClass: "fa-question-circle",
            footer: `<button><i class="fa fa-close"></i></button><button><i class="fa fa-check-circle"></i></button>`
          }
        },
        _rgxAttr = /^\/(?<body>.+)\/(?<flags>[gimsuy]*)$/gi,
        _noOPRgx = new RegExp("", ""),
        parseRegexFromAttr = function(str){
          if (!str) {return _noOPRgx}
          try {
            str = atob(str)
          } catch {}
          try {
            let [{groups:{body = "", flags = ""}} = {groups: {body: "", flags: ""}},] = [...str.matchAll(_rgxAttr)];
            return new RegExp(body, flags.replace(/g/g,""));
          } catch {}
          return _noOPRgx;
        },
        parseJSONFromAttr = function(str){
          if(!str) {return {}}
          try {
            str = atob(str) 
          } catch {}
          try {
            return JSON.parse(str);
          } catch {}
          return {};
        },
        tauto = () => true,
        wait = (ms) => new Promise(r => setTimeout(r, ms)),
        textMimes = {
          "calendar": [".ics", ".ifb"],
          "css": [".css"],
          "csv": [".csv"],
          "html": [".html", ".html"],
          "javascript": [".js", ".cjs", ".mjs"],
          "markdown": [".md", ".markdown"],
          "plain": [".txt", ".text", ".log"],
          "sql": [".sql"],
          "xml": [".xml"],
          "x-asm": [".s", ".asm"],
          "x-batch": [".bat", ".cmd"],
          "x-bed": [".bed"],
          "x-c": [".c", ".h"],
          "x-c++": [".cpp", ".hpp", ".cc", ".cxx"],
          "x-config": [".conf", ".cfg"],
          "x-diff": [".diff", ".patch"],
          "x-dockerfile": [".dockerfile"],
          "x-fastq": [".fq", ".fastq"],
          "x-fasta": [".fa", ".fas", ".fasta"],
          "x-genbank": [".gb", ".gbk"],
          "x-gff": [".gff", ".gff3"],
          "x-go": [".go"],
          "x-java-source": [".java"],
          "x-java-properties": [".properties"],
          "x-latex": [".tex", ".ltx"],
          "x-log": [".log"],
          "x-lua": [".lua"],
          "x-makefile": [".mk"],
          "x-newick": [".nwk", ".newick"],
          "x-org" : [".org"],
          "x-perl": [".pl", ".pm"],
          "x-php": [".php", ".phtml"],
          "x-pdb": [".pdb"],
          "x-python": [".py"],
          "x-r": [".r", ".R"],
          "x-rustsrc": [".rs"],
          "x-sam": [".sam"],
          "x-scss": [".scss"],
          "x-sh": [".sh", ".bash", ".zsh"],
          "x-texinfo": [".texi", ".texinfo"],
          "x-toml": [".toml"],
          "tsv": [".tsv"],
          "vnd.graphviz": [".dot"],
          "x-vcf": [".vcf"],
          "x-yaml": [".yaml", ".yml"]
        },
        textMimesMap = (() => {
          const mimeMap = new Map();
          for (const [pmime, extArr] of Object.entries(textMimes)){
            for (const ext of extArr) {
              mimeMap.set(ext, `text/${pmime}`)
            }
          }
          return mimeMap;
        })(),
        parseFilename = function (name){
          var match = name.match(/([^\/\\]+?)(\.[^.]*)?$/i);
          return {
            base: match?.[1] ?? (()=>{throw new Error("cannot parse filename")})(), 
            ext: match?.[2] ?? "",
            get full() {
              delete this.full;
              return this.full = this.base + this.ext
            }
          };
        },
        getMimeFromFilename = function(filename, v = {}){
          const parsed = parseFilename(filename);
          return v?.overrideMime || textMimesMap.get(parsed.ext) || "text/plain";
        },
        encode = TextEncoder.prototype.encode.bind(new TextEncoder),
        asyncStreamGen = async function* (ctrl, strs, chunkSize, options) {
          //console.log("stream generating", Date.now());
          const progress = options?.element?.[symbols.issueMessage]?.({msg:`Converting ${options.filename}`, fadeout: 20000, type: "progress"}),
                delay = options?.values?.streamEnqueueDelay;
          /** 
           * Why was I conservative to divide chunkSize by 4? Isnt it the other way around?
           * slice does not cut by char, it cuts by byte.
          */
          let sliceSize = chunkSize / 4 | 0; //max 4 bytes per char
          let totalStrsLen = 0;
          for (let str of strs) {
            totalStrsLen += str.length;
          }
          let offset = 0;
          OUTER:
          for (let str of strs) {
            let len = str.length;
            for (let i = 0, j, chunk, lastChar, nextChar; i < len; i += sliceSize) {
              delay && await wait(delay);
              chunk = str.slice(i, i + sliceSize);
              if(!chunk.length){continue OUTER}
              lastChar = chunk.slice(-1);
              j = i + chunk.length;
              nextChar = str[j];
              if (lastChar >= "\uD800" && lastChar <= "\uD8FF"){
                if (j < len && nextChar >= "\uDC00" && nextChar <= "\uDFFF"){
                  chunk += nextChar; ++i;
                }
              }
              //console.log("stream enquing", Date.now(), "offset" ,offset, "i", i, "chunk len", chunk.length, "total", totalStrsLen);
              progress?.set((offset + i + chunk.length) / totalStrsLen);
              ctrl.enqueue(encode(chunk));
              yield
            }
            offset += len;
          }
          //progress?.rm();
          progress?.msg("Done! You can close this message.");
          ctrl.close();
        },
        stringsToUint8 = async function(options, ...strs){
          let 
            offset,
            chunks,
            chunkSize = 64 * 1024, //if you want to force char by char streaming, set this to 4
            totalByteLength,
            concatUint8,
            asyncIt;
          const stream = new ReadableStream({
            start (ctrl) {
              totalByteLength = 0;
              asyncIt = asyncStreamGen(ctrl, strs, chunkSize, options);
            },
            pull (ctrl) {
                //console.log("stream pulling!", Date.now());
                return asyncIt.next()
            },
            cancel () {}
          }, {highWaterMark: 3});
          chunks = [];
          for await (const chunk of stream) {
            chunks.push(chunk);
            totalByteLength += chunk.length;
          }
          concatUint8 = new Uint8Array(totalByteLength);
          offset = 0;
          for (const chunk of chunks){
            concatUint8.set(chunk, offset);
            offset += chunk.length;
          }
          /*console.log("UINT8:", concatUint8);
          console.log("decoded:", new TextDecoder().decode(concatUint8));
          console.log("buffer:", concatUint8.buffer);*/
          return concatUint8;
        },
        bufferToFile = function({buffer, name, type}){
          return new File([buffer], name, {type})
        },
        pasteOrBeforeinput = new Set(["paste", "beforeinput"]),
        handleTextarea = async function ({event, values:v, element:el}){
          //TODO increment and decrement at finally step of trty catch
          //a counter.
          event.preventDefault?.();
          if (v.textareaDisabled) {
            return el[symbols.issueMessage]({msg:"Text input is currently disabled", fadeout: 5000, type: "info"});
          }
          let currVal = this.value,
              selStart = this.selectionStart,
              selEnd = this.selectionEnd,
              selDiff = selEnd - selStart,
              totalLen,
              data = "";
          switch (true) {
            case event.type === "paste":
              data = (event.clipboardData || window.clipboardData).getData("text"); 
              totalLen = currVal.length - selDiff + data.length;
              break;
            case event.type === "beforeinput":
              data = event.data ?? "";
              totalLen = currVal.length - selDiff + data.length;
              break;
            case event.type === "input":
              data = "";
              totalLen = currVal.length;
          }
          if (totalLen > v.textareaMaxSize){
            this.readOnly = true;
            try {
              v[symbols.textAreaStreamBusy] ||= 0;
              ++v[symbols.textAreaStreamBusy];
              const 
                filename = await el[symbols.issueMessage]({
                  msg: `The text exceeds allowed length of ${v.textareaMaxSize}.<br>`
                    + `Provide a filename for it to be saved as a file instead.`,
                  fadeout: 60000, type: "prompt"
                }),
                type = getMimeFromFilename(filename, v),
                _file = bufferToFile({
                  /**await has lowever precedence than prop access*/
                  buffer: (await stringsToUint8({filename, element: el, values: v}, currVal.slice(0, selStart), data, currVal.slice(selEnd))).buffer, 
                  name: filename,
                  type
                });
              createFileIcon(_file, v.upload);
              //console.log("mime is", type);
              //console.log("capturing:", currVal.slice(0, selStart) + data + currVal.slice(selEnd));
              this.value = "";
            } catch (err) {
              el[symbols.issueMessage]({
                msg:`There was an error during file conversion.<br>`
                  + `reason: ${err?.message || err || "unknown"}<br>`
                  + `your message is truncated to max allowed length.`,
                fadeout: 5000, type: "error"
              });
              this.value = currVal.slice(0, v.textareaMaxSize);
            } finally {
              --v[symbols.textAreaStreamBusy];
              return this.readOnly = false;
            }
          }
          if(!pasteOrBeforeinput.has(event.type)){return}
          this.value = currVal.slice(0, selStart) + data + currVal.slice(selEnd);
          this.selectionStart = this.selectionEnd = selStart + data.length;
        },
        refreshFormAction = function({values: v, element: el}){
          if (el.hasAttribute("data-form-action")){
            const state = ch.state();
            ch(el);
            const currPath = ch.gatr("data-form-action"),
                  currMethod = (el.hasAttribute("data-form-method") ? ch.gatr("data-form-method") : "POST").toUpperCase();
            let currReqInit = el.hasAttribute("data-form-request-init") ? ch.gatr("data-form-request-init") : void(0);
            if (
              v?.formAction === currPath
              && v?.formMethod === currMethod
              && v?.formReqInit === currReqInit
            ) {
              ch.state(state); 
              return
            }
            currReqInit = parseJSONFromAttr(currReqInit);
            currReqInit.method = currMethod;
            if(v?.formAction){el.offsend("data-form-action")}
            v.formAction = function({files, text, abort, progress}){
              const fData = new FormData(),
                    signal = abort.signal;
              let fileCount = 0,
                  totalFileSizeInBytes = 0,
                  textSizeInBytes = 0,
                  totalSizeInBytes = 0;
              for (const file of files){
                fileCount++;
                totalFileSizeInBytes += file.size;
                fData.append("files[]", file);
              }
              textSizeInBytes += encode(text).length;
              totalSizeInBytes += totalFileSizeInBytes + textSizeInBytes;
              fData.append("text", text);
              fData.append("fileCount", fileCount);
              fData.append("totalFileSizeInBytes", totalFileSizeInBytes);
              fData.append("textSizeInBytes", textSizeInBytes);
              fData.append("totalSizeInBytes", totalSizeInBytes);
              currReqInit.body = fData;
              currReqInit.signal = signal;
              return fetch(currPath, currReqInit);
            }
            el.onsend(v.formAction, "data-form-action");
            ch.state(state);
          } else {
            if (v?.formAction) {
              el.offsend("data-form-action");
              v.formAction = void(0);
            }
          }
        }; 
return function simpleUpload({name, attrs, styles, props, data, el, proto}) {
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
            style = shadow.querySelector("style[data-for=simple-upload]"),
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
    proto.setCancellable = function(bool){ 
      if(this[symbols.nue].includes(bool) || !!bool){
        this.setAttribute("data-cancellable", ""); return this;
      }
      this.removeAttribute("data-cancellable"); return this;
    }
    proto.hideHeader = function() {
      this.setAttribute("data-hide-header", ""); return this;
    }
    proto.showHeader = function() {
      this.removeAttribute("data-hide-header"); return this;
    }
    proto.hideTextarea = function() {
      this.setAttribute("data-hide-textarea", ""); return this;
    }
    proto.showTextarea = function() {
      this.removeAttribute("data-hide-textarea"); return this;
    }
    proto.disableTextarea = function() {
      this.setAttribute("data-disable-textarea", ""); return this;
    }
    proto.enableTextarea = function(){
      this.removeAttribute("data-disable-textarea"); return this;
    }
    proto.disableDragndrop = function(){
      this.setAttribute("data-disable-dragndrop", ""); return this;
    }
    proto.enableDragndrop = function(){
      this.removeAttribute("data-disable-dragndrop"); return this;
    }
    proto.showTyping = function(ms){ this.setAttribute("data-typing", ms); return this; }
    proto.hideTyping = function(){ this.removeAttribute("data-typing"); return this; }
    proto.setHeaderTitle = function(title){ this.setAttribute("data-title", title ?? ""); return this; }
    proto.setPlaceholder = function(ph){this.setAttribute("data-placeholder", ph ?? ""); return this;}
    proto.setOverrideMime = function(mime){
      if(!mime){
        this.removeAttribute("data-override-mime");
      } else {
        this.setAttribute("data-override-mime", mime);
      }
      return this;
    }
    proto.setFilenameMessage = function(msg){this.setAttribute("data-filename-message", msg ?? "invalid filename"); return this;}
    proto.setFilenameValidator = function(f){
      if(typeof f !== "function"){return this}
      const v = wk.get(this); //values
      v.validateFilename = f;
      return this;
    };
    proto.setTextareaMessage = function(msg){this.setAttribute("data-textarea-message", msg ?? "invalid text"); return this;}
    proto.setTextareaValidator = function(f){
      if(typeof f !== "function"){return this}
      const v = wk.get(this); //values
      v.validateTextarea = f;
      return this;
    };
    proto.setTextareaMaxSize = function(len){len = len | 0 || 65536; this.setAttribute("data-textarea-max-size", len); return this;}
    proto.setSendingMessage = function(msg){this.setAttribute("data-sending-message", msg ?? "Sending..."); return this;}
    proto.setSentMessage = function(msg){this.setAttribute("data-sent-message", msg ?? "Done!"); return this;}
    proto.setConfirmingMessage = function(msg){this.setAttribute("data-confirming-message", msg ?? "Are you sure you want to cancel?"); return this;}
    proto.setConfirmedMessage = function(msg){this.setAttribute("data-confirmed-message", msg ?? "Canceled by user"); return this;}
    proto.setStreamEnqueueDelay = function(dly){
      dly = Math.min(1000, Math.max(0, +dly | 0)); 
      this.setAttribute("data-stream-enqueue-delay", dly);
      return this
    };
    proto.setMessageOpacity = function(opacity){this.setAttribute("data-message-opacity", opacity ?? 0.85); return this;}
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
    proto.clear = function() {
      if(!this[symbols.input]){return}
      this[symbols.input].value = ""; return this;
    }
    proto.clearFiles = function(){
      const v = wk.get(this); //values
      [...v.upload.children].forEach(button => button.click());
      return this;
    }
    proto.abortSend = function(msg){
      const v = wk.get(this); //values
      msg ||= "Canceled by the app";
      v[symbols.abort]?.abort(msg);
      return this;
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
      v.cancellable = el.hasAttribute("data-cancellable");
      v.headerHidden = el.hasAttribute("data-hide-header");
      v.historyLength = +ch.gatr("data-history-length") || 100;
      [v.typingMs = 0, v.typingName = "anonymous"] = `${ch.gatr("data-typing") || ""}`.split(",").filter(Boolean);
      v.typingMs = +v.typingMs || 0;
      v.headerTitle = ch.gatr("data-title");
      v.fileDisabled = (ch.gatr("data-file") ?? "").toLowerCase() === "false";
      v.placeholder = ch.gatr("data-placeholder") ?? "";
      v.textareaHidden = el.hasAttribute("data-hide-textarea");
      v.textareaRegex = el.hasAttribute("data-textarea-regex") 
        ? parseRegexFromAttr(ch.gatr("data-textarea-regex")) 
        : _noOPRgx;
      v.filenameRegex = el.hasAttribute("data-filename-regex") 
        ? parseRegexFromAttr(ch.gatr("data-filename-regex")) 
        : _noOPRgx;
      v.textareaDisabled = el.hasAttribute("data-disable-textarea");
      v.dragndropDisabled = el.hasAttribute("data-disable-dragndrop");
      v.messageOpacity = ch.gatr("data-message-opacity") ?? 0.85;
      v.filenameMessage = ch.gatr("data-filename-message") ?? "invalid filename";
      v.textareaMessage = ch.gatr("data-textarea-message") ?? "invalid text";
      v.sendingMessage = ch.gatr("data-sending-message") ?? "Sending...";
      v.sentMessage = ch.gatr("data-sent-message") ?? "Done!";
      v.confirmingMessage = ch.gatr("data-confirming-message") ?? "Are you sure you want to cancel?";
      v.confirmedMessage = ch.gatr("data-confirmed-message") ?? "Canceled by user";
      v.validateFilename = v.validateFilename || tauto;
      v.validateTextarea = v.validateTextarea || tauto;
      v.textareaMaxSize = ch.gatr("data-textarea-max-size") | 0 || 65536;
      v.overrideMime = ch.gatr("data-override-mime") ?? "";
      v.streamEnqueueDelay = Math.min(1000, Math.max(0, +ch.gatr("data-stream-enqueue-delay") | 0));
      refreshFormAction({values: v, element: el});
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
      ({values:v, el, selector: ".msger-chat", prop: "display", val:`${v.textareaHidden ? "none" : "revert"}`})
      ({values:v, el, selector: ".msger", prop: "height", val:`${v.textareaHidden ? "calc((var(--currHeight) - var(--currChatHeight)) * 1px)" : "calc(var(--currHeight) * 1px)"}`})
      ({values:v, el, selector: ".info-msg, .success-msg, .warning-msg, .error-msg, .prompt-msg, .progress-msg, .confirm-msg", prop: "--opacity", val:`${v.messageOpacity}`})
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
        v.input.readOnly = true;
        el[symbols.send].innerHTML = `<i class="fa fa-stop"></i>`;
        el[symbols.send].disabled = true;
      } else {
        v.input.readOnly = false;
        el[symbols.send].innerHTML = `<i class="fa fa-send"></i>`
        el[symbols.send].disabled = false;
      }
      if(v.cancellable && !v.disabled) {
        el[symbols.send].innerHTML = `<i class="fa fa-close"></i>`
      }
      if(v.fileDisabled) {
        v.attach.disabled = true;
      } else {
        v.attach.disabled = false;
      }
      /**Below is commented to allow updating immediately */
      if (/*!v[symbols.typing] &&*/ v.typingMs) {
        el[symbols.typing].firstElementChild.textContent = v.typingName;
        if (isFinite(v.typingMs)) {
          clearTimeout(v?.[symbols.typing]);
          v[symbols.typing] = setTimeout(() => {
            el.removeAttribute("data-typing");
            v[symbols.typing] = void(0);
          }, v.typingMs);
        }
      }
      if (v.headerTitle) {
        el[symbols.headerTitle].textContent = ` ${v.headerTitle} `;
      }
      if (v.placeholder) {
        v.textarea.placeholder = v.placeholder;
      }
      if (v.textareaDisabled) {
        el.clear();
        v.textarea.readOnly = true;
        if(!v.placeholder){
          v.textarea.placeholder = v.dragndropDisabled ? " " : "drag&drop";
        }
      } else if (!v.placeholder) {
        v.textarea.placeholder = v.dragndropDisabled ? "copy/paste" : "copy/paste or drag&drop";
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
    proto.send = async function(f){
      const v = wk.get(this);
      if (v[symbols.busy]) {
        const prom = this[symbols.issueMessage]({msg: v.confirmingMessage, fadeout: 10000, type: "confirm"});
        prom.catch(noOp).then(choice => choice && v[symbols.abort]?.abort(v.confirmedMessage));
        return;
      }
      if(v[symbols.textAreaStreamBusy] > 0) {
        this[symbols.issueMessage]({msg: "Streaming busy. Try again later.", fadeout: 10000, type: "error"});
        return;
      }
      const files = getAttachedFiles(this),
            textContent = getInputContents(this);
      if (!textContent && !files.length){
        this[symbols.issueMessage]({msg: "No files or text", fadeout: 10000, type: "warning"});
        return;
      }
      let payloadDetails = "";
      if (files.length > 1) {
        payloadDetails += files.length + " files"
      } else if (files.length) {
        payloadDetails += "1 file"
      }
      if (textContent) {
        if (payloadDetails) {
          payloadDetails += " and text";
        } else {
          payloadDetails += "text";
        }
      }
      if(!v.textareaDisabled && (!v.textareaRegex.test(v.textarea.value) || !v.validateTextarea(v.textarea.value))) {
        this[symbols.issueMessage]({msg: v.textareaMessage, fadeout: 10000, type: "error"});
        return;
      }
      v[symbols.busy] = true;
      v[symbols.abort] = new AbortController;
      let r,j;
      const signal = v[symbols.abort].signal,
            prom = new Promise((_r,_j) => [r, j] = [_r, _j]);
      signal.addEventListener("abort", function(){
        j(signal.reason || "upload canceled");
      });
      const progress = this[symbols.issueMessage]({msg: `${v.sendingMessage}(${payloadDetails})`, fadeout: Infinity, type: "progress"})
      try {
        this.setCancellable();
        const result = await Promise.race([
          prom,
          f.call(this, {files, textContent, text: textContent, abort: v[symbols.abort], progress})
        ]);
        r(result);
        progress.set(1).freeze().msg(`Done!(${payloadDetails})`);
        this[symbols.issueMessage]({msg: `${v.sentMessage}(${payloadDetails})`, fadeout: 10000, type: "success"});
        this.clear();
        this.clearFiles();
      } catch (err) {
        j(err?.message || err || "unknown");
        this[symbols.issueMessage]({
          msg: `There was an error during upload.<br>`
            + `reason: ${err?.message || err || "unknown"}`, 
          fadeout: 10000, type: "error"
        });
        progress.set(0).freeze().msg(`Failed!(${payloadDetails})`);
      } finally {
        v[symbols.busy] = false;
        v[symbols.abort] = void(0);
        this.setCancellable(false);
        wait(5000).then(() => progress.rm());
      }
      return this;
    };
    proto[symbols.issueMessage] = proto.issueMessage = function({ msg = "", fadeout = 5000, type = "info"} = {msg: "", fadeout: 5000, type: "info"}){
      const v = wk.get(this); //values
      //I should consider adding v.self = el in component initialization instead of below
      const _el = this;
      const rndID = genHexStr(8, 2, "file-upload-close-button-");
      let _abort = void(0);
      ch(v.overlay)`
      *> ${"div"} |> sappend ${0}
      addClass ${[messageTypes?.[type]?.attrClass ?? "info-mgs", "animated", "fadeInLeft"]}
      >> innerHTML ${`
          <header>
            <i class="fa ${messageTypes?.[type]?.attrFaClass ?? "fa-info-circle"}"></i>
            <button data-random-id='${rndID}'>
              <i class="fa fa-close"></i>
            </button>
          </header>
          <main>
            <span>${msg || ""}</span>
            <span></span>
            <div>${messageTypes?.[type]?.main_div ?? ""}</div>
          </main>
          <footer>${messageTypes?.[type]?.footer ?? ""}</footer>
      `}
      => ${() => () => {
        //switched from inline onclick due to CSP
        ch.select(`[data-random-id=${rndID}]`, v.overlay).on("click", function(e){
          const that = this.parentElement.parentElement;
          ch(that)
          .addClass("fadeOutLeft")
          .animate([],{duration:1000})
          .pipe("await", () => {
              ch(that.parentElement).rm([that]);
          });
        })
      }}
      => ${() => () => setTimeout(
          () => ch
              .exec(() => {_abort && _abort.abort("filename timedout")})
              .select(`[data-random-id=${rndID}]`, v.overlay)
              ?.selected
              ?.click(),
          Math.min(fadeout, 0x7FFFFFFF))
      }
      => ${() => async () => {
        await wait(17);
        _el[symbols.scrollToBottom](v.overlay);
      }}`
      switch (type) {
        case "prompt": {
          let res, rej;
          _abort = new AbortController();
          const signal = _abort.signal,
                prom = new Promise((r,j) => [res, rej] = [r, j]),
                promptDiv = v.overlay.querySelector(`div:has([data-random-id=${rndID}])`),
                cancelButton = ch.select("button:has(.fa.fa-close)", promptDiv).selected,
                checkButton = ch.select("button:has(.fa.fa-check-circle)", promptDiv).selected,
                input = ch.select("bioinfo-input", promptDiv).selected,
                errorMessage = ch.select("main span:last-of-type", promptDiv).selected;
          signal.addEventListener("abort", function(){
            rej(signal.reason || "filename aborted");
          });
          ch(input.shadowRoot.querySelector("input")).on("input",throttle_v2(function(){
            if(this.textContent){this.textContent = ""}
          },{thisArg:errorMessage, defer: false, delay: 250}))
          (cancelButton).on("click@abort", function(e){
            _abort.abort("filename canceled");
          })(checkButton).on("click", function(e){
            const inputValue = input.value();
            if (!v.filenameRegex.test(inputValue) || !v.validateFilename(inputValue)){
              return errorMessage.textContent = v.filenameMessage;
            }
            ch(cancelButton).off("click@abort").selected.click();
            res(inputValue);
          });
          return prom;
        }
        case "progress": {
          const promptDiv = v.overlay.querySelector(`div:has([data-random-id=${rndID}])`),
                cancelButton = ch.select("button:has(.fa.fa-close)", promptDiv).selected,
                progress = ch.select("main > div:last-of-type > div", promptDiv).selected,
                progressBar = progress.firstElementChild.firstElementChild,
                message = ch.select("main span:last-of-type", promptDiv).selected;
          return {
            value: function(x){
              return this.set(x);
            },
            set: function(x) {
              x = +x;
              if(x < 0 || isNaN(x) || !isFinite(x)){
                return progress.setAttribute("data-indefinite","");
              }
              const width = Math.min(100, Math.max(0, (x * 100 | 0))) + "%";
              progress.removeAttribute("data-indefinite");
              progress.setAttribute("data-value", ("000" + width).slice(-4));
              progressBar.style.width = width;
              return this;
            },
            remove: function(){
              return this.rm();
            },
            rm: function(){
              cancelButton.click();
              return;
            },
            message: function(msg){
              return this.msg(msg);
            },
            msg: function(msg){
              message.textContent = msg;
              return this;
            },
            freeze: function(){
              this.set = () => this;
              return this;
            }
          }
        }
        case "confirm": {
          let r, j;
          const promptDiv = v.overlay.querySelector(`div:has([data-random-id=${rndID}])`),
                [cancelButton, cancelButton2] = promptDiv.querySelectorAll("button:has(.fa.fa-close)"),
                checkButton = ch.select("button:has(.fa.fa-check-circle)", promptDiv).selected,
                prom = new Promise((_r,_j) => [r, j] = [_r, _j]);
          ch(cancelButton2).on("click", (e) => cancelButton.click())
          (cancelButton).on("click@reject", (e) => j(false))
          (checkButton).on("click", (e) => {ch(cancelButton).off("click@reject").selected.click(); r(true);});
          return prom;
        }
        default: 
          return
      }
    }
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
      <style data-for="simple-upload">
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
            --color-auto-invert: var(--font-color, color(from var(--bg-color, #f9f9f9) xyz clamp(0.058, calc(1 - 3 * x * x + 2 * x * x * x), 0.876) clamp(0.076, calc(1 - 3 * y * y + 2 * y * y * y), 0.950) clamp(0.089, calc(1 - 3 * z * z + 2 * z * z * z), 1.035) / alpha));
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
            /*TODO: have to find an elegant way to combine above v.colors.font with below*/
            color: var(--color-auto-invert);
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
              /*TODO: have to find an elegant way to combine above v.colors.font with below*/
              color: var(--color-auto-invert);
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
            & :where(.msger-header-title, .msger-header-options) {
              opacity: 0.8
            }
          }
          .msger-chat {
            //flex: 1;
            flex-grow: 1;
            flex-shrink: 1;
            //overflow-y: auto;
            padding: ${v.padding || "var(--padding, 10px)"};
            position: relative;
            height: calc(var(--currChatHeight) * 1px);
            min-height: 3em;
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
          .msg:last-of-type {
            margin: 0;
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
          .msger-send-btn {
            align-self: end;
            height: auto;
            aspect-ratio: 1 / 1;
            max-height: clamp(1.2em, calc(var(--currHeight) / 5 * 1px), 3.4em);
            width: calc(50% - var(--margin, 10px) / 2); 
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: ${v.margin || "var(--margin, 10px)"};
            background: hsl(160, 100%, 25%);
            background: hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} calc(h + 140) calc(s + 30) clamp(25, calc(l - 40), 90) / alpha);
            background: color-mix(in lch shorter hue, hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} calc(h + 140) calc(s + 30) clamp(25, calc(l - 40), 90) / alpha) 35%, #14b765);
            color: #e1e1ff;
            color: hsl(from ${v.colors.font || "var(--font-color, DarkSlateGray)"} h s calc(l + 100) / alpha);
            font-weight: bold;
            cursor: pointer;
            transition: background 0.23s;
          }
          .msger-send-btn:hover {
            background: hsl(160, 100%, 15%);
            background: hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} calc(h + 140) calc(s + 30) clamp(10, calc(l - 60), 90) / alpha);
            background: color-mix(in lch shorter hue, hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} calc(h + 140) calc(s + 30) clamp(10, calc(l - 60), 90) / alpha) 65%, #14b765);
          }
          .msger-attach-btn {
            align-self: end;
            height: auto;
            aspect-ratio: 1 / 1;
            max-height: clamp(1.2em, calc(var(--currHeight) / 5 * 1px), 3.4em);
            width: calc(50% - var(--margin, 10px) / 2); 
            display: flex;
            align-items: center;
            justify-content: center;
            background: #dddddd;
            background: hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} h s clamp(30, calc(l - 45), 90) / alpha);
            color: #e1e1ff;
            color: hsl(from ${v.colors.font || "var(--font-color, DarkSlateGray)"} h s calc(l + 100) / alpha);
            font-weight: bold;
            cursor: pointer;
            transition: background 0.23s;

            &:disabled {
              opacity: 0.5;
            }
          }
          .msger-attach-btn:not(:disabled):hover {
            background: #dddddd;
            /*
            keep attach button and send button uniform
            background: hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} calc(h + 140) calc(s + 30) clamp(25, calc(l - 40), 90) / alpha);
            */
            background: hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} calc(h + 140) calc(s + 30) clamp(10, calc(l - 60), 90) / alpha);
            background: color-mix(in lch shorter hue, hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} calc(h + 140) calc(s + 30) clamp(10, calc(l - 60), 90) / alpha) 65%, #14b765);
          }
          #main-container > svg:first-of-type {
            width: 100%;
            height: 100%;
            pointer-events: none;
            user-select: none;
            position: absolute;
            z-index: -1;
          }
          #main-container > textarea {
            width: 100%;
            height: 100%;
            background: transparent;
            resize: none;
            font: inherit;
            font-style: inherit;
            font-family: inherit;
            font-size: inherit;
            font-weight: inherit;
            line-height: inherit;
            color: hsl(from var(--font-color, DarkSlateGray) h s calc(l + 10) / alpha);
            color: var(--color-auto-invert);
            border-radius: calc(${v.borderRadius || "var(--border-radius, 4px)"} * 4);
            border: none;
            outline-color: #ececec;
            outline-color: hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} h s calc(l - 20) / alpha);
            outline-width: ${v.outlineWidth || v.borderWidth || " var(--outline-width, var(--border-width, 4px))"};
            outline-offset: ${-v.outlineWidth || -v.borderWidth || " calc(-1 * var(--outline-width, var(--border-width, 4px)))"};
            outline-style: dashed;
            padding: ${2 * v.outlineWidth || 2 * v.borderWidth || " calc(2 * var(--border-width, 4px))"};
            &:placeholder-shown {
              text-align: center;
              font-size: 1.2em;
              padding-top: 0.5em;
            }
            &::placeholder {
              /*mix-blend-mode: multiply;*/
              color: hsl(from var(--font-color, DarkSlateGray) h s calc(l + 10) / alpha);
              color: var(--color-auto-invert);
              /*color: #e1e1ff;
              color: hsl(from ${v.colors.font || "var(--font-color, DarkSlateGray)"} h s calc(l + 100) / alpha);
              background: #579ffb;
              background: linear-gradient(to bottom in lch shorter hue, #579ffb 0 65%, transparent);
              background: linear-gradient(to bottom in lch shorter hue, hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} calc(h - 120) calc(s + 270) calc(l - 10) / alpha) 0 65%, transparent);
              background: linear-gradient(to bottom in lch shorter hue, color-mix(in lch shorter hue, hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} calc(h - 120) calc(s + 270) calc(l - 10) / alpha) 15%, #579ffb) 0 65%, transparent);
              */
            }
            &::-webkit-scrollbar {
              width: 6px;
            }
            &::-webkit-scrollbar-track {
              background: transparent;
            }
            &::-webkit-scrollbar-thumb {
              background: transparent;
            }
          }
          pattern > g {
            fill: hsl(from ${v.colors.fill || v.colors.background || "var(--bg-color, #f9f9f9)"} h s calc(l - 15) / alpha);
            stroke: none;
            opacity: 0.5;
          }
          #main-container {
            position: relative;
            overflow: hidden;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          #typing-indicator {
            position: absolute;
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
            border-top-right-radius: 0;
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
          .info-msg,
          .success-msg,
          .warning-msg,
          .error-msg,
          .prompt-msg,
          .progress-msg,
          .confirm-msg {
            --opacity: ${v.messageOpacity || 0.85};
            display: flex;
            gap: 0.4em;
            flex-flow: column wrap;
            align-items: center;
            justify-content: space-between;
            word-break: break-word;
            white-space: pre-wrap;
            text-align: justify;
            width: 100%;
            margin: 10px 0;
            padding: 10px;
            border-radius: calc(${v.borderRadius || "var(--border-radius, 4px)"} * 0.75);
            box-sizing: inherit;
            color: #e1e1ff;
            color: hsl(from ${v.colors.font || "var(--font-color, DarkSlateGray)"} h s calc(l + 100) / alpha);
            &:hover {
              outline-color: #ececec;
              outline-color: hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} h s calc(l - 20) / alpha);
              outline-width: ${v.outlineWidth || v.borderWidth || " var(--outline-width, var(--border-width, 4px))"};
              outline-offset: ${-v.outlineWidth || -v.borderWidth || " calc(-1 * var(--outline-width, var(--border-width, 4px)))"};
              outline-style: solid;
            }
            & :is(header, main, footer) {
              width: 100%;
              display: flex;
              flex-flow: row wrap;
              align-items: center;
              justify-content: space-between;
            }
            & main > * {
              flex-basis: 100%;
              flex-shrink: 0;
              white-space: normal;
            }
            & footer {
              flex-direction: row-reverse;
            }
            & .fa:is(.fa-close, .fa-remove, .fa-times, .fa-check-circle):not(:where(button *)) {
              cursor: pointer;
              &:hover {
                mix-blend-mode: overlay;
              }
            }
            & button:has(.fa:is(.fa-close, .fa-remove, .fa-times, .fa-check-circle)) {
              all: unset;
              cursor: pointer;
              display: inline-flex;
              align-items:center;
              justify-content: center;
              &:hover, &:focus {
                mix-blend-mode: overlay;
              }
              &:focus {
                outline-style: solid;
              }
            }
            & bioinfo-input {
              --heading-color: #e1e1ffaa;
              --heading-color: hsl(from ${v.colors.font || "var(--font-color, DarkSlateGray)"} h s calc(l + 100) / 0.6);
              --border-color: #ececec;
              --border-color: hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} h s calc(l - 20) / alpha);
              --base-font-color: #e1e1ff;
              --base-font-color: hsl(from ${v.colors.font || "var(--font-color, DarkSlateGray)"} h s calc(l + 100) / alpha);
              --hover-color: #ececec77;
              --hover-color: hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} h s calc(l - 20) / 0.4);
              --shadow-color: #ececec;
              --shadow-color: hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} h s calc(l - 20) / alpha);
            }
            &.prompt-msg > main span:last-of-type, &.progress-msg > main span:last-of-type {
              color: DarkKhaki;
            }
          }
          .info-msg, .progress-msg {
            background: linear-gradient(to bottom, #383B3944, transparent 40%), #579ffb;
            background: linear-gradient(to bottom, #383B3944, transparent 40%), hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} calc(h - 120) calc(s + 270) calc(l - 10) / alpha);
            background: linear-gradient(to bottom, #383B3944, transparent 40%), color-mix(in lch shorter hue, hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} calc(h - 120) calc(s + 270) calc(l - 10) / alpha) 15%, #579ffb);
          }
          .success-msg, .prompt-msg {
            background: linear-gradient(to bottom, #383B3944, transparent 40%), hsl(160, 100%, 25%);
            background: linear-gradient(to bottom, #383B3944, transparent 40%), hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} calc(h + 140) calc(s + 30) clamp(25, calc(l - 40), 90) / alpha);
            background: linear-gradient(to bottom, #383B3944, transparent 40%), color-mix(in lch shorter hue, hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} calc(h + 140) calc(s + 30) clamp(25, calc(l - 40), 90) / alpha) 15%, hsl(160, 100%, 25%));
          }
          .warning-msg, .confirm-msg {
            background: linear-gradient(to bottom, #383B3944, transparent 40%), hsl(42, 70%, 45%);
            background: linear-gradient(to bottom, #383B3944, transparent 40%), hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} calc(h + 50) calc(s + 60) clamp(25, calc(l - 40), 90) / alpha);
            background: linear-gradient(to bottom, #383B3944, transparent 40%), color-mix(in lch shorter hue, hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} calc(h + 50) calc(s + 60) clamp(25, calc(l - 40), 90) / alpha) 15%, hsl(42, 70%, 45%));
          }
          .error-msg {
            background: linear-gradient(to bottom, #383B3944, transparent 40%), hsl(0, 100%, 70%);
            background: linear-gradient(to bottom, #383B3944, transparent 40%), hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} calc(h + 0) calc(s + 100) clamp(25, calc(l - 40), 90) / alpha);
            background: linear-gradient(to bottom, #383B3944, transparent 40%), color-mix(in lch shorter hue, hsl(from ${v.colors.background || "var(--bg-color, #f9f9f9)"} calc(h + 0) calc(s + 100) clamp(25, calc(l - 40), 90) / alpha) 15%, hsl(0, 100%, 70%));
          }
          .progress-msg .progress-bar {
            & > div > div {
              background-color: hsl(42, 70%, 45%);
            }
            &[data-indefinite] > div > div {
              width: 100% !important;
              animation: progress-indefinite 2s linear infinite;
            }
            &::after {
              display: block;
              position: absolute;
              inset: 0;
              text-align: center;
              content: attr(data-value);
              padding: 4px;
              font-variant-numeric: tabular-nums;
              font-feature-settings: "tnum"; /* optional legacy fallback */
            }
            &[data-indefinite]::after {
              content: "" / "Progress Busy";
            }
          }
          .confirm-msg footer {
            justify-content: flex-start;
            gap: 0.5rem;
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
          .fa-upload:before {
            content: "\\f093";
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
          .fa-info-circle:before {
            content: "\\f05a";
          }
          .fa-remove:before,
          .fa-close:before,
          .fa-times:before {
            content: "\\f00d";
          }
          .fa-check-circle:before {
            content: "\\f058";
          }
          .fa-question-circle:before {
            content: "\\f059";
          }
          .fa-thumbs-up:before {
            content: "\\f164";
          }
          .fa-gears:before,
          .fa-cogs:before {
            content: "\\f085";
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
          @keyframes progress-indefinite {
            0% {
              background-position: 0 0;
            }
            100% {
              background-position: 35px 35px;
            }
          }
          @container component-container (min-width: 0px) {
            #typing-indicator {
              //max-width: calc(max(20cqw, 50px) + calc(${v.padding || "var(--padding, 10px)"} * 2.5));
              max-width: 100cqw;
              width: 100cqw;
            }
            #typing-indicator-name {
              //max-width: calc(max(20cqw, 50px) + calc(${v.padding || "var(--padding, 10px)"} * 2.5) - 50px);
              max-width: calc(100cqw - 50px);
            }
            #overlay {
              position: absolute;
              top: 0;
              width: calc(100cqw - 2 * var(--padding, 10px));
              height: auto;
              //background: #ff000022;
              max-height: 100%;
              overflow-y: auto;
              &::-webkit-scrollbar {
                width: 6px;
              }
              &::-webkit-scrollbar-track {
                background: #ddd;
              }
              &::-webkit-scrollbar-thumb {
                background: #bdbdbd;
              }
            }
          }
          /**
           * ==============================================
           * Animate CSS
           * ==============================================
           */
          .animated {
            -webkit-animation-duration: 1s;
            animation-duration: 1s;
            -webkit-animation-fill-mode: both;
            animation-fill-mode: both;
          }
          @-webkit-keyframes fadeInLeft {
            0% {
              opacity: 0;
              -webkit-transform: translate3d(-100%, 0, 0);
              transform: translate3d(-100%, 0, 0);
            }
            to {
              opacity: var(--opacity, 1);
              -webkit-transform: translateZ(0);
              transform: translateZ(0);
            }
          }
          @keyframes fadeInLeft {
            0% {
              opacity: 0;
              -webkit-transform: translate3d(-100%, 0, 0);
              transform: translate3d(-100%, 0, 0);
            }
            to {
              opacity: var(--opacity, 1);
              -webkit-transform: translateZ(0);
              transform: translateZ(0);
            }
          }
          .fadeInLeft {
            -webkit-animation-name: fadeInLeft;
            animation-name: fadeInLeft;
          }
          @-webkit-keyframes fadeOutLeft {
            0% {
              opacity: var(--opacity, 1);
            }
            to {
              opacity: 0;
              -webkit-transform: translate3d(-100%, 0, 0);
              transform: translate3d(-100%, 0, 0);
            }
          }
          @keyframes fadeOutLeft {
            0% {
              opacity: var(--opacity, 1);
            }
            to {
              opacity: 0;
              -webkit-transform: translate3d(-100%, 0, 0);
              transform: translate3d(-100%, 0, 0);
            }
          }
          .fadeOutLeft {
            -webkit-animation-name: fadeOutLeft;
            animation-name: fadeOutLeft;
          }
          /**
           * ==============================================
           * Animate CSS
           * ==============================================
           */
        </style>
    `}`
  }}
  |> await ${({values:v}) => async () => ch(shadow).append(v.section = ch.dom`
    <section class="msger">
      <header class="msger-header">
        <div class="msger-header-title">
          <i class="fa fa-upload"></i> ${v.headerTitle || "FileUpload"}
        </div>
        <button class="msger-header-options" disabled>
          <span><i class="fa fa-cog"></i></span>
        </button>
      </header>

      <main class="msger-chat">
        <div id="main-container">
          <textarea placeholder="${v.placeholder || "copy/paste or drag&amp;drop"}" spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off"></textarea>
        </div>
        <div id="typing-indicator">
          <div id="typing-indicator-name">test</div>
          <div class="dot-flashing"></div>
        </div>
        <div id="overlay"></div>
      </main>

      <form class="msger-inputarea">
        <div class="msger-upload"></div>
        <button type="button" class="msger-attach-btn"><i class="fa fa-paperclip"></i></button>
        <button type="button" class="msger-send-btn"><i class="fa fa-send"></i></button>
        <div class="msger-extra"></div>
      </form>
    </section>
  `)}
  |> await ${({values:v}) => async() => {
    const textarea = v.input = v.textarea = ch.select("textarea", v.section).selected,
          _handleTextarea = throttle_v2(function(e){
            e?.preventDefault?.();
            /*if (v.textareaDisabled) {
              return el[symbols.issueMessage]({msg:"Text input is currently disabled", fadeout: 5000, type: "info"});
            }*/
            handleTextarea.call(this, {event:e, element: el, values:v});
          }, {thisArg: textarea, delay: 50, defer: false});
    ch(textarea)
    .on("dragover", function(e){
      e.preventDefault();
    })
    .on("drop", function(e){
      e.preventDefault();
      if (v.dragndropDisabled) {
        return el[symbols.issueMessage]({msg:"Drag and drop is currently disabled", fadeout: 5000, type: "info"});
      }
      const fileList = e?.dataTransfer?.files;
      if (!fileList?.length){return}
      createFileListIcons(fileList, v.upload);
    })
    .on("paste", _handleTextarea)
    .on("beforeinput", _handleTextarea)
    .on("input", _handleTextarea);
  }}
  |> await ${({values:v}) => async() => {
    v.upload = ch.select(".msger-upload", v.section).selected;
    v.extra = ch.select(".msger-extra", v.section).selected;
    v.overlay = ch.select("#overlay", v.section).selected;
    v.attach = ch.select("button:has(i[class~=fa-paperclip])", v.section).selected;
    ch.on("click", function(e){return attachFile.call(this, {event:e, values:v})});
  }} 
  |> await ${({values:v}) => async() => v.main = v.section.querySelector("main")}
  |> await ${({values:v}) => async () => ch(v.chat = v.main.firstElementChild).prepend(v.svg = ch.dom`
    <svg id="main-svg" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <foreignObject>
          <slot></slot>
        </foreignObject>
        <pattern id="bgPattern" patternTransform="scale(3)" patternContentUnits="userSpaceOnUse" patternUnits="userSpaceOnUse" width="55" height="45">
          <g transform="translate(-0.21816057,-0.92192896)">
            <path d="m 50.581425,14.493742 v -2.512813 h -3.695313 c -0.245738,0 -0.443437,0.197699 -0.443437,0.443437 v 8.573125 c 0,0.245738 0.197699,0.443438 0.443437,0.443438 h 6.208125 c 0.245739,0 0.443437,-0.1977 0.443437,-0.443438 V 14.93718 h -2.512812 c -0.24389,0 -0.443437,-0.199548 -0.443437,-0.443438 z m 1.204672,3.990936 h -1.204672 v 1.478126 c 0,0.162592 -0.133032,0.295624 -0.295625,0.295624 h -0.59125 c -0.162594,0 -0.295624,-0.133032 -0.295624,-0.295624 v -1.478126 h -1.204674 c -0.264213,0 -0.395397,-0.319644 -0.208784,-0.506257 l 1.781141,-1.768207 c 0.123792,-0.121944 0.321491,-0.121944 0.443437,0 l 1.78114,1.768207 c 0.188462,0.186613 0.05543,0.506257 -0.208785,0.506257 z m 1.622241,-4.56371 -1.808855,-1.810702 c -0.08314,-0.08315 -0.195851,-0.129337 -0.314101,-0.129337 h -0.112708 v 2.365001 h 2.365 v -0.112708 c 0,-0.116403 -0.04619,-0.229108 -0.129336,-0.312254 z" style="stroke-width:0.0184766" />
            <path d="m 17.066421,18.902691 h 1.970504 v -2.14964 h -0.179137 c -0.98973,0 -1.791367,0.801637 -1.791367,1.791367 z m 0,0.358274 v 1.433094 c 0,0.98973 0.801637,1.791367 1.791367,1.791367 h 0.716547 c 0.98973,0 1.791367,-0.801637 1.791367,-1.791367 v -1.433094 h -2.149641 z m 4.299281,-0.358274 v -0.358273 c 0,-0.98973 -0.801637,-1.791367 -1.791367,-1.791367 h -0.179136 v 2.14964 z" style="fill:#000000;fill-opacity:0.249377;stroke-width:0.0111961" />
            <path d="m 19.916781,17.039082 h 1.970504 v -2.149641 h -0.179137 c -0.989731,0 -1.791367,0.801637 -1.791367,1.791367 z m 0,0.358273 v 1.433094 c 0,0.98973 0.801637,1.791367 1.791367,1.791367 h 0.716547 c 0.989731,0 1.791368,-0.801637 1.791368,-1.791367 v -1.433094 h -2.149642 z m 4.299282,-0.358273 v -0.358274 c 0,-0.98973 -0.801637,-1.791367 -1.791368,-1.791367 h -0.179136 v 2.149641 z" style="fill:#000000;fill-opacity:0.40399;stroke-width:0.0111961" />
            <path d="m 22.767142,15.175472 h 1.970503 v -2.149641 h -0.179136 c -0.98973,0 -1.791367,0.801637 -1.791367,1.791367 z m 0,0.358273 v 1.433094 c 0,0.98973 0.801637,1.791367 1.791367,1.791367 h 0.716546 c 0.989734,0 1.791366,-0.801637 1.791366,-1.791367 v -1.433094 h -2.149639 z m 4.299279,-0.358273 v -0.358274 c 0,-0.98973 -0.801632,-1.791367 -1.791366,-1.791367 h -0.179136 v 2.149641 z" style="fill:#000000;fill-opacity:1;stroke-width:0.0111961" />
            <path d="m 17.782732,34.011197 c 0.049,-0.09962 0.156779,-0.156779 0.266196,-0.142081 l 3.997861,0.499733 3.99786,-0.499733 c 0.109418,-0.01307 0.217204,0.04409 0.266197,0.142081 l 0.681008,1.362016 c 0.146981,0.292327 -0.0098,0.646712 -0.323356,0.736534 l -2.668505,0.762663 c -0.227004,0.06532 -0.470337,-0.03102 -0.591188,-0.233535 l -1.362016,-2.270026 -1.362015,2.270026 c -0.120851,0.202507 -0.364185,0.29886 -0.591187,0.233535 l -2.666874,-0.762663 c -0.31519,-0.08982 -0.470336,-0.444207 -0.323356,-0.736534 z m 4.282022,1.402844 0.896578,1.492664 c 0.243334,0.405013 0.728369,0.597719 1.184008,0.467071 l 2.082218,-0.594453 v 2.727298 c 0,0.359286 -0.244967,0.672842 -0.594453,0.761031 l -3.333183,0.832887 c -0.166578,0.04247 -0.34132,0.04247 -0.506265,0 l -3.333183,-0.832887 c -0.349487,-0.08982 -0.594453,-0.403379 -0.594453,-0.762664 V 36.77769 l 2.083851,0.596086 c 0.454005,0.130648 0.940674,-0.06206 1.184008,-0.467071 l 0.894944,-1.492664 z" style="stroke-width:0.0163312" />
            <path d="m 46.399947,35.256816 c -0.152779,0 -0.277778,0.125 -0.277778,0.277778 v 4.444444 c 0,0.152778 0.124999,0.277777 0.277778,0.277777 h 7.777776 c 0.152779,0 0.277779,-0.124999 0.277779,-0.277777 v -4.444444 c 0,-0.152778 -0.125,-0.277778 -0.277779,-0.277778 z m -1.111112,0.277778 c 0,-0.612849 0.498263,-1.111112 1.111112,-1.111112 h 7.777776 c 0.612848,0 1.111112,0.498263 1.111112,1.111112 v 4.444444 c 0,0.612847 -0.498264,1.111111 -1.111112,1.111111 h -7.777776 c -0.612849,0 -1.111112,-0.498264 -1.111112,-1.111111 z m 3.055555,3.333332 h 3.88889 c 0.152777,0 0.277776,0.125001 0.277776,0.277778 v 0.277778 c 0,0.152778 -0.124999,0.277777 -0.277776,0.277777 h -3.88889 c -0.152777,0 -0.277778,-0.124999 -0.277778,-0.277777 v -0.277778 c 0,-0.152777 0.125001,-0.277778 0.277778,-0.277778 z m -1.249999,-1.249999 c 0,-0.152778 0.125,-0.277777 0.277778,-0.277777 h 0.277778 c 0.152778,0 0.277776,0.124999 0.277776,0.277777 v 0.277779 c 0,0.152776 -0.124998,0.277776 -0.277776,0.277776 h -0.277778 c -0.152778,0 -0.277778,-0.125 -0.277778,-0.277776 z m 0.277778,-1.666667 h 0.277778 c 0.152778,0 0.277776,0.125 0.277776,0.277778 v 0.277778 c 0,0.152776 -0.124998,0.277778 -0.277776,0.277778 h -0.277778 c -0.152778,0 -0.277778,-0.125002 -0.277778,-0.277778 v -0.277778 c 0,-0.152778 0.125,-0.277778 0.277778,-0.277778 z m 1.11111,1.666667 c 0,-0.152778 0.125,-0.277777 0.277778,-0.277777 h 0.277777 c 0.152779,0 0.277779,0.124999 0.277779,0.277777 v 0.277779 c 0,0.152776 -0.125,0.277776 -0.277779,0.277776 h -0.277777 c -0.152778,0 -0.277778,-0.125 -0.277778,-0.277776 z m 0.277778,-1.666667 h 0.277777 c 0.152779,0 0.277779,0.125 0.277779,0.277778 v 0.277778 c 0,0.152776 -0.125,0.277778 -0.277779,0.277778 h -0.277777 c -0.152778,0 -0.277778,-0.125002 -0.277778,-0.277778 v -0.277778 c 0,-0.152778 0.125,-0.277778 0.277778,-0.277778 z m 1.111111,1.666667 c 0,-0.152778 0.125,-0.277777 0.277778,-0.277777 h 0.277778 c 0.152777,0 0.277778,0.124999 0.277778,0.277777 v 0.277779 c 0,0.152776 -0.125001,0.277776 -0.277778,0.277776 h -0.277778 c -0.152778,0 -0.277778,-0.125 -0.277778,-0.277776 z m 0.277778,-1.666667 h 0.277778 c 0.152777,0 0.277778,0.125 0.277778,0.277778 v 0.277778 c 0,0.152776 -0.125001,0.277778 -0.277778,0.277778 h -0.277778 c -0.152778,0 -0.277778,-0.125002 -0.277778,-0.277778 v -0.277778 c 0,-0.152778 0.125,-0.277778 0.277778,-0.277778 z m 1.111112,1.666667 c 0,-0.152778 0.124999,-0.277777 0.277778,-0.277777 h 0.277778 c 0.152777,0 0.277777,0.124999 0.277777,0.277777 v 0.277779 c 0,0.152776 -0.125,0.277776 -0.277777,0.277776 h -0.277778 c -0.152779,0 -0.277778,-0.125 -0.277778,-0.277776 z m 0.277778,-1.666667 h 0.277778 c 0.152777,0 0.277777,0.125 0.277777,0.277778 v 0.277778 c 0,0.152776 -0.125,0.277778 -0.277777,0.277778 h -0.277778 c -0.152779,0 -0.277778,-0.125002 -0.277778,-0.277778 v -0.277778 c 0,-0.152778 0.124999,-0.277778 0.277778,-0.277778 z m 1.111109,1.666667 c 0,-0.152778 0.125001,-0.277777 0.277779,-0.277777 h 0.277777 c 0.152778,0 0.277778,0.124999 0.277778,0.277777 v 0.277779 c 0,0.152776 -0.125,0.277776 -0.277778,0.277776 h -0.277777 c -0.152778,0 -0.277779,-0.125 -0.277779,-0.277776 z m 0.277779,-1.666667 h 0.277777 c 0.152778,0 0.277778,0.125 0.277778,0.277778 v 0.277778 c 0,0.152776 -0.125,0.277778 -0.277778,0.277778 h -0.277777 c -0.152778,0 -0.277779,-0.125002 -0.277779,-0.277778 v -0.277778 c 0,-0.152778 0.125001,-0.277778 0.277779,-0.277778 z" style="stroke-width:0.0173612" />
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
    scrollToBottom: Symbol("scrollToBottom"),
    issueMessage: Symbol("issueMessage"),
    textAreaStreamBusy: Symbol("textAreaStreamBusy"),
    abort: Symbol("abort")
  }
)

ch.adopt("simple-upload", simpleUpload)`<simple-upload ${{}}/>`
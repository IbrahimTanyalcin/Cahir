# SIMPLE UPLOAD

<video width="480" height="auto" controls>
  <source src="https://ibrahimtanyalcin.github.io/Cahir/static/video/simple-upload-demo.mp4" type="video/mp4">
</video>

![gif](https://ibrahimtanyalcin.github.io/Cahir/static/gif/simple-upload-demo.gif)

👉 [Codepen](https://codepen.io/IbrahimTanyalcin/pen/bNNxyLo)

Simple-upload is a tool you can use to provide interactive file upload/form behavior via just adding `<simple-upload></simple-upload>` element. Simple upload is similar to html form element, but handles errors, user prompts, validation, streaming and all. Most importantly, it is a web component, works with any framework.

Has 0 opinions on how the backend should respond or what it should receive. Simple-upload is a pure UI component, you get to control how the upload should take place between frontend and backend. It gives you files, text and validated user inputs and handles the abort issues without you writing boiler plate code.

## Installation

### regular script

```html
  <script src="https://cdn.jsdelivr.net/npm/cahir@0.0.10/dist/cahir.0.0.10.evergreen.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/cahir@0.0.10/collections/DOM/ch.0.0.10.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/cahir@0.0.10/components/bioinfoInput/bioinfo-input.0.0.10.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/cahir@0.0.10/components/simpleUpload/simple-upload.0.0.10.js"></script>
```

The first 2 are cahir library itself and a selection of DOM methods that are shared accross all ui elements, the 3rd script is another cahir web component for providing a user input.

### es module
```html
<script type="module" src="./components/bioinfoInput/bioinfo-input.0.0.10.es.js"></script>
<script type="module" src="./components/simpleChat/simple-chat.0.0.10.es.js"></script>
```

If you use a bundler, it should be able to handle the dependencies. If not please reach out to me and open an issue.

## Example markup

```html
<simple-upload></simple-upload>
```

that's it.

## Example

Go to the [examples](../examples/) folder and run:

```shell
cd examples
node server.cjs
```

Visit `localhost:3000`

## List of Attributes

All attributes are optional. You can update these as you want even after component is mounted, it batches changes and updates itself.

```js
/*<simple-upload*/
  data-width-ratio = "0.95" //controls how much of parent width it should take

  data-colors = "background,transparent,stroke,orange" //comma separated list of colors to override. Alternatively, use --bg-color as a single means to set theme!

  data-hide-header //boolean attribute to hide or show the header

  data-title = "FileUpload" //title of the header
  
  data-disabled //disables the component wrt user interaction

  data-cancellable //Boolean attribute that sets the send icon to cancel icon the component is NOT disabled. Internally used.
  
  data-file = "true" //set it to 'false' to disable attaching file

  data-placeholder //set it to any string you want to de displayed as placeholder for the textarea + drag and drop. Replaces the default 'copy/paste or drag&drop'
  
  data-hide-textarea //hides the textarea + drag and drop zone
  
  data-textarea-regex = "/^hello/gi" //a full regular expression with flags that validates against the text content of the textarea. Can be base64 encoded.
  
  data-filename-regex = "/.txt$/i" //a full regular expression with flgas that validates against the user provided file name.

  data-disable-textarea //disables typing/pasting text but doesnt touch drag and drop functionality
  
  data-disable-dragndrop //disables drag and drop functionality but does not interrupt typing/pasting text
  
  data-message-opacity = "0.85" //sets the opacity of the messages and info displayed to user. Default is 0.85
  
  data-filename-message = "You need to provide .txt extension" //sets the invalid filename message when user inputs a name that does not pass the regex or function validator.
  
  data-textarea-message = "invalid text" //set the textarea message when it does not match the provided regex or function validator
  
  data-sending-message = "Uploading..." //changes the default 'Sending...' message when user clicks the send button
  
  data-sent-message = "You are all set!" //changes the default 'Done!' success message displayed to the user after send
  
  data-confirming-message = "Are you sure you want to cancel?" //changes the default message when the user wants to abort sending
  
  data-confirmed-message = "Canceled by user" //changes the default cancel message once the user aborted sending
  
  data-textarea-max-size = "16384" //sets the default size in bytes for pasted/typed text content. If the content size in LENGTH passes this limit, the user will be prompted to enter a file name and it will be saved as a file instead. Default is 65536

  data-override-mime = "text/plain" //simple-upload provides extensive mime types inferred from the user supplied filename extension. If you always want to disregard auto mime type setting, use this attribute.
  
  data-stream-enqueue-delay = "1" //sets a Stream API's controller.enqueue delay in milliseconds to provide the user a sense of progress. Even for large pasted content > 100Mb, simple-upload uses async iterator that is visually fast and takes less than a second, to provde the user some sense of progress you can set this to create an artifical delay.
  
  data-update-delay = "50" //when you change attributes on simple-upload or call methods that change attributes, the changes are batched and called in bulk. This is the default interval.

  data-toggle-delay = "50" //when you do el.toggle(), it controls how frequent you can spam it.

  data-resize-delay = "500" //when the window or parent container is resized, resize events are batched and fired at this interval. Default is 500ms.
  
  data-form-action = "/path/to/api" //if you do not want to use js methods like el.send or el.onsend to register functions to control what happens when the user clicks on send button, you can use this attribute to set a default endpoint where the component uploads files and text content. Think of it like native html form's action attribute. Default method is 'POST' and uses FormData. Adds files to 'files[]' field, textare content as text to 'text' field and sends some nifty fields you can use in your backend: 'fileCount', 'totalFizeSizeInBytes', 'textSizeInBytes', 'totalSizeInBytes'
  
  data-form-method = "POST" //set the form method, default is POST. This attribute is a no operation if data-form-action does not exist.
  
  data-form-request-init = "eyJtZXRob2QiOiJQT1NUIiwiYm9keSI6IntcInVzZXJuYW1lXCI6XCJleGFtcGxlXCJ9IiwiaGVhZGVycyI6eyJDb250ZW50LVR5cGUiOiJhcHBsaWNhdGlvbi9qc29uIn19" //a json string or base 64 encoded json string that is sent as RequestInit object for fetch. Use this if you need to set proprietary headers in fetch etc. Does not have to be base64 encoded, but since double quotes can break html parsing, it is recommended.
/*></simple-upload>*/
```

## List of Methods

```js
/*set custom css
  simpleUploadEl.css(`
      :host {
          --font-color: var(--font-color-chat-box);
          --bg-color: #f9f9f9
      }
  `);
*/
simpleUploadEl.css(cssStr) //set a custom css
simpleUploadEl.enable(); //enables component
simpleUploadEl.disable(); //disables component
simpleUploadEl.setCancellable(bool); //replaces the send icon with cancel if the component is not disabled. Used internally
simpleUploadEl.hideHeader(); //hides the header
simpleUploadEl.showHeader(); //shows the header
simpleUploadEl.hideTextarea(); //hides the textarea + drag and drop
simpleUploadEl.showTextarea(); //shows the textarea + drag and drop
simpleUploadEl.disableTextarea(); //disables textarea
simpleUploadEl.enableTextarea(); //enables textarea
simpleUploadEl.disableDragndrop(); //disables drag and drop
simpleUploadEl.enableDragndrop(); //enables drag and drop
simpleUploadEl.setHeaderTitle("custom-title"); //changes the default SimpleChat title
simpleUploadEl.setPlaceholder(ph); //replaces the default placeholder string
simpleUploadEl.setOverrideMime(mime); //overrides the automatic mime detection with the passed mime argument, like 'text/plain'. If no argument is given, it is removed.
simpleUploadEl.setFilenameMessage(msg); //replaces the default invalid filename message
simpleUploadEl.setFilenameValidator(func); //adds a function validator to the user supplied filename. Works in CONJUNCTION with data-filename-regex. Both have to return true. Default always returns true, falling back to data-filename-regex.
simpleUploadEl.setTextareaMessage(msg); //replaces the default invalid text message
simpleUploadEl.setTextareaValidator(func); //similar to setFilenameValidator, but for the text content. Works in CONJUNCTION with data-textarea-regex
simpleUploadEl.setTextareaMaxSize(num); //sets the data-textarea-max-size attribute. Default 65536.
simpleUploadEl.setSendingMessage(msg); //sets the data-sending-message attribute
simpleUploadEl.setSentMessage(msg); //sets the data-sent-message attribute
simpleUploadEl.setConfirmingMessage(msg); //sets the data-confirming-message attribute
simpleUploadEl.setConfirmedMessage(msg); //sets the data-confirmed-message attribute
simpleUploadEl.setStreamEnqueueDelay(ms); //sets the stream enqueue delay in milliseconds. Check data-stream-enqueue-delay in List of Attributes section.
simpleUploadEl.setMessageOpacity(0.6); //sets opacity of the messages displayed to user.
simpleUploadEl.disableFile(); //disables file attachment
simpleUploadEl.enableFile(); //enables file attachment
simpleUploadEl.changeBackground(nodeStr or node); //switches the default background of textarea + drag and drop. You can pass a node object or an svg outerhtml string
simpleUploadEl.clear(); //empty textarea
simpleUploadEl.clearFiles(); //remove the attached files
simpleUploadEl.abortSend(msg); //displays the msg argument to the user and programmatically aborts current sending process
```

## Manual Send

At anytime you can do:

```js
simpleUploadElement.send(f)
```

to programmatically call a function.

Above will call `f` with `this` pointing to the component and an object `{files[], text, textContent, abort, progress}`. 

`text` and `textContent` are identical and will be the textarea contents and files array is populated with [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File) objects or an empty array.

`abort` is the [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) instance which you can pass its `signal` to `fetch` (if you are using fetch inside your function).

`progress` is a small object with `set`, `rm`, `msg` methods that allow you to display sentence above progress bar via `progress.msg("some message")`, or remove via `progress.rm()` to remove it. Most frequently, you'll want to use `progress.set(0.5)` to set the progress bar to 50% etc. Methods other than `set` are internally used and you do not need to manage this yourself. You also do not need to set a progress if you are not able to get progress, in that case default progress is always a infinite sliding animation until the returned `promise` (fetch etc) is resolved.

## Events

Register an event to be fired when the send button is clicked:

```js
simpleUploadElement.onsend(function({files, text, textContent, abort, progress}){
    //do something like
    const fData = new FormData(),
          signal = abort.signal;
    for (const file of files){
      fData.append("files[]", file);
    }
    fData.append("text", text);
    return fetch("/path/to/api", {
      method: "POST",
      body: fData,
      signal
    })
});
```

A progress bar will be displayed until the returned `promise` is resolved. The user has the ability to cancel the sending. To refer to what the argument passed to your function is, refer to the **Manual Send** section.

You can register more than 1 event. `onsend` method accepts an optional `namespace`:

```js
simpleUploadElement.onsend(function({files, text, abort, progress}){
    //do something
}, "mynamespace");
```

Later you can do:

```js
simpleUploadElement.offsend("mynamespace");
```

This way, if you attached several listeners with same namespace, you can selectively and bulk remove those.

`onsend` and `offsend` methods can also be set like this:

```js
simpleUploadElement.onsend = function({files, text, abort, progress}){
    //do something
}
```

However if you use the above form, you won't be able to use namespaces.

If you want to execute a function once the component ready, use the `onready`:

```js
simpleUploadElement.onready(() => {
  //do something
}, /*...args*/)
```

this will call the registered function with the supplied arguments (if any) and `this` pointing out the component (not if you are using lambda like above).

## Contributing

If this project has been useful to you, you can help to make it better via:

- submitting PR for features
- fixes / bugs that I wasn't aware of
- supporting with documentation

## Credits

- progress bar is taken from Ravikumar Chauhan (https://codepen.io/rkchauhan)
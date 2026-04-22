# TODO
## 16 10 2023
- ~~measure the performance between returning freshly bound functions at `get` handler of the `Proxy` versus storing the bound function on a `Map`.~~ *Chrome lighthouse reports BETTER performance for returning freshly bound functions. Very counter intuitive, perhaps some sort of compiler optimization*

## 17 10 2023
- Add an API section that defines different methods inside [collections](collections/) in `JSDoc` syntax

## 10 02 2025
- add `white-space` pre-wrap to default parser of simple-chat
- add a class selector to ch collections: "ch`.**** `" and "ch``"
- add querySelectorAll variant selector ch, but one that splits via `,` and returns objects not in doc traversal but in selector order

## 19 04 2026
- Add lightweight automated tests
- Add e2e tests for components (possibly ai automated)
- Deal with TustedTypes API that is being rolled out. Dedice whether to create a default policy and tell consumers to include that in the CSP headers. Optinally provide method to preprocess input before being passed to sinks. Have an internal list to wrap values with createHTML from the policy in `ch.set`
- Provide framework wrappers
- Provide font-family fix and fallback with proper font-weigth for consumers using FontAwesome 4+
- Extend the version-bump script to provide number to changes to be made during dry-run so that those numbers can be passed by argument to signal bypass


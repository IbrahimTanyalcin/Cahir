# TODO
## 16 10 2023
- ~~measure the performance between returning freshly bound functions at `get` handler of the `Proxy` versus storing the bound function on a `Map`.~~ *Chrome lighthouse reports BETTER performance for returning freshly bound functions. Very counter intuitive, perhaps some sort of compiler optimization*
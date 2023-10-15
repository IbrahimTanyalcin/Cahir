export default Object.defineProperties(
    {},
    {
        _noTTError: {
            enumerable: false,
            configurable: false,
            get: function(){return new Error("Pickle method only accepts a tagged template");}
        }
    }
);
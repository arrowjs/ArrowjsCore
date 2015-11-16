
Declare folder:

```javascript
\\config/config.js
 ArrowHelper : "/helpers/"
```

Demo global function:

```javascript
module.exports = {
    test : function (key) {
        let self = this; // this = your arrow application;
        return self._lang[self._config.language][key] || "undefined";
    },
    variableTest : "demo"
};
```

How to use :

You can call global function and variables everywhere inside your application, under the namespace *ArrowHelper*.
```javascript
    ArrowHelper.test(),
    ArrowHelper.variableTest,
```
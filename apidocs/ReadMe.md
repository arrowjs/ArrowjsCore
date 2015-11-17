How to generate JSDoc
==================

Install latest jsdoc3 from git. Do not install from npmjs because this old version cannot parse class keyword in ECMA script 2015.

```
npm install git+https://github.com/jsdoc3/jsdoc.git --save-dev
npm install grunt-jsdoc --save-dev
npm install ink-docstrap --save-dev
rm -rf node_modules\grunt-jsodc\node_modules\jsdoc
```

then run
```
grunt jsdoc
```



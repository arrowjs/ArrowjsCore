## Folder setting

config/view.js
```
    functionFolder : '/extendsView/function',
    filterFolder : '/extendsView/filter',
    variableFile : '/extendsView/variable.js'
```
## Custom filter sample

Declare : 
```
   module.exports = {
       name: "test", //default file_name
       async :true, // default false 
       handler : function (param,cb) { //if async we must push cb(err,data)
           fs.readFile("file", function (err,data) {
               cb(null,err)
           })
       }
   }; 
```

Use : 
```
    {{ "" | test }} //param = "",second param need add to test(b,c)..
```



## Function sample

Declare :
```
 module.exports = {
       name: "test", //default file_name
       async :true, // default false>
       handler : function (param) { 
           .....
       }
   }; 
```
function async can run when you use async filter 

```
    {{ test() | async }}
```

Use : 
```
    {{ test() }} 
```

## Variable sample

Declare :
```
 module.exports = {
       "hello" : "Hello World"
 }; 
```

Use: 
```
    {{ test }}
```


## Core support Filter

- async : 
It receive a function async and make function run async in view
```
    {{ <async function> | async }}
```

## Core support function

- link_to(name,option) : route function
```
    {{ link_to('about',{id : 1}) }}
    // get route name about and replace id = 1; result: /about/1;
```

- t(key) : translate function

```
    t('module_name')
    //check folder lang and get result of key 'module_name'
```
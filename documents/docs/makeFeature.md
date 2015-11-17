Feature
========================
Feature represents one unit of feature in web application. A feature consists of Model, View, Controller, Route.

- Model: data structure and data object that is fetched from back end database. In early version, we support Postgresql. Later on we will support MongoDB, MySQL,...
- View: View template = HTML + Nunjucks syntax, CSS, JavaScript
- Controller: Javascript file contains handler functions for different HTTP requests
- Router: Direct HTTP request to appropriate handler functions in controller


## Folder structure of feature
![folder structure of blog feature](./img/folder_feature.jpg)

Folder structure of a feature is governed by [structure.js](./structure.md). In common web application, a feature may have more than one subfolders: 

- *frontend* sub folder: It is customer facing part for end user.
- *backend* sub folder: It is back office operational part for administrator, operator.

A feature may have only *frontend* sub folder or *backend* subfolder or more than that. Below is extract of controller section in structure.js. There are sub folders *backend* and *frontend*. When you implement new feature, you may skip one of them but creating new sub folder different with *backend* and *frontend* will not be recognized when Arrowjs app parses.

Example of feature that have backend and frontend sub folders.

```
controller: [
    {
        path: {
            name: "backend",
            folder: "backend/controllers",
            file: "*.js"
        }
    },
    {
        path: {
            name: "frontend",
            folder: "frontend/controllers",
            file: "*.js"
        }
    }
]
```

Example of feature that has a single, direct sub folder named *controllers*

```
controller: [
    {
        path: {     
            folder: "controllers",
            file: "*.js"
        }
    }    
]
```


## Create a feature manually
In booting process, Arrowjs web application will parse and load all features in folder *features*. Developer can create feature manually or use Yeoman generator to generate scaffold of feature.

To create a feature manually.

```
    mkdir <name>
    cd <name>
    touch feature.js
```
<name> is real name of feature such as: blog, order, event_calender. Please don't use space in feature name.

feature.js is required configuration file for feature.

```
'use strict';

module.exports = {
    name: "index" // if not exist, Arrowjs will use feature folder name instead
    title: "Index Module", //display in feature management in back end
    author: 'Tran Quoc Cuong', 
    version: '0.1.0',
    description: "Hello Arrowjs",
    permissions: [
        {
            name: 'index',  //key of permission
            title: t('m_users_backend_rule_index')  //description of permission in localized language
        },
        {
            name: 'create',
            title: t('m_users_backend_rule_create')
        },] 
    };

```



## Create a controller inside a feature
In this example, we are going to create a controller sub folder inside a feature then create index.js. index.js contains functions that handles HTTP requests we need map in route.js

```
    cd <feature name>
    mkdir controllers
    cd controllers
    touch index.js
```

Below is example index.js that has one handler function responses back to browser "Hello Arrowjs"

```
module.exports = function (controller,component,application) {
    controller.index = function (req,res) {
       res.send("Hello Arrowjs");
    };
}
```
Developer can access properties 5 parameters passed in:

- controller > controller object itself
- component > feature object that contains controller
- application > Arrowjs application object
- req > [request object](http://expressjs.com/api.html#req)
- response > [response object](http://expressjs.com/api.html#res)

## Tạo route đầu tiên

Tạo một file route.js ở ngay ngoài thư mục của feature
```
'use strict';

/**
 * Map final part of URL to equivalent functions in controller
 */
module.exports = function (component,application) {
    return {
        "/": {
            get : {
                handler: component.controllers.index
            }
        },
    }
};
```

## Tạo file layout cho feature

tạo thư mục view trong feature. Hệ thống Arrow sẽ tự động loading các file trong thư mục này khi bạn gọi hàm res.render()

``` 
       cd <feature name>
       mkdir view
       touch index.html

```
File view trong ArrowJS tuân thủ một số cú pháp của Nunjucks. Bạn hoàn toàn có thể sử dụng html ở đây.

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{title}}</title>
</head>
<body>
<h1>{{ title }}</h1>
</body>
</html>
```

## Chỉnh sửa controller để renderView
Để có thể render bạn có thể gọi res.render hoặc component.render

```
module.exports = function (controller,component,application) {
     controller.index = function (req,res) {
        res.render("index.html");
      };
    }
```

Để đẩy dữ liệu từ controller ra view bạn hãy truyền dữ liệu cho nó như sau :

```
    res.render("index.html",{ title : "Hello ArrowJS"});
```

## Tạo Model

Core Arrow hỗ trợ mặc định cơ sở dữ liệu PostgreSQL bên cạnh đó bạn có thể sử dụng mySQL, sqlite

Cấu trúc môt model đơn giản :

```
var bcrypt = require('bcrypt');

module.exports = function (sequelize,Datatypes) {
    var User = sequelize.define('user', {
        id : {
            type: Datatypes.INTEGER,
            primaryKey : true,
            autoIncrement : true
        },
        username: {
            type: Datatypes.STRING,
            unique: true
        },
        password: {
            type: Datatypes.STRING,
        },
    }, {
        freezeTableName : true,
        hooks : {
            beforeCreate: function (user, op, fn) {
                if(user.password) {
                    bcrypt.hash(user.password,10, function (err, hash) {
                        if(err) throw  err;
                        user.password = hash;
                        fn(null, user);
                    })
                } else {
                    user.password = '';
                    fn(null, user);
                }
            }
        }
    })

    User.sync();
    return User
}
```

## Lấy dữ liệu từ model trong controller

Trong controller để sử dụng database bạn có thể gọi 
```
    component.models.[tên của model].findById // Hàm hỗ trợ của model
```

Bên cạnh đó để gọi toàn bộ model trong hệ thống bạn có thể dùng cú pháp:

```
    application.models.[tên của model].findById // Hàm hỗ trợ của model
```


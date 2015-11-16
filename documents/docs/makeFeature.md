Hệ thống feature trong Arrowjs gốc được thiết kế theo mô hình MVC.
Mỗi feature là một tính năng gồm có *route, model,view,controller*

## Tạo thư mục và file cấu hình cho feature:
Hệ thống Arrowjs cơ bản sẽ load các feature trong thư mục *features*. Hãy tạo ra một folder với tên feature bạn mong muốn, đồng thời tạo kèm file để cấu hình cho feature

```
    mkdir <name>
    cd <name>
    touch feature.js
```

Thêm nội dung cho file feature.js

```
'use strict';

module.exports = {
    name: "index" // nếu không có tên hệ thống tự nhận tên folder làm tên feature
    title: "Index Module", 
    author: 'Tran Quoc Cuong',
    version: '0.1.0',
    description: "Hello Arrowjs",
    permissions: [] // Các quyền  cho các Controller.(active role  = true).
};

```

## Tạo controller đầu tiên

Tạo thêm thư mục controller và tạo file controller đầu tiên cho hệ thống. Arrowjs sẽ tự động load toàn bộ các file javascript trong thư mục controller

```
    cd <feature name>
    mkdir controller
    touch index.js
```

Nội dung một file index.js
```
module.exports = function (controller,component,application) {
     controller.index = function (req,res) {
        res.send("Hello Arrowjs");
      };
    }
```
Với các bạn đã làm quen với Express bạn hoàn toàn có thể gọi được các hàm của trên đối tượng request và response . Ở đây chúng ta gửi ra đoạn text "Hello world".

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


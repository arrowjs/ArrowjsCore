#### Model Associate
Để tạo quan hệ giữa các bảng ở từng bảng cần thêm classMethod như sau:

```
classMethods: {
    associate: function () {
        return {
            "user" : {
                type : "belongsTo",
                option : {
                    foreignKey: 'created_by'
                }
            }
        }
    }
}
```

There are several [relation and associate types](http://docs.sequelizejs.com/en/latest/docs/associations/)

1- 
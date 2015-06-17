# Flash Messages

Là một middleware xử lý messages

`app\plugins\flash-plugin.js`

```js
module.exports = function(req, res, next){
    res.locals.messages = [];
    req.flash = {
        success:function(content){
            res.locals.messages.push({
                type:'success',
                content:content
            })
        },
        error:function(content){
            res.locals.messages.push({
                type:'error',
                content:content
            })
        },
        warning:function(content){
            res.locals.messages.push({
                type:'warning',
                content:content
            })
        },
        info:function(content){
            res.locals.messages.push({
                type:'info',
                content:content
            })
        }
    }
    next();
}
```

Việc xử lý để xuất ra view được viết trong `custom_filters\flash_messages.js`

##Cách sử dụng

Nếu muốn flash một message ra ngoài sử dụng `req`.`flash`.`[message_type]`

* `req` - là request.
* `[message_type]` - bao gồm `error`, `success`, `warning`, `info`.

Ví dụ:

```js
exports.index=function(req, res){
    req.flash.error("Oh! có lỗi gì đó");
    res.render('views');
}
```



# Tạo một filter mới

Tạo một file javascript mới trong thư mục `custom_filters` VD: tạo file `hello_filter.js`

Nội dung của file `hello_filter.js`:

```js
module.exports = function (env) {
    //hello_filter là tên của filter, có thể thay đổi thành bất kỳ tên khác
    env.addFilter('hello_filter', function(input){
        return "Hello "+ input;
    });
}
```

Cách sử dụng ngoài template
```
{{ "Thanh"|hello_filter }}
```

Kết quả

```
Hello Thanh
```

#Tạo filter có hàm xử lý bất đồng bộ(async)

Tạo file javascript `async_filter.js` với nội dung

```js
module.exports = function (env) {
    //async_filter là tên của filter, có thể thay đổi thành bất kỳ tên khác
    env.addFilter('async_filter', function(input, callback){
        //Gọi các hàm xử lý bất đồng bộ ở đây
        .....
        //Sau khi muốn kết thúc thì phải gọi hàm callback để trả về kết quả
        //hàm callback luông có 2 biến err và res để trả về cho view
        callback(err,res);
    },true);//phải bổ sung thêm một biến true để báo đây là hàm bất đồng bộ
}
```


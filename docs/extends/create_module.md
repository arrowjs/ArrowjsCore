# Tạo mới module backend

###1. Tạo folder mới trong thư mục `app\backend` theo cấu trúc

```
    [module-name]       # Tên module
        controllers     # Thư mục chứa file xử lý nghiệp vụ
            index.js    # File xử lý nghiệp vụ
        models          # Thư mục chứa file model của module
        module.js       # File định nghĩa module
        route.js        # File định nghĩa điều hướng của module
```

Nội dung file `module.js`

```js
module.exports = function (modules) {
    modules.[module_name] = {
        title: '[module_title]',
        rules: []
    }
    return modules;
};
```

* `[module_name]` - tên module
* `[module_title]` - tên hiển thị
* `rules` - là mảng các chức năng có trong module có các thuộc tính
    * `name` - tên chức năng
    * `title` - tên hiển thị

###2. Tạo folder mới trong thư mục `app\themes\admin`

```
    [module-name]
        index.html  # File định nghĩa hiển thị của module
```

###3. Tạo một menu mới trong backend

Đọc thêm [ở đây](../folders/app/menus.md) để tạo mới một menu
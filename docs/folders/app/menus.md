# Thư mục menus
![Screenshot](img/img4.png)

Định nghĩa cấu trúc `Menus` của backend

Mỗi group menus trong backend được chia thành các thư mục khác nhau để dễ quản lý

#Cấu trúc thư mục
* `default` - thư mục chứa các menu của nhóm `Main Navigation`
* `systems` - thư mục chứa các menu của nhóm `System`

#Các thuộc tính cần có của menu file

Thông tin nhóm các menus được định nghĩa trong file `menus_manager.js` trong thư mục `libs`
```js
var menus = {};
module.exports = function () {
    //Main Navigation group
    menus.default = {
        title:'Main Navigation',
        sort:1,
        modules:{}
    };
    //System group
    menus.systems = {
        title:'Systems',
        sort:2,
        modules:{}
    };

    return menus;
};
```
Các file menu phải được cung cấp các thông tin `menus`.`group_name`.`module`.'menus'

```js
module.exports = function (menus) {
    menus.systems.modules.menus = {
        title:'Menus',
        sort: 3,
        icon:"fa fa-bars",
        menus: [
            {
                name: 'index',
                title: 'All Menus',
                link: '/'
            },
            {
                name: 'create',
                title: 'New Menu',
                link: '/create'
            }

        ]
    };
    return menus;
};
```
![Screenshot](img/img10.png)



# Thư mục backend
![Screenshot](img/img2.png)

Chứa toàn bộ mã nguồn của các module xử lý trong phần admin

# Cấu trúc thư mục một module
* `dir-name` - Tên module.
    * `controllers`(có thể có hoặc ko) - Thư mục chứa tất cả các file xử lý nghiệp vụ.
    * `models` - Thư mục chứa tất cả các file model được định nghĩa theo chuẩn của sequlize.
    * `module.js` - File chứa thông tin định nghĩa module(tên, các chức năng ...) .
    * `route.js` - File định nghĩa điều hướng.

VD: module phần quyền `roles`

![Screenshot](img/img8.png)



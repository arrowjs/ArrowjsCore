# Tạo một theme mới

Chuẩn bị đầy đủ tài nguyên của theme(hình ảnh, file css, javascript ...).

Tạo một thư mục mới `[theme-name]` trong thư mục `public`.

```
    public
        [theme-name]    # Thư mục chứa css, image, javascript...
```

Chép toàn bộ tài nguyên của theme vào thư mục

Tạo một thư mục mới `[theme-name]` trong thư mục `app\themes`

Tạo file `layout.html` trong thư mục

```
    app
        themes
            [theme-name]
                [module]    # Module muốn viết đè
                layout.html # Định nghĩa layout của theme
```

Vào file `config\env\all.js` sửa thuộc tính `themes:default` thành `theme:[theme-name]`.


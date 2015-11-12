Demo Theme
==================

ArrowJS uses [Nunjuck template](https://mozilla.github.io/nunjucks/) to render HTML page.

## Configuration
In the folder config/structure, you can define folder location for theme (Nunjuck view + CSS + JavaScript).
Option A: views are in module folder
```json
view : {
  path :{
    folder : "view"
  }
}
```
```json
view : {
  path :{
    folder : "/public/themes/:theme/"
  }
}
```
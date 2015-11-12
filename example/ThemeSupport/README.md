Theme switching
==================
Arrowjs.io uses Nunjucks as default template. Theme are set of Nunjucks templates with CSS, JavaScript and images files.

## Nunjucks Syntax

[Nunjucks Syntax](https://mozilla.github.io/nunjucks/) is similar syntax with [Twig syntax](http://twig.sensiolabs.org/). Assume that you use WebStorm or PHP Storm to code and highlight by [twig plugin](https://plugins.jetbrains.com/plugin/7303?pr=). If you have pure HTML, CSS,  JavaScript web template, you need to change extension of .html file to .twig so WebStorm or PHPStorm can highlight Nunjucks syntax properly.
![Nunjuck Highlight](help/nunjucksyntax.jpg)

##Define locations of themes and view templates in configure/structure.js

Theme defines consistent look of web site. While view templates associates with custom feature. A feature may have several view templates. Common CMS feature such as blog post will use view templates in theme folder.

All themes should be placed in the folder ```/public/themes```.
In the view section of file ```config/structure.js```,  we define one or more locations of view templates.

```
view : {
  path :{
    folder : ["/public/themes/:theme","view"]
  }
}
```

In above example, we define two folders:

* /public/themes/:theme: a theme folder named by :name parameter in /public/themes
* view: view template folder inside feature folder

![image](help/viewfolder.jpg)

##Default theme and view template extension
The configure file ```config/view.js``` defines ```viewExtension``` by default is ```twig``` and ```theme``` in this example is "clean". There will be a folder named clean in ```/public/themes```

```
module.exports = {
    resource : {
        path : 'public',
        option : {
            maxAge: 3600
        }
    },
    viewExtension : "twig",
    pagination: {
        number_item: 20
    },
    theme: "clean"
};
```

## Switching Theme

User may change theme on fly without rebooting Node.js app. Look at method ```controller.changeTheme``` in file ```features/index/controller/index.js```


```
    controller.changeTheme = function (req,res) {
        let theme = req.query.theme || "clean";
        application.setConfig("theme",theme).then(function () {
            res.render('change', {theme: application.getConfig('theme')});
        });
    }
```
Guide lines
========================
1. Every function in Arrowjs Core, CMS and examples must be documented in plain, simple English and [JSDoc syntax](http://usejsdoc.org/)
2. Key in JSON configuration file must not enclosed in double quotes "" nor single quote ''. It must not contain space character nor . character.
3. File extension for view template is .twig. Using twig, Nunjucks syntax will be parsed and highlighted properly in WebStorm or PHPStorm.
4. Default port of all sample applications in Core and CMS is 8000.
5. Name attribute must not contain space character. For example theme_name = "acme2" is correct while theme_name = "acme 2" is incorrect.
6. In path, route configuration, "/" means root folder.
7. Always manually test through all examples before pushing your code to remote repository. Automatic BDD test will be added soon to support continous integration.
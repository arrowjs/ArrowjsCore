
#### Default Settings

```
module.exports = {
    secret: "helloArrow",
    key: 'sid',
    resave: true,
    saveUninitialized: true,
    cookie : {
        httpOnly: true
    },
    redis_prefix : "sess : "
};
```

#### Advance configs
Arrowjs use express-session by default.When you use real redis, core will use redis-session . You can use any *Store* by setting:
```
    module.exports = {
       store : new <NewStore>
       secret: "helloArrow",
       key: 'sid',
       resave: true,
       saveUninitialized: true,
       cookie : {
           httpOnly: true
       },
       redis_prefix : "sess : "
   };
```

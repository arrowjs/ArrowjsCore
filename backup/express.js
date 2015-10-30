//app.use(express.static(path.resolve(__base + __config.resource.path), __config.resource.option));
//
///**
// * Set local variable
// */
//app.locals.title = __config.app.title;
//app.locals.description = __config.app.description;
//app.locals.keywords = __config.app.keywords;
//app.locals.facebookAppId = __config.facebook.clientID || "";
//
///** Showing stack errors */
//app.set('showStackError', true);
//
///** Set views path and view engine */
//app.set('view engine', 'html');
//
//
///** Environment dependent middleware */
//if (process.env.NODE_ENV === 'development') {
//    /** Uncomment to enable logger (morgan) */
//    app.use(morgan('dev'));
//    /** Disable views cache */
//    app.set('view cache', false);
//} else if (process.env.NODE_ENV === 'production') {
//    app.locals.cache = 'memory';
//} else if (process.env.NODE_ENV === 'secure') {
//    /** Log SSL usage */
//
//    /** Load SSL key and certificate */
//    let privateKey = fs.readFileSync('./config/sslcerts/key.pem', 'utf8');
//    let certificate = fs.readFileSync('./config/sslcerts/cert.pem', 'utf8');
//
//    /** Create HTTPS Server */
//    let httpsServer = https.createServer({
//        key: privateKey,
//        cert: certificate
//    }, app);
//
//    /** Return HTTPS server instance */
//    return httpsServer;
//}
//
///** Request body parsing middleware should be above methodOverride */
//app.use(bodyParser.urlencoded(__config.bodyParser));
//app.use(bodyParser.json({limit: __config.bodyParser.limit}));
//app.use(methodOverride());
//
///** CookieParser should be above session */
//app.use(cookieParser());
//
///** Express session storage */
//app.use(require(__base + 'config/session'));
//
//app.use(function (req, res, next) {
//
//    if (!req.session) {
//        return next(new Error('Session destroy')); // handle error
//    }
//    next(); // otherwise continue
//});
//
///** Use passport session */
//
//if (!fs.accessSync(__base + 'config/passport.js')) {
//    // Initialize strategies
//    __.getGlobbedFiles(__base + 'config/strategies/**/*.js').forEach(function (strategy) {
//        require(path.resolve(strategy))();
//    });
//    require(__base + 'config/passport.js')(passport);
//
//    app.use(passport.initialize());
//    app.use(passport.session());
//}
//
//
///** Flash messages */
//
//app.use(require('../middleware/flash-plugin.js'));
//
//
///** Use helmet to secure Express headers */
//app.use(helmet.xframe());
//app.use(helmet.xssFilter());
//app.use(helmet.nosniff());
//app.use(helmet.ienoopen());
//app.disable('x-powered-by');
//
///** Passing the request url to environment locals */
//app.use(function (req, res, next) {
//    res.locals.hasOwnProperty = Object.hasOwnProperty
//    res.locals.url = req.protocol + '://' + req.headers.host + req.url;
//    res.locals.path = req.protocol + '://' + req.headers.host;
//    res.locals.route = req.url;
//
//    if (req.user) {
//        res.locals.__user = req.user;
//    }
//    next();
//});
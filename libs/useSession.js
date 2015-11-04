"use strict";

module.exports = function useSession() {
    let app = this;
    try {
        fs.accessSync(app.arrFolder + 'config/session.js');
        app.use(require(app.arrFolder + 'config/session')(app));

        app.use(function (req, res, next) {
            if (!req.session) {
                return next(new Error('Session destroy')); // handle error
            }
            next(); // otherwise continue
        });
    } catch(err) {
        throw Error("You dont have file config/session.js");
    }
};
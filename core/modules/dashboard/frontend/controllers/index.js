'use strict';

let _module = new FrontModule('dashboard');

_module.index = function (req, res) {
    //_module.render404(req, res); return;
    _module.render(req, res, 'index', {
        user: req.user || null
    });
};

module.exports = _module;
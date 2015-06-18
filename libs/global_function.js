'use strict';

let config = require(__base + 'config/config');
let mailer = require('nodemailer');

/**
 * Create breadcrumb
 * @param   {array} root - Existing breadcrumb
 * @returns {array} - Return new breadcrumb
 */
exports.createBreadcrumb = function (root) {
    let arr = root.slice(0);
    for (let i = 1; i < arguments.length; i++) {
        if (arguments[i] != undefined)
            arr.push(arguments[i]);
    }
    return arr;
};

/**
 * Add active class to current menu
 * @param   {string} value - Menu link
 * @param   {string} string_to_compare - String to compare with menu link
 * @param   {string} css_class - CSS class when not use class "active"
 * @param   {integer} index
 * @returns {string}
 */
//todo: hoi anh thanh
exports.active_menu = function (value, string_to_compare, css_class, index) {
    let arr = value.split('/');
    let st = "active";

    if (css_class) {
        st = css_class;
    }

    if (string_to_compare == '') {
        string_to_compare = 'index';
    }

    if (~string_to_compare.indexOf('/')) {
        string_to_compare = string_to_compare.split('/')[index];
    }

    if (index) {
        let v = arr[index];
        if (!v) {
            v = "index";
        }
        return v === string_to_compare ? st : "";
    }

    return arr[2] == string_to_compare ? st : "";
};

/**
 * Sort menu by "sort" property
 * @param {object} menus
 * @returns {array}
 */
exports.sortMenus = function (menus) {
    let sortable = [];

    for (let m in menus) {
        if (menus.hasOwnProperty(m)) {
            sortable.push({menu: m, sort: menus[m].sort});
        }
    }

    sortable.sort(function (a, b) {
        if (a.sort < b.sort)
            return -1;
        if (a.sort > b.sort)
            return 1;
        return 0;
    });

    return sortable;
};

/**
 * Get widget by alias
 * @param {string} alias
 * @returns {*}
 */
exports.getWidget = function (alias) {
    for (let i in __widgets) {
        if (__widgets.hasOwnProperty(i)) {
            if (__widgets[i].alias == alias) {
                return __widgets[i];
            }
        }
    }
};

/**
 * Create Environment to handles templates
 * @param {array} views - List of loaders
 * @returns {object}
 */
exports.createNewEnv = function (views) {
    let nunjucks = require('nunjucks');
    let env;

    if (views) {
        env = new nunjucks.Environment(new nunjucks.FileSystemLoader(views));
    } else {
        env = new nunjucks.Environment(new nunjucks.FileSystemLoader([__base + 'app/widgets', __base + 'app/frontend/themes']));
    }

    env = __.getAllCustomFilter(env);
    env = __.getAllGlobalVariable(env);

    return env;
};

/**
 * Add custom filter to Environment
 * @param {object} env - Environment to add custom filter
 * @returns {object}
 */
exports.getAllCustomFilter = function (env) {
    config.getGlobbedFiles(__base + 'custom_filters/*.js').forEach(function (routePath) {
        require(routePath)(env);
    });
    return env;
};

/**
 * Add global variables to Environment
 * @param {object} env - Environment to add global variable
 * @returns {object}
 */
exports.getAllGlobalVariable = function (env) {
    env.addGlobal('create_link', function (module_name, link) {
        return module_name + '/' + link;
    });
    env.addGlobal('media_server', config.media_server);
    env.addGlobal('media_server_id', config.media_server_id);
    return env;
};


exports.parseCondition = function (column_name, value, col) {
    if (col.filter.filter_key) {
        column_name = col.filter.filter_key;
    }

    column_name = (col.filter.model ? (col.filter.model + '.') : '') + column_name;
    column_name = column_name.replace(/(.*)\.(.*)/, '"$1"."$2"');

    if (col.filter.data_type == 'array') {
        return column_name + ' @> ?';
    } else if (col.filter.data_type == 'string') {
        return column_name + ' ilike ?';
    } else if (col.filter.data_type == 'datetime') {
        return column_name + " between ?::timestamp and ?::timestamp";
    } else {
        if (~value.indexOf('><') || col.filter.type == 'datetime') {
            return column_name + " between ? and ?";
        } else if (~value.indexOf('<>')) {
            return column_name + " not between ? and ?";
        } else if (~value.indexOf('>=')) {
            return column_name + " >= ?";
        } else if (~value.indexOf('<=')) {
            return column_name + " <= ?";
        } else if (~value.indexOf('<')) {
            return column_name + " < ?";
        } else if (~value.indexOf('>')) {
            return column_name + " > ?";
        } else if (~value.indexOf(';')) {
            return column_name + " in (?)";
        } else {
            return column_name + " = ?";
        }
    }
};

exports.parseValue = function (value, col) {
    if (col.filter.data_type == 'array') {
        return '{' + value + '}';
    }

    if (col.filter.type == 'datetime') {
        return value.split(/\s+-\s+/);
    } else if (col.filter.data_type == 'string') {
        value = "%" + value + "%";
    } else if (col.filter.data_type == 'bytes') {
        let match = /([0-9]+)\s*(.*)/g.exec(value);

        if (match) {
            let unit = match[2];
            value = match[1];

            switch (unit.toLowerCase()) {
                case "kb":
                    value = value * 1000;
                    break;
                case 'mb':
                    value = value * 1000 * 1000;
                    break;
                case "gb":
                    value = value * 1000 * 1000 * 1000;
                    break;
            }
            return value;
        }
    }

    if (~value.indexOf('><')) {
        return value.split('><');
    } else if (~value.indexOf('<>')) {
        return value.split('<>');
    } else {
        return value.replace(/[><]/g, "");
    }
};

exports.createFilter = function (req, res, route, reset_link, current_column, order, columns, customCondition, type) {
    // Add button Search
    if (route != '') {
        res.locals.searchButton = __acl.customButton(route);
        res.locals.resetFilterButton = __acl.customButton(reset_link);
    }

    let conditions = [];
    let values = [];
    let attributes = [];
    values.push('command');

    let getColumn = function (name) {
        for (let i in columns) {
            if (columns[i].column == name) {
                return columns[i];
            }
        }
        return {filter: {}};
    };

    for (let i in req.query) {
        if (req.query[i] != '') {
            let col = getColumn(i);
            if (!col) continue;

            if (col.query) {
                conditions.push(col.query);
            } else {
                conditions.push(__.parseCondition(i, req.query[i], col));
            }

            let value = __.parseValue(req.query[i], col);
            if (Array.isArray(value)) {
                for (let y in value) {
                    values.push(value[y].trim());
                }

            } else {
                values.push(value);
            }
        }
    }

    for (let i in columns) {
        if (columns[i].column != '')
            attributes.push(columns[i].column);
    }

    let tmp = conditions.length > 0 ? "(" + conditions.join(" AND ") + ")" : " 1=1 ";
    let stCondition = tmp + (customCondition ? customCondition : '');
    values[0] = stCondition;

    res.locals.table_columns = columns;
    res.locals.currentColumn = current_column;
    res.locals.currentOrder = order;
    res.locals.filters = req.query;

    if (current_column.indexOf('.') > -1)
        current_column = current_column.replace(/(.*)\.(.*)/, '"$1"."$2"');
    return {
        values: values,
        attributes: attributes,
        sort: current_column + " " + order
    };
};

exports.toRawFilter = function (filterValues) {
    let conditions = filterValues[0].split('?');
    for (let i = 0; i < conditions.length - 1; i++) conditions[i] += "'" + filterValues[i + 1] + "'";
    return conditions.join('');
};

exports.randomSalt = function (length) {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

exports.sendMail = function (mailOptions) {
    return new Promise(function (fulfill, reject) {
        let transporter = mailer.createTransport(config.mailer_config);
        transporter.sendMail(mailOptions, function (err, info) {
            if (err !== null) {
                reject(err);
            } else {
                fulfill(info);
            }
        });
    });
};


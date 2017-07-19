'use strict';

let create = (() => {
    var _ref = _asyncToGenerator(function* (content, pathStr, force) {
        pathStr = pathStr || `${process.cwd()}/.felintrc`;
        if (force) {
            fileUtil.createFileSync(pathStr, content, 'json');
        } else {
            let override = yield fileUtil.checkOverride(pathStr);
            if (override) {
                fileUtil.createFileSync(pathStr, content, 'json');
            }
        }
    });

    return function create(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    };
})();

let local = (() => {
    var _ref2 = _asyncToGenerator(function* () {
        yield set({
            local: true
        });
    });

    return function local() {
        return _ref2.apply(this, arguments);
    };
})();

let set = (() => {
    var _ref3 = _asyncToGenerator(function* (value) {
        let felintrcFile = read();
        felintrcFile = felintrcFile || {};
        Object.assign(felintrcFile, value);
        yield create(felintrcFile, null, true);
    });

    return function set(_x4) {
        return _ref3.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let fileUtil = require('./utils/fileUtil.js');

function read() {
    return fileUtil.treeReadFile('.felintrc', 'json') || {};
}

function isLocal() {
    let felintrcFile = read() || {};
    return !!felintrcFile.local;
}

function getPlan() {
    return read().plan;
}

module.exports = {
    read,
    create,
    local,
    set,
    isLocal,
    getPlan
};
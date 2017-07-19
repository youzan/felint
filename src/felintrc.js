let fileUtil = require('./utils/fileUtil.js');

function read() {
    return fileUtil.treeReadFile('.felintrc', 'json') || {};
}

async function create(content, pathStr, force) {
    pathStr = pathStr || `${process.cwd()}/.felintrc`;
    if (force) {
        fileUtil.createFileSync(pathStr, content, 'json');
    } else {
        let override = await fileUtil.checkOverride(pathStr);
        if (override) {
            fileUtil.createFileSync(pathStr, content, 'json');
        }
    }
}

async function local() {
    await set({
        local: true
    });
}

function isLocal() {
    let felintrcFile = read() || {};
    return !!felintrcFile.local;
}

async function set(value) {
    let felintrcFile = read();
    felintrcFile = felintrcFile || {};
    Object.assign(felintrcFile, value);
    await create(felintrcFile, null, true);
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

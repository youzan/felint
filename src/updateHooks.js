let sh = require('shelljs');

let felintConfig = require('./felintConfig.js');

function update() {
    let initHooksFile = felintConfig.read().initHooks;
    if (initHooksFile) {
        sh.exec(`sh ./.felint/${initHooksFile}`);
    }
}

module.exports = {
    update
};

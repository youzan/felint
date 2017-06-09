'use strict';

/* global Promise */
var fs = require('fs');
var path = require('path');
var YAML = require('js-yaml');
let readline = require('readline');

function checkOverride(filePath) {
    return new Promise(res => {
        let fileStat = has(filePath);
        if (fileStat && fileStat.isFile()) {
            let rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl.question(`${filePath}文件已存在，是否要覆盖(Y/n)?`, ans => {
                rl.close();
                if (ans !== 'n') {
                    res(true);
                } else {
                    res(false);
                }
            });
        } else {
            res(true);
        }
    });
}

function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

function has(pathStr) {
    if (pathStr) {
        let s;
        try {
            s = fs.statSync(pathStr);
        } catch (e) {
            return false;
        }
        return s;
    } else {
        return false;
    }
}

function treeHas(prePath, pathStr, targetFold) {
    if (prePath !== pathStr && pathStr && targetFold) {
        let fp = `${pathStr}/${targetFold}`;
        let s = has(fp);
        if (!s) {
            return treeHas(pathStr, path.dirname(pathStr), targetFold);
        } else {
            return {
                'stat': s,
                'path': fp,
                'dirname': pathStr
            };
        }
    } else {
        return false;
    }
}

function findUp(pathStr, target, type) {
    let result = treeHas('', pathStr, target);
    if (type && result) {
        if (!result.stat[type]()) {
            return findUp(path.dirname(result.path), target, type);
        }
    }
    return result;
}

function readFile(pathStr, ext) {
    if (!pathStr) {
        return;
    }
    let fileContent;
    if (ext === 'js') {
        fileContent = require(pathStr);
    } else {
        try {
            fileContent = fs.readFileSync(pathStr, 'utf8');
        } catch (e) {
            console.log(`读取${pathStr}失败`.red);
            return;
        }
    }
    if (ext === 'json') {
        fileContent = JSON.parse(fileContent);
    }

    if (ext === 'yaml' || ext === 'yml') {
        try {
            fileContent = YAML.safeLoad(fileContent);
        } catch (e) {
            console.log(`解析${pathStr}为yaml格式失败`.red);
            return;
        }
    }
    return fileContent;
}

function createFileSync(pathStr, contentStr, ext) {
    if (pathStr && contentStr) {
        if (typeof contentStr === 'object') {
            if (ext === 'yaml' || ext === 'yml') {
                contentStr = YAML.safeDump(contentStr || {});
            } else {
                contentStr = JSON.stringify(contentStr, null, 4);
            }
        }
        fs.writeFileSync(pathStr, contentStr);
    }
}

function treeReadFile(filename, ext) {
    ext = ext || 'json';
    // read file content
    let fileInfo = findUp(process.cwd(), filename, 'isFile');
    let content;
    if (fileInfo) {
        content = readFile(fileInfo.path, ext);
    }
    return content;
}

module.exports = {
    readFile,
    treeReadFile,
    findUp,
    has,
    getFileExtension,
    checkOverride,
    createFileSync
};
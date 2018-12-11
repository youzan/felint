/* global Promise */
const fs = require('fs');
const path = require('path');
const YAML = require('js-yaml');
const readline = require('readline');

/**
 * 判断是否需要覆盖对应文件
 * @param {String} filePath 需要覆盖的文件路径
 */
function checkOverride(filePath) {
    return new Promise(res => {
        const fileStat = has(filePath);
        if (fileStat && fileStat.isFile()) {
            const rl = readline.createInterface({
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

/**
 * 获取文件扩展名
 * @param {String} filename 文件名
 */
function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * 判断是否存在对应文件
 * @param {String} filePath 文件路径
 */
function has(filePath) {
    if (filePath) {
        let s;
        try {
            s = fs.statSync(filePath);
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
        const fp = `${pathStr}/${targetFold}`;
        const s = has(fp);
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
    const result = treeHas('', pathStr, target);
    if (type && result) {
        if (!result.stat[type]()) {
            return findUp(path.dirname(result.path), target, type);
        }
    }
    return result;
}

/**
 * 读取文件内容
 * @param {String} pathStr 文件路径
 * @param {String} ext 扩展名
 */
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

/**
 * 创建文件
 * @param {String} pathStr 文件路径
 * @param {String} contentStr 文件内容
 * @param {String} ext 扩展名
 */
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

/**
 * 树形读取文件
 * @param {String} filename 文件路径
 * @param {String} ext 扩展名
 */
function treeReadFile(filename, ext = 'json') {
    // read file content
    const fileInfo = findUp(process.cwd(), filename, 'isFile');
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

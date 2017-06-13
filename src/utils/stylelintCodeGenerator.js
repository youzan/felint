let codePattern = `
    var child = require('child_process');
    var islocal = false;
    var felintPath = '';
    try {
        islocal = child.execSync('felint islocal', {
            encoding: 'utf-8'
        }).trim() === 'true';
        if (!islocal) {
            felintPath = child.execSync('felint where', {
                encoding: 'utf-8'
            }).trim() + '/node_modules/';
        }
    } catch(e) {
    }
    var ap = islocal ? '' : felintPath;
    module.exports = <%content%>
`;

let localCodePattern = 'module.exports = <%content%>';

export default (content, islocal) => {
    return islocal ? localCodePattern.replace(/<%content%>/g, content) : codePattern.replace(/<%content%>/g, content).replace(/"<%path%>/g, 'ap+"');
};

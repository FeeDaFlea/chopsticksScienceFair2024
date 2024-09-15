const fs = require('fs');
var gTree = [];
fs.readFile('gTree.txt', 'utf-8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(data).replace("L0", "0").replace("E1", "1").replace("E-1", "-1");
});

console.log(JSON.stringify(gTree))
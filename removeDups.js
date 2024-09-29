const fs = require("fs")

const url = "./rawGTree.txt";
const gTree = JSON.parse(fs.readFileSync(url))

function removeDuplicates(arr) {
    const strArr = arr.map(elm => JSON.stringify(elm));
	const removedDups = Array.from(new Set(strArr)).map(elm => JSON.parse(elm));
    return removedDups
}

let data = JSON.stringify(removeDuplicates(gTree));

fs.writeFileSync(url, data);
console.log("Data written to file!")


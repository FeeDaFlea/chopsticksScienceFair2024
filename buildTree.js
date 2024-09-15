const fingerNum = 5,
  start = [[1, 1], [1, 1]];

const fs = require('fs');

let gTree = [
  {
    "Start": [start]
  }
];

function findSplits(vals, turn) { //Function declaration
  //Initialize variables for function 
  let total = 0,
    iterNum = 0,
    arr = [],
    nItem = [],
    op = 0,
    pos = 0,
    alt = 0,
    i = 0;

  if (turn == 1) {
    pos = vals[0];
    alt = vals[1];
  } else if (turn == 2) {
    pos = vals[1]
    alt = vals[0];
  } else {
    return "Error: turn not 1 or 2"
  }

  //Find the total of both fingers
  for (i = 0; i < pos.length; i++) {
    total += pos[i];
  }

  //Check how many times to loop. *You can't loop more times than you have fingers*
  if (total >= fingerNum) {
    iterNum = fingerNum + 1;
  } else {
    iterNum = total + 1;
  }

  //Create the list 
  for (i = 0; i < iterNum; i++) {
    op = total - i;
    if (turn == 1) {
      nItem = [
        [handleNum(i), handleNum(total - i)],
        [...alt]
      ];
      if ((nItem[0][0] !== pos[0] && nItem[0][1] !== pos[1]) && (nItem[0][1] !== pos[0] && nItem[0][0] !== pos[1])) {
        arr.push(nItem);
      }
    } else {
      nItem = [
        [...alt],
        [handleNum(i), handleNum(total - i)]
      ];
      if ((nItem[1][0] !== pos[0] && nItem[1][1] !== pos[1]) && (nItem[1][1] !== pos[0] && nItem[1][0] !== pos[1])) {
        arr.push(nItem);
      }
    }

  }

  //End the function
  return arr
}

function findHits(vals, turn) { //Function declaration
  let arr = [];

  if (turn == 1) { //Is it Player 1's turn?
    if (vals[1][0] !== 0) { //You can hit Player 2's left hand 
      if (vals[0][0] !== 0) { //You can hit with Player 1's left hand
        arr.push([
          [...vals[0]],
          [vals[1][0] + vals[0][0], vals[1][1]]
        ]);
      };
      if (vals[0][1] !== 0) {
        arr.push([
          [...vals[0]],
          [vals[1][0] + vals[0][1], vals[1][1]]
        ]);
      }
    }
    if (vals[1][1] !== 0) { //You can hit Player 2's right hand
      if (vals[0][0] !== 0) {
        arr.push([
          [...vals[0]],
          [vals[1][0], vals[1][1] + vals[0][0]]
        ]);
      }
      if (vals[0][1] !== 0) {
        arr.push([
          [...vals[0]],
          [vals[1][0], vals[1][1] + vals[0][1]]
        ]);
      }
    }
  } else { //It is Player 2's turn
    if (vals[0][0] !== 0) { //You can hit Player 1's left hand
      if (vals[1][0] !== 0) {
        arr.push([
          [vals[0][0] + vals[1][0], vals[0][1]],
          [...vals[1]]
        ]);
      }
      if (vals[1][1] !== 0) {
        arr.push([
          [vals[0][0] + vals[1][1], vals[0][1]],
          [...vals[1]]
        ]);
      }
    }
    if (vals[0][1] !== 0) { //You can hit Player 1's right hand
      if (vals[1][0] !== 0) {
        arr.push([
          [vals[0][0], vals[0][1] + vals[1][0]],
          [...vals[1]]
        ]);
      }
      if (vals[1][1] !== 0) {
        arr.push([
          [vals[0][0], vals[0][1] + vals[1][1]],
          [...vals[1]]
        ]);
      }
    }
  }

  //Change all numbers in the array to chopstick numbers *0-4*
  for (i = 0; i < arr.length; i++) {
    for (e = 0; e < arr[0].length; e++) {
      for (f = 0; f < arr[0][0].length; f++) {
        arr[i][e][f] = handleNum(arr[i][e][f]);
      }
    }
  }

  return arr
}

function buildTreeStep(vals, turn) { //Function declaration
  return findSplits(vals, turn).concat(findHits(vals, turn));
}

function handleNum(num) { //Function declaration
  if (num > 4) { //If you don't have enough fingers
    return num - 5;
  } else {
    return num;
  }
}

function nestArrSearch(bArr, sArr) { //Function declaration
  if (JSON.stringify(bArr).indexOf(JSON.stringify(sArr)) == -1) { //It doesn't exist
    return false
  } else {
    return true
  }
}

function checkTree(pos, turn) { //Function declaration
  let check = false;
  gTree.forEach(e => {
    if ((gTree.indexOf(e) % 2) == turn) {
      Object.values(e).forEach(f => {
        f.forEach(g => {
          if (JSON.stringify(g) == JSON.stringify(pos)) {
            check = true;
          }
        })
      })
    }
  })
  return check
}

function buildTreeFromLayer(layer) { //Function declaration
  let obj = {},
    turn = 2 - ((layer + 1) % 2);
  Object.values(gTree[layer]).forEach(e => {
    e.forEach(f => {
      if (!nestArrSearch(f, "L0") && !nestArrSearch(f, "E-1") && !nestArrSearch(f, "E1")) {
        obj[JSON.stringify(f)] = [];
        let val = buildTreeStep(f, turn);
        for (let i = 0; i < val.length; i++) {
          if (checkTree(val[i], turn)) {
            obj[JSON.stringify(f)].push([val[i], "L0"]);
          } else if (JSON.stringify(val[i][0]) == "[0,0]") {
            obj[JSON.stringify(f)].push([val[i], "E-1"]);
          } else if (JSON.stringify(val[i][1]) == "[0,0]") {
            obj[JSON.stringify(f)].push([val[i], "E1"]);
          } else {
            obj[JSON.stringify(f)].push(val[i]);
          }
        }
      }
    });
  });
  gTree.push(obj);
}

let index = 0;

do {
  buildTreeFromLayer(index);
  console.log(index);
  index++;
} while (JSON.stringify(gTree[gTree.length - 1]) != JSON.stringify({}))

gTree.pop();

let fileName = "gTree.txt",
  data = JSON.stringify(gTree);
fs.writeFile(fileName, data, (err) => {
  if (err) throw err;
  console.log('Data written to file');
});

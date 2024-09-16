const fs = require("fs");

const fingerNum = 5,
  start = [[1, 1], [1, 1]],
  fileName = "altGTree.txt";

let gTree = [ //Round, Playing, FromPos, CurrentPos, isEnd, isLoop, Payoff1
  [0, undefined, undefined, [[1, 1], [1, 1]], false, false, undefined]
]

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

function handleNum(num) { //Function declaration
  if (num > 4) { //If you don't have enough fingers
    return num - 5;
  } else {
    return num;
  }
}

function buildTreeStep(pos, turn) { //Function declaration
  return findSplits(pos, turn).concat(findHits(pos, turn));
}

function checkForLoop(pos, turn) {
  let check = false;
  let arr = [];
  gTree.forEach(e => {
    if (e[1] == turn && e[3][0][0] == pos[0][0] && e[3][0][1] == pos[0][1] && e[3][1][0] == pos[1][0] && e[3][1][1] == pos[1][1]) {
      check = true;
    }
  })
  return check
}

function buildTreeRound(round) {
  let i = 0;
  let turn = (2 - ((round + 1) % 2));
  gTree.forEach(e => {
    if (e[0] == round) {
      buildTreeStep(e[3], turn).forEach(f => {
        if (!(e[3][4] == true || e[3][5] == true)) {
          let isEnd = false,
            isLoop = false,
            payoff1;
          if (JSON.stringify(f[0]) == JSON.stringify([0, 0])) {
            payoff1 = -1;
            isEnd = true;
          } else if (JSON.stringify(f[1]) == JSON.stringify([0, 0])) {
            payoff1 = 1;
            isEnd = true;
          } else if (checkForLoop(f, turn)) {
            payoff1 = 0;
            isLoop = true;
          };
          gTree.push([(round + 1), turn, e[3], f, isEnd, isLoop, payoff1]);
          i++;
        }
      })
    }
  })
  return i
}

for (let index = 0; index < 6; index++) {
  let length = gTree.length;
  console.log("Round: " + index);
  console.log("Paths searched: " + buildTreeRound(index)); 
}

fs.writeFileSync(fileName, "");
console.log("File cleared!");

let data = gTree.map(row => row.join("\t")).join("\n");

fs.writeFile(fileName, data, (err) => {
  if (err) throw err
  console.log("Data written to file")
})

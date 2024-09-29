const fs = require("fs");

const fingerNum = 5,
  start = [[1, 1], [1, 1]],
  fileName = "altGTree.txt",
  rawFileName = "rawGTree.txt";

let gTree = [ //Round, Playing, FromPos, CurrentPos, isEnd, isLoop, Payoff1
  [0, undefined, undefined, start, false, false, undefined, undefined]
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

function checkForLoop(pos, round) {
  let turn = 2 - ((round + 1) % 2)
  let check = false;
  let arr = [];
  gTree.forEach(e => {
    if (e[1] == turn && e[3][0][0] == pos[0][0] && e[3][0][1] == pos[0][1] && e[3][1][0] == pos[1][0] && e[3][1][1] == pos[1][1] && e[0] < round) {
      check = true;
    }
  })
  return check
}

function buildTreeRound(round) {
  let i = 0;
  let turn = 2 - ((round + 1) % 2);
  gTree.forEach(e => {
    if (e[0] == round) {
      buildTreeStep(e[3], turn).forEach(f => {
        if (!(e[4] == true || e[5] == true)) {
          let isEnd = false,
            isLoop = false,
            payoff1;
          if (JSON.stringify(f[0]) == JSON.stringify([0, 0])) {
            payoff1 = -1;
            isEnd = true;
          } else if (JSON.stringify(f[1]) == JSON.stringify([0, 0])) {
            payoff1 = 1;
            isEnd = true;
          } else if (checkForLoop(f, round)) {
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

let testLength = 0,
  index = 0,
  isGlobalEnd = false;

do {
  testLength = gTree.length;
  console.log("Round: " + index);
  console.log("Paths searched: " + buildTreeRound(index));
  index++;
  if (gTree.length == testLength) {
    isGlobalEnd = true;
  }
} while (!isGlobalEnd)

function rollbackPays(round) {
  const GTR = gTree.filter(elm => elm[0] == round), //Get all elements in the specified round
  turn = 2 - ((round + 1) % 2); //Save whose turn it is in the round
  let checkArr = [], //Define some temporary variables
    finalArr = [];
  GTR.forEach(elm => { //Loop through the elements in the specified round
    let data = JSON.stringify(elm[2])
    let unique = true; //Assume that the specific element is the first one the code has seen
    checkArr.forEach(e => { //Loop through the temporary checking array
      if (data == e){ //If the "from" position in the current element has been seen before
        unique = false; //It is not unique
      }
    })
    if (unique) { //If it is unique
      finalArr.push(data); //Add it to the final array
      checkArr.push(data); //Add it to the checking array so it won't be unique again
    }
  })
  finalArr.forEach(elm => { //Loop through the unique pay's froms
    const GTRF = GTR.filter(e => JSON.stringify(e[2]) == elm); //Save all the elements in the round where the from is the same as the specific from in the unique array
    const pays = GTRF.map(e => e[6]);
    if (GTR[0][1] == 1) {
      bestPay = Math.max(...pays);
    } else if (GTR[0][1] == 2) {
      bestPay = Math.min(...pays);
    }
    gTree.filter(e => e[0] == round - 1).filter(e => JSON.stringify(e[3]) == elm).filter(e => e[6] == undefined).forEach(e => {
      e[6] = bestPay;
    })
  })
}

for(index--; index > 0; index--) {
  rollbackPays(index);
}

function removeDuplicates(arr) {
  const strArr = arr.map(elm => JSON.stringify(elm));
  const removedDups = Array.from(new Set(strArr)).map(elm => JSON.parse(elm));
  return removedDups
}

gTree = removeDuplicates(gTree);
console.log("Removed duplicates!")

fs.writeFileSync(fileName, "");
console.log("File cleared!");

let data = gTree.map(row => row.join("\t")).join("\n");

fs.writeFileSync(fileName, data)
console.log("Data written to file")

fs.writeFileSync(rawFileName, "");
console.log("Raw file cleared!");

fs.writeFileSync(rawFileName, JSON.stringify(gTree));
console.log("Data written to raw file!")

function getBestMove(pos, turn) {
  const x = gTree.filter(elm => (JSON.stringify(elm[2]) == JSON.stringify(pos)) && (elm[1] == turn));
  const pays = x.map(elm => elm[6]);
  let bestPay;
  if (turn == 1) {
    bestPay = Math.max(pays);
  } else {
    bestPay = Math.min(pays);
  }
  return x.filter(elm => elm[6] == bestPay)[0];
}

//Pause

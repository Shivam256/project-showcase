const stackList = [
  {
    name:'HTML',
    dataIcon:'logos:html-5'
  },
  {
    name:'CSS',
    dataIcon:'logos:css-3'
  },
  {
    name:'Javascript',
    dataIcon:'logos:javascript'
  },
  {
    name:'React JS',
    dataIcon:'logos:react'
  },
  {
    name:'Node JS',
    dataIcon:'logos:nodejs'
  },
  {
    name:'Redux',
    dataIcon:'logos:redux'
  },
  {
    name:'Sass',
    dataIcon:'logos:sass'
  },
  {
    name:'Angular',
    dataIcon:'logos:angular-icon'
  },
  {
    name:'Firebase',
    dataIcon:'logos:firebase'
  },
  {
    name:'Mongo DB',
    dataIcon:'logos:mongodb'
  },
  {
    name:'Express JS',
    dataIcon:'logos:express'
  },
  {
    name:'SQLite',
    dataIcon:'logos:sqlite'
  }
]

const getStackByName = (arr) => {
  const stack = [];
  for(let i of arr){
    let obj;
    for(let j of stackList){
      if(i == j.name){
        obj = j;
        stack.push(j);
        break;
      }
    }
  }

  return stack;
}

module.exports = {
  stackList,
  getStackByName
}



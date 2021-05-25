const User = require('../models/user');
const Project = require('../models/project');

calcProjectRating = function(project){
  let total = 0, num= 0;
  for(let rating of project.ratings){
    total += rating.rating;
    num++;
  }
  
  const overallRating = Math.round(total/num)
  return overallRating || 0;
}

calculateUserRating = function(user){
  if(user.projects.length){
    const projectRatings = [];
    for(let project of user.projects){
      projectRatings.push(calcProjectRating(project));
    }

    let t=0,n=0;
    for(let r of projectRatings){
      t+=r;
      n++;
    }

    const overallUserRating = Math.round(t/n);
    return overallUserRating
  }
  return 0;
}

// const getCollabSuggestions2 = (user,allUsers) => {
//   let possibleUsers = [];
//   for(let u of allUsers){
//     if((u.username != user.username)&&(!user.friends.some(e => e.equals(u._id))))
//   }
// }



const getCollabSuggestions = (user,allUsers) => {
  const currentFriends = user.friends;
  let allUsers2 = [];
  for(let curr of allUsers){
    if((curr.username != user.username)&&(!user.friends.some(e => e.equals(curr._id)))){
      allUsers2.push(curr);
    }
  }
  const topUsers = allUsers2.sort((a,b) => (calculateUserRating(b) - calculateUserRating(a)));
  let suggestedCollabs = [];
  if(topUsers.length > 5){
    suggestedCollabs = topUsers.slice(0,5);
    return suggestedCollabs;
  }
  else{
    return topUsers;
  }
  
}

const checkCollabRequested = function(fromUser,toUser){
  return toUser.activity.collabRequests.some((el) => (el.username == fromUser.username))
}

const checkCollabRequested2 = function(fromUser,toUser){
  return toUser.activity.collabRequests.some((el) => el.equals(fromUser._id))
}


module.exports = {getCollabSuggestions, checkCollabRequested,checkCollabRequested2}
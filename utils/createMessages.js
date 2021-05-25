const User = require('../models/user');
const Message = require('../models/messages');
const MessageBox = require('../models/messageBox');


module.exports.createMessages = async (currUser, currFriend, msg) => {
  const message = new Message({
    toUser: currFriend,
    fromUser: currUser,
    message: msg
  });

  await message.save();

  const currentUser = await User.findById(currUser);
  const currentFriend = await User.findById(currFriend);

  // const allMsgBx = await MessageBox.find({});
  // let pairExists = allMsgBx.some((msgBx)=>((msgBx.userPair.user1 == currUser && msgBx.userPair.user2 == currFriend)||(msgBx.userPair.user2 == currUser && msgBx.userPair.user1 == currFriend)));

  
  // const messageBox = await MessageBox.findOne({user1:currUser,user2:currFriend});
  const messageBox = await MessageBox.findOne({$or:[{user1:currUser,user2:currFriend},{user1:currFriend,user2:currUser}]});
  if(messageBox){
    messageBox.messages.push(message);
    await messageBox.save();
  }
  else{
    const messgeBox = new MessageBox({
        user1: currUser,
        user2: currFriend
    })
    messgeBox.messages.push(message);
    await messgeBox.save();
  }

  


  
  



}
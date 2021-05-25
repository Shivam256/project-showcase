const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const messageBoxSchema = new Schema({
  user1:{type:Schema.Types.ObjectId,ref:'user'},
  user2:{type:Schema.Types.ObjectId,ref:'user'},
  messages:[{type:Schema.Types.ObjectId,ref:'Message'}]
})

module.exports = mongoose.model('MessageBox',messageBoxSchema);
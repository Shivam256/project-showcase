const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  toUser:{
    type:Schema.Types.ObjectId,
    ref:'User'
  },
  fromUser:{
    type:Schema.Types.ObjectId,
    ref:'User',
  },
  message:{
    type:String,
  }
},{timestamps:true});




module.exports = mongoose.model('Message',messageSchema);
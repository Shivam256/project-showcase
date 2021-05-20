const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ratingSchema = new Schema({
  body:{
    type:String
  },
  rating:{
    type:Number
  },
  author:{
    type:Schema.Types.ObjectId,
    ref:'User',
  }
});


module.exports = mongoose.model('Rating',ratingSchema); 
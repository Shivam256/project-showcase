const mongoose = require('mongoose');
const passport = require('passport');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const ImageSchema = new Schema({
  url: String,
  filename: String
})


const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  profilePic: ImageSchema,
  friends: [{
    type: Schema.Types.ObjectId,
    red: 'User'
  }],
  bio: String,
  projects: [{
    type: Schema.Types.ObjectId,
    ref: 'Project'
  }],
  activity: {
    collabRequests: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    collabRequested: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    projectRatings: [{
      project: {
        type: Schema.Types.ObjectId,
        ref: 'Project'
      },
      rating: {
        type: Schema.Types.ObjectId,
        ref: 'Rating'
      }
    }]
  },
  messageBoxes: [{
    type: Schema.Types.ObjectId,
    ref: 'MessageBox'
  }]
})

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
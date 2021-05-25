const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Rating = require('./rating');


const ImageSchema = new Schema({
  url:String,
  filename:String
})

ImageSchema.virtual('thumbnail').get(function(){
  return this.url.replace('/upload','/upload/w_200');
})

const projectSchema = new Schema({
  title:{
    type:String,
  },
  images:[ImageSchema],
  description:{
    type:String,
  },
  links:{
    githubLink:String,
    hostedLink:String,
  },
  stack:[{
    name:String,
    dataIcon:String
  }],
  ratings:[
    {
      type:Schema.Types.ObjectId,
      ref:'Rating'
    }
  ],
  author:{
    type:Schema.Types.ObjectId,
    ref:'User',
  }
});

// projectSchema.virtual('overallRating').get(function(){
//   if(this.ratings.length){
//     let total = 0, num = 0;
//     for(let trating of this.ratings){
//       const foundRating = Rating.findById(trating._id,()=>{
//         total += foundRating.rating;
//         num++;
//       })
//     }

//     const or = Math.round(total/num);
//     return or;
//   }
//   return 0;
// })

projectSchema.post('findOneAndDelete',async function(doc){
  if(doc){
    await Rating.deleteMany({
      _id:{$in:doc.ratings}
    })
  }
})

module.exports = mongoose.model('Project',projectSchema);
const {projectSchema ,ratingSchema} = require('./schemas');
const ExpressError = require('./utils/ExpressError');
const Project = require('./models/project');
const Rating = require('./models/rating');


module.exports.validateProject = (req,res,next)=>{
  const {error} = projectSchema.validate(req.body);
  if(error){
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg,400);
  }
  else{
    next();
  }
}
module.exports.validateRating = (req,res,next)=>{
  const {error} = ratingSchema.validate(req.body);
  if(error){
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg,400);
  }
  else{
    next();
  }
}

module.exports.isLoggedIn = (req,res,next) => {
  if(!req.isAuthenticated()){
    req.session.returnLink = req.originalUrl;
    req.flash('error','YOU MUST BU SIGNED IN!');
    res.redirect('/');
  }
  else{
    next();
  }
}

module.exports.isProjectAuthor = async(req,res,next)=>{
  const {id} = req.params;
  const project = await Project.findById(id);
  if(!project.author.equals(req.user._id)){
    req.flash('error','YOU DONT HAVE THE PERMISSION TO DO THAT!');
    return res.redirect(`/projects/${id}`);
  }
  else{
    next();
  }
}

module.exports.isRatingtAuthor = async(req,res,next)=>{
  const {ratingId} = req.params;
  const rating = await Rating.findById(ratingId);
  if(!rating.author.equals(req.user._id)){
    req.flash('error','YOU DONT HAVE THE PERMISSION TO DO THAT!');
    return res.redirect(`/projects/${id}`);
  }
  else{
    next();
  }
}


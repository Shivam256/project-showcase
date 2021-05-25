if (process.NODE_ENV !== "production") {
  require('dotenv').config();
}

const express = require('express');
const socket = require('socket.io');
const app = express();
const httpServer = require('http').createServer(app);
const io = socket(httpServer);

const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Project = require('./models/project');
const Rating = require('./models/rating');
const User = require('./models/user');
const Message = require('./models/messages');
const MessageBox = require('./models/messageBox')
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const {
  validateProject,
  validateRating,
  isLoggedIn,
  isProjectAuthor,
  isRatingtAuthor
} = require('./middleware');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const multer = require('multer');
const {
  storage
} = require('./cloudinary/index');
const upload = multer({
  storage
});
const {
  stackList,
  getStackByName
} = require('./public/scripts/stack-list');
const {
  getCollabSuggestions,
  checkCollabRequested,
  checkCollabRequested2
} = require('./utils/collabSuggestions');
const user = require('./models/user');
const {createMessages} = require('./utils/createMessages');


mongoose.connect('mongodb://localhost:27017/project-showcase', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('SUCESSFULLY CONNECTED TO DATABASE');
  })
  .catch((e) => {
    console.log('CANNOT CONNECT TO DATABASE!!');
    console.log(e);
  })

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


const sesisonConfig = {
  secret: 'thisIsNotSoGOODsecre__t',
  cookie: {
    httpOnly: true,
    expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
    maxAge: 1000 * 60 * 60 * 24 * 7
  },
  resave: false,
  saveUninitialized: true,
}

app.use(session(sesisonConfig));
app.use(flash());

app.use(express.urlencoded({
  extended: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'))

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

//projrct routes

app.get('/', (req, res) => {
  res.render('home');
})

app.get('/projects', catchAsync(async (req, res) => {
  const projects = await Project.find({}).populate('ratings').populate('author');
  if (req.isAuthenticated()) {
    const user = await User.findById(req.user._id).populate({
      path: 'projects',
      populate: {
        path: 'ratings'
      }
    }).populate('friends');

    const allUsers = await User.find({}).populate({
      path: 'projects',
      populate: {
        path: 'ratings'
      }
    }).populate('friends').populate('activity.collabRequests');

    const collabList = getCollabSuggestions(user, allUsers);
    return res.render('projects/index', {
      projects,
      collabList
    })
  }
  res.render('projects/index', {
    projects
  });
}))

app.get('/projects/new', isLoggedIn, (req, res) => {
  res.render('projects/new', {
    stackList
  });
})

app.post('/projects', isLoggedIn, upload.array('image'), catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  const project = new Project(req.body.project);
  project.author = req.user._id;
  project.links = req.body.links;
  project.stack = getStackByName(req.body.stacks);
  project.images = req.files.map(f => ({
    url: f.path,
    filename: f.filename
  }));
  user.projects.push(project);
  await project.save();
  await user.save();
  req.flash('success', 'Successfully posted your project');
  res.redirect(`/projects/${project._id}`);
}))



app.get('/projects/:id', catchAsync(async (req, res) => {
  const {
    id
  } = req.params;
  const project = await Project.findById(id).populate({
    path: 'ratings',
    populate: {
      path: 'author'
    }
  }).populate('author');
  // console.log(project);
  res.render('projects/show', {
    project
  })
}))

app.get('/projects/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
  const {
    id
  } = req.params;
  const project = await Project.findById(id);
  if (!project) {
    req.flash('error', 'Cannot find the project!');
    return res.redirect('/projects');
  }
  res.render('projects/edit', {
    project,stackList
  });
}))

app.put('/projects/:id', isLoggedIn, isProjectAuthor, catchAsync(async (req, res) => {
  const {
    id
  } = req.params;
  const project = await Project.findByIdAndUpdate(id, req.body.project, {
    new: true
  });
  req.flash('success', 'Successfully edited your project!');
  res.redirect(`/projects/${id}`);
}))

app.delete('/projects/:id', isLoggedIn, isProjectAuthor, catchAsync(async (req, res) => {
  const {
    id
  } = req.params;
  const project = await Project.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted your project!');
  res.redirect('/projects');
}))



//review routes  
app.post('/projects/:id/rating', isLoggedIn, validateRating, catchAsync(async (req, res) => {
  const {
    id
  } = req.params;
  const project = await Project.findById(id);
  const rating = new Rating(req.body.rating);
  project.ratings.push(rating);
  rating.author = req.user._id;
  await rating.save();
  await project.save();
  
  //updating the user activity page
  const projectOwner = await User.findById(project.author);
  projectOwner.activity.projectRatings.push({project,rating});

  await projectOwner.save();
  console.log(projectOwner);

  res.redirect(`/projects/${id}`);
}))

///projects/<%= project._id%>/ratings/<%rating._id%>
//"/projects/<%= project._id%>/rating/<%rating._id %>?_method=DELETE"
app.delete('/projects/:id/rating/:ratingId', isLoggedIn, isRatingtAuthor, catchAsync(async (req, res) => {
  const {
    id,
    ratingId
  } = req.params;
  await Rating.findByIdAndDelete(ratingId);
  await Project.findByIdAndUpdate(id, {
    $pull: {
      ratings: ratingId
    }
  });

  req.flash('success', 'Successfully deleted the review');
  res.redirect(`/projects/${id}`);

}))

//user routes

app.get('/register', (req, res) => {
  res.render('user/register');
})

app.post('/register', upload.single('profilePic'), catchAsync(async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      bio
    } = req.body;
    const user = new User({
      username,
      email,
      bio
    });
    const {
      path,
      filename
    } = req.file;
    const profPic = {
      url: path || "https://www.cornwallbusinessawards.co.uk/wp-content/uploads/2017/11/dummy450x450.jpg",
      filename: filename || null
    };

    user.profilePic = profPic;
    const registeredUser = await User.register(user, password);
    await user.save();
    req.login(registeredUser, err => {
      if (err) {
        return next(err);
      }
      req.flash('success', 'Welcome to the Project Showcase');
      res.redirect('/projects');
    })
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/projects');
  }
}))

app.get('/login', (req, res) => {
  res.render('user/login');
})

app.post('/login', passport.authenticate('local', {
  failureFlash: true,
  failureRedirec: '/login'
}), (req, res) => {
  req.flash('success', 'Welcome Back!');
  const redirectUrl = req.session.returnLink || '/projects';
  delete req.session.returnLink;
  res.redirect(redirectUrl);
})

app.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'GOODBYE!');
  res.redirect('/projects');
})

app.get('/user/:id', isLoggedIn, catchAsync(async (req, res) => {
  const {
    id
  } = req.params;
  const user = await User.findById(id).populate({
    path: 'projects',
    populate: {
      path: 'ratings'
    }
  }).populate('friends');
  res.render('user/show', {
    user
  });
}))


app.get('/user/:id/activity',isLoggedIn, catchAsync(async (req, res) => {
  const {
    id
  } = req.params;
  const user = await User.findById(id).populate({
    path: 'projects',
    populate: {
      path: 'ratings'
    }
  }).populate('friends').populate('activity.collabRequests').populate({
    path:'activity.projectRatings',
    populate:{
      path:'project'
    }
  }).populate({
    path:'activity.projectRatings',
    populate:{
      path:'rating',
      populate:{
        path:'author'
      }
    }
  });
  res.render('user/activity', {
    user
  });
}))

app.post('/user/:fromUserId/collab/:toUserId', isLoggedIn, catchAsync(async (req, res) => {
  const {
    fromUserId,
    toUserId
  } = req.params;
  const toUser = await User.findById(toUserId);
  const fromUser = await User.findById(fromUserId);
  if (checkCollabRequested2(fromUser, toUser)) {
    const idx = toUser.activity.collabRequests.findIndex(a => a.equals(fromUser._id));
    toUser.activity.collabRequests.splice(idx, 1);
    await toUser.save();
    const idx2 = fromUser.activity.collabRequested.findIndex(a => a.equals(toUser._id));
    fromUser.activity.collabRequested.splice(idx2, 1);
    await fromUser.save();

    // console.log('YIPIIEEE')
  } else {
    toUser.activity.collabRequests.push(fromUser);
    fromUser.activity.collabRequested.push(toUser);
  }
  await toUser.save();
  await fromUser.save();
  console.log(req.originalUrl);
  const currentUrl = req.originalUrl;
  res.redirect('/projects');
}));


app.post('/user/:fromUserId/collab/:toUserId/:requestStatus', isLoggedIn, catchAsync(async (req, res) => {
  const {
    fromUserId,
    toUserId,
    requestStatus
  } = req.params;
  const toUser = await User.findById(toUserId);
  const fromUser = await User.findById(fromUserId);

  if (requestStatus == 'accepted') {

    const idx = toUser.activity.collabRequests.findIndex(a => a.equals(fromUser._id));
    toUser.activity.collabRequests.splice(idx, 1);
    const idx2 = fromUser.activity.collabRequested.findIndex(a => a.equals(toUser._id));
    fromUser.activity.collabRequested.splice(idx2, 1);

    toUser.friends.push(fromUser);
    fromUser.friends.push(toUser);

    await toUser.save();
    await fromUser.save();

    return res.redirect(`/user/${toUserId}/activity`);
  } else if (requestStatus == 'rejected') {
    const idx = toUser.activity.collabRequests.findIndex(a => a.equals(fromUser._id));
    toUser.activity.collabRequests.splice(idx, 1);
    const idx2 = fromUser.activity.collabRequested.findIndex(a => a.equals(toUser._id));
    fromUser.activity.collabRequested.splice(idx2, 1);

    await toUser.save();
    await fromUser.save();

    return res.redirect(`/user/${toUserId}/activity`);
  }
}))

app.delete('/user/:fromUserId/collab/:toUserId',isLoggedIn,catchAsync(async(req,res)=>{
  const {
    fromUserId,
    toUserId
  } = req.params;
  const toUser = await  User.findById(toUserId).populate('friends');
  const fromUser = await User.findById(fromUserId).populate('friends');
  toUser.friends = toUser.friends.filter(e => !e.equals(fromUser._id));
  fromUser.friends = fromUser.friends.filter(e => !e.equals(toUser._id));
  await toUser.save();
  await fromUser.save();

  res.redirect(`/user/${toUserId}`);
}))


app.get('/user/:id/messages',isLoggedIn,catchAsync(async(req,res)=>{
  const {id} = req.params;
  const user = await User.findById(id).populate({
    path: 'projects',
    populate: {
      path: 'ratings'
    }
  }).populate('friends');

  res.render('user/messages',{user});
}))

app.get('/user/:currUser/messages/:currFriend',catchAsync(async (req,re)=>{
  const {currUser,currFriend} = req.params;
  const messageBox = await MessageBox.findOne({$or:[{user1:currUser,user2:currFriend},{user1:currFriend,user2:currUser}]}).populate('messages');

  res.send(messageBox);

}))

app.post('/user/:currUser/messages/:currFriend',catchAsync(async (req,res)=>{
  const {currUser,currFriend} = req.params;
  const {message} = req.body;
  console.log('IN THE POST ROUTE!!');
  createMessages(currUser,currFriend,message);
  res.sendStatus(200);
}))


io.on('connection',(socket)=>{
  console.log('SOCKET CONNECTED!');
  socket.on('chat-message',async (currUser,currFriend,msg)=>{
    console.log(`from ${currUser} to ${currFriend} message is ${msg}`);
    
    // if(createMessages(currUser,currFriend,msg)){
    //   console.log('TRUEEEE');
    // }
    // else{
    //   console.log('FALSEEEE');
    //   console.log(createMessages(currUser,currFriend,msg));
    // }
    // socket.broadcast.emit("received", { message: msg  });
    // createMessages(currUser,currFriend,msg);

    // const messageBox = await MessageBox.findOne({$or:[{user1:currUser,user2:currFriend},{user1:currFriend,user2:currUser}]}).populate('messages');

    // socket.emit('messages-list',messageBox);
    
  })
})



app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found!', 500));
})


app.use((err, req, res, next) => {
  const {
    statusCode = 500
  } = err;
  if (!err.message) {
    err.message = 'SOMETHING WENT WRONG!!';
  }
  res.status(statusCode).render('error', {
    err
  });
})



const PORT = process.env.PORT || 3000

httpServer.listen(PORT, () => {
  console.log('SERVER STARTED ON PORT 3000');
})


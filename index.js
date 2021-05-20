const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Project = require('./models/project');
const Rating = require('./models/rating');
const User = require('./models/user');
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
  const projects = await Project.find({}).populate('ratings');
  res.render('projects/index', {
    projects
  });
}))

app.get('/projects/new', isLoggedIn, (req, res) => {
  res.render('projects/new');
})

app.post('/projects', isLoggedIn, validateProject, catchAsync(async (req, res) => {
  const project = new Project(req.body.project);
  project.author = req.user._id;
  await project.save();
  req.flash('success', 'Successfully posted your project');
  res.redirect(`/projects/${project._id}`);
}))

app.get('/projects/:id', catchAsync(async (req, res) => {
  const {
    id
  } = req.params;
  const project = await Project.findById(id).populate({
    path:'ratings',
    populate:{
      path:'author'
    }
  }).populate('author');
  console.log(project);
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
    project
  });
}))

app.put('/projects/:id', isLoggedIn, isProjectAuthor,catchAsync(async (req, res) => {
  const {
    id
  } = req.params;
  const project = await Project.findByIdAndUpdate(id, req.body.project, {
    new: true
  });
  req.flash('success', 'Successfully edited your project!');
  res.redirect(`/projects/${id}`);
}))

app.delete('/projects/:id', isLoggedIn, isProjectAuthor,catchAsync(async (req, res) => {
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
  res.redirect(`/projects/${id}`);
}))

///projects/<%= project._id%>/ratings/<%rating._id%>
//"/projects/<%= project._id%>/rating/<%rating._id %>?_method=DELETE"
app.delete('/projects/:id/rating/:ratingId', isLoggedIn, isRatingtAuthor,catchAsync(async (req, res) => {
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

  req.flash('success', 'Successfully deleted the campground');
  res.redirect(`/projects/${id}`);

}))

//user routes

app.get('/register', (req, res) => {
  res.render('user/register');
})

app.post('/register', catchAsync(async (req, res) => {
  try {
    const {
      username,
      email,
      password
    } = req.body;
    const user = new User({
      username,
      email
    });
    const registeredUser = await User.register(user, password);
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


const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log('SERVER STARTED ON PORT 3000');
})
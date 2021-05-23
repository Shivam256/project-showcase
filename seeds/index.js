const mongoose = require('mongoose');
const Project = require('../models/project');
const User = require('../models/user');

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

const tempData = [
  {
    title:'Chat App with encryption',
    description:'This is a nice clean chat app!',
    images:'https://assets.justinmind.com/wp-content/uploads/2018/10/messenger-app-ux-justinmind.png',
    author:'60a5cb88e51c3c1cb06bf593'
  },
  {
    title:'Ecommerce app',
    description:'This is a cool e commerce app with full functionality',
    images:'https://figmaelements.com/wp-content/uploads/2019/10/e-commerce-app-ui.png',
    author:'60a5cb88e51c3c1cb06bf593'
  },
  {
    title:'Netflix clone',
    description:'This is a fully functional Netflix clone',
    images:'https://www.webdesignerdepot.com/cdn-origin/uploads/2020/01/Netflix-User-Personalization.png',
    author:'60a5cb88e51c3c1cb06bf593'
  },
]
const tempData2 = [
  {
    title:'Chat App with encryption',
    description:'This is a nice clean chat app!',
    images:[
      {
        url:'https://cdn.dribbble.com/users/4708/screenshots/14355627/media/acaca4cbfc108f4c1107c5f013f76be4.png?compress=1&resize=400x300',
        filename:'something'

      },
      {
        url:'https://cdn.dribbble.com/users/2246412/screenshots/11470136/media/3ff4434fa21205b5438dfd2a22c4fde7.png?compress=1&resize=400x300',
        filename:'something diff'
      },
    ],
    author:'60a5cb88e51c3c1cb06bf593'
  }
]


// const seedDB = async(arr) =>{
//   await Project.deleteMany({});
//   for(let elem of arr){
//     const project = new Project(elem)
//     await project.save();
//   }
// }


const seedDB = async(id) => {
  const user = await User.findById(id);
  user.activity.collabRequests.splice(0,collabRequests.length);
}

seedDB('60a8b1d841b2dd7dbcca6d15').then(()=>{
  mongoose.connection.close();
})
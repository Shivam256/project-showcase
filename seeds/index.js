const mongoose = require('mongoose');
const Project = require('../models/project');

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
    image:'https://assets.justinmind.com/wp-content/uploads/2018/10/messenger-app-ux-justinmind.png',
    author:'60a5cb88e51c3c1cb06bf593'
  },
  {
    title:'Ecommerce app',
    description:'This is a cool e commerce app with full functionality',
    image:'https://figmaelements.com/wp-content/uploads/2019/10/e-commerce-app-ui.png',
    author:'60a5cb88e51c3c1cb06bf593'
  },
  {
    title:'Netflix clone',
    description:'This is a fully functional Netflix clone',
    image:'https://www.webdesignerdepot.com/cdn-origin/uploads/2020/01/Netflix-User-Personalization.png',
    author:'60a5cb88e51c3c1cb06bf593'
  },
]


const seedDB = async(arr) =>{
  await Project.deleteMany({});
  for(let elem of arr){
    const project = new Project(elem)
    await project.save();
  }
}

seedDB(tempData).then(()=>{
  mongoose.connection.close();
})
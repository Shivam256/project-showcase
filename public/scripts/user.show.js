console.log('CONNECTED TO JS');

const outerProjectContainers = document.querySelectorAll('.project-outer-container');
const mainProjectContainer = document.querySelectorAll('.main-project-container');
const projectContaier = document.querySelectorAll('.profile-project-container');


for(let c of mainProjectContainer){
  c.addEventListener('mouseenter',function(){
    this.children[1].style.visibility = 'visible';
    this.children[0].style.filter = 'brightness(60%)';
  })
}

for(let c of mainProjectContainer){
  c.addEventListener('mouseleave',function(){
    this.children[1].style.visibility = 'hidden';
    this.children[0].style.filter = 'brightness(100%)';
  })
}



const iconContainers = document.querySelectorAll('.stack-icon-container');
const hiddenInputContainer = document.querySelector('.hidden-inputs');

// const addInps = () => {
//   //removing the earlier children
//   let inps = hiddenInputContainer.children;
//   console.log(inps);
//   let n = hiddenInputContainer.childElementCount;
//   console.log(n);
//   if(n){
//     for(let i=0; i<n;i++){
//       hiddenInputContainer.removeChild();
//     }
//   }
//   const selectedStacks = document.querySelectorAll('.stack-icon-container-selected');

//   for(let stack of selectedStacks){
//     const inpElem = document.createElement('input');
//     inpElem.setAttribute('type', 'hidden');
//     inpElem.setAttribute('name', 'stacks');
//     inpElem.setAttribute('value', stack.children[1].textContent);
//     hiddenInputContainer.append(inpElem);
//   }
// }

for (let stack of iconContainers) {
  stack.addEventListener('click', function () {
    this.classList.toggle('stack-icon-container-selected');
    if (this.classList.contains('stack-icon-container-selected')) {
      const inpElem = document.createElement('input');
      inpElem.setAttribute('type', 'hidden');
      inpElem.setAttribute('name', 'stacks');
      inpElem.setAttribute('value', this.children[1].textContent);
      hiddenInputContainer.append(inpElem);

    }
    else{
      const val = this.children[1].textContent;
      const inputs = hiddenInputContainer.children;
      for(let i of inputs){
        if(i.getAttribute('value') == val){
          hiddenInputContainer.removeChild(i);
          break;
        }
      }
    }


  })
}
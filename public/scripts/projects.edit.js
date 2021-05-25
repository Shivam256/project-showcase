const hiddenInputContainer = document.querySelector('.hidden-inputs');
const delImgContainers = document.querySelectorAll('.del-image-container');
const iconContainers = document.querySelectorAll('.stack-icon-container');



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


for (let delImg of delImgContainers) {
  delImg.addEventListener('click', function () {
    this.classList.toggle('del-img-container-selected');
    if (this.classList.contains('del-img-container-selected')) {
      const inpElem = document.createElement('input');
      inpElem.setAttribute('type', 'hidden');
      inpElem.setAttribute('name', 'deleteImages[]');
      inpElem.setAttribute('value', this.dataset.imgFilename);
      hiddenInputContainer.append(inpElem);
    }
    else{
      const val = this.dataset.imgFilename;
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
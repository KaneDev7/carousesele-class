import Carousel from './carousel.js'

 new Carousel(document.querySelector(".container"), {
  visibles: 3,
  scrollable: 1,
  duration: 3,
  buttonsColor : 'white',
  buttonsBackground : '#3085d4',
  buttonsType : 1,
  loop : true,
  pagination : true, 
  autoslide : false,
  delay : 5,
  isButtonVisble : true

});




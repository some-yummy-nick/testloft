'use strict';
(function () {
  var check = document.querySelectorAll('.courses__check');
  var complete = document.querySelector('.courses__complete');
  var wrapper = document.querySelector('.courses__wrapper');
  var title = document.querySelector('.courses__title');
  var text = document.querySelector('.courses__title ~ p');

  function invisible(e) {
    e.target.parentNode.parentNode.classList.add('invisible');
  }
  for (var i = 0; i < check.length; i++) {
    check[i].addEventListener('click', function (e) {
      e.target.parentNode.parentNode.classList.add('courses__item--invisible');
      setTimeout(function () {
        if (e.target.parentNode.parentNode.nextElementSibling) {
          e.target.parentNode.parentNode.nextElementSibling.classList.add('courses__item--margin-right');
        }
        e.target.parentNode.parentNode.remove(); //.classList.add('courses__item--invisible')
        if (wrapper.firstElementChild == null) {
          complete.classList.add('courses__complete--visible');
          title.remove();
          text.remove();
        }
      }, 1000);
    });
  }
})();
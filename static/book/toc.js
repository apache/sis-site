/*
 * Licensed to the Apache Software Foundation (ASF)
 * under one or more contributor license agreements.
 */
window.addEventListener('DOMContentLoaded', () => {

  var lastVisibleId = null;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const id = entry.target.getAttribute('id');
      var line = document.querySelector(`nav li a[href="#${id}"]`);
      if (line !== null) {
        if (entry.intersectionRatio > 0) {
          if (lastVisibleId !== null) {
              document.querySelector(`nav li a[href="#${lastVisibleId}"]`).parentElement.classList.remove('active');
          }
          lastVisibleId = id;
          var item = line.parentElement;
          item.classList.add('active');
          const bounds = item.getBoundingClientRect();
          if (bounds.top < 0 || bounds.bottom > window.innerHeight - 2) {
              item.scrollIntoView();
          }
        }
      }
    });
  });

  // Track headers that have an `id` applied.
  document.querySelectorAll(':is(h1,h2,h3,h4)[id]').forEach((section) => {
    observer.observe(section);
  });
});

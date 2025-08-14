// HomePage- Menu Toggle Button
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('show');
  });


// Our Hotel Card Slider
  const slider = document.getElementById("hotelSlider");
  const prevBtn = document.querySelector(".slide-btn.prev");
  const nextBtn = document.querySelector(".slide-btn.next");

  let cardWidth = 0;

  function updateCardWidth() {
    const card = slider.querySelector(".hotel-card");
    const gap = parseInt(getComputedStyle(slider).gap) || 0;
    if (card) {
      cardWidth = card.offsetWidth + gap;
    }
  }

  window.addEventListener("load", updateCardWidth);
  window.addEventListener("resize", updateCardWidth);

  nextBtn.addEventListener("click", () => {
    slider.scrollBy({ left: cardWidth, behavior: "smooth" });
  });

  prevBtn.addEventListener("click", () => {
    slider.scrollBy({ left: -cardWidth, behavior: "smooth" });
  });

// // Testimonial Card Slider
// const testimonialSlider = document.getElementById("testimonialSlider");
// const testimonialNextBtn = document.querySelector(".slide-btn.next");
// const testimonialPrevBtn = document.querySelector(".slide-btn.prev");

// let currentIndex = 0;

// function getSlideWidth() {
//   return testimonialSlider.querySelector(".testimonial-card").offsetWidth + 30; // card + gap
// }

// testimonialNextBtn.addEventListener("click", () => {
//   const totalCards = testimonialSlider.children.length;
//   if (currentIndex < totalCards - 1) {
//     currentIndex++;
//     testimonialSlider.style.transform = `translateX(-${getSlideWidth() * currentIndex}px)`;
//   }
// });

// testimonialPrevBtn.addEventListener("click", () => {
//   if (currentIndex > 0) {
//     currentIndex--;
//     testimonialSlider.style.transform = `translateX(-${getSlideWidth() * currentIndex}px)`;
//   }
// });

// // Handle window resize
// window.addEventListener("resize", () => {
//   testimonialSlider.style.transform = `translateX(-${getSlideWidth() * currentIndex}px)`;
// });


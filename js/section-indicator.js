document.addEventListener('DOMContentLoaded', function () {
    const topicsMenu =
          document.querySelector(".topics");
    const sections =
          document.querySelector(".post-content").querySelectorAll("h1, h2, h3, h4, h5, h6");
    var activatedLink = null;

    window.addEventListener('scroll', function () {
        const currentPos = window.scrollY;

        sections.forEach(function (section) {
            const sectionTop = section.offsetTop - 50;
            const sectionId = section.getAttribute('id');

            if (sectionId != activatedLink && currentPos >= sectionTop) {
                activatedLink?.classList.remove('active');

                activatedLink =
                document.querySelector('.topics a[href="#' 
                    + sectionId + '"]');
                activatedLink.classList.add('active');
                topicsMenu.scrollTop = activatedLink.offsetTop - 80;

                console.log(topicsMenu.scrollTop);
            }
        });
    });
});
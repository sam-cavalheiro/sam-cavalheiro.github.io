var timeoutId = -1;
var currentSlideIndex = -1;
var prevClickedThumbnail;


function init() {
    document.querySelector(".gallery-display video").addEventListener("play", onPlayVideoFirstTime);
}

function nextSlide() {
    var thumbnailElement = document.getElementById("thumbnail" + (currentSlideIndex + 1));

    if (thumbnailElement == null) {
        thumbnailElement = document.getElementById("thumbnail" + 0);

        if (thumbnailElement == null)
            return;
    }

    thumbnailElement.onclick.call();
}

function displayMedia(mediaPath, index) {
    if (index == currentSlideIndex)
        return;

    const displayImg = document.querySelector(".gallery-display img");
    const displayVideo = document.querySelector(".gallery-display video");

    var extension = "";

    for (let i = mediaPath.lastIndexOf('.') + 1; i  < mediaPath.length; i++)
        extension += mediaPath[i];

    extension = extension.toLowerCase();

    if (extension == "png" || extension == "jpg" || extension == "bmp" || extension == "gif") {
        displayImg.src = mediaPath;
        displayVideo.pause();
        displayImg.style.visibility = "visible";
        displayVideo.style.visibility = "hidden";

        clearTimeout(timeoutId);
        timeoutId = setTimeout(nextSlide, 5000);
    }
    else if (extension == "mp4") {
        displayVideo.src = mediaPath;
        displayVideo.play();
        displayImg.style.visibility = "hidden";
        displayVideo.style.visibility = "visible";

        clearTimeout(timeoutId);

        if (displayVideo.paused)
            timeoutId = setTimeout(nextSlide, 5000);
    }

    if (currentSlideIndex > -1)
        document.getElementById("thumbnail" + currentSlideIndex).classList.remove("active");
    document.getElementById("thumbnail" + index).classList.add("active");

    currentSlideIndex = index;
}

function onPlayVideoFirstTime() {
    clearTimeout(timeoutId);
    document.querySelector(".gallery-display video").removeEventListener("play", onPlayVideoFirstTime);
}
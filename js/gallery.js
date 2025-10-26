var displayGallery;
var displayYoutube;
var displayImg;
var displayVideo;

var youtubePlayer;

var nextSlideTimeoutId = -1;
var pauseOnEndIntervalId = -1;
var currentSlideIndex = -1;
var playedVideoFirstTime = false;
var playedYoutubeFirstTime = false;
var wasPlayingWhenUnfocused = false;
var isVisibleInScroll = false;


var youtubeTag = document.createElement("script");
youtubeTag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(youtubeTag, firstScriptTag);


function onYouTubeIframeAPIReady() {
    youtubePlayer = new YT.Player('youtube-player', {
        width: '100%',
        height: '100%',
        playerVars: {
            'playsinline': 1
        },
        events: {
            'onReady': onYoutubePlayerReady,
            'onStateChange': onYoutubePlayerStateChange
        }
    });
}

function init() {
    displayGallery = document.getElementsByClassName("gallery-display")[0];
    displayYoutube = document.querySelector(".gallery-display iframe");
    displayImg = document.querySelector(".gallery-display img");
    displayVideo = document.querySelector(".gallery-display video");

    window.addEventListener("focus", onFocusWindow);
    window.addEventListener("blur", onUnfocusWindow);
    window.addEventListener("scroll", onScroll);
    displayVideo.addEventListener("play", onPlayVideoFirstTime);

    isVisibleInScroll = window.scrollY + window.innerHeight > displayGallery.offsetTop && window.scrollY < displayGallery.offsetTop + displayGallery.offsetHeight + 100;
}

function nextSlide() {
    var thumbnailElement = document.getElementById("thumbnail" + (currentSlideIndex + 1));

    if (thumbnailElement == null) {
        thumbnailElement = document.getElementById("thumbnail0");

        if (thumbnailElement == null)
            return;
    }

    thumbnailElement.onclick.call();
}

function displayMedia(mediaPath, index) {
    if (index == currentSlideIndex)
        return;

    displayYoutube.style.visibility = "hidden";
    displayImg.style.visibility = "hidden";
    displayVideo.style.visibility = "hidden";

    var dotIndex = mediaPath.lastIndexOf('.');

    if (dotIndex == -1) { // Youtube ID
        displayVideo.pause();

        youtubePlayer.loadVideoById(mediaPath);
        displayYoutube.style.visibility = "visible";

        clearTimeout(nextSlideTimeoutId);

        if (!document.hasFocus() || !isVisibleInScroll)
            youtubePlayer.pauseVideo();
        else if (!playedYoutubeFirstTime)
            nextSlideTimeoutId = setTimeout(nextSlide, 5000);
    }
    else { // Imagem ou vídeo
        var extension = "";

        for (let i = dotIndex + 1; i  < mediaPath.length; i++)
            extension += mediaPath[i];

        extension = extension.toLowerCase();

        if (extension == "png" || extension == "jpg" || extension == "bmp" || extension == "gif") {
            displayVideo.pause();
            youtubePlayer.stopVideo();

            displayImg.src = mediaPath;
            displayImg.style.visibility = "visible";

            clearTimeout(nextSlideTimeoutId);

            if (document.hasFocus() && isVisibleInScroll)
                nextSlideTimeoutId = setTimeout(nextSlide, 5000);
        }
        else if (extension == "mp4") {
            youtubePlayer.stopVideo();

            displayVideo.src = mediaPath;
            displayVideo.play();
            displayVideo.style.visibility = "visible";

            clearTimeout(nextSlideTimeoutId);

            if (displayVideo.paused && document.hasFocus() && isVisibleInScroll)
                nextSlideTimeoutId = setTimeout(nextSlide, 5000);
        }
    }

    if (currentSlideIndex > -1)
        document.getElementById("thumbnail" + currentSlideIndex).classList.remove("active");
    document.getElementById("thumbnail" + index).classList.add("active");

    currentSlideIndex = index;
}

function activateTimerDependingCurrentSlide() {
    if (displayImg.style.visibility == "visible" ||
    (!playedVideoFirstTime && displayVideo.style.visibility == "visible") ||
    (!playedYoutubeFirstTime && displayYoutube.style.visibility == "visible"))
        nextSlideTimeoutId = setTimeout(nextSlide, 5000);
}

function onFocusWindow() {
    if (wasPlayingWhenUnfocused) {
        clearInterval(pauseOnEndIntervalId);
        wasPlayingWhenUnfocused = false;

        if (displayVideo.style.visibility == "visible")
            displayVideo.play();
        if (displayYoutube.style.visibility == "visible")
            youtubePlayer.playVideo();

        return;
    }

    activateTimerDependingCurrentSlide();
}

function onUnfocusWindow() {
    clearTimeout(nextSlideTimeoutId);

    if (playedVideoFirstTime && displayVideo.style.visibility == "visible" && !displayVideo.paused) {
        clearInterval(pauseOnEndIntervalId);
        wasPlayingWhenUnfocused = true;

        pauseOnEndIntervalId = setInterval(() => {
            if (displayVideo.currentTime >= displayVideo.duration * 0.9) {
                displayVideo.pause();
                clearInterval(pauseOnEndIntervalId);
            }
        }, 100);
    }
    else if (playedYoutubeFirstTime && displayYoutube.style.visibility == "visible" &&
        youtubePlayer.playerInfo.playerState == YT.PlayerState.PLAYING) {
        clearInterval(pauseOnEndIntervalId);
        wasPlayingWhenUnfocused = true;

        pauseOnEndIntervalId = setInterval(() => {
            if (youtubePlayer.playerInfo.currentTime >= youtubePlayer.playerInfo.duration * 0.9) {
                youtubePlayer.pauseVideo();
                clearInterval(pauseOnEndIntervalId);
            }
        }, 100);
    }
}

function onScroll() {
    if (window.scrollY + window.innerHeight > displayGallery.offsetTop && window.scrollY < displayGallery.offsetTop + displayGallery.offsetHeight + 100) {
        if (!isVisibleInScroll) {
            activateTimerDependingCurrentSlide();
            isVisibleInScroll = true;
        }
    }
    else {
        clearTimeout(nextSlideTimeoutId);
        isVisibleInScroll = false;
    }
}

function onPlayVideoFirstTime() {
    clearTimeout(nextSlideTimeoutId);
    playedVideoFirstTime = true;
    displayVideo.removeEventListener("play", onPlayVideoFirstTime);
}

function onYoutubePlayerReady(event) {
    init();
    nextSlide();
}

function onYoutubePlayerStateChange(event) {
    if (!playedYoutubeFirstTime && event.data == YT.PlayerState.PLAYING){
        clearTimeout(nextSlideTimeoutId);
        playedYoutubeFirstTime = true;
    }
    if (event.data == YT.PlayerState.ENDED)
        nextSlide();
}
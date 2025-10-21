var youtubePlayer;

var timeoutId = -1;
var currentSlideIndex = -1;
var playedYoutubeFirstTime = false;


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
    document.querySelector(".gallery-display video").addEventListener("play", onPlayVideoFirstTime);
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

    const displayYoutube = document.querySelector(".gallery-display iframe");
    const displayImg = document.querySelector(".gallery-display img");
    const displayVideo = document.querySelector(".gallery-display video");

    displayYoutube.style.visibility = "hidden";
    displayImg.style.visibility = "hidden";
    displayVideo.style.visibility = "hidden";

    var dotIndex = mediaPath.lastIndexOf('.');

    if (dotIndex == -1) { // Youtube ID
        displayVideo.pause();

        youtubePlayer.loadVideoById(mediaPath);
        displayYoutube.style.visibility = "visible";
        //youtubePlayer.playVideo();

        clearTimeout(timeoutId);

        if (!playedYoutubeFirstTime)
            timeoutId = setTimeout(nextSlide, 5000);
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

            clearTimeout(timeoutId);
            timeoutId = setTimeout(nextSlide, 5000);
        }
        else if (extension == "mp4") {
            youtubePlayer.stopVideo();

            displayVideo.src = mediaPath;
            displayVideo.play();
            displayVideo.style.visibility = "visible";

            clearTimeout(timeoutId);

            if (displayVideo.paused)
                timeoutId = setTimeout(nextSlide, 5000);
        }
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

function onYoutubePlayerReady(event) {
    init();
    nextSlide();
}

function onYoutubePlayerStateChange(event) {
    if (!playedYoutubeFirstTime && event.data == YT.PlayerState.PLAYING){
        clearTimeout(timeoutId);
        playedYoutubeFirstTime = true;
    }
}
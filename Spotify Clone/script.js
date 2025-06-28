
let currentSong = new Audio();
let songs;
let currFolder;

function convertToMinutesSeconds(totalSeconds) {

    if (isNaN(totalSeconds) || totalSeconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    // Add leading zeros if needed
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${currFolder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currFolder}/`)[1]);
        }
    }

    //Show all the songs in the playist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="Assets/music.svg" alt="music">
                                <div class="info">
                                    <div>${song.replaceAll("%20", " ")}</div>
                                    <div>Maninder Buttar</div>
                                </div>
                                <div class="playnow">
                                    <span>Play Now</span>
                                    <img class="invert" src="Assets/play.svg" alt="play">
                                </div></li>`;
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;

    if (!pause) {
        currentSong.play();
        play.src = "Assets/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    Array.from(anchors).forEach(e => {
        if(e.href.includes("/songs")) {
            e.href.split("/").slice(-2)[0]
        }
    })
}

async function main() {

    //getting list of all the songs
    await getSongs("songs/ncs")
    playMusic(songs[0], true)

    //Display all the albums on the page
    displayAlbums()

    //Attaching event listener to play,next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "Assets/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "Assets/play.svg";
        }
    })

    // Listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertToMinutesSeconds(currentSong.currentTime)} / ${convertToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration) * percent / 100;
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/songs/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/songs/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)

        })
    })
}

main()



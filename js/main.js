let client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8",
});

let config = {
  appId: "88566ab591d243baa35bc9feb8b461c1",
  channel: "liveStream",
  token:
    "00688566ab591d243baa35bc9feb8b461c1IAAhgSs40Mqr+VZ1UkTUkMhs62m7NdzA3JVdYR8K9jd0gqtapy0AAAAAEADC8VeA6wLjYQEAAQDrAuNh",
  uid: null,
};

// //#3 - Setting tracks for when user joins
let localTracks = {
  audioTrack: null,
  videoTrack: null,
};

//#4 - Want to hold state for users audio and video so user can mute and hide
let localTrackState = {
  audioTrackMuted: false,
  videoTrackMuted: false,
};

// for other users on the same application
let remoteTracks = {};

document.getElementById("join-btn").addEventListener("click", async () => {
  // console.log("user joined the cam!");
  await joinStreams();
  document.getElementById('join-wrapper').style.display = 'none'
  document.getElementById("footer").style.display = "flex";
});

document.getElementById("leave-btn").addEventListener("click", async () => {
  for (trackName in localTracks) {
    let track = localTracks[trackName];
    if (track) {
      track.stop();
      track.close();
      localTracks[trackName] = null;
    }
  }

  //Leave the channel
  await client.leave();
  document.getElementById("footer").style.display = "none";
  document.getElementById("user-streams").innerHTML = "";
  document.getElementById('join-wrapper').style.display = 'block'
});

document.getElementById("mic-btn").addEventListener("click", async () => {
  // console.log(localTrackState.audioTrackMuted);
  if (!localTrackState.audioTrackMuted) {
    await localTracks.audioTrack.setMuted(true);
    localTrackState.audioTrackMuted = true;
    document.getElementById("mic-btn").style.backgroundColor =
      "rgb(255, 80, 80, 0.7)";
  } else {
    await localTracks.audioTrack.setMuted(false);
    localTrackState.audioTrackMuted = false;
    document.getElementById("mic-btn").style.backgroundColor = "#1f1f1f8e";
  }
});

document.getElementById("camera-btn").addEventListener("click", async () => {
  // console.log(localTrackState.audioTrackMuted);
  if (!localTrackState.videoTrackMuted) {
    await localTracks.videoTrack.setMuted(true);
    localTrackState.videoTrackMuted = true;
    document.getElementById("camera-btn").style.backgroundColor =
      "rgb(255, 80, 80, 0.7)";
  } else {
    await localTracks.videoTrack.setMuted(false);
    localTrackState.videoTrackMuted = false;
    ocument.getElementById("camera-btn").style.backgroundColor = "#1f1f1f8e";
  }
});

let joinStreams = async () => {
  client.on("user-published", handleUserJoined);
  client.on("user-left", handleUserLeft);

  [config.uid, localTracks.audioTrack, localTracks.videoTrack] =
    await Promise.all([
      client.join(
        config.appId,
        config.channel,
        config.token || null,
        config.uid || null
      ),
      AgoraRTC.createMicrophoneAudioTrack(),
      AgoraRTC.createCameraVideoTrack(),
    ]);

  let videoPlayer = `<div class="video-containers" id="video-wrapper-${config.uid}">
                        <p class="user-uid">${config.uid}</p>
                        <div class="video-player player" id="stream-${config.uid}"></div>
                      </div>`;

  document
    .getElementById("user-streams")
    .insertAdjacentHTML("beforeend", videoPlayer);
  localTracks.videoTrack.play(`stream-${config.uid}`);

  await client.publish([localTracks.audioTrack, localTracks.videoTrack]);
  // client.on("user-published", handleUserJoined);
};

let handleUserJoined = async (user, mediaType) => {
  // console.log('another user has joined')
  remoteTracks[user.uid] = user;

  await client.subscribe(user, mediaType);

  if (mediaType === "video") {
    let videoPlayer = document.getElementById(`video-wrapper-${user.uid}`);
    if (videoPlayer != null) videoPlayer.remove();

    videoPlayer = `<div class="video-containers" id="video-wrapper-${user.uid}">
                            <p class="user-uid">${user.uid}</p>
                            <div class="video-player player" id="stream-${user.uid}"></div>
                        </div>`;
    document
      .getElementById("user-streams")
      .insertAdjacentHTML("beforeend", videoPlayer);
    user.videoTrack.play(`stream-${user.uid}`);
  }
  if (mediaType === "audio") user.audioTrack.play();
};

let handleUserLeft = async (user) => {
  // console.log('user has left!');
  delete remoteTracks[user.uid];
  document.getElementById(`video-wrapper-${user.uid}`);
};

var baseApiUrl = "http://localhost:3000";
var recorder = null;
var chunks = [];
var filename = null;

// Starts sending the video chunks to the backend
async function sendChunkToBackend(base64Data) {
  if (!filename) {
    console.error("File is not set. Aborting sendChunkToBackend.");
    return;
  } else {
    console.log(base64Data);
    fetch(`http://localhost:3000/upload?filename=${filename}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chunk: base64Data }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to upload filename");
        }
        console.log("Filename uploaded successfully");
      })
      .catch((error) => {
        console.error("Error uploading filename:", error);
      });
  }
}

// When user grants permissions and hits start or stop
function onAccessApproved(stream) {
  if (!recorder) {
    recorder = new MediaRecorder(stream);
    recorder.start(5000);

    recorder.onstop = function () {
      stream.getTracks().forEach(function (track) {
        if (track.readyState === "live") {
          track.stop();
        }
      });
      filename = null;
      chunks = [];
    };
  }

  // When there are available chunks
  recorder.ondataavailable = function (event) {
    chunks.push(event.data);
    if (!filename) {
      filename = generateUniqueID();
    }
    if (event.data.size > 0) {
      // Convert the blob to base64
      const reader = new FileReader();
      reader.onload = function () {
        sendChunkToBackend(reader.result);
      };
      reader.readAsDataURL(event.data);
    }
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "request_recording") {
    sendResponse(`processed ${message.action}`);
    generateUniqueID();
    navigator.mediaDevices
      .getDisplayMedia({
        video: {
          mediaSource: "screen",
        },
        audio: true,
        // audio: true,
        // video: {
        //   width: 999999999,
        //   height: 999999999,
        // },
      })
      .then((stream) => {
        onAccessApproved(stream);
      });
  }

  if (message.action === "stop_video") {
    sendResponse(`processed ${message.action}`);
    if (!recorder) {
      console.log("no recorder");
    } else if (recorder.state === "recording") {
      recorder.stop();
    } else {
      console.log("Recorder not in recoding state");
    }
  }
});

// Function to generate a unique ID (filename)
function generateUniqueID() {
  if (!filename) {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Month is zero-based
    const day = String(currentDate.getDate()).padStart(2, "0");
    const timestamp = currentDate.getTime();

    filename = `${timestamp}${year}${month}${day}`;
  }
  return filename;
}

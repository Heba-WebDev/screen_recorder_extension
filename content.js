var recorder = null;
var mediaChunks = [];
var filename = null; // Initialize the filename

function sendChunkToBackend(filename) {
  console.log("sending filename");
  console.log(filename);

  fetch(`http://localhost:3000/upload?filename=${filename}`, {
    method: "POST",
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

function onAccessApproved(stream) {
  if (!recorder) {
    recorder = new MediaRecorder(stream);
    recorder.start(2000);

    recorder.onstop = function () {
      stream.getTracks().forEach(function (track) {
        if (track.readyState === "live") {
          track.stop();
        }
      });

      filename = null;
    };
  }

  recorder.ondataavailable = function (event) {
    mediaChunks.push(event.data);

    // Set the filename (ID) if it's null
    if (!filename) {
      filename = generateUniqueID();
    }
    sendChunkToBackend(event.data); // Send the chunks to the backend
    // Clear the chunks array to avoid sending duplicates
    mediaChunks.length = 0;
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "request_recording") {
    sendResponse(`processed ${message.action}`);
    generateUniqueID();
    navigator.mediaDevices
      .getDisplayMedia({
        audio: true,
        video: {
          width: 999999999,
          height: 999999999,
        },
      })
      .then((stream) => {
        onAccessApproved(stream);
      });
  } else if (message.action === "stop_video") {
    sendResponse(`processed ${message.action}`);
    if (!recorder) {
      console.log("no recorder");
    } else if (recorder.state === "recording") {
      recorder.stop();
      sendChunkToBackend(); // Send any remaining chunks when stopping
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

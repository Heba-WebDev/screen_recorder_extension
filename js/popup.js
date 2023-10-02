const closeWindow = document.querySelector(".close_btn");
const startRecordingBtn = document.querySelector("#start_video");
const stopRecordingBtn = document.querySelector("#stop_video");

// Closes the extension window
closeWindow.addEventListener("click", () => {
  window.close();
});

// Starts recording
startRecordingBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "request_recording" },
      function (response) {
        if (!chrome.runtime.lastError) {
          console.log(response);
        } else {
          console.log(chrome.runtime.lastError);
        }
      }
    );
  });
});

// Stop recording
stopRecordingBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "stop_video" },
      function (response) {
        if (!chrome.runtime.lastError) {
          console.log(response);
        } else {
          console.log(chrome.runtime.lastError);
        }
      }
    );
  });
});

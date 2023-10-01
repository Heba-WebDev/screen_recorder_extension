const closeWindow = document.querySelector(".close_btn");

closeWindow.addEventListener("click", () => {
  window.close();
});

document.addEventListener("DOMContentLoaded", () => {
  // we page is fully loaded
  const startRecordingBtn = document.querySelector("#start_video");
  const stopRecordingBtn = document.querySelector("#stop_video");

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
});

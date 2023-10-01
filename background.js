// Conent will only be injected if the page has loaded and if we are in
// a webpage (excluse settings pages, etc)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && /^http/.test(tab.url)) {
    chrome.scripting
      .executeScript({
        target: { tabId },
        files: ["./content.js"],
      })
      .then(() => {
        console.log("Injected the conent script");
      })
      .catch((error) => {
        console.log(error);
      });
  }
});

// chrome.action.onClicked

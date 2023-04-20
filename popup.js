document.addEventListener('DOMContentLoaded', async () => {
  const activeTabUrl = document.getElementById('active-tab-url');

  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const activeTab = tabs[0];

    const regex = /^https:\/\/www\.faceit\.com\/en\/csgo\/room\//;

    console.log('activeTab.url', activeTab.url);

    if (regex.test(activeTab.url)) {
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        files: ['content-script.js'],
      });
    }
  });
});

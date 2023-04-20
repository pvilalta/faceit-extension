document.addEventListener('DOMContentLoaded', async () => {
  const activeTabUrl = document.getElementById('active-tab-url');

  // Sélectionner le bouton et ajouter un gestionnaire d'événement 'click'
  const executeScriptButton = document.getElementById('execute-script');
  executeScriptButton.addEventListener('click', () => {
    const userNickname = document.getElementById('nickname').value;
    const accuracy = document.getElementById('accuracy').value;

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const activeTab = tabs[0];

      const regex = /^https:\/\/www\.faceit\.com\/en\/csgo\/room\//;

      console.log('activeTab.url', activeTab.url);

      if (regex.test(activeTab.url)) {
        chrome.tabs.sendMessage(activeTab.id, { userNickname, accuracy });

        chrome.scripting.executeScript(
          {
            target: { tabId: activeTab.id },
            files: ['content-script.js'],
          },
          () => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              return;
            }
          }
        );
      }
    });
  });
});

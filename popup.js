function insertHtlmText(parentEl, elToCreate, data) {
  let element = document.getElementById(parentEl);
  let createdTag = document.createElement(elToCreate);
  createdTag.textContent = data;
  element.appendChild(createdTag);
}

function generateHTML(data) {
  let html = '';

  data.forEach(teamData => {
    html += `<h2>${teamData.team}</h2>`;
    html += '<table>';
    html += '<tr><th>Map</th><th>Total Games</th><th>Wins</th><th>Loses</th><th>Win Rate</th></tr>';

    teamData.winrate.forEach(winrate => {
      html += '<tr>';
      html += `<td>${winrate.name}</td>`;
      html += `<td>${winrate.win + winrate.lose}</td>`;
      html += `<td>${winrate.win}</td>`;
      html += `<td>${winrate.lose}</td>`;
      html += `<td>${winrate.winRate}%</td>`;
      html += '</tr>';
    });

    html += '</table>';
  });

  let div = document.createElement('div');
  div.innerHTML = html;

  return div;
}

document.addEventListener('DOMContentLoaded', async () => {
  const executeScriptButton = document.getElementById('execute-script');

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.message) {
      case 'fetching':
        insertHtlmText('result', 'p', 'fetching');
        break;
      case 'result':
        const resultTab = generateHTML(request.data);
        let element = document.getElementById('result');
        element.appendChild(resultTab);
    }
  });

  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const activeTab = tabs[0];
    let nickname;

    chrome.scripting
      .executeScript({
        target: { tabId: activeTab.id },
        files: ['fetchNickname.js'],
      })
      .then(res => {
        nickname = res[0].result;
        insertHtlmText('player', 'h3', nickname);
      });

    const regex = /^https:\/\/www\.faceit\.com\/(en|fr)\/csgo\/room\//;

    if (regex.test(activeTab.url)) {
      executeScriptButton.addEventListener('click', () => {
        const accuracy = document.getElementById('accuracy').value;

        chrome.tabs.sendMessage(activeTab.id, { nickname, accuracy });

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
      });
    }
  });
});

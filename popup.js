function insertHtlmText(parentEl, elToCreate, data) {
  let element = document.getElementById(parentEl);
  let createdTag = document.createElement(elToCreate);
  createdTag.textContent = data;
  element.appendChild(createdTag);
}

function generateHTML(data) {
  let html = '';

  data.forEach(teamData => {
    html += `<h2>${teamData.name}</h2>`;
    html += '<table>';
    html += '<tr><th>Map</th><th>Total</th><th>Wins</th><th>Loses</th><th>Win Rate</th></tr>';

    teamData.maps.forEach(map => {
      html += '<tr>';
      html += `<td>${map.name}</td>`;
      html += `<td>${map.win + map.lose}</td>`;
      html += `<td>${map.win}</td>`;
      html += `<td>${map.lose}</td>`;
      html += `<td>${map.winRate}%</td>`;
      html += '</tr>';
    });

    html += '</table>';
  });

  let div = document.createElement('div');
  div.innerHTML = html;

  return div;
}

document.addEventListener('DOMContentLoaded', async () => {
  let scriptButton = document.getElementById('execute-script');
  scriptButton.disabled = true;

  chrome.runtime.onMessage.addListener(request => {
    switch (request.message) {
      case 'fetching':
        document.getElementById('result').firstChild?.remove();
        insertHtlmText('result', 'p', 'fetching');
        scriptButton.disabled = true;

        break;
      case 'result':
        document.getElementById('result').firstChild?.remove();
        const resultTab = generateHTML(request.data);
        let element = document.getElementById('result');
        element.appendChild(resultTab);
        scriptButton.disabled = false;
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
      scriptButton.disabled = false;
      scriptButton.addEventListener('click', () => {
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

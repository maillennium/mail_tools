// Base64 decoding function
function decodeBase64(base64) {
  return decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

// Quoted-printable decoding function
function decodeQuotedPrintable(input) {
  return input.replace(/=([A-Fa-f0-9]{2})/g, function(match, p1) {
    return String.fromCharCode(parseInt(p1, 16));
  }).replace(/=\r\n/g, '');
}

async function getAccounts() {
  let accounts = await browser.accounts.list();
  return accounts;
}

async function getFolders(accountId) {
  let account = await browser.accounts.get(accountId);
  return account.folders;
}

async function extractUrlsFromFolder(accountId, folderPath) {
  let messages = await browser.messages.list({ accountId, path: folderPath });
  let urls = [];
  let progressBar = document.getElementById('progressBar');

  if (progressBar) {
    progressBar.max = messages.messages.length;
    progressBar.value = 0;

    for (let message of messages.messages) {
      let fullMessage = await browser.messages.getFull(message.id);
      let bodyPart = fullMessage.parts.find(part => part.contentType === "text/html" || part.contentType === "text/plain");

      if (bodyPart) {
        let body = bodyPart.body;

        if (bodyPart.encoding === "base64") {
          body = decodeBase64(body);
        } else if (bodyPart.encoding === "quoted-printable") {
          body = decodeQuotedPrintable(body);
        }

        // Improved URL regex to capture more complex URLs
        let urlRegex = /https?:\/\/[^\s"<]+(?:\.[^\s"<]+)*(?:\/[^\s"<]*)*/g;
        let foundUrls = body.match(urlRegex);

        if (foundUrls) {
          urls.push(...foundUrls);
        }
      }
      progressBar.value += 1;
    }
  } else {
    console.error("Progress bar element not found");
  }

  return urls;
}

document.addEventListener('DOMContentLoaded', async () => {
  let accountList = document.getElementById('accountList');
  let folderList = document.getElementById('folderList');
  let progressBar = document.getElementById('progressBar');
  let downloadButton = document.getElementById('downloadButton');

  if (!accountList || !folderList || !progressBar || !downloadButton) {
    console.error("Required DOM elements not found");
    return;
  }

  let accounts = await getAccounts();
  accounts.forEach(account => {
    let option = document.createElement('option');
    option.value = account.id;
    option.textContent = account.name;
    accountList.appendChild(option);
  });

  accountList.addEventListener('change', async () => {
    let selectedAccountId = accountList.value;
    let folders = await getFolders(selectedAccountId);
    folderList.innerHTML = '';
    folders.forEach(folder => {
      let option = document.createElement('option');
      option.value = folder.path;
      option.textContent = folder.name;
      folderList.appendChild(option);
    });
  });

  document.getElementById('extractUrlsButton').addEventListener('click', async () => {
    let selectedFolderPath = folderList.value;
    let selectedAccountId = accountList.value;
    let urls = await extractUrlsFromFolder(selectedAccountId, selectedFolderPath);
    document.getElementById('urls').value = urls.join('\n');
  });

  downloadButton.addEventListener('click', () => {
    let urlsText = document.getElementById('urls').value;
    let blob = new Blob([urlsText], { type: 'text/plain' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'extracted_urls.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});

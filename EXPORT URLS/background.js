async function getAccounts() {
  let accounts = await browser.accounts.list();
  return accounts;
}

async function getFolders(accountId) {
  let account = await browser.accounts.get(accountId);
  return account.folders;
}

async function extractUrlsFromFolder(folder) {
  let messages = await browser.messages.list(folder);
  let urls = [];

  for (let message of messages.messages) {
    let fullMessage = await browser.messages.getFull(message.id);
    let bodyPart = fullMessage.parts.find(part => part.contentType === "text/html");

    if (bodyPart) {
      let body = bodyPart.body;
      
      // Improved URL regex to capture more complex URLs
      let urlRegex = /https?:\/\/[^\s"<]+(?:\.[^\s"<]+)*(?:\/[^\s"<]*)*/g;
      let foundUrls = body.match(urlRegex);

      if (foundUrls) {
        urls.push(...foundUrls);
      }
    }
  }

  return urls;
}

browser.browserAction.onClicked.addListener(() => {
  console.log("Browser action clicked");
});

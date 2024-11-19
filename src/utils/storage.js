export class Storage {
    static async getSettings() {
      return new Promise((resolve) => {
        chrome.storage.sync.get(['apiKey', 'template'], resolve);
      });
    }
  
    static async saveSettings(settings) {
      return new Promise((resolve) => {
        chrome.storage.sync.set(settings, resolve);
      });
    }
}
// Funzione per mostrare il messaggio di successo
function showSuccessMessage() {
    const successMessage = document.getElementById('saveSuccess');
    successMessage.style.display = 'block';
    
    // Nascondi il messaggio dopo 3 secondi
    setTimeout(() => {
      successMessage.style.display = 'none';
    }, 3000);
  }
  
  // Funzione per salvare le impostazioni
  async function saveSettings() {
    const settings = {
      apiKey: document.getElementById('apiKey').value.trim(),
      githubToken: document.getElementById('githubToken').value.trim(),
      template: document.getElementById('template').value.trim()
    };
  
    // Valida l'API key
    if (!settings.apiKey) {
      alert('Please enter your Claude API key');
      return;
    }
  
    try {
      await chrome.storage.sync.set(settings);
      showSuccessMessage();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  }
  
  // Funzione per caricare le impostazioni salvate
  async function loadSettings() {
    try {
      const data = await chrome.storage.sync.get(['apiKey', 'githubToken', 'template']);
      
      if (data.apiKey) {
        document.getElementById('apiKey').value = data.apiKey;
      }
      
      if (data.githubToken) {
        document.getElementById('githubToken').value = data.githubToken;
      }
      
      if (data.template) {
        document.getElementById('template').value = data.template;
      } else {
        // Template di default
        document.getElementById('template').value = `## 🎯 What Changed
  
  [Brief summary of the main changes]
  
  ## 🔍 Details
  
  ### Added
  - 
  
  ### Changed
  - 
  
  ### Fixed
  - 
  
  ## 🧪 Testing Done
  - [ ] Manual testing
  - [ ] Unit tests
  - [ ] Integration tests
  
  ## 📝 Notes
  - Any known limitations?
  - Any follow-up tasks?`;
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      alert('Failed to load settings. Please try refreshing the page.');
    }
  }
  
  // Inizializza la pagina
  document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    
    // Event listener per il pulsante di salvataggio
    document.getElementById('save').addEventListener('click', saveSettings);
    
    // Event listeners per salvare con Ctrl+S o Cmd+S
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveSettings();
      }
    });
  });
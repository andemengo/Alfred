(function() {
    console.log('Alfred: Script loaded');
  
    const AlfredIntegration = {
      async init() {
        console.log('Alfred: Initializing...'); 
        if (!this.isPRPage()) {
          console.log('Alfred: Not a PR page, stopping.'); 
          return;
        }
        
        console.log('Alfred: PR page detected, proceeding...'); 
        this.injectStyles();
        this.addAIButton();
      },
  
      isPRPage() {
        const isPR = window.location.pathname.includes('/pull/') || 
                     window.location.pathname.includes('/compare/');
        console.log('Alfred: isPRPage:', isPR, window.location.pathname); 
        return isPR;
      },
  
      addAIButton() {
        console.log('Alfred: Adding AI button...');
        
        // Se siamo nella pagina di creazione PR
        if (window.location.pathname.includes('/compare')) {
          this.addButtonToNewPR();
          return;
        }
  
        // Se siamo in una PR esistente, osserva i cambiamenti per il pulsante edit
        this.observeEditButton();
      },
  
      addButtonToNewPR() {
        const actionBar = document.querySelector('md-toolbar') || 
                         document.querySelector('.comment-form-actions');
        
        if (!actionBar) {
          console.log('Alfred: Action bar not found for new PR, setting up observer...');
          this.observeNewPRForm();
          return;
        }
  
        this.insertButton(actionBar);
      },
  
      observeNewPRForm() {
        const observer = new MutationObserver((mutations, obs) => {
          const actionBar = document.querySelector('md-toolbar') || 
                           document.querySelector('.comment-form-actions');
          
          if (actionBar) {
            console.log('Alfred: Action bar found in new PR form');
            this.insertButton(actionBar);
            obs.disconnect();
          }
        });
  
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      },
  
      observeEditButton() {
        console.log('Alfred: Setting up edit button observer...');
        
        // Cerca tutti i possibili pulsanti edit
        const editButtons = document.querySelectorAll([
          '.js-comment-edit-button',
          '.js-comment-edit',
          '.timeline-comment-action',
          'button[aria-label="Edit"]',
          '[data-hotkey="e"]'  // GitHub usa questo per il tasto rapido di edit
        ].join(','));
      
        console.log('Alfred: Found edit buttons:', editButtons.length);
      
        editButtons.forEach(button => {
          console.log('Alfred: Adding listener to edit button');
          button.addEventListener('click', () => {
            console.log('Alfred: Edit button clicked');
            // Usiamo un approccio più robusto con retry
            this.waitForEditForm();
          });
        });

        // Osserva i cambiamenti nella pagina
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        // Cerca sia il form che l'action bar
        const actionBar = document.querySelector('md-toolbar') || 
                         document.querySelector('.comment-form-actions');
        const editForm = document.querySelector('.js-comment-update');
        
        if ((actionBar || editForm) && !document.querySelector('.alfred-ai-button')) {
          console.log('Alfred: Edit form or action bar found');
          this.insertButton(actionBar || editForm);
        }

        // Cerca anche nuovi pulsanti edit che potrebbero essere stati aggiunti
        const newEditButtons = document.querySelectorAll([
          '.js-comment-edit-button',
          '.js-comment-edit',
          '.timeline-comment-action',
          'button[aria-label="Edit"]',
          '[data-hotkey="e"]'
        ].join(','));

        newEditButtons.forEach(button => {
          if (!button.hasAlfredListener) {
            button.hasAlfredListener = true;
            button.addEventListener('click', () => {
              console.log('Alfred: New edit button clicked');
              this.waitForEditForm();
            });
          }
        });
      }
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });
},

waitForEditForm() {
    console.log('Alfred: Waiting for edit form...');
    let attempts = 0;
    const maxAttempts = 10;
    
    const checkForm = setInterval(() => {
      attempts++;
      console.log(`Alfred: Checking for edit form (attempt ${attempts})`);
  
      const actionBar = document.querySelector('md-toolbar') || 
                       document.querySelector('.comment-form-actions') ||
                       document.querySelector('.js-comment-update');
  
      if (actionBar) {
        console.log('Alfred: Found action bar in edit form');
        clearInterval(checkForm);
        this.insertButton(actionBar);
      } else if (attempts >= maxAttempts) {
        console.log('Alfred: Max attempts reached, stopping checks');
        clearInterval(checkForm);
      }
    }, 300);
  },
      checkAndAddButton() {
        const actionBar = document.querySelector('md-toolbar') || 
                         document.querySelector('.comment-form-actions');
        
        if (actionBar && !actionBar.querySelector('.alfred-ai-button')) {
          console.log('Alfred: Adding button to edit form');
          this.insertButton(actionBar);
        }
      },
  
      insertButton(actionBar) {
        if (document.querySelector('.alfred-ai-button')) {
          console.log('Alfred: Button already exists');
          return;
        }
      
        console.log('Alfred: Creating button...');
        const button = document.createElement('button');
        button.className = 'alfred-ai-button toolbar-item tooltipped tooltipped-n';
        button.setAttribute('aria-label', 'Generate description with AI');
        button.setAttribute('type', 'button'); // Importante per evitare submit accidentali
        button.innerHTML = `${this.createStarIcon()} Generate with AI`;
        button.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.handleGenerate();
        });
      
        // Prova diversi possibili container per il bottone
        const targetContainer = actionBar.querySelector('.toolbar-commenting') || 
                               actionBar.querySelector('.d-flex') ||
                               actionBar;
      
        if (targetContainer.firstChild) {
          console.log('Alfred: Inserting button at start of container');
          targetContainer.insertBefore(button, targetContainer.firstChild);
        } else {
          console.log('Alfred: Appending button to container');
          targetContainer.appendChild(button);
        }
        
        console.log('Alfred: Button added successfully');
      },
  
      createStarIcon() {
        return `
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 0L10.2571 5.08359L15.6085 5.52786L11.6521 9.19641L12.7023 14.4721L8 11.8836L3.29772 14.4721L4.34794 9.19641L0.391548 5.52786L5.74294 5.08359L8 0Z" fill="currentColor"/>
          </svg>
        `;
      },
  
      injectStyles() {
        console.log('Alfred: Injecting styles...');
        const style = document.createElement('style');
        style.textContent = `
          .alfred-ai-button.toolbar-item {
            display: inline-flex !important;
            align-items: center;
            padding: 4px 8px;
            font-size: 12px;
            font-weight: 500;
            line-height: 20px;
            color: #24292f;
            white-space: nowrap;
            vertical-align: middle;
            cursor: pointer;
            background-color: transparent;
            border: 0;
            border-radius: 6px;
          }
  
          .alfred-ai-button.toolbar-item:hover {
            color: #0969da;
            background-color: #f3f4f6;
          }
  
          .alfred-ai-button.toolbar-item svg {
            margin-right: 4px;
            fill: currentColor;
            width: 16px;
            height: 16px;
          }
  
          @media (prefers-color-scheme: dark) {
            .alfred-ai-button.toolbar-item {
              color: #c9d1d9;
            }
  
            .alfred-ai-button.toolbar-item:hover {
              color: #58a6ff;
              background-color: #30363d;
            }
          }
  
          .alfred-loading {
            opacity: 0.7;
            cursor: wait !important;
          }
  
          .alfred-ai-badge {
            display: inline-flex;
            align-items: center;
            padding: 2px 7px;
            margin-left: 8px;
            font-size: 12px;
            font-weight: 500;
            color: #57606a;
            background-color: #f6f8fa;
            border: 1px solid rgba(27,31,36,0.15);
            border-radius: 12px;
          }
        `;
        document.head.appendChild(style);
        console.log('Alfred: Styles injected');
      },
  
      async handleGenerate() {
        try {
          console.log('Alfred: Handling generate click...');
          const settings = await this.getSettings();
          if (!settings.apiKey) {
            alert('Please configure your Claude API key in Alfred\'s extension settings');
            chrome.runtime.openOptionsPage();
            return;
          }
  
          const button = document.querySelector('.alfred-ai-button');
          button.classList.add('alfred-loading');
          button.disabled = true;
  
          const [, owner, repo, , prNumber] = window.location.pathname.split('/');
          console.log('Alfred: Extracting PR info:', { owner, repo, prNumber });
  
          const diffContent = await this.getPRDiff(owner, repo, prNumber);
          if (!diffContent) {
            throw new Error('Could not fetch PR changes');
          }
  
          const description = await this.generateDescription(settings.apiKey, diffContent, settings.template);
  
          const textarea = document.getElementById('pull_request_body') || 
                          document.querySelector('.js-quote-selection-container textarea');
          
          if (textarea) {
            textarea.value = description;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            this.addAIBadge();
          }
  
        } catch (error) {
          console.error('Alfred: Error:', error);
          alert(`Alfred encountered an error: ${error.message}`);
        } finally {
          const button = document.querySelector('.alfred-ai-button');
          button.classList.remove('alfred-loading');
          button.disabled = false;
        }
      },
  
      async getPRDiff(owner, repo, prNumber) {
        try {
          const settings = await this.getSettings();
          const githubToken = settings.githubToken;
  
          const apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}.diff`;
          console.log('Alfred: Fetching PR diff from:', apiUrl);
  
          const headers = {
            'Accept': 'application/vnd.github.v3+json'
          };
  
          if (githubToken) {
            console.log('Alfred: Using GitHub token for authentication');
            headers['Authorization'] = `token ${githubToken}`;
          }
  
          const response = await fetch(apiUrl, { headers });
  
          if (!response.ok) {
            console.log(`Alfred: API request failed with status ${response.status}`);
            throw new Error('Could not access PR diff. Please check your GitHub token permissions.');
          }
  
          const diffContent = await response.text();
          if (!diffContent.trim()) {
            throw new Error('PR diff is empty. This might be a new PR without changes.');
          }
  
          return diffContent;
  
        } catch (error) {
          console.error('Alfred: Error fetching diff:', error);
          throw error;
        }
      },
  
      async generateDescription(apiKey, diffContent, template) {
        console.log('Alfred: Starting description generation...');
        
        try {
          const isActive = await this.checkServiceWorker();
          if (!isActive) {
            throw new Error('Extension service is not responding. Please try reloading the page.');
          }
  
          const response = await this.sendMessageToBackground({
            action: 'generateDescription',
            data: { apiKey, diffContent, template }
          });
  
          if (response?.status === 'error') {
            throw new Error(response.message);
          }
  
          if (!response?.status === 'ok' || !response?.data) {
            throw new Error('Invalid response from extension service');
          }
  
          return response.data;
        } catch (error) {
          console.error('Alfred: Generation error:', error);
          throw error;
        }
      },
  
      async sendMessageToBackground(message) {
        try {
          return await chrome.runtime.sendMessage(message);
        } catch (error) {
          console.error('Alfred: Communication error:', error);
          throw new Error('Failed to communicate with extension background service');
        }
      },
  
      async checkServiceWorker() {
        try {
          console.log('Alfred: Checking service worker status...');
          const response = await this.sendMessageToBackground({ action: 'ping' });
          console.log('Alfred: Service worker response:', response);
          return response?.status === 'ok' && response?.message === 'pong';
        } catch (error) {
          console.error('Alfred: Service worker check failed:', error);
          return false;
        }
      },
  
      addAIBadge() {
        console.log('Alfred: Adding AI badge...');
        const existingBadge = document.querySelector('.alfred-ai-badge');
        if (existingBadge) return;
  
        const badge = document.createElement('span');
        badge.className = 'alfred-ai-badge';
        badge.innerHTML = `${this.createStarIcon()} Generated with AI`;
  
        const tabBar = document.querySelector('.tabnav-tabs') || 
                      document.querySelector('.js-quote-selection-container');
        
        if (tabBar) {
          tabBar.appendChild(badge);
        }
      },
  
      async getSettings() {
        return new Promise((resolve) => {
          chrome.storage.sync.get(['apiKey', 'template', 'githubToken'], (data) => {
            resolve(data);
          });
        });
      }
    };
  
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        console.log('Alfred: DOM Content Loaded');
        AlfredIntegration.init();
      });
    } else {
      console.log('Alfred: DOM already loaded');
      AlfredIntegration.init();
    }
  
    // Watch for GitHub SPA navigation
    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        console.log('Alfred: URL changed, reinitializing...');
        AlfredIntegration.init();
      }
    }).observe(document.body, {subtree: true, childList: true});
  })();
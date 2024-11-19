console.log('Alfred Background: Service Worker Initializing');

let isInitialized = false;

function initialize() {
  if (isInitialized) return;
  console.log('Alfred Background: Initializing service worker');
  isInitialized = true;
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('Alfred Background: Extension installed');
  initialize();
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Alfred Background: Extension starting up');
  initialize();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Alfred Background: Received message', request);

  if (request.action === 'ping') {
    console.log('Alfred Background: Ping received, sending pong');
    sendResponse({ status: 'ok', message: 'pong' });
    return true;
  }

  if (request.action === 'generateDescription') {
    console.log('Alfred Background: Generating description');
    handleGenerateDescription(request.data)
      .then(response => {
        console.log('Alfred Background: Generation successful');
        sendResponse({ status: 'ok', data: response });
      })
      .catch(error => {
        console.error('Alfred Background: Generation failed', error);
        sendResponse({ status: 'error', message: error.message });
      });
    return true;
  }
});

async function handleGenerateDescription({ apiKey, diffContent, template }) {
  if (!apiKey) throw new Error('API key is required');
  if (!diffContent) throw new Error('Diff content is required');

  console.log('Alfred Background: Making request to Claude API');
  
  const enhancedPrompt = `As an iOS developer, analyze this git diff and generate a detailed PR description that:

1. Clearly explains the technical changes and their impact
2. Highlights architectural improvements or patterns used
3. Notes any important iOS-specific considerations
4. References relevant documentation or best practices when applicable
5. Includes code examples for significant changes if helpful
6. Describes testing considerations

Focus on making it clear for other iOS developers to understand both the what and why of the changes.

Template to follow:
${template || `
## 🎯 Technical Changes
[Detailed technical explanation]

## 🏗 Architecture & Patterns
[Architectural changes and patterns used]

## 📱 iOS Considerations
[iOS-specific impacts and considerations]

## 🧪 Testing Approach
- Unit tests added/modified
- UI testing considerations
- Edge cases covered

## 📚 References
[Any relevant documentation links]

## 📝 Additional Notes
[Other important details]`}

Here's the diff:
${diffContent}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 4096, // Aumentato per permettere risposte più lunghe
          messages: [{
            role: "user",
            content: enhancedPrompt
          }]
        })
      });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Alfred Background: Claude API error response:', errorText);
      throw new Error(`Claude API Error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    if (!result.content?.[0]?.text) {
      console.error('Alfred Background: Invalid Claude API response:', result);
      throw new Error('Invalid response from Claude API');
    }

    return result.content[0].text;
  } catch (error) {
    console.error('Alfred Background: Error in Claude API call:', error);
    throw error;
  }
}

// Mantieni attivo il service worker
setInterval(() => {
  console.log('Alfred Background: Service worker heartbeat');
}, 20000);

// Inizializza subito
initialize();
export class ClaudeAPI {
    constructor(apiKey) {
      this.apiKey = apiKey;
    }
  
    async generateDescription(diffContent, template) {
      try {
        const prompt = `Based on this git diff, please generate a PR description following this template:\n\n${template}\n\nHere's the diff:\n${diffContent}`;
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: "claude-3-sonnet-20240229",
            max_tokens: 1024,
            messages: [{
              role: "user",
              content: prompt
            }]
          })
        });
  
        const result = await response.json();
        return result.content[0].text;
      } catch (error) {
        throw new Error(`Claude API Error: ${error.message}`);
      }
    }
  }
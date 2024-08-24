import { HumanMessage } from '@langchain/core/messages';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import MarkdownIt from 'markdown-it';
import { maybeShowApiKeyBanner } from './gemini-api-banner';
import './style.css';

const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

const form = document.querySelector('form');
const promptInput = document.querySelector('input[name="prompt"]');
const output = document.querySelector('.output');

form.onsubmit = async ev => {
  ev.preventDefault();
  output.textContent = 'Generating...';

  try {
    const contents = [
      new HumanMessage({
        content: promptInput.value,
      }),
    ];

    // Initialize ChatGoogleGenerativeAI with the API key
    const vision = new ChatGoogleGenerativeAI({
      apiKey: apiKey,
      modelName: 'gemini-1.5-flash', // Ensure this is the correct model
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    // Multi-modal streaming (text only in this case)
    const streamRes = await vision.stream(contents);

    // Read from the stream and interpret the output as markdown
    const buffer = [];
    const md = new MarkdownIt();

    for await (const chunk of streamRes) {
      buffer.push(chunk.content);
      output.innerHTML = md.render(buffer.join(''));
    }
  } catch (e) {
    output.innerHTML += '<hr>' + e.message;
  }
};

maybeShowApiKeyBanner(apiKey, `enter it in your <code>.env</code> file.`);

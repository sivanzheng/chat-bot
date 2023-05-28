# A Document-based QA Chatbot with LangChain and NestJS

## Getting Started

### Prerequisites
- Node.js >= 18 and
- OpenAI API Key

### Installing
1. Clone the repository 
```sh
git clone https://github.com/sivanzheng/chat-bot.git
```
2. Navigate to the project directory and install the dependencies
```sh
cd chat-bot
npm install
```
3. Create a `.env` file in the project directory and add the following line with your LangChain API Key:
```sh
OPENAI_API_KEY=your-api-key-here
```
4. Build the project
```sh
npm run build
```
5. Start the server
```sh
npm run start
```

### Usage
Stream the bot's response you should create an EventSource, like the following example:

```js
const source = new EventSource('http://localhost:3000/bot/ask?question=hello&history=["who are you?"]')

source.onmessage = function(event) {
  console.log('Received event:', event.data)
}
```
[Here is a client example](static/index.html)
## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
# A Document-based QA Chatbot with LangChain, Chroma and NestJS

## Getting Started

### Prerequisites
- Node.js >= 18
- OpenAI API Key
- Chroma DB
  > [Running Chroma DB in Docker](https://docs.trychroma.com/usage-guide#running-chroma-in-clientserver-mode)

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
3. Create a `.env` file in the project directory and add the following lines:
```sh
OPENAI_API_KEY=your-api-key-here
PROXY_PATH=proxy-path-for-openai
CHROMA_DB_PATH=chroma-db-path
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
- Upload a document to the bot
```sh
curl --location --request POST 'http://localhost:3000/file/upload' \
--form 'file=@"xxxx.pdf"'
```

- Parse the document
```sh
curl --location --request POST 'http://localhost:3000/document/parse' \
--header 'Content-Type: application/json' \
--data-raw '{
    "fileId": "xxxxxxxxxx",
    "collectionName": "test-docs"
}'
```

Stream the bot's response you should create an EventSource, like the following example:

```js
const source = new EventSource('http://localhost:3000/dialog?topic={test-docs}&question={question}&history={[history]}')

source.onmessage = function(event) {
  console.log('Received event:', event.data)
}
```
[Here is a client example](static/index.html)
## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
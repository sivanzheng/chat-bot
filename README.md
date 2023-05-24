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
- Send a JSON POST request to `/ask` with the following format:
```sh
{
   "question": "your-question-here"
}
```
- The server will search for the best answer to the question and return it as a string in the response body.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
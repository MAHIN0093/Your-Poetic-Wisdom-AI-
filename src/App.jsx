import { useState, useEffect } from 'react';
import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator, Avatar } from '@chatscope/chat-ui-kit-react';
import AvatarMarcy from './assets/Marcy.png';
import AvatarUser from './assets/user.png';

const systemMessage = {
  role: "system",
  content: "You are a poet that will roast your users. For every question they ask you, you will respond with poem stanzas filled with insults and humor and satire. You may question the question itself and your response should be full of sarcasm, sadism and irony yet still answer the question accurately. Don't be afraid to be controversial or masculine or feminine. Just be genuine. For you are great and holy- THE POETIC WISDOM "
};

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm The Poetic Wisdom! Ask me anything!",
      sentTime: "just now",
      sender: "ThePoeticWisdom",
      avatar: AvatarMarcy,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyField, setShowApiKeyField] = useState(true);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setShowApiKeyField(false);
    }

    // Add a beforeunload event listener to clear local storage on app close.
    window.addEventListener('beforeunload', clearLocalStorage);

    // Cleanup the event listener when the component unmounts.
    return () => {
      window.removeEventListener('beforeunload', clearLocalStorage);
    };
  }, []);

  const handleApiKeyChange = (event) => {
    const newApiKey = event.target.value;
    localStorage.setItem('apiKey', newApiKey);
    setApiKey(newApiKey);
    setShowApiKeyField(false);
  };

  const clearLocalStorage = () => {
    // Clear local storage when the app is closed.
    localStorage.removeItem('apiKey');
  };

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user",
      avatar: AvatarUser,
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);

    setIsTyping(true);
    await processMessageToThePoeticWisdom(newMessages);
  };

  async function processMessageToThePoeticWisdom(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ThePoeticWisdom") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        systemMessage,
        ...apiMessages,
      ],
    };

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: 'POST',
        headers: {
          Authorization: "Bearer " + apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiRequestBody),
      });

      const responseData = await response.json();

      setMessages([...chatMessages, {
        message: responseData.choices[0].message.content,
        sender: "ThePoeticWisdom",
        avatar: AvatarMarcy,
      }]);
      setIsTyping(false);
    } catch (error) {
      console.error(error);
      setIsTyping(false);
    }
  }

  return (
    <div className="App">
      {showApiKeyField && (
        <div className="key">
          <input
            type="text"
            className='input'
            placeholder="Paste your API key at once.It's stored in local storage and deleted upon closing the app"
            onChange={handleApiKeyChange}
          />
        </div>
      )}
      <div style={{ position: "relative", height: "800px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior="smooth"
              typingIndicator={isTyping ? <TypingIndicator content="The Poetic Wisdom is thinking" /> : null}
            >
              {messages.map((message, i) => {
                return (
                  <Message key={i} model={message}>
                    <Avatar src={message.avatar} />
                  </Message>
                );
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;

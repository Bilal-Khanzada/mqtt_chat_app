import React, { useEffect, useState, useRef } from 'react';
import mqtt from 'mqtt';
import './App.css'; // Importing thee CSS

const brokerUrl = 'wss://test.mosquitto.org:8081';
const topic = 'react-chat-room';

export default function App() {
  const [client, setClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const mqttClient = mqtt.connect(brokerUrl);
    mqttClient.on('connect', () => {
      mqttClient.subscribe(topic);
    });

    mqttClient.on('message', (topic, message) => {
      const msg = JSON.parse(message.toString());
      setMessages(prev => [...prev, msg]);
    });

    setClient(mqttClient);

    return () => mqttClient.end();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const name = username || `User${Math.floor(Math.random() * 1000)}`;
    setUsername(name);

    const fullMessage = {
      user: name,
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    client.publish(topic, JSON.stringify(fullMessage));
    setMessage('');
  };

  return (
    <div className="chat-container">
      <h1 className="chat-title">💬 MQTT Chat</h1>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.user === username ? 'my-msg' : 'other-msg'}`}
          >
            <div className="meta">
              <span className="user">{msg.user}</span>
              <span className="time">{msg.time}</span>
            </div>
            <div className="text">{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-inputs">
        <input
          className="input"
          placeholder="Your Name"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          className="input"
          placeholder="Type a message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button className="send-btn" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#6657d9',
          colorInfo: '#6657d9',
          borderRadius: 12,
          fontFamily: "Inter, 'Noto Sans Thai', system-ui, sans-serif",
        },
        components: {
          Button: { controlHeight: 40, fontWeight: 600 },
          Input: { controlHeight: 42 },
          InputNumber: { controlHeight: 42 },
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>,
);

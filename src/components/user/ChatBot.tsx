import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { LuMessageSquareMore } from "react-icons/lu";
import { RxAvatar } from "react-icons/rx";
import { CiCirclePlus } from "react-icons/ci";
import { TiDelete } from "react-icons/ti";
import { LuSendHorizontal } from "react-icons/lu";
import { CiUser } from "react-icons/ci";

const API_BASE = "http://localhost:8080/api/v1/ai";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  imageUrl?: string;
  timestamp: Date;
}

interface ChatHistory {
  id: number;
  userQuery: string;
  aiResponse: string;
  chatType: string;
  imageUrl?: string;
  sessionId: string;
  createdAt: string;
}

const generateSessionId = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

const getAuthHeader = () => {
  const auth = localStorage.getItem("auth");
  return auth ? { Authorization: `Basic ${auth}` } : {};
};

const getSessionId = () => {
  let sessionId = sessionStorage.getItem("chatSessionId");
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem("chatSessionId", sessionId);
  }
  return sessionId;
};

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionId = getSessionId();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await axios.get(`${API_BASE}/history`, {
        params: { sessionId },
        headers: getAuthHeader(),
      });
      const histories: ChatHistory[] = res.data.data || [];
      if (histories.length > 0) {
        const historyMessages: Message[] = [];
        histories.forEach((h) => {
          if (h.userQuery) {
            historyMessages.push({
              id: `user-${h.id}`,
              type: "user",
              content: h.userQuery === "[Hình ảnh]" ? "" : h.userQuery,
              imageUrl: h.imageUrl || undefined,
              timestamp: new Date(h.createdAt),
            });
          }
          if (h.aiResponse) {
            historyMessages.push({
              id: `bot-${h.id}`,
              type: "bot",
              content: h.aiResponse,
              timestamp: new Date(h.createdAt),
            });
          }
        });
        setMessages(historyMessages);
      } else {
        setMessages([
          {
            id: "welcome",
            type: "bot",
            content:
              "Xin chào! Tôi là trợ lý tư vấn trang sức của Jewelry Management. Tôi có thể giúp bạn tìm kiếm sản phẩm phù hợp. Bạn cần tư vấn gì không? 💎",
            timestamp: new Date(),
          },
        ]);
      }
    } catch {
      setMessages([
        {
          id: "welcome",
          type: "bot",
          content:
            "Xin chào! Tôi là trợ lý tư vấn trang sức của Jewelry Management. Tôi có thể giúp bạn tìm kiếm sản phẩm phù hợp. Bạn cần tư vấn gì không? 💎",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadHistory();
    }
  }, [isOpen, messages.length, loadHistory]);

  const handleSend = async () => {
    if ((!inputValue.trim() && !selectedImage) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      imageUrl: imagePreview || undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      let aiResponse = "";

      if (selectedImage) {
        const formData = new FormData();
        if (inputValue.trim()) formData.append("message", inputValue);
        formData.append("image", selectedImage);
        formData.append("sessionId", sessionId);

        const res = await axios.post(`${API_BASE}/chat-with-image`, formData, {
          headers: {
            ...getAuthHeader(),
            "Content-Type": "multipart/form-data",
          },
          params: { sessionId },
        });
        aiResponse = res.data.data;
      } else {
        const res = await axios.post(
          `${API_BASE}/chat`,
          {},
          {
            params: { message: inputValue, sessionId },
            headers: getAuthHeader(),
          },
        );
        aiResponse = res.data.data;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau!",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleNewSession = () => {
    sessionStorage.removeItem("chatSessionId");
    setMessages([
      {
        id: "welcome-new",
        type: "bot",
        content:
          "Đã bắt đầu cuộc trò chuyện mới! Tôi có thể giúp gì cho bạn? 💎",
        timestamp: new Date(),
      },
    ]);
  };

  // Format time
  const formatTime = (date: Date) =>
    date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  const renderContent = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      <div
        className={`chat-icon ${isOpen ? "!hidden" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <LuMessageSquareMore className="text-[2.8rem] text-white" />
      </div>

      {isOpen && (
        <div
          className="chat-container"
          style={{
            display: "flex",
            animation: "slideUp 0.3s ease",
          }}
        >
          {/* Header */}
          <div
            className="chat-header"
            style={{ justifyContent: "space-between" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="bot-avatar">
                <RxAvatar className="text-white text-[4.5rem]" />
              </div>
              <div>
                <h3 className="text-[1.4rem] text-white" style={{ margin: 0 }}>
                  Trợ lý Jewelry
                </h3>
                <span style={{ fontSize: "1.1rem", opacity: 0.85 }}>
                  {isLoading ? "Đang trả lời..." : "Trực tuyến"}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {/* New session button */}
              <button
                onClick={handleNewSession}
                title="Cuộc trò chuyện mới"
                style={{
                  border: "none",
                  borderRadius: "50%",
                  width: 30,
                  height: 30,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <CiCirclePlus className="text-[3.5rem]" />
              </button>
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  border: "none",
                  borderRadius: "50%",
                  width: 30,
                  height: 30,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <TiDelete className="text-[3.5rem]" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {isLoadingHistory ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 20,
                  color: "#999",
                  fontSize: "1.2rem",
                }}
              >
                Đang tải lịch sử...
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.type === "user" ? "user-message" : "bot-message"}`}
                >
                  {msg.type === "bot" && (
                    <div className="message-avatar">
                      <CiUser className="text-[2rem]" />
                    </div>
                  )}
                  <div>
                    <div
                      className="message-content"
                      style={{
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.5,
                      }}
                    >
                      {msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          alt="uploaded"
                          style={{
                            maxWidth: "100%",
                            borderRadius: 8,
                            marginBottom: msg.content ? 8 : 0,
                            display: "block",
                          }}
                        />
                      )}
                      {msg.content && renderContent(msg.content)}
                    </div>
                    <div
                      style={{
                        fontSize: "1rem",
                        color: "#999",
                        marginTop: 3,
                        textAlign: msg.type === "user" ? "right" : "left",
                        marginLeft: msg.type === "bot" ? 10 : 0,
                        marginRight: msg.type === "user" ? 10 : 0,
                      }}
                    >
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                  {msg.type === "user" && (
                    <div className="message-avatar user-avatar">
                      <CiUser className="text-[2.4rem] text-white" />
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Typing indicator */}
            {isLoading && (
              <div className="message bot-message">
                <div className="message-avatar">
                  <i
                    className="fas fa-gem"
                    style={{ color: "#4a76a8", fontSize: 14 }}
                  />
                </div>
                <div
                  className="message-content bot-message"
                  style={{ padding: "12px 16px" }}
                >
                  <div
                    style={{ display: "flex", gap: 4, alignItems: "center" }}
                  >
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: "#4a76a8",
                          animation: `bounce 1s infinite ${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Image preview */}
          {imagePreview && (
            <div
              style={{
                padding: "8px 15px",
                borderTop: "1px solid #eee",
                position: "relative",
                display: "inline-block",
              }}
            >
              <img
                src={imagePreview}
                alt="preview"
                style={{
                  height: 60,
                  borderRadius: 8,
                  border: "1px solid #ddd",
                }}
              />
              <button
                onClick={removeImage}
                style={{
                  position: "absolute",
                  top: 4,
                  left: 68,
                  background: "#e74c3c",
                  border: "none",
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  cursor: "pointer",
                  color: "white",
                  fontSize: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Input */}
          <div className="chat-input items-center">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageSelect}
              style={{ display: "none" }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Gửi ảnh"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#4a76a8",
                fontSize: 18,
                marginRight: 6,
                padding: "0 4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <i className="fas fa-image" />
            </button>
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button
              className="send-button"
              onClick={handleSend}
              disabled={isLoading || (!inputValue.trim() && !selectedImage)}
              style={{ opacity: isLoading ? 0.6 : 1 }}
            >
              <LuSendHorizontal className="text-[2rem]" />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
};

export default ChatBot;

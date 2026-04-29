import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { LuMessageSquareMore, LuSendHorizontal } from "react-icons/lu";
import { RxAvatar } from "react-icons/rx";
import { CiCirclePlus, CiUser } from "react-icons/ci";
import { TiDelete } from "react-icons/ti";
import { aiApi } from "../../apis/ai.api";
import { Message, ChatHistory } from "../../types";

interface Product {
  id: string;
  name: string;
  price: string;
  sku: string;
  status: string;
  image: string;
}

interface ParsedMessage {
  intro: string;
  products: Product[];
  outro: string;
}

const generateSessionId = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

const getSessionId = () => {
  let sessionId = sessionStorage.getItem("chatSessionId");
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem("chatSessionId", sessionId);
  }
  return sessionId;
};

const hasProducts = (content: string): boolean => {
  const hasOldFormat = /\d+\.\s+.*?:\s*\n/.test(content) && /Giá:/i.test(content);
  const hasNewFormat = /ID:\s*\d+/i.test(content) && /Tên:/i.test(content) && /Giá:/i.test(content);
  return hasOldFormat || hasNewFormat;
};

const parseProducts = (content: string): ParsedMessage => {
  const lines = content.split("\n");
  const products: Product[] = [];
  let intro = "";
  let outro = "";
  let currentProduct: Partial<Product> | null = null;
  let phase: "intro" | "products" | "outro" = "intro";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    const newFormatMatch = line.match(/^(?:Mã\s*)?ID:\s*(.+)$/i);
    const oldFormatMatch = line.match(/^\d+\.\s+(.+):?\s*$/);

    if (newFormatMatch && phase !== "outro") {
      phase = "products";
      if (currentProduct && currentProduct.name) {
        products.push(currentProduct as Product);
      }
      currentProduct = { id: newFormatMatch[1].trim() };
      continue;
    } else if (oldFormatMatch && phase !== "outro") {
      phase = "products";
      if (currentProduct && currentProduct.name) {
        products.push(currentProduct as Product);
      }
      currentProduct = { name: oldFormatMatch[1].replace(/:$/, "").trim() };
      continue;
    }

    if (phase === "intro") {
      intro += (intro ? "\n" : "") + line;
      continue;
    }

    if (phase === "products" && currentProduct) {
      const cleanLine = line.replace(/^\*\s*/, "").trim();

      if (/^Tên(?: sản phẩm)?:/i.test(cleanLine) && !currentProduct.name) {
        currentProduct.name = cleanLine.replace(/^Tên(?: sản phẩm)?:\s*/i, "").trim();
      } else if (/^Giá:/i.test(cleanLine)) {
        currentProduct.price = cleanLine.replace(/^Giá:\s*/i, "").trim();
      } else if (/^Tình trạng:/i.test(cleanLine)) {
        currentProduct.status = cleanLine.replace(/^Tình trạng:\s*/i, "").trim();
      } else if (/^Mã SKU:/i.test(cleanLine)) {
        currentProduct.sku = cleanLine.replace(/^Mã SKU:\s*/i, "").trim();
      } else if (/^Hình ảnh:/i.test(cleanLine)) {
        currentProduct.image = cleanLine.replace(/^Hình ảnh:\s*/i, "").trim();
      } else if (/^(?:Mã\s*)?ID:/i.test(cleanLine) && !currentProduct.id) {
        currentProduct.id = cleanLine.replace(/^(?:Mã\s*)?ID:\s*/i, "").trim();
      } else if (cleanLine !== "" && !cleanLine.includes(":")) {
        if (currentProduct && currentProduct.name) {
          products.push(currentProduct as Product);
          currentProduct = null;
        }
        phase = "outro";
        outro += (outro ? "\n" : "") + cleanLine;
      }
    } else if (phase === "outro") {
      outro += (outro ? "\n" : "") + line;
    }
  }

  if (currentProduct && currentProduct.name) {
    products.push(currentProduct as Product);
  }

  return { intro: intro.trim(), products, outro: outro.trim() };
};

const renderText = (content: string) => {
  if (!content) return null;
  const parts = content.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
};

const ProductCard: React.FC<{ product: Product; index: number }> = ({
  product,
  index,
}) => (
  <div
    className="jm-product-card"
    style={{ animationDelay: `${index * 80}ms` }}
  >
    <div className="jm-product-img-wrap">
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="jm-product-img"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="jm-product-img-placeholder">💎</div>
      )}
      {product.status && (
        <span
          className={`jm-product-badge ${
            product.status.toLowerCase().includes("hàng")
              ? "badge-in-stock"
              : "badge-out"
          }`}
        >
          {product.status}
        </span>
      )}
    </div>
    <div className="jm-product-info">
      <p className="jm-product-name">{product.name}</p>
      {product.price && <p className="jm-product-price">{product.price}</p>}
      {product.sku && (
        <p className="jm-product-sku">Mã sản phẩm: {product.sku}</p>
      )}
      {product.id && (
        <Link
          to={`/product-detailed/${product.id}`}
          className="jm-product-detail-link"
        >
          Xem chi tiết →
        </Link>
      )}
    </div>
  </div>
);

const BotProductMessage: React.FC<{ content: string }> = ({ content }) => {
  const { intro, products, outro } = parseProducts(content);
  return (
    <div className="jm-bot-product-wrap">
      {intro && <p className="jm-bot-product-intro">{renderText(intro)}</p>}
      {products.length > 0 && (
        <div className="jm-product-grid">
          {products.map((p, i) => (
            <ProductCard key={i} product={p} index={i} />
          ))}
        </div>
      )}
      {outro && <p className="jm-bot-product-outro">{renderText(outro)}</p>}
    </div>
  );
};

interface Order {
  id: string;
  status: string;
  total: string;
  date: string;
}

interface ParsedOrderMessage {
  intro: string;
  orders: Order[];
  outro: string;
}

const hasOrders = (content: string): boolean => {
  return /-\s*Đơn\s*#\d+\s*\|/i.test(content);
};

const parseOrders = (content: string): ParsedOrderMessage => {
  const lines = content.split("\n");
  const orders: Order[] = [];
  let intro = "";
  let outro = "";
  let phase: "intro" | "orders" | "outro" = "intro";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    const orderMatch = line.match(/^-\s*Đơn\s*#(\d+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*(.+)$/i);

    if (orderMatch && phase !== "outro") {
      phase = "orders";
      orders.push({
        id: orderMatch[1].trim(),
        status: orderMatch[2].trim(),
        total: orderMatch[3].trim(),
        date: orderMatch[4].trim(),
      });
      continue;
    }

    if (phase === "intro") {
      if (line !== "") intro += (intro ? "\n" : "") + line;
    } else if (phase === "orders") {
      if (line !== "" && !/^-\s*Đơn/.test(line)) {
        phase = "outro";
        outro += line;
      }
    } else if (phase === "outro") {
      if (line !== "") outro += (outro ? "\n" : "") + line;
    }
  }

  return { intro: intro.trim(), orders, outro: outro.trim() };
};

const OrderCard: React.FC<{ order: Order; index: number }> = ({ order, index }) => {
  const dateObj = new Date(order.date);
  const formattedDate = isNaN(dateObj.getTime())
    ? order.date
    : dateObj.toLocaleDateString("vi-VN") + " " + dateObj.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  const formattedTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(order.total) || 0);

  let statusClass = "badge-out";
  const st = order.status.toUpperCase();
  if (st === "PENDING" || st === "CONFIRMED" || st === "DELIVERED") {
    statusClass = "badge-in-stock";
  }

  return (
    <div className="jm-product-card jm-order-card" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="jm-product-info" style={{ padding: "12px", width: "100%" }}>
        <p className="jm-product-name" style={{ marginBottom: "8px" }}>Đơn hàng #{order.id}</p>
        <p className="jm-product-price" style={{ fontSize: "14px", color: "var(--gold)" }}>Tổng tiền: {formattedTotal}</p>
        <p className="jm-product-sku" style={{ marginTop: "4px" }}>Ngày đặt: {formattedDate}</p>
        <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className={`jm-product-badge ${statusClass}`} style={{ position: "relative", bottom: "auto", left: "auto" }}>
            {order.status}
          </span>
        </div>
      </div>
    </div>
  );
};

const BotOrderMessage: React.FC<{ content: string }> = ({ content }) => {
  const { intro, orders, outro } = parseOrders(content);
  return (
    <div className="jm-bot-product-wrap">
      {intro && <p className="jm-bot-product-intro">{renderText(intro)}</p>}
      {orders.length > 0 && (
        <div className="jm-product-grid">
          {orders.map((o, i) => (
            <OrderCard key={i} order={o} index={i} />
          ))}
        </div>
      )}
      {outro && <p className="jm-bot-product-outro">{renderText(outro)}</p>}
    </div>
  );
};

const BotTextMessage: React.FC<{ content: string }> = ({ content }) => (
  <div className="jm-bot-text">{renderText(content)}</div>
);

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = getSessionId();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setDefaultWelcome = () => {
    setMessages([
      {
        id: "welcome",
        type: "bot",
        content:
          "Xin chào! Tôi là trợ lý tư vấn trang sức của Jewelry Management. Tôi có thể giúp bạn tìm kiếm sản phẩm phù hợp. Bạn cần tư vấn gì không? 💎",
        timestamp: new Date(),
      },
    ]);
  };

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await aiApi.getHistory(sessionId);
      const histories: ChatHistory[] = res.data || [];
      if (histories.length > 0) {
        const historyMessages: Message[] = [];
        histories.forEach((h) => {
          if (h.userQuery) {
            historyMessages.push({
              id: `user-${h.id}`,
              type: "user",
              content: h.userQuery,
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
        setDefaultWelcome();
      }
    } catch {
      setDefaultWelcome();
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
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await aiApi.chat(currentInput, sessionId);
      const aiResponse = res.data;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content:
          typeof aiResponse === "string"
            ? aiResponse
            : (aiResponse as any).aiResponse || "",
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
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewSession = () => {
    sessionStorage.removeItem("chatSessionId");
    const newId = generateSessionId();
    sessionStorage.setItem("chatSessionId", newId);
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

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* Toggle button */}
      <button
        className={`jm-toggle-btn ${isOpen ? "jm-toggle-btn--hidden" : ""}`}
        onClick={() => setIsOpen(true)}
        aria-label="Mở chat"
      >
        <LuMessageSquareMore />
        <span className="jm-toggle-pulse" />
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="jm-chat-window">
          {/* Header */}
          <div className="jm-header">
            <div className="jm-header-left">
              <div className="jm-avatar-wrap">
                <RxAvatar />
                <span className="jm-avatar-dot" />
              </div>
              <div className="jm-header-info">
                <span className="jm-header-title">Trợ lý Jewelry</span>
                <span className="jm-header-status">
                  {isLoading ? (
                    <>
                      <span className="jm-status-dot jm-status-typing" />
                      Đang trả lời...
                    </>
                  ) : (
                    <>
                      <span className="jm-status-dot jm-status-online" />
                      Trực tuyến
                    </>
                  )}
                </span>
              </div>
            </div>
            <div className="jm-header-actions">
              <button
                className="jm-icon-btn"
                onClick={handleNewSession}
                title="Cuộc trò chuyện mới"
              >
                <CiCirclePlus />
              </button>
              <button
                className="jm-icon-btn jm-icon-btn--close"
                onClick={() => setIsOpen(false)}
                title="Đóng"
              >
                <TiDelete />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="jm-messages">
            {isLoadingHistory ? (
              <div className="jm-loading-history">
                <span className="jm-spinner" />
                Đang tải lịch sử...
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`jm-msg-row ${
                    msg.type === "user" ? "jm-msg-row--user" : "jm-msg-row--bot"
                  }`}
                >
                  {msg.type === "bot" && (
                    <div className="jm-msg-avatar jm-msg-avatar--bot">
                      <CiUser />
                    </div>
                  )}

                  <div className="jm-msg-body">
                    {msg.type === "bot" ? (
                      hasProducts(msg.content) ? (
                        <div className="jm-bubble jm-bubble--product">
                          <BotProductMessage content={msg.content} />
                        </div>
                      ) : hasOrders(msg.content) ? (
                        <div className="jm-bubble jm-bubble--product">
                          <BotOrderMessage content={msg.content} />
                        </div>
                      ) : (
                        <div className="jm-bubble jm-bubble--bot">
                          <BotTextMessage content={msg.content} />
                        </div>
                      )
                    ) : (
                      <div className="jm-bubble jm-bubble--user">
                        {msg.content}
                      </div>
                    )}
                    <span className="jm-msg-time">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}

            {/* Typing indicator */}
            {isLoading && (
              <div className="jm-msg-row jm-msg-row--bot">
                <div className="jm-msg-avatar jm-msg-avatar--bot">
                  <CiUser />
                </div>
                <div className="jm-bubble jm-bubble--bot jm-bubble--typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="jm-input-bar">
            <input
              type="text"
              className="jm-input"
              placeholder="Nhập tin nhắn..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <button
              className="jm-send-btn"
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
            >
              <LuSendHorizontal />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .jm-chat-window, .jm-toggle-btn {
          --gold: #c9a84c;
          --gold-light: #e8c97a;
          --gold-pale: #fdf6e3;
          --dark: #1a1208;
          --dark2: #2c1f0a;
          --text: #3d2b00;
          --text-muted: #8a7355;
          --bg: #fffdf7;
          --bg2: #faf5ea;
          --border: #e8d8b0;
          --user-bubble: linear-gradient(135deg, #c9a84c 0%, #a07830 100%);
          --bot-bubble: #ffffff;
          --product-bg: #fffef9;
          --shadow: 0 8px 40px rgba(100,70,10,.18);
          --radius: 18px;
          font-family: 'Georgia', 'Times New Roman', serif;
        }

        /* ── Toggle button ── */
        .jm-toggle-btn {
          position: fixed;
          bottom: 28px;
          right: 28px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: var(--user-bubble);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          color: #fff;
          box-shadow: 0 4px 20px rgba(180,130,20,.4);
          transition: transform .2s, box-shadow .2s;
          z-index: 9998;
        }
        .jm-toggle-btn:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(180,130,20,.55); }
        .jm-toggle-btn--hidden { display: none !important; }
        .jm-toggle-pulse {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid var(--gold-light);
          animation: pulse 2.2s ease-out infinite;
          pointer-events: none;
        }
        @keyframes pulse {
          0%   { opacity: .7; transform: scale(1); }
          70%  { opacity: 0; transform: scale(1.35); }
          100% { opacity: 0; }
        }

        /* ── Window ── */
        .jm-chat-window {
          position: fixed;
          bottom: 28px;
          right: 28px;
          width: 400px;
          height: 600px;
          background: var(--bg);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 9999;
          border: 1px solid var(--border);
          animation: slideUp .3s cubic-bezier(.22,1,.36,1);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Header ── */
        .jm-header {
          background: linear-gradient(135deg, #1a1208 0%, #3d2800 100%);
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(201,168,76,.3);
          flex-shrink: 0;
        }
        .jm-header-left { display: flex; align-items: center; gap: 10px; }
        .jm-avatar-wrap {
          position: relative;
          width: 42px; height: 42px;
          background: rgba(201,168,76,.2);
          border-radius: 50%;
          border: 2px solid var(--gold);
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; color: var(--gold-light);
        }
        .jm-avatar-dot {
          position: absolute;
          bottom: 1px; right: 1px;
          width: 10px; height: 10px;
          border-radius: 50%;
          background: #4caf50;
          border: 2px solid #1a1208;
        }
        .jm-header-info { display: flex; flex-direction: column; }
        .jm-header-title { color: var(--gold-light); font-size: 15px; font-weight: 600; letter-spacing: .3px; }
        .jm-header-status {
          display: flex; align-items: center; gap: 5px;
          color: rgba(255,255,255,.65); font-size: 11.5px; font-family: 'Segoe UI', sans-serif;
        }
        .jm-status-dot {
          width: 7px; height: 7px; border-radius: 50%;
        }
        .jm-status-online { background: #4caf50; }
        .jm-status-typing { background: var(--gold); animation: blink 1s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

        .jm-header-actions { display: flex; gap: 6px; }
        .jm-icon-btn {
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(201,168,76,.25);
          border-radius: 8px;
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; color: var(--gold-light);
          cursor: pointer;
          transition: background .15s, transform .15s;
        }
        .jm-icon-btn:hover { background: rgba(201,168,76,.18); transform: scale(1.05); }
        .jm-icon-btn--close { font-size: 24px; }
        .jm-icon-btn--close:hover { background: rgba(220,60,60,.25); color: #ff8080; }

        /* ── Messages area ── */
        .jm-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px 14px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: var(--bg2);
          background-image: 
            radial-gradient(circle at 20% 20%, rgba(201,168,76,.04) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(201,168,76,.04) 0%, transparent 50%);
        }
        .jm-messages::-webkit-scrollbar { width: 4px; }
        .jm-messages::-webkit-scrollbar-track { background: transparent; }
        .jm-messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

        .jm-loading-history {
          display: flex; align-items: center; gap: 8px; justify-content: center;
          color: var(--text-muted); font-size: 13px; padding: 20px;
          font-family: 'Segoe UI', sans-serif;
        }
        .jm-spinner {
          width: 16px; height: 16px;
          border: 2px solid var(--border);
          border-top-color: var(--gold);
          border-radius: 50%;
          animation: spin .8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Message row ── */
        .jm-msg-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          animation: msgIn .22s ease;
        }
        @keyframes msgIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .jm-msg-row--user { flex-direction: row-reverse; }
        .jm-msg-body { display: flex; flex-direction: column; max-width: 88%; }
        .jm-msg-row--user .jm-msg-body { align-items: flex-end; max-width: 78%; }

        .jm-msg-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-size: 18px;
        }
        .jm-msg-avatar--bot {
          background: linear-gradient(135deg, #2c1f0a, #4d3510);
          border: 1.5px solid var(--gold);
          color: var(--gold-light);
        }
        .jm-msg-avatar--user {
          background: var(--user-bubble);
          color: #fff;
        }

        .jm-msg-time {
          font-size: 10.5px;
          color: var(--text-muted);
          margin-top: 4px;
          padding: 0 4px;
          font-family: 'Segoe UI', sans-serif;
        }

        /* ── Bubbles ── */
        .jm-bubble {
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 13.5px;
          line-height: 1.55;
          font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
        }
        .jm-bubble--user {
          background: var(--user-bubble);
          color: #fff;
          border-radius: 16px 16px 4px 16px;
          box-shadow: 0 2px 10px rgba(160,120,48,.3);
        }
        .jm-bubble--bot {
          background: var(--bot-bubble);
          color: var(--text);
          border-radius: 16px 16px 16px 4px;
          box-shadow: 0 1px 6px rgba(0,0,0,.07);
          border: 1px solid var(--border);
        }
        .jm-bubble--typing {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .jm-bubble--typing span {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--gold);
          display: inline-block;
          animation: bounce 1s infinite;
        }
        .jm-bubble--typing span:nth-child(2) { animation-delay: .18s; }
        .jm-bubble--typing span:nth-child(3) { animation-delay: .36s; }
        @keyframes bounce {
          0%,60%,100% { transform: translateY(0); }
          30%          { transform: translateY(-7px); }
        }

        /* ── Product bubble ── */
        .jm-bubble--product {
          background: var(--product-bg);
          border: 1.5px solid rgba(201,168,76,.4);
          border-radius: 16px 16px 16px 4px;
          padding: 12px;
          box-shadow: 0 2px 12px rgba(180,130,20,.08);
          width: 100%;
          box-sizing: border-box;
        }
        .jm-bot-product-intro {
          font-size: 13px;
          color: var(--text);
          margin: 0 0 10px 0;
          line-height: 1.5;
        }
        .jm-bot-product-outro {
          font-size: 13px;
          color: var(--text-muted);
          margin: 10px 0 0 0;
          font-style: italic;
        }

        /* ── Product detail link ── */
        .jm-product-detail-link {
          display: inline-block;
          margin-top: 4px;
          font-size: 11.5px;
          font-family: 'Segoe UI', sans-serif;
          color: var(--gold);
          font-weight: 600;
          text-decoration: none;
          letter-spacing: .2px;
          transition: color .15s, transform .15s;
        }
        .jm-product-detail-link:hover {
          color: var(--dark);
          transform: translateX(2px);
        }

        /* ── Product grid ── */
        .jm-product-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* ── Product card ── */
        .jm-product-card {
          display: flex;
          gap: 10px;
          background: #fff;
          border-radius: 12px;
          border: 1px solid rgba(201,168,76,.3);
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,.06);
          animation: cardIn .3s ease both;
          transition: box-shadow .2s, transform .2s;
        }
        .jm-product-card:hover {
          box-shadow: 0 4px 18px rgba(180,130,20,.18);
          transform: translateY(-1px);
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .jm-product-img-wrap {
          position: relative;
          width: 80px;
          min-width: 80px;
          height: 80px;
          background: var(--gold-pale);
          flex-shrink: 0;
        }
        .jm-product-img {
          width: 100%; height: 100%;
          object-fit: cover;
        }
        .jm-product-img-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-size: 28px;
        }
        .jm-product-badge {
          position: absolute;
          bottom: 4px; left: 4px;
          font-size: 9px;
          padding: 2px 5px;
          border-radius: 4px;
          font-family: 'Segoe UI', sans-serif;
          font-weight: 600;
          letter-spacing: .3px;
        }
        .badge-in-stock { background: #e8f5e9; color: #2e7d32; }
        .badge-out      { background: #ffeee8; color: #c62828; }

        .jm-product-info {
          flex: 1;
          padding: 8px 10px 8px 4px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 3px;
        }
        .jm-product-name {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--dark);
          margin: 0;
          line-height: 1.3;
          font-family: 'Segoe UI', sans-serif;
        }
        .jm-product-price {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--gold);
          margin: 0;
          font-family: 'Segoe UI', sans-serif;
        }
        .jm-product-sku {
          font-size: 10.5px;
          color: var(--text-muted);
          margin: 0;
          font-family: 'Segoe UI', sans-serif;
        }

        /* ── Input bar ── */
        .jm-input-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: var(--bg);
          border-top: 1px solid var(--border);
          flex-shrink: 0;
        }
        .jm-input {
          flex: 1;
          border: 1.5px solid var(--border);
          border-radius: 24px;
          padding: 9px 16px;
          font-size: 13.5px;
          font-family: 'Segoe UI', sans-serif;
          background: var(--bg2);
          color: var(--text);
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .jm-input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(201,168,76,.12);
        }
        .jm-input::placeholder { color: var(--text-muted); }
        .jm-input:disabled { opacity: .6; cursor: not-allowed; }

        .jm-send-btn {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: var(--user-bubble);
          border: none;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; color: #fff;
          flex-shrink: 0;
          transition: transform .15s, box-shadow .15s, opacity .15s;
          box-shadow: 0 2px 10px rgba(160,120,48,.3);
        }
        .jm-send-btn:hover:not(:disabled) { transform: scale(1.08); box-shadow: 0 4px 16px rgba(160,120,48,.45); }
        .jm-send-btn:disabled { opacity: .45; cursor: not-allowed; transform: none; }

        /* ── Bot text content ── */
        .jm-bot-text { white-space: pre-wrap; }

        /* ── Responsive ── */
        @media (max-width: 460px) {
          .jm-chat-window {
            width: 100vw; height: 100dvh;
            bottom: 0; right: 0;
            border-radius: 0;
          }
          .jm-toggle-btn { bottom: 20px; right: 20px; }
        }
      `}</style>
    </>
  );
};

export default ChatBot;

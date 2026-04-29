import React, { useState, useEffect, useRef } from "react";
import {
  FaRobot,
  FaComments,
  FaChartBar,
  FaSearch,
  FaPaperPlane,
  FaUser,
} from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import toast from "react-hot-toast";
import { aiApi } from "../../apis";
import { STORAGE_KEYS } from '../../constants';

interface ChatSession {
  sessionId: string;
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
  accountId: number;
  fullName: string;
  avatar: string;
}

interface ChatHistoryItem {
  id: number;
  userQuery: string;
  aiResponse: string;
  chatType: string;
  imageUrl?: string;
  sessionId: string;
  createdAt: string;
}

interface AnalyticsMessage {
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0)
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN");
};

const AdminAI: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"history" | "analytics">(
    "history",
  );
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(
    null,
  );
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Analytics
  const [analyticsMessages, setAnalyticsMessages] = useState<
    AnalyticsMessage[]
  >([
    {
      type: "bot",
      content:
        "Xin chào Admin! Tôi có thể giúp bạn phân tích dữ liệu kinh doanh, doanh thu, tồn kho và xu hướng khách hàng. Bạn muốn xem báo cáo gì?",
      timestamp: new Date(),
    },
  ]);
  const [analyticsInput, setAnalyticsInput] = useState("");
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const analyticsEndRef = useRef<HTMLDivElement>(null);
  const analyticsSessionId = "ADMIN_" + (localStorage.getItem(STORAGE_KEYS.USER_ID) || "0");

  // Load sessions
  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const data = await aiApi.getSessions();
      setSessions(data.data || []);
      setFilteredSessions(data.data || []);
    } catch {
      toast.error("Lỗi tải danh sách sessions");
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // Search
  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFilteredSessions(
      sessions.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.sessionId.toLowerCase().includes(q) ||
          s.lastMessage.toLowerCase().includes(q),
      ),
    );
  }, [searchQuery, sessions]);

  // Load history of selected session
  const loadHistory = async (session: ChatSession) => {
    setSelectedSession(session);
    setLoadingHistory(true);
    try {
      const data = await aiApi.getHistory(session.sessionId);
      setChatHistory(data.data || []);
    } catch {
      toast.error("Lỗi tải lịch sử chat");
    } finally {
      setLoadingHistory(false);
    }
  };

  // Analytics chat
  useEffect(() => {
    analyticsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [analyticsMessages]);

  const sendAnalytics = async () => {
    if (!analyticsInput.trim() || analyticsLoading) return;
    const msg = analyticsInput.trim();
    setAnalyticsInput("");
    setAnalyticsMessages((prev) => [
      ...prev,
      { type: "user", content: msg, timestamp: new Date() },
    ]);
    setAnalyticsLoading(true);
    try {
      const data = await aiApi.analytics(msg, analyticsSessionId);
      setAnalyticsMessages((prev) => [
        ...prev,
        { type: "bot", content: data.data, timestamp: new Date() },
      ]);
    } catch {
      setAnalyticsMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const renderBotContent = (content: string) => {
    return content
      .split(/(\*\*.*?\*\*)/g)
      .map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      );
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="ms-3 mb-3 mt-4">
        <h3 className="mb-0 h4 font-weight-bolder text-dark !text-[2.4rem]">
          Quản lý AI Chat
        </h3>
        <p className="text-[16px] text-muted">
          Xem lịch sử hội thoại khách hàng và phân tích dữ liệu kinh doanh với
          AI.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="ms-3 mb-4">
        <button
          className={`account-action-btn !text-[1.4rem] inline-flex items-center ${activeTab === "history" ? "action-active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <FaComments className="me-2" /> Lịch sử Chat
        </button>
        <button
          className={`account-action-btn !text-[1.4rem] inline-flex items-center ${activeTab === "analytics" ? "action-active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          <FaChartBar className="me-2" /> Phân tích AI
        </button>
      </div>

      {/* TAB 1: LỊCH SỬ */}
      {activeTab === "history" && (
        <div className="col-12">
          <div
            className="card border-0 shadow-sm"
            style={{ height: "calc(100vh - 220px)" }}
          >
            <div
              className="card-body p-0 d-flex"
              style={{ overflow: "hidden" }}
            >
              {/* Cột trái: danh sách sessions */}
              <div
                style={{
                  width: 320,
                  minWidth: 320,
                  borderRight: "1px solid #eee",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Search + Refresh */}
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <div style={{ position: "relative", flex: 1 }}>
                      <FaSearch
                        style={{
                          position: "absolute",
                          left: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#999",
                          fontSize: 13,
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          width: "100%",
                          paddingLeft: 32,
                          paddingRight: 12,
                          height: 36,
                          border: "1px solid #ddd",
                          borderRadius: 8,
                          fontSize: "1.2rem",
                          outline: "none",
                        }}
                      />
                    </div>
                    <button
                      onClick={loadSessions}
                      title="Làm mới"
                      style={{
                        background: "#f8f9fa",
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        width: 36,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#666",
                      }}
                    >
                      <MdRefresh size={18} />
                    </button>
                  </div>
                  <div
                    style={{ fontSize: "1.1rem", color: "#999", marginTop: 6 }}
                  >
                    {filteredSessions.length} cuộc hội thoại
                  </div>
                </div>

                {/* Session list */}
                <div style={{ flex: 1, overflowY: "auto" }}>
                  {loadingSessions ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: 30,
                        color: "#999",
                        fontSize: "1.3rem",
                      }}
                    >
                      Đang tải...
                    </div>
                  ) : filteredSessions.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: 30,
                        color: "#999",
                        fontSize: "1.3rem",
                      }}
                    >
                      Không có dữ liệu
                    </div>
                  ) : (
                    filteredSessions.map((session) => (
                      <div
                        key={session.sessionId}
                        onClick={() => loadHistory(session)}
                        style={{
                          padding: "12px 16px",
                          borderBottom: "1px solid #f5f5f5",
                          cursor: "pointer",
                          background:
                            selectedSession?.sessionId === session.sessionId
                              ? "#e3f2fd"
                              : "white",
                          transition: "background 0.15s",
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                        }}
                      >
                        {/* Avatar */}
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          {session.avatar ? (
                            <img
                              src={session.avatar}
                              alt={session.fullName}
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: "50%",
                                background: "#4a76a8",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <FaUser
                                style={{ color: "white", fontSize: 18 }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 600,
                                fontSize: "1.3rem",
                                color: "#333",
                              }}
                            >
                              {session.fullName}
                            </span>
                            <span
                              style={{
                                fontSize: "1.1rem",
                                color: "#999",
                                flexShrink: 0,
                                marginLeft: 6,
                              }}
                            >
                              {formatTime(session.lastMessageAt)}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: "1.1rem",
                              color: "#666",
                              marginTop: 2,
                            }}
                          >
                            Session:{" "}
                            <span
                              style={{
                                fontFamily: "monospace",
                                color: "#4a76a8",
                              }}
                            >
                              {session.sessionId}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: "1.2rem",
                              color: "#888",
                              marginTop: 2,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {session.lastMessage}
                          </div>
                          <div
                            style={{
                              fontSize: "1.1rem",
                              color: "#bbb",
                              marginTop: 2,
                            }}
                          >
                            {session.messageCount} tin nhắn
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Cột phải: nội dung chat */}
              <div
                style={{ flex: 1, display: "flex", flexDirection: "column" }}
              >
                {!selectedSession ? (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#bbb",
                    }}
                  >
                    <FaComments style={{ fontSize: 48, marginBottom: 12 }} />
                    <div style={{ fontSize: "1.4rem" }}>
                      Chọn một cuộc hội thoại để xem
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <div
                      style={{
                        padding: "14px 20px",
                        borderBottom: "1px solid #eee",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        background: "#fafafa",
                      }}
                    >
                      {selectedSession.avatar ? (
                        <img
                          src={selectedSession.avatar}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: "#4a76a8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FaUser style={{ color: "white" }} />
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "1.4rem" }}>
                          {selectedSession.fullName}
                        </div>
                        <div style={{ fontSize: "1.2rem", color: "#999" }}>
                          Session:{" "}
                          <span
                            style={{
                              fontFamily: "monospace",
                              color: "#4a76a8",
                            }}
                          >
                            {selectedSession.sessionId}
                          </span>
                          {" · "}
                          {selectedSession.messageCount} tin nhắn
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div
                      style={{ flex: 1, overflowY: "auto", padding: "20px" }}
                    >
                      {loadingHistory ? (
                        <div
                          style={{
                            textAlign: "center",
                            color: "#999",
                            fontSize: "1.3rem",
                          }}
                        >
                          Đang tải...
                        </div>
                      ) : chatHistory.length === 0 ? (
                        <div
                          style={{
                            textAlign: "center",
                            color: "#999",
                            fontSize: "1.3rem",
                          }}
                        >
                          Không có tin nhắn
                        </div>
                      ) : (
                        chatHistory.map((item) => (
                          <div key={item.id} style={{ marginBottom: 20 }}>
                            {/* User message */}
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                marginBottom: 8,
                              }}
                            >
                              <div>
                                <div
                                  style={{
                                    background: "#e3f2fd",
                                    borderRadius: "18px 18px 4px 18px",
                                    padding: "10px 15px",
                                    maxWidth: 400,
                                    fontSize: "1.3rem",
                                    color: "#333",
                                    lineHeight: 1.5,
                                  }}
                                >
                                  {item.imageUrl && (
                                    <img
                                      src={item.imageUrl}
                                      style={{
                                        maxWidth: "100%",
                                        borderRadius: 8,
                                        marginBottom: 6,
                                        display: "block",
                                      }}
                                    />
                                  )}
                                  {item.userQuery !== "[Hình ảnh]" &&
                                    item.userQuery}
                                </div>
                                <div
                                  style={{
                                    fontSize: "1.1rem",
                                    color: "#bbb",
                                    textAlign: "right",
                                    marginTop: 3,
                                  }}
                                >
                                  {selectedSession.fullName} ·{" "}
                                  {new Date(item.createdAt).toLocaleTimeString(
                                    "vi-VN",
                                    { hour: "2-digit", minute: "2-digit" },
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Bot message */}
                            {item.aiResponse && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: 10,
                                }}
                              >
                                <div
                                  style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: "50%",
                                    background: "#4a76a8",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                  }}
                                >
                                  <FaRobot
                                    style={{ color: "white", fontSize: 14 }}
                                  />
                                </div>
                                <div>
                                  <div
                                    style={{
                                      background: "#f5f5f5",
                                      borderRadius: "18px 18px 18px 4px",
                                      padding: "10px 15px",
                                      maxWidth: 500,
                                      fontSize: "1.3rem",
                                      color: "#333",
                                      lineHeight: 1.6,
                                      whiteSpace: "pre-wrap",
                                    }}
                                  >
                                    {renderBotContent(item.aiResponse)}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "1.1rem",
                                      color: "#bbb",
                                      marginTop: 3,
                                    }}
                                  >
                                    AI ·{" "}
                                    {new Date(
                                      item.createdAt,
                                    ).toLocaleTimeString("vi-VN", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="col-12">
          <div
            className="card border-0 shadow-sm"
            style={{
              height: "calc(100vh - 220px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="card-header p-4 bg-white border-bottom d-flex align-items-center gap-3">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #4a76a8, #2c4f7a)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaRobot style={{ color: "white", fontSize: 18 }} />
              </div>
              <div>
                <h6 className="mb-0 font-weight-bold text-[16px]">
                  AI Phân tích kinh doanh
                </h6>
                <span style={{ fontSize: "1.2rem", color: "#28a745" }}>
                  ● Trực tuyến
                </span>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              {analyticsMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent:
                      msg.type === "user" ? "flex-end" : "flex-start",
                    marginBottom: 16,
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  {msg.type === "bot" && (
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #4a76a8, #2c4f7a)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FaRobot style={{ color: "white", fontSize: 14 }} />
                    </div>
                  )}
                  <div style={{ maxWidth: "70%" }}>
                    <div
                      style={{
                        background: msg.type === "user" ? "#e3f2fd" : "#f5f5f5",
                        borderRadius:
                          msg.type === "user"
                            ? "18px 18px 4px 18px"
                            : "18px 18px 18px 4px",
                        padding: "12px 16px",
                        fontSize: "1.3rem",
                        lineHeight: 1.6,
                        whiteSpace: "pre-wrap",
                        color: "#333",
                      }}
                    >
                      {msg.type === "bot"
                        ? renderBotContent(msg.content)
                        : msg.content}
                    </div>
                    <div
                      style={{
                        fontSize: "1.1rem",
                        color: "#bbb",
                        marginTop: 3,
                        textAlign: msg.type === "user" ? "right" : "left",
                      }}
                    >
                      {msg.timestamp.toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  {msg.type === "user" && (
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: "#6c757d",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FaUser style={{ color: "white", fontSize: 14 }} />
                    </div>
                  )}
                </div>
              ))}

              {analyticsLoading && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #4a76a8, #2c4f7a)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FaRobot style={{ color: "white", fontSize: 14 }} />
                  </div>
                  <div
                    style={{
                      background: "#f5f5f5",
                      borderRadius: "18px 18px 18px 4px",
                      padding: "14px 18px",
                    }}
                  >
                    <div style={{ display: "flex", gap: 4 }}>
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
              <div ref={analyticsEndRef} />
            </div>

            {/* Input */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #eee",
                display: "flex",
                gap: 10,
                alignItems: "center",
              }}
            >
              <input
                type="text"
                placeholder="Hỏi AI về doanh thu, tồn kho, xu hướng khách hàng..."
                value={analyticsInput}
                onChange={(e) => setAnalyticsInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && sendAnalytics()
                }
                disabled={analyticsLoading}
                style={{
                  flex: 1,
                  height: 44,
                  border: "1px solid #ddd",
                  borderRadius: 22,
                  padding: "0 20px",
                  fontSize: "1.3rem",
                  outline: "none",
                }}
              />
              <button
                onClick={sendAnalytics}
                disabled={analyticsLoading || !analyticsInput.trim()}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background:
                    analyticsLoading || !analyticsInput.trim()
                      ? "#ccc"
                      : "#4a76a8",
                  border: "none",
                  cursor: analyticsLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  transition: "background 0.2s",
                }}
              >
                <FaPaperPlane style={{ fontSize: 16 }} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        body {display: block;}
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        .action-active {
          background-color: #007bff !important;
          color: white !important;
        }
        .account-action-btn {
          border: 1px solid #ddd;
          padding: 8px 20px;
          border-radius: 8px;
          margin-right: 10px;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
          background: white;
          cursor: pointer;
        }
        .account-action-btn:hover { background: #f8f9fa; }
      `}</style>
    </div>
  );
};

export default AdminAI;

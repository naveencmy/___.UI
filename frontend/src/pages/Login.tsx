import { useState, useEffect, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { type Role } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { AuthAPI } from "@/lib/api";

const TERMINAL_LINES = [
  "> INITIALIZING GRIDIRON SECURITY CORE...",
  "> ESTABLISHING PEER-TO-PEER TUNNEL...",
];

export default function Login() {
  const { currentUser, login } = useAuth();
  const navigate = useNavigate();
  const [uid, setUid] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [error, setError] = useState("");
  const uidRef = useRef<HTMLInputElement>(null);

  // Cursor blink
  useEffect(() => {
    const timer = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(timer);
  }, []);

  // Sequentially reveal terminal lines
  useEffect(() => {
    if (visibleLines >= TERMINAL_LINES.length) return;
    const timer = setTimeout(() => setVisibleLines((v) => v + 1), 800 * (visibleLines + 1));
    return () => clearTimeout(timer);
  }, [visibleLines]);

  // Auto-focus UID input
  useEffect(() => {
    uidRef.current?.focus();
  }, []);

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = uid.trim();
    if (!trimmed) {
      setError("OPERATOR_ID required");
      uidRef.current?.focus();
      return;
    }
    setError("");
    try {
      const res = await AuthAPI.login({ username: trimmed, password: accessKey });
      localStorage.setItem("token", res.token);
      const role = (res.user.role as Role) ?? "owner";
      login({ name: res.user.name, role });
      navigate("/dashboard");
    } catch {
      setError("AUTH_FAILED — invalid credentials");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        backgroundColor: "#131313",
        backgroundImage:
          "radial-gradient(circle at 50% 50%, rgba(163,201,255,0.05) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Main centered content */}
      <div className="w-full max-w-[528px] mx-auto px-4 flex flex-col items-center gap-0">
        {/* Header Logo */}
        <div className="w-full mb-0">
          <img
            src="/assets/logo-retail-cmd.svg"
            alt="RETAIL_OS_CMD"
            className="w-full h-16 object-contain"
          />
        </div>

        {/* Login Container */}
        <div className="w-full" style={{ backgroundColor: "#1c1b1b" }}>
          {/* Warning Banner */}
          <div
            className="flex items-center justify-between px-5 py-2.5"
            style={{ backgroundColor: "#93000a" }}
          >
            <div className="flex items-center gap-3">
              <img
                src="/assets/icon-warning.svg"
                alt="Warning"
                className="w-3 h-3"
                style={{ filter: "invert(90%) sepia(20%) saturate(200%) hue-rotate(330deg)" }}
              />
              <span
                className="text-[#ffdad6] font-black tracking-[2.4px] uppercase"
                style={{ fontSize: "10.4px" }}
              >
                UNAUTHORIZED ACCESS PROHIBITED
              </span>
            </div>
            <span
              className="text-[#ffdad6]"
              style={{
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: "9.6px",
              }}
            >
              ERR_SECURITY_LEVEL_A
            </span>
          </div>

          {/* Form Block */}
          <form onSubmit={handleSubmit}>
            <div
              className="flex flex-col px-10 py-8"
              style={{ backgroundColor: "#2a2a2a", gap: "32px" }}
            >
              {/* [01] Operator ID */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="uid"
                    className="text-[#a3c9ff] font-bold tracking-[1.6px] uppercase"
                    style={{ fontSize: "11.2px" }}
                  >
                    [01] OPERATOR ID
                  </label>
                  <span
                    className="text-[#404753] font-bold tracking-[1.6px] uppercase"
                    style={{ fontSize: "11.2px" }}
                  >
                    F1_SELECT
                  </span>
                </div>
                <div
                  className="flex items-center justify-between border-b-2 border-[#a3c9ff] px-6 py-4"
                  style={{ backgroundColor: "#1c1b1b" }}
                >
                  <input
                    id="uid"
                    ref={uidRef}
                    type="text"
                    value={uid}
                    onChange={(e) => setUid(e.target.value)}
                    placeholder="ENTER_UID"
                    className={cn(
                      "flex-1 bg-transparent text-[#e5e2e1] outline-none placeholder-[#e5e2e1]/40 tracking-[2px] uppercase",
                    )}
                    style={{
                      fontFamily: "'Courier New', Courier, monospace",
                      fontSize: "20px",
                    }}
                    autoComplete="off"
                    spellCheck={false}
                    aria-label="Operator ID"
                  />
                  <span
                    className="text-[#404753] select-none ml-2"
                    style={{
                      fontFamily: "'Material Symbols Outlined'",
                      fontSize: "24px",
                      lineHeight: "24px",
                    }}
                    aria-hidden="true"
                  >
                    fingerprint
                  </span>
                </div>
              </div>

              {/* [02] Access Key */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="accessKey"
                    className="text-[#a3c9ff] font-bold tracking-[1.6px] uppercase"
                    style={{ fontSize: "11.2px" }}
                  >
                    [02] ACCESS KEY
                  </label>
                  <span
                    className="text-[#404753] font-bold tracking-[1.6px] uppercase"
                    style={{ fontSize: "11.2px" }}
                  >
                    F2_SELECT
                  </span>
                </div>
                <div
                  className="flex items-center justify-between px-6 py-4"
                  style={{ backgroundColor: "#1c1b1b" }}
                >
                  <input
                    id="accessKey"
                    type={showKey ? "text" : "password"}
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    placeholder="••••••••"
                    className="flex-1 bg-transparent text-[#e5e2e1] outline-none placeholder-[#e5e2e1]/60 tracking-[2px]"
                    style={{
                      fontFamily: "'Courier New', Courier, monospace",
                      fontSize: "20px",
                    }}
                    aria-label="Access Key"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    className="text-[#404753] hover:text-[#a3c9ff] transition-colors ml-2"
                    style={{
                      fontFamily: "'Material Symbols Outlined'",
                      fontSize: "24px",
                      lineHeight: "24px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                    aria-label={showKey ? "Hide access key" : "Show access key"}
                  >
                    {showKey ? "visibility" : "key"}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <span
                  className="text-[#ffdad6] text-[10px] tracking-[1px] uppercase -mt-4"
                  style={{ fontFamily: "'Courier New', Courier, monospace" }}
                >
                  !! {error}
                </span>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="flex items-center justify-center gap-4 py-5 font-black tracking-[4px] uppercase transition-opacity hover:opacity-90 active:opacity-80"
                style={{
                  background: "linear-gradient(99.13deg, #a3c9ff 0%, #1493ff 100%)",
                  color: "#002a51",
                  fontSize: "14px",
                }}
                aria-label="System Access Enter"
              >
                SYSTEM ACCESS [ENTER]
                <img
                  src="/assets/icon-terminal.svg"
                  alt=""
                  className="w-5 h-4"
                  style={{ filter: "invert(8%) sepia(60%) saturate(2000%) hue-rotate(195deg) brightness(40%)" }}
                />
              </button>
            </div>
          </form>

          {/* Footer Meta */}
          <div
            className="flex items-center justify-between px-8 py-3.5 border-t"
            style={{
              backgroundColor: "#0e0e0e",
              borderColor: "rgba(255,255,255,0.05)",
            }}
          >
            <div className="flex gap-6">
              <div className="flex flex-col gap-0.5">
                <span
                  className="text-[#8a919f] font-bold uppercase"
                  style={{ fontSize: "8px", letterSpacing: "-0.4px" }}
                >
                  LAT: 40.7128° N
                </span>
                <span
                  className="text-[#8a919f] font-bold uppercase"
                  style={{ fontSize: "8px", letterSpacing: "-0.4px" }}
                >
                  LON: 74.0060° W
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span
                  className="text-[#8a919f] font-bold uppercase"
                  style={{ fontSize: "8px", letterSpacing: "-0.4px" }}
                >
                  STATUS: HANDSHAKE
                </span>
                <span
                  className="text-[#a3c9ff] font-bold uppercase"
                  style={{ fontSize: "8px", letterSpacing: "-0.4px" }}
                >
                  ENCRYPTED_TLS_1.3
                </span>
              </div>
            </div>
            <span
              className="text-[#404753] uppercase tracking-[1.04px]"
              style={{
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: "10.4px",
              }}
            >
              SYSTEM_ACTIVE_V2.0
            </span>
          </div>
        </div>
      </div>

      {/* Terminal Output — below the card */}
      <div className="w-full max-w-[896px] mx-auto px-6 mt-8">
        <div className="flex items-start justify-between">
          <div
            className="flex flex-col gap-1"
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "9.6px",
              letterSpacing: "0.48px",
              color: "#e5e2e1",
              textTransform: "uppercase",
            }}
          >
            {TERMINAL_LINES.map((line, i) =>
              i < visibleLines ? <span key={i}>{line}</span> : null
            )}
            {visibleLines >= TERMINAL_LINES.length && (
              <span className="flex items-center gap-1">
                {">"} WAITING FOR USER INPUT{" "}
                <span
                  className="inline-block w-2 h-3"
                  style={{
                    backgroundColor: "#a3c9ff",
                    opacity: cursorVisible ? 1 : 0,
                    transition: "opacity 0.1s",
                  }}
                />
              </span>
            )}
          </div>
          <div
            className="flex flex-col gap-1 text-right"
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "9.6px",
              letterSpacing: "0.48px",
              color: "#e5e2e1",
              textTransform: "uppercase",
            }}
          >
            <span>IP_ADDR: 192.168.1.104</span>
            <span>SEC_ZONE: DELTA_7</span>
          </div>
        </div>
      </div>
    </div>
  );
}

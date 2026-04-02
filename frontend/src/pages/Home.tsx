import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleLoginToTerminal = () => navigate("/login");
  const handleDiagnostics = () => navigate(currentUser ? "/dashboard" : "/login");

  return (
    <div className="min-h-screen bg-white flex flex-col font-['Inter',sans-serif]">
      {/* Branding Area */}
      <div className="flex-1 flex flex-col px-6 md:px-8 pt-6">
        <div className="max-w-[1248px] w-full mx-auto flex-1 flex flex-col">
          {/* Large POS Logo */}
          <div className="pt-8 md:pt-12">
            <h1
              className="text-[72px] md:text-[108px] lg:text-[128px] font-black leading-[0.85] tracking-[-0.05em] uppercase text-[#1493ff] select-none"
            >
              COMMAND
              <br />
              POS
            </h1>
          </div>

          {/* Divider Row */}
          <div className="flex items-center gap-4 mt-4 mb-0">
            <div className="flex-1 h-[3px] bg-[#353534]" />
            <span
              className="text-[#a3c9ff] text-[10px] md:text-[12px] font-medium tracking-[3.2px] uppercase whitespace-nowrap"
            >
              GRIDIRON_OPERATING_SYSTEM_V.2.4.0
            </span>
          </div>

          {/* Bento Grid */}
          <div className="mt-0 flex flex-col lg:flex-row gap-0 flex-1">
            {/* Left: System Status Block */}
            <div
              className="flex-[1.4] border-l-4 border-[#a3c9ff] bg-[#1c1b1b] p-6 md:p-9 flex flex-col justify-between min-h-[280px]"
            >
              <div className="flex flex-col gap-6">
                <span className="text-[#8a919f] text-[11px] font-bold tracking-[1.6px] uppercase">
                  SYSTEM_TELEMETRY
                </span>

                {/* LAN + DB row */}
                <div className="flex gap-6 md:gap-10 flex-wrap">
                  <div className="flex flex-col gap-1">
                    <span className="text-[#6b7280] text-[10px] uppercase">LAN_STATUS</span>
                    <span className="text-white text-2xl font-black">LAN: CONNECTED</span>
                    <div className="flex gap-1 mt-1">
                      <div className="h-1 w-8 bg-[#a3c9ff]" />
                      <div className="h-1 w-8 bg-[#a3c9ff]" />
                      <div className="h-1 w-8 bg-[rgba(163,201,255,0.3)]" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[#6b7280] text-[10px] uppercase">DATABASE_STATE</span>
                    <span className="text-white text-2xl font-black">DB: OPTIMAL</span>
                    <div className="h-1 w-full bg-[#1493ff] mt-1" />
                  </div>
                </div>

                {/* Uptime */}
                <div className="flex flex-col gap-1">
                  <span className="text-[#6b7280] text-[10px] uppercase">UPTIME_COUNTER</span>
                  <span
                    className="text-white font-black tracking-[-0.05em] leading-none"
                    style={{ fontSize: "clamp(32px, 4vw, 48px)" }}
                  >
                    UPTIME: 14D 02H
                  </span>
                </div>
              </div>

              {/* Status Bar */}
              <div className="flex items-center gap-3 mt-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <img src="/assets/icon-dot-live.svg" alt="" className="w-2 h-2" />
                  <span className="text-[#a3c9ff] text-[10px] font-bold">SYSTEM_LIVE</span>
                </div>
                <span className="text-[#a3c9ff] text-[10px] font-bold">/</span>
                <span className="text-[#a3c9ff] text-[10px] font-bold">ENCRYPTION: AES_256</span>
                <span className="text-[#a3c9ff] text-[10px] font-bold">/</span>
                <span className="text-[#a3c9ff] text-[10px] font-bold">ZONE: EAST_01</span>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex flex-col flex-1 min-w-[260px]">
              {/* Login to Terminal Button */}
              <button
                onClick={handleLoginToTerminal}
                className="relative flex-[1] flex items-end p-6 md:p-8 overflow-hidden group transition-all duration-200 hover:opacity-90 min-h-[160px]"
                style={{
                  background: "linear-gradient(135deg, #1493ff 0%, #004883 100%)",
                }}
                aria-label="Login to Terminal"
              >
                {/* Decorative arrow background */}
                <img
                  src="/assets/icon-arrow-decor.svg"
                  alt=""
                  className="absolute right-0 bottom-0 opacity-20 h-24 w-24 md:h-32 md:w-32 object-contain pointer-events-none"
                />
                <div className="relative z-10 flex items-end justify-between w-full">
                  <div className="flex items-start gap-4">
                    <img
                      src="/assets/icon-pos-register.svg"
                      alt="POS Register"
                      className="w-8 h-8 mt-1 invert brightness-0 bg-[#002a51] p-1 rounded-sm"
                    />
                    <div>
                      <div
                        className="text-[#002a51] font-black leading-tight text-[26px] md:text-[30px] uppercase"
                      >
                        LOGIN TO
                        <br />
                        TERMINAL
                      </div>
                      <div className="text-[rgba(0,42,81,0.7)] text-[10px] font-bold tracking-[1px] uppercase mt-1">
                        ACCESS_LEVEL: OPERATOR
                      </div>
                    </div>
                  </div>
                  <img
                    src="/assets/icon-arrow-decor.svg"
                    alt=""
                    className="w-6 h-6 opacity-50"
                  />
                </div>
              </button>

              {/* System Diagnostics Button */}
              <button
                onClick={handleDiagnostics}
                className="flex items-center justify-between px-6 py-5 bg-[#2a2a2a] hover:bg-[#333333] transition-colors duration-200 group"
                aria-label="System Diagnostics"
              >
                <div className="flex items-center gap-4">
                  <img
                    src="/assets/icon-terminal.svg"
                    alt="Terminal"
                    className="w-5 h-4 invert"
                  />
                  <div className="text-left">
                    <div className="text-white text-[13px] md:text-[14px] font-bold tracking-[-0.05em] uppercase">
                      SYSTEM DIAGNOSTICS
                    </div>
                    <div className="text-[#6b7280] text-[10px] uppercase mt-0.5">
                      RUN_DEEP_SCAN_V1.0
                    </div>
                  </div>
                </div>
                <img
                  src="/assets/icon-chevron-right.svg"
                  alt=""
                  className="w-2 h-3 opacity-60 group-hover:translate-x-1 transition-transform duration-200"
                  style={{ filter: "invert(60%) sepia(0%) saturate(0%)" }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Data Feed */}
      <footer className="border-t border-[#353534] bg-[#0e0e0e] px-6 md:px-8 py-3">
        <div className="max-w-[1248px] w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 md:gap-8">
            <span
              className="text-[#4b5563] text-[10px]"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              CPU_LOAD: 12.4%
            </span>
            <span
              className="text-[#4b5563] text-[10px]"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              MEM_USED: 2.1GB / 16GB
            </span>
            <span
              className="text-[#4b5563] text-[10px]"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              THERMAL: 42°C
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-[#a3c9ff] text-[10px] font-bold"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              READY_STATE_CMD
            </span>
            <img
              src="/assets/icon-bar-status.svg"
              alt="Status"
              className="h-3"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}

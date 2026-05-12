"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ExternalLink,
  Gift,
  PackageOpen,
  Power,
  Radio,
  Sparkles,
  Timer,
  Trophy,
  Wifi,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import { ArenaGameService, type GameState as ArenaGameState } from "@/lib/arenaGameService";
import { getEmpireSession, type EmpireSession } from "@/lib/empireGameCenter";

type ConnectionStatus = "idle" | "missing" | "connecting" | "connected" | "ended" | "error";

type ArenaLogTone = "boost" | "drop" | "package" | "system" | "event";

type ArenaLogItem = {
  id: string;
  title: string;
  description: string;
  tone: ArenaLogTone;
  timestamp: string;
};

type ArenaPopup = {
  id: string;
  title: string;
  description: string;
  tone: ArenaLogTone;
};

type CountdownState = {
  secondsRemaining: number;
  phase: string;
};

const toneClasses: Record<ArenaLogTone, string> = {
  boost: "bg-[#24f59f] text-black",
  drop: "bg-[#ff2f92] text-white",
  package: "bg-[#ffe84d] text-black",
  system: "bg-[#39e8ff] text-black",
  event: "bg-[#8b5cf6] text-white",
};

const shortValue = (value: string, fallback = "Missing") => {
  if (!value) return fallback;
  if (value.length <= 18) return value;
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
};

const eventTime = (timestamp?: string) => {
  const date = timestamp ? new Date(timestamp) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toLocaleTimeString();
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

export const ArenaMonitoring = () => {
  const serviceRef = useRef<ArenaGameService | null>(null);
  const popupTimerRef = useRef<number | null>(null);
  const [session, setSession] = useState<EmpireSession>({
    wallet: "",
    authToken: "",
    streamUrl: "",
    updatedAt: "",
  });
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [arenaState, setArenaState] = useState<ArenaGameState | null>(null);
  const [countdown, setCountdown] = useState<CountdownState | null>(null);
  const [arenaActive, setArenaActive] = useState(false);
  const [logs, setLogs] = useState<ArenaLogItem[]>([]);
  const [popup, setPopup] = useState<ArenaPopup | null>(null);
  const [error, setError] = useState("");
  const [streamerHelpOpen, setStreamerHelpOpen] = useState(false);

  useEffect(() => {
    const storedSession = getEmpireSession();
    setSession(storedSession);
    setStatus(storedSession.authToken && storedSession.streamUrl ? "idle" : "missing");

    return () => {
      if (popupTimerRef.current) {
        window.clearTimeout(popupTimerRef.current);
      }
      serviceRef.current?.disconnect(false);
      serviceRef.current = null;
    };
  }, []);

  const addLog = useCallback((item: Omit<ArenaLogItem, "id" | "timestamp"> & { timestamp?: string }) => {
    setLogs((current) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        timestamp: eventTime(item.timestamp),
        title: item.title,
        description: item.description,
        tone: item.tone,
      },
      ...current,
    ].slice(0, 8));
  }, []);

  const showPopup = useCallback((nextPopup: Omit<ArenaPopup, "id">) => {
    setPopup({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ...nextPopup,
    });

    if (popupTimerRef.current) {
      window.clearTimeout(popupTimerRef.current);
    }

    popupTimerRef.current = window.setTimeout(() => setPopup(null), 2000);
  }, []);

  const attachArenaHandlers = useCallback(
    (service: ArenaGameService) => {
      service.onArenaCountdownStarted = (data) => {
        addLog({
          title: "Countdown armed",
          description: `Session ${shortValue(data?.sessionId ?? "")} is preparing to start.`,
          tone: "system",
          timestamp: data?.timestamp,
        });
      };

      service.onCountdownUpdate = (data) => {
        setCountdown({
          secondsRemaining: Number(data?.secondsRemaining ?? 0),
          phase: data?.phase ?? "countdown",
        });
      };

      service.onArenaBegins = (data) => {
        setArenaActive(Boolean(data?.arenaActive));
        addLog({
          title: data?.arenaActive ? "Arena live" : "Arena paused",
          description: data?.arenaActive ? "Viewer influence is active." : "Viewer influence is paused.",
          tone: "system",
          timestamp: data?.timestamp,
        });
      };

      service.onPlayerBoostActivated = (data) => {
        const amount = Number(data?.boostAmount ?? data?.amount ?? 0);
        const playerName = data?.playerName ?? data?.actorName ?? "Player";
        const booster = data?.boosterUsername ?? data?.username ?? "Viewer";
        const description = `${booster} boosted ${playerName} by ${amount} points.`;

        showPopup({
          title: `+${amount} Boost`,
          description,
          tone: "boost",
        });
        addLog({
          title: "Boost activated",
          description,
          tone: "boost",
          timestamp: data?.timestamp,
        });
      };

      service.onImmediateItemDrop = (data) => {
        const itemName = data?.item?.name ?? data?.itemName ?? "Package";
        const target = data?.targetPlayerName ?? data?.targetActorName ?? "a player";
        const purchaser = data?.purchaserUsername ?? "Viewer";
        const description = `${purchaser} dropped ${itemName} on ${target}.`;

        showPopup({
          title: "Immediate Drop",
          description,
          tone: "drop",
        });
        addLog({
          title: "Immediate package drop",
          description,
          tone: "drop",
          timestamp: data?.timestamp,
        });
      };

      service.onPackageDrop = (data) => {
        const packageName = data?.packageName ?? data?.itemName ?? data?.package?.name ?? "Package";
        const playerName = data?.playerName ?? data?.actorName ?? data?.targetActorName ?? "Player";
        const description = `${packageName} is available for ${playerName}.`;

        showPopup({
          title: "Package Unlocked",
          description,
          tone: "package",
        });
        addLog({
          title: "Package unlocked",
          description,
          tone: "package",
          timestamp: data?.timestamp,
        });
      };

      service.onEventTriggered = (data) => {
        addLog({
          title: data?.name ?? "Arena event",
          description: data?.targetActorName
            ? `Targeted ${data.targetActorName}.`
            : "A global arena event was triggered.",
          tone: "event",
          timestamp: data?.timestamp,
        });
      };

      service.onGameCompleted = (data) => {
        setArenaActive(false);
        addLog({
          title: "Arena session ended",
          description: data?.winnerActorName
            ? `${data.winnerActorName} finished on top.`
            : `Reason: ${data?.reason ?? "completed"}.`,
          tone: "system",
          timestamp: data?.timestamp,
        });
      };

      service.onGameStopped = (data) => {
        setArenaActive(false);
        addLog({
          title: "Arena stopped",
          description: `Reason: ${data?.reason ?? "manual stop"}.`,
          tone: "system",
          timestamp: data?.timestamp,
        });
      };
    },
    [addLog, showPopup],
  );

  const handleConnect = async () => {
    const latestSession = getEmpireSession();
    setSession(latestSession);
    setError("");

    if (!latestSession.authToken || !latestSession.streamUrl) {
      setStatus("missing");
      setError("Missing auth token or stream URL from Empire of Bits.");
      return;
    }

    if (!serviceRef.current) {
      serviceRef.current = new ArenaGameService();
    }

    attachArenaHandlers(serviceRef.current);
    setStatus("connecting");
    addLog({
      title: "Connecting arena",
      description: `Using stream ${shortValue(latestSession.streamUrl)}.`,
      tone: "system",
    });

    const result = await serviceRef.current.initializeGame(latestSession.streamUrl, latestSession.authToken);

    if (!result.success || !result.data) {
      const connectError = result.error ?? "Failed to connect arena session.";
      setStatus("error");
      setError(connectError);
      if (connectError.toLowerCase().includes("active streamer role")) {
        setStreamerHelpOpen(true);
      }
      addLog({
        title: "Arena connection failed",
        description: connectError,
        tone: "system",
      });
      return;
    }

    setArenaState(result.data);
    setArenaActive(result.data.arenaActive);
    setStatus("connected");
    addLog({
      title: "Arena connected",
      description: `Session ${shortValue(result.data.sessionId ?? result.data.gameId)} is ready.`,
      tone: "system",
    });
  };

  const handleEndSession = () => {
    serviceRef.current?.disconnect();
    serviceRef.current = null;
    setArenaState(null);
    setArenaActive(false);
    setCountdown(null);
    setStatus("ended");
    addLog({
      title: "Session ended",
      description: "Arena monitoring was manually stopped.",
      tone: "system",
    });
  };

  const statusLabel =
    status === "connected"
      ? arenaActive
        ? "Live"
        : "Connected"
      : status === "connecting"
        ? "Connecting"
        : status === "missing"
          ? "Missing Session"
          : status === "ended"
            ? "Ended"
            : status === "error"
              ? "Error"
              : "Ready";

  return (
    <section className="relative z-50 border-b-2 border-black bg-[#0b0816]/95 px-3 py-3 text-white shadow-[0_6px_0_#000] backdrop-blur-xl md:px-5">
      <AnimatePresence>
        {popup && (
          <motion.div
            key={popup.id}
            initial={{ opacity: 0, x: "-50%", y: -20, scale: 0.96 }}
            animate={{ opacity: 1, x: "-50%", y: 0, scale: 1 }}
            exit={{ opacity: 0, x: "-50%", y: -16, scale: 0.98 }}
            className={`fixed left-1/2 top-4 z-[120] w-[min(92vw,420px)] border-2 border-black px-5 py-4 text-center hard-shadow ${toneClasses[popup.tone]}`}
          >
            <p className="font-arcade text-[10px] font-black uppercase tracking-[0.24em] opacity-70">
              Arena Alert
            </p>
            <p className="mt-1 text-lg font-black uppercase tracking-[-0.03em]">{popup.title}</p>
            <p className="mt-1 text-sm font-black">{popup.description}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {streamerHelpOpen && (
          <motion.div
            initial={{ opacity: 0, x: 24, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.96 }}
            className="fixed right-4 top-24 z-[130] w-[min(92vw,390px)] border-2 border-black bg-[#fff8ec] p-4 text-black hard-shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-arcade text-[10px] font-black uppercase tracking-[0.24em] text-[#ff2f92]">
                  Arena Setup Needed
                </p>
                <h3 className="mt-1 text-xl font-black uppercase tracking-[-0.04em]">
                  Enable Streamer Mode
                </h3>
              </div>
              <button
                onClick={() => setStreamerHelpOpen(false)}
                className="border-2 border-black bg-[#ff2f92] p-1.5 text-white shadow-[3px_3px_0_#000]"
                aria-label="Close streamer mode help"
              >
                <X size={16} />
              </button>
            </div>
            <p className="mt-3 text-sm font-black leading-relaxed">
              Arena creation needs an active streamer role. Go to Vorld, open your profile, and enable streamer mode.
            </p>
            <a
              href="https://vorld.tv/"
              target="_blank"
              rel="noreferrer"
              className="eob-button mt-4 inline-flex items-center gap-2 bg-[#24f59f] px-4 py-3 font-arcade text-[10px] font-black uppercase tracking-[0.16em] text-black"
            >
              Open Vorld.tv <ExternalLink size={14} />
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="grid gap-2 sm:grid-cols-4">
            <div className="border-2 border-black bg-[#fff8ec] px-3 py-2 text-black hard-shadow-sm">
              <p className="flex items-center gap-1.5 font-arcade text-[9px] font-black uppercase tracking-[0.22em] text-black/55">
                <Radio size={12} /> Arena
              </p>
              <p className="mt-1 text-sm font-black uppercase">{statusLabel}</p>
            </div>

            <div className="border-2 border-black bg-[#24f59f] px-3 py-2 text-black hard-shadow-sm">
              <p className="flex items-center gap-1.5 font-arcade text-[9px] font-black uppercase tracking-[0.22em] text-black/55">
                <Trophy size={12} /> Wallet
              </p>
              <p className="mt-1 truncate text-sm font-black">{shortValue(session.wallet)}</p>
            </div>

            <div className="border-2 border-black bg-[#39e8ff] px-3 py-2 text-black hard-shadow-sm">
              <p className="flex items-center gap-1.5 font-arcade text-[9px] font-black uppercase tracking-[0.22em] text-black/55">
                <Wifi size={12} /> Stream
              </p>
              <p className="mt-1 truncate text-sm font-black">{shortValue(session.streamUrl)}</p>
            </div>

            <div className="border-2 border-black bg-[#ffe84d] px-3 py-2 text-black hard-shadow-sm">
              <p className="flex items-center gap-1.5 font-arcade text-[9px] font-black uppercase tracking-[0.22em] text-black/55">
                <Timer size={12} /> Countdown
              </p>
              <p className="mt-1 text-sm font-black uppercase">
                {countdown ? `${countdown.secondsRemaining}s ${countdown.phase}` : "Standby"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-stretch gap-2">
            <button
              onClick={handleConnect}
              disabled={status === "connecting" || status === "connected"}
              className="eob-button flex items-center gap-2 bg-[#24f59f] px-4 py-3 font-arcade text-[10px] font-black uppercase tracking-[0.16em] text-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "connected" ? <Wifi size={15} /> : <Activity size={15} />}
              {status === "connected" ? "Connected" : "Connect Arena"}
            </button>
            <button
              onClick={handleEndSession}
              disabled={!serviceRef.current || status === "connecting"}
              className="eob-button flex items-center gap-2 bg-[#ff2f92] px-4 py-3 font-arcade text-[10px] font-black uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Power size={15} /> End Session
            </button>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-[0.8fr_1.2fr]">
          <div className="border-2 border-black bg-black/55 px-3 py-2 hard-shadow-sm">
            <p className="font-arcade text-[9px] font-black uppercase tracking-[0.22em] text-[#24f59f]">
              Session Details
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-black uppercase text-stone-300">
              <span className="flex items-center gap-1.5">
                {session.authToken ? <Wifi size={12} /> : <WifiOff size={12} />} Auth
              </span>
              <span className="text-right text-white">{session.authToken ? "Stored" : "Missing"}</span>
              <span className="flex items-center gap-1.5">
                <Sparkles size={12} /> Viewers
              </span>
              <span className="text-right text-white">{arenaState?.viewerCount ?? 0}</span>
              <span className="flex items-center gap-1.5">
                <Zap size={12} /> Coins
              </span>
              <span className="text-right text-white">{arenaState?.totalCoinsSpent ?? 0}</span>
            </div>
            {error && (
              <p className="mt-2 border-2 border-black bg-[#ff2f92] px-2 py-1 font-arcade text-[9px] font-black uppercase tracking-[0.12em] text-white">
                {error}
              </p>
            )}
          </div>

          <div className="border-2 border-black bg-black/55 px-3 py-2 hard-shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-arcade text-[9px] font-black uppercase tracking-[0.22em] text-[#ffe84d]">
                Arena Feed
              </p>
              <span className="font-arcade text-[8px] font-black uppercase tracking-[0.2em] text-stone-500">
                Boosts / Drops / Events
              </span>
            </div>
            <div className="max-h-24 space-y-1 overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <div className="flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-2 text-xs font-black uppercase text-stone-400">
                  <Gift size={14} /> Waiting for arena activity
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="grid grid-cols-[auto_1fr] gap-2 border border-white/10 bg-white/5 px-2 py-1.5 text-xs"
                  >
                    <span className={`grid h-7 w-7 place-items-center border-2 border-black ${toneClasses[log.tone]}`}>
                      {log.tone === "package" ? <PackageOpen size={13} /> : log.tone === "boost" ? <Zap size={13} /> : <Gift size={13} />}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate font-black uppercase text-white">{log.title}</span>
                        <span className="font-arcade text-[8px] text-stone-500">{log.timestamp}</span>
                      </span>
                      <span className="block truncate font-black text-stone-400">{log.description}</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

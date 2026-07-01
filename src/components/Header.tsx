import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Shield, ShieldAlert, Cpu, Github, Twitter, Youtube, Bell, Menu, X } from "lucide-react";

interface HeaderProps {
  onNavClick: (tab: string) => void;
  activeTab: string;
}

export default function Header({ onNavClick, activeTab }: HeaderProps) {
  const [time, setTime] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alerts] = useState<string[]>([
    "Intrusion attempt blocked from 185.220.101.5",
    "Integrity check passed (100% OK)",
    "AI Cyber Defense core loaded",
    "WAF active, monitoring TCP traffic on port 443",
  ]);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const alertInterval = setInterval(() => {
      setCurrentAlertIndex((prev) => (prev + 1) % alerts.length);
    }, 6000);
    return () => clearInterval(alertInterval);
  }, [alerts.length]);

  const navLinks = [
    { label: "HOME", value: "home" },
    { label: "ABOUT", value: "about" },
    { label: "SERVICES", value: "services" },
    { label: "PROJECTS", value: "projects" },
    { label: "TOOLS", value: "tools" },
    { label: "CONTACT", value: "contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-900 bg-black/80 backdrop-blur-md">
      {/* Top Threat Ticker */}
      <div className="flex h-8 items-center justify-between border-b border-red-950/20 bg-red-950/10 px-4 text-[10px] font-mono tracking-wider text-[#ff2020]">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-[#ff2020]"></span>
          <span className="font-bold text-[#ff2020]">SEC_ALERT:</span>
          <motion.span
            key={currentAlertIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="truncate text-red-300"
          >
            {alerts[currentAlertIndex]}
          </motion.span>
        </div>
        <div className="hidden items-center gap-4 sm:flex">
          <div className="flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-[#ff2020]" />
            <span className="text-slate-500">CORE_TEMP:</span>
            <span className="text-slate-300">42°C</span>
          </div>
          <span className="text-slate-800">|</span>
          <span className="text-slate-400 font-medium">{time}</span>
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div
          onClick={() => onNavClick("home")}
          className="flex cursor-pointer items-center gap-3 select-none"
        >
          {/* Glowing Brand Mark SVG */}
          <svg className="w-10 h-10 drop-shadow-[0_0_8px_rgba(255,32,32,0.45)] shrink-0" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="glow-header" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <path d="M40 90H10M30 70H15M50 110H20M25 130H10" stroke="#ff2020" strokeWidth="4.5" strokeLinecap="round" opacity="0.8"/>
            <circle cx="10" cy="90" r="4" fill="#ff2020" />
            <circle cx="15" cy="70" r="4" fill="#ff2020" />
            <circle cx="20" cy="110" r="4" fill="#ff2020" />
            <circle cx="10" cy="130" r="4" fill="#ff2020" />
            <path d="M40 90 L50 80 M30 70 L40 60 M50 110 L60 100" stroke="#ff2020" strokeWidth="3.5" opacity="0.8"/>
            <circle cx="110" cy="100" r="70" stroke="#ff2020" strokeWidth="8" strokeLinecap="round" strokeDasharray="300 120" filter="url(#glow-header)"/>
            <path d="M90 65 H125 C140 65, 148 72, 148 83 C148 94, 140 100, 125 100 H105 V135 H90 V65 Z M105 80 V90 H122 C128 90, 132 87, 132 85 C132 82, 128 80, 122 80 H105 Z" fill="#fff" />
            <path d="M108 100 L145 135 H125 L92 100 H108 Z" fill="#ff2020" />
          </svg>
          <div className="flex flex-col">
            <div className="font-display font-black text-lg sm:text-xl tracking-[0.15em] text-white leading-none">
              REXDEV<span className="text-[#ff2020]">CYBER</span>
            </div>
            <span className="text-[9px] font-mono tracking-widest text-slate-500 mt-1 uppercase font-bold">SECURE • BUILD • INNOVATE</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 font-mono">
          {navLinks.map((link) => (
            <button
              key={link.value}
              onClick={() => onNavClick(link.value)}
              className={`relative py-2 text-xs font-bold uppercase tracking-widest transition-colors duration-200 cursor-pointer ${
                activeTab === link.value
                  ? "text-[#ff2020]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {link.label}
              {activeTab === link.value && (
                <motion.span
                  layoutId="activeHeaderBorder"
                  className="absolute bottom-0 left-0 h-[2px] w-full bg-[#ff2020] shadow-[0_0_10px_#ff2020]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Action Controls & Socials */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/rexdevcyber/rexrecon"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-950 hover:text-white transition-all border border-transparent hover:border-slate-800"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="https://x.com/rexdevcyber"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-950 hover:text-white transition-all border border-transparent hover:border-slate-800"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="https://youtube.com/@rexdevcyber"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-950 hover:text-white transition-all border border-transparent hover:border-slate-800"
            >
              <Youtube className="h-4 w-4" />
            </a>
          </div>

          <div className="h-4 w-px bg-slate-800"></div>

          <div className="flex flex-col items-end leading-none">
            <span className="text-[9px] text-slate-500 uppercase tracking-tighter font-mono">Status</span>
            <span className="text-[11px] text-[#ff2020] font-mono font-bold">SECURE_NODE: 0xFF12</span>
          </div>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => onNavClick("terminal")}
            className="rounded border border-red-500/20 bg-red-950/20 px-2 py-1 text-[10px] font-mono text-[#ff2020]"
          >
            CONSOLE
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition-all"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-slate-900 bg-[#05070d] px-4 py-4 md:hidden"
        >
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <button
                key={link.value}
                onClick={() => {
                  onNavClick(link.value);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium tracking-wider ${
                  activeTab === link.value
                    ? "bg-red-950/20 text-[#ff2020] font-bold border-l-2 border-[#ff2020]"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="mt-4 flex items-center justify-around border-t border-slate-900 pt-4">
            <a href="https://github.com/rexdevcyber/rexrecon" className="text-slate-400 hover:text-white">
              <Github className="h-5 w-5" />
            </a>
            <a href="https://x.com/rexdevcyber" className="text-slate-400 hover:text-white">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="https://youtube.com/@rexdevcyber" className="text-slate-400 hover:text-white">
              <Youtube className="h-5 w-5" />
            </a>
          </div>
        </motion.div>
      )}
    </header>
  );
}

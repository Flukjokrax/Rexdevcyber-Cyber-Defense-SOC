import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it via the Settings > Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Chat API using Gemini for AI Cyber Defense Dashboard
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages array provided." });
      }

      const client = getGeminiClient();

      // We extract the last message as the query, and use systemInstruction
      const lastMessage = messages[messages.length - 1];
      const userText = lastMessage?.content || "Hello";

      const systemInstruction = `
        You are the REXDEVCYBER AI Cyber Defense Assistant, an elite cybersecurity expert system.
        You are integrated directly into the REXDEVCYBER Security Operations Center (SOC) portal.
        Your tone is highly professional, technical, authoritative, with a touch of cyberpunk minimalism.
        You assist users in analyzing code vulnerabilities, explaining threat models, recommending security actions, and demonstrating pentesting remediation.
        Keep answers informative, technical, cleanly formatted with markdown, and concise.
        Avoid verbose boilerplate. Directly address questions with precise cybersecurity terms (e.g., CVEs, OWASP Top 10, memory safety, mitigation strategies).
      `;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userText,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || "No response received from security core.";
      res.json({ content: replyText });
    } catch (error: any) {
      console.error("Gemini Chat API Error:", error);
      res.status(500).json({
        error: error.message || "An error occurred in the REXDEVCYBER AI defense core.",
      });
    }
  });

  // AI Security Scanner API
  app.post("/api/security/scan", async (req, res) => {
    try {
      const { target, scanType } = req.body;
      if (!target) {
        return res.status(400).json({ error: "Target host or domain is required." });
      }

      // 1. Generate realistic simulated telemetry data based on target
      const simulatedPorts = [
        { port: 22, service: "SSH", status: "open", banner: "OpenSSH 8.2p1 Ubuntu-4ubuntu0.5" },
        { port: 80, service: "HTTP", status: "open", banner: "nginx/1.18.0" },
        { port: 443, service: "HTTPS", status: "open", banner: "nginx/1.18.0" },
        { port: 3000, service: "NodeJS", status: "open", banner: "Express/Vite Dev" },
        { port: 3306, service: "MySQL", status: "closed", banner: "" },
        { port: 8080, service: "HTTP-Proxy", status: "filtered", banner: "" },
      ];

      // Shuffle or select based on target hash
      const targetHash = target.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      const activePorts = simulatedPorts.filter((p, idx) => (targetHash + idx) % 2 === 0 || p.port === 80 || p.port === 443);

      const vulnerabilities = [
        {
          cve: "CVE-2023-35123",
          title: "HTTP Header Information Disclosure",
          severity: "LOW",
          description: "Web server exposes exact backend version details in response headers (nginx/1.18.0).",
          remediation: "Configure ServerTokens off in nginx configurations.",
        },
        {
          cve: "CVE-2024-4112",
          title: "Outdated SSH Host Key Exchange Weakness",
          severity: "MEDIUM",
          description: "SSH daemon supports obsolete cipher suites risking decryption or session hijacking under specific OSINT criteria.",
          remediation: "Update /etc/ssh/sshd_config to allow only strong modern HMACs and cipher algorithms.",
        },
      ];

      // Add a higher risk vulnerability if domain looks sketchy or target hash satisfies condition
      if (targetHash % 3 === 0) {
        vulnerabilities.push({
          cve: "CVE-2024-9102",
          title: "SQL Injection on Auth Entrypoint",
          severity: "HIGH",
          description: "Parameter login handler allows raw SQL statements via injection payload, leading to authentication bypass.",
          remediation: "Implement prepared statements and parameterized queries for all database connection drivers.",
        });
      }

      // 2. Call Gemini to create a customized AI Cyber Security Assessment & Remediation Report
      let aiReport = "";
      try {
        const client = getGeminiClient();
        const prompt = `
          Generate a detailed REXDEVCYBER Threat Assessment Report for target: "${target}"
          Scan type run: "${scanType || 'Comprehensive OSINT & Network Scan'}"
          Detected open ports: ${JSON.stringify(activePorts.map(p => p.port))}
          Known vulnerabilities spotted: ${JSON.stringify(vulnerabilities.map(v => v.title))}

          Please output a structured expert technical report in Markdown formatting containing:
          1. **Executive Summary**: A crisp professional summary of security posture.
          2. **Vulnerability Assessment**: High-level review of risk factors.
          3. **Defense Action Plan**: Step-by-step remediation advice tailored for security teams.
          Keep the response concise, authoritative, and clean. No generic conversational fluff.
        `;

        const response = await client.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            temperature: 0.5,
          },
        });

        aiReport = response.text || "Report compilation failed.";
      } catch (geminiErr: any) {
        console.warn("Gemini Scan Report generation failed, fallback to local reports:", geminiErr);
        aiReport = `### REXDEVCYBER Vulnerability Assessment (Fallback Mode)\n\nWe scanned **${target}** but could not reach the remote Gemini AI engine to produce a customized assessment.\n\n* **Status**: Warning\n* **Open Ports**: ${activePorts.map(p => `${p.port}/${p.service}`).join(", ")}\n* **Recommendation**: Ensure your API keys are updated in Secrets.`;
      }

      // 3. Return report & telemetry
      res.json({
        target,
        timestamp: new Date().toISOString(),
        ports: activePorts,
        vulnerabilities,
        remediationReport: aiReport,
      });

    } catch (error: any) {
      console.error("Scan API Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during system audit scan." });
    }
  });

  // Vite development middleware vs Static Production build serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

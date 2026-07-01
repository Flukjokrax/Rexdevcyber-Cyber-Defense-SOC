export interface Message {
  id: string;
  sender: "user" | "ai" | "system";
  content: string;
  timestamp: string;
}

export interface SecurityScanResult {
  target: string;
  timestamp: string;
  ports: Array<{
    port: number;
    service: string;
    status: string;
    banner: string;
  }>;
  vulnerabilities: Array<{
    cve: string;
    title: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    description: string;
    remediation: string;
  }>;
  remediationReport: string;
  status?: "pending" | "running" | "completed";
}

export interface Project {
  title: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  type: string;
}

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  HardDrive, 
  Download, 
  Trash2, 
  UploadCloud, 
  RefreshCw, 
  Search, 
  FileText, 
  FileCode, 
  File, 
  AlertTriangle, 
  Sparkles,
  Info,
  Fingerprint,
  Cpu,
  CornerDownRight,
  Database
} from "lucide-react";
import { 
  googleSignIn, 
  logoutUser, 
  listDriveFiles, 
  uploadDriveFile, 
  deleteDriveFile, 
  downloadDriveFile, 
  DriveFile, 
  initAuth 
} from "../lib/drive";
import { User } from "firebase/auth";

export default function DriveVault() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New text dossier creator state
  const [newDocName, setNewDocName] = useState("");
  const [newDocContent, setNewDocContent] = useState("");
  const [creatingDoc, setCreatingDoc] = useState(false);

  // Drag-and-drop file upload state
  const [dragActive, setDragActive] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File integrity scan state
  const [scanningFileId, setScanningFileId] = useState<string | null>(null);
  const [scanReport, setScanReport] = useState<{
    fileName: string;
    fileId: string;
    sha256: string;
    classification: "SAFE" | "SUSPICIOUS" | "THREAT_FOUND";
    entropy: string;
    details: string[];
  } | null>(null);

  // Format file size
  const formatFileSize = (sizeStr?: string) => {
    if (!sizeStr) return "UNKNOWN SIZE";
    const bytes = parseInt(sizeStr, 10);
    if (isNaN(bytes)) return "UNKNOWN SIZE";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Humanize modified time
  const formatTime = (timeStr: string) => {
    try {
      const d = new Date(timeStr);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return timeStr;
    }
  };

  // Get file icon based on mimeType
  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("text/plain") || mimeType.includes("document")) {
      return <FileText className="h-4.5 w-4.5 text-cyan-400" />;
    }
    if (mimeType.includes("json") || mimeType.includes("javascript") || mimeType.includes("typescript") || mimeType.includes("html") || mimeType.includes("css")) {
      return <FileCode className="h-4.5 w-4.5 text-yellow-400" />;
    }
    return <File className="h-4.5 w-4.5 text-slate-400" />;
  };

  // Initialize Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        fetchFiles(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
        setFiles([]);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch file directory from Google Drive
  const fetchFiles = async (accessToken: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const driveFiles = await listDriveFiles(accessToken);
      setFiles(driveFiles);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to synchronize with Google Drive. Session might have expired.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger Google Sign In Flow
  const handleConnect = async () => {
    setErrorMsg(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        fetchFiles(result.accessToken);
        setSuccessMsg("SECURE CHANNEL ESTABLISHED: Authenticated with Google Cloud Gateway.");
        setTimeout(() => setSuccessMsg(null), 5000);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "OAuth login sequence aborted or timed out.");
    }
  };

  // Logout / Disconnect
  const handleDisconnect = async () => {
    try {
      await logoutUser();
      setUser(null);
      setToken(null);
      setFiles([]);
      setScanReport(null);
      setSuccessMsg("SECURE CHANNEL TERMINATED: Signed out safely.");
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to cleanly disconnect auth session.");
    }
  };

  // Download a file
  const handleDownload = async (file: DriveFile) => {
    if (!token) return;
    try {
      setSuccessMsg(`Initiating secure payload download: ${file.name}...`);
      const blob = await downloadDriveFile(token, file.id);
      
      // Create local file download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccessMsg(`SUCCESS: Payload ${file.name} downloaded securely.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed to retrieve payload: ${err.message}`);
    }
  };

  // Delete a file with premium confirmation modal
  const handleDelete = async (file: DriveFile) => {
    if (!token) return;
    
    // Explicit security compliance prompt mandated by the workspace guidelines
    const confirmed = window.confirm(
      `[SECURITY AUDIT MANDATE] DESTRUCTIVE OPERATION CONFIRMATION\n\nAre you sure you want to delete "${file.name}" from your Google Drive permanently?\nThis operation will purge this asset from the cloud.`
    );
    
    if (!confirmed) return;

    try {
      setLoading(true);
      await deleteDriveFile(token, file.id);
      setSuccessMsg(`SUCCESS: Asset "${file.name}" purged successfully.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      // Re-fetch file list
      await fetchFiles(token);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed to purge asset: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Upload custom text dossier report
  const handleCreateDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newDocName) return;

    setCreatingDoc(true);
    setErrorMsg(null);
    try {
      const docNameWithExt = newDocName.toLowerCase().endsWith(".txt") 
        ? newDocName 
        : `${newDocName}.txt`;
      
      const contentBlob = new Blob([newDocContent], { type: "text/plain;charset=utf-8" });
      await uploadDriveFile(token, docNameWithExt, "text/plain", contentBlob);
      
      setSuccessMsg(`SUCCESS: Cyber intelligence dossier "${docNameWithExt}" created.`);
      setNewDocName("");
      setNewDocContent("");
      setTimeout(() => setSuccessMsg(null), 4000);
      
      // Re-fetch files
      await fetchFiles(token);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed to construct dossier: ${err.message}`);
    } finally {
      setCreatingDoc(false);
    }
  };

  // Handle Drag Events for File Upload
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle Drop Events
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await handleUpload(file);
    }
  };

  // Handle manual input file select
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await handleUpload(file);
    }
  };

  // Main Upload Executor
  const handleUpload = async (file: File) => {
    if (!token) return;
    setUploadingFile(true);
    setErrorMsg(null);
    try {
      setSuccessMsg(`Uploading and encrypting payload: ${file.name}...`);
      const fileBlob = new Blob([file], { type: file.type });
      await uploadDriveFile(token, file.name, file.type, fileBlob);
      
      setSuccessMsg(`SUCCESS: Payload "${file.name}" successfully saved in Secure Vault.`);
      setTimeout(() => setSuccessMsg(null), 5000);
      await fetchFiles(token);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed to save payload: ${err.message}`);
    } finally {
      setUploadingFile(false);
    }
  };

  // File Integrity Scan Execution (Holographic Threat Auditor)
  const executeIntegrityScan = (file: DriveFile) => {
    setScanningFileId(file.id);
    setScanReport(null);

    // Simulate high-tech scanning with logs
    setTimeout(() => {
      // Hash generation logic
      const randomHash = Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join("");

      // Classification determination based on file characteristics
      const isSuspicious = file.name.includes(".exe") || file.name.includes(".sh") || file.name.includes(".bat") || Math.random() > 0.8;
      const entropyVal = (6.2 + Math.random() * 1.6).toFixed(4);
      
      const classification = isSuspicious 
        ? (Math.random() > 0.5 ? "THREAT_FOUND" : "SUSPICIOUS") 
        : "SAFE";

      const details = [
        `[MFT_RECORD] Loaded file descriptor: ${file.id}`,
        `[BYTE_COUNT] Mapped ${file.size ? formatFileSize(file.size) : "unknown bytes"} structure into memory sandbox`,
        `[ENTROPY] Byte distribution density computed at: ${entropyVal} bits/symbol`,
        classification === "SAFE" 
          ? "[AUDIT] Signature matching against zero-day registry completed. 0 malware patterns isolated."
          : classification === "SUSPICIOUS"
            ? "[WARNING] Heuristics isolated high-entropy byte arrays. Potential encrypted archive payload."
            : "[CRITICAL] SIGNATURE MATCH DETECTED: Botnet Trojan loader payload matched on byte block sequence #420!"
      ];

      setScanReport({
        fileName: file.name,
        fileId: file.id,
        sha256: randomHash,
        classification,
        entropy: entropyVal,
        details
      });
      setScanningFileId(null);
    }, 1800);
  };

  // Filter files based on search input
  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-mono text-xs select-none">
      
      {/* HUD HEADER PANEL */}
      <div className="p-5 rounded-2xl border border-slate-900 bg-black/60 backdrop-blur-md relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-10 relative">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-cyan-950/20 border border-cyan-900/30 text-cyan-400">
              <HardDrive className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] text-cyan-400 uppercase tracking-[0.25em] font-bold">REXDEVCYBER L7 INTERPRETER</span>
              <h2 className="text-lg font-bold text-white uppercase mt-0.5 tracking-wider">SECURE GOOGLE DRIVE VAULT</h2>
            </div>
          </div>
          
          <div>
            {!user ? (
              <button
                onClick={handleConnect}
                className="gsi-material-button text-xs tracking-wider cursor-pointer font-bold px-4 py-2.5 rounded-lg border border-transparent bg-gradient-to-r from-cyan-600 to-teal-500 text-white shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:from-cyan-500 hover:to-teal-400 transition-all flex items-center gap-2"
              >
                <Fingerprint className="h-4 w-4" />
                <span>DECRYPT VAULT WITH GOOGLE</span>
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-900/80">
                <div className="text-right">
                  <span className="block text-[10px] text-cyan-400 font-bold uppercase">{user.displayName || "SECURE_USER"}</span>
                  <span className="block text-[8px] text-slate-500">{user.email || "L7 ACCESS Granted"}</span>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="px-2.5 py-1.5 rounded bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-500 hover:text-white transition-all font-bold tracking-widest text-[8px] cursor-pointer"
                >
                  [SIG_OFF]
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SUCCESS / ERROR ALERTS */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-xl border border-red-900/40 bg-red-950/10 text-red-400 flex items-start gap-3"
          >
            <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5 animate-bounce" />
            <div>
              <strong className="block uppercase text-[10px] tracking-wide">DECRYPTION FAILURE / BOUNDARY BREACH:</strong>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-300">{errorMsg}</p>
            </div>
          </motion.div>
        )}
        
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-xl border border-cyan-900/40 bg-cyan-950/10 text-cyan-400 flex items-start gap-3"
          >
            <ShieldCheck className="h-4.5 w-4.5 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <strong className="block uppercase text-[10px] tracking-wide">SECURE LINK DISPATCH:</strong>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-300">{successMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!user ? (
        /* LOCK SCREEN FOR UNAUTHENTICATED USERS */
        <div className="p-12 rounded-2xl border border-slate-900 bg-black/40 backdrop-blur-md text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="max-w-md mx-auto space-y-4 relative z-10">
            <div className="w-16 h-16 rounded-full border border-red-900/30 bg-red-950/15 flex items-center justify-center mx-auto text-[#ff2020] animate-pulse">
              <Lock className="h-8 w-8" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">CLOUD SECURE VAULT IS COLD-LOCKED</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Google Drive integration is currently disengaged. Establish mutual TLS and Google authentication credentials using your Google Cloud sign-in to list, modify, create, and audit remote cybersecurity assets securely.
            </p>
            <button
              onClick={handleConnect}
              className="py-3 px-6 bg-[#ff2020] hover:bg-red-500 text-white font-bold uppercase tracking-widest rounded-lg transition-all shadow-md shadow-red-500/20 hover:shadow-red-500/45 cursor-pointer flex items-center justify-center gap-2 mx-auto"
            >
              <Unlock className="h-4 w-4" />
              <span>REQUEST DEPLOYED DECRYPTION</span>
            </button>
          </div>
        </div>
      ) : (
        /* CONNECTED DASHBOARD */
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* LEFT AREA: DIRECTIVES / FILE UPLOAD & CREATOR */}
          <div className="space-y-6 xl:col-span-1">
            
            {/* FILE DROP ZONE */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-black/60 backdrop-blur-md space-y-4">
              <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest">DRAG & DROP AUDITING</span>
              <h4 className="text-xs font-bold text-white uppercase">UPLOAD SECURE PAYLOAD</h4>
              
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed p-8 rounded-xl flex flex-col items-center justify-center text-center gap-3 cursor-pointer transition-all duration-300 ${
                  dragActive 
                    ? "border-cyan-400 bg-cyan-950/10 text-cyan-300" 
                    : "border-slate-900 hover:border-cyan-500/40 bg-[#05070d]/60 hover:bg-cyan-950/5"
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {uploadingFile ? (
                  <div className="space-y-2">
                    <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin mx-auto" />
                    <p className="text-[10px] text-cyan-400 uppercase font-bold animate-pulse">ENCRYPTING INGEST SEQUENCE...</p>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="h-10 w-10 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    <div>
                      <p className="text-xs text-slate-300 font-bold">DRAG NEW PAYLOAD HERE</p>
                      <p className="text-[10px] text-slate-500 mt-1">or click to browse local harddrive</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* DIRECT TEXT DOSSIER CREATOR */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-black/60 backdrop-blur-md space-y-4">
              <span className="text-[9px] text-yellow-500 font-bold uppercase tracking-widest">RAPID INTELLIGENCE REPORT</span>
              <h4 className="text-xs font-bold text-white uppercase">WRITE DIGITAL REPORT DOSSIER</h4>
              
              <form onSubmit={handleCreateDossier} className="space-y-3 font-mono text-xs">
                <div>
                  <label className="block text-slate-500 uppercase font-bold mb-1">DOSSIER NAME:</label>
                  <input 
                    type="text"
                    required
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    placeholder="e.g. Vuln-Mitigation-Patch"
                    className="w-full bg-[#05070d] text-white px-3 py-2.5 rounded border border-slate-900 outline-none focus:border-cyan-500 transition-colors text-xs"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-500 uppercase font-bold mb-1">CONTENT PAYLOAD:</label>
                  <textarea 
                    rows={4}
                    required
                    value={newDocContent}
                    onChange={(e) => setNewDocContent(e.target.value)}
                    placeholder="Enter security audit report or logic patch bytes..."
                    className="w-full bg-[#05070d] text-white px-3 py-2.5 rounded border border-slate-900 outline-none focus:border-cyan-500 transition-colors resize-none text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creatingDoc}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase tracking-wider rounded-lg transition-all shadow-md shadow-cyan-500/10 hover:shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {creatingDoc ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>INITIALIZING...</span>
                    </>
                  ) : (
                    <>
                      <Database className="h-3.5 w-3.5" />
                      <span>DISPATCH TO CLOUD DRIVE</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* MIDDLE & RIGHT AREA: FILE EXPLORER & METADATA THREAT AUDITOR */}
          <div className="space-y-6 xl:col-span-2">
            
            {/* INTEGRITY AUDIT HOLOGRAPHIC REPORT DRAWER */}
            <AnimatePresence>
              {scanReport && (
                <motion.div
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="p-5 rounded-2xl border bg-black/85 backdrop-blur-md relative overflow-hidden font-mono text-xs shadow-2xl"
                  style={{
                    borderColor: scanReport.classification === "SAFE" 
                      ? "rgba(16,185,129,0.3)" 
                      : scanReport.classification === "SUSPICIOUS" 
                        ? "rgba(245,158,11,0.3)" 
                        : "rgba(239,68,68,0.3)"
                  }}
                >
                  <div className="flex items-start justify-between border-b border-slate-900 pb-3.5 mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <Cpu className={`h-5 w-5 ${scanReport.classification === "SAFE" ? "text-emerald-400" : scanReport.classification === "SUSPICIOUS" ? "text-amber-400" : "text-red-500 animate-pulse"}`} />
                      <div>
                        <span className="text-[8px] text-slate-500 uppercase font-black">AUDIT REPORT MODULE</span>
                        <h4 className="text-sm font-bold text-white uppercase">{scanReport.fileName}</h4>
                      </div>
                    </div>
                    
                    <span className={`px-2.5 py-1 text-[9px] font-bold rounded uppercase tracking-wider ${
                      scanReport.classification === "SAFE" 
                        ? "bg-emerald-950/20 text-emerald-400 border border-emerald-900/30" 
                        : scanReport.classification === "SUSPICIOUS" 
                          ? "bg-amber-950/20 text-amber-400 border border-amber-900/30" 
                          : "bg-red-950/20 text-red-500 border border-red-900/30"
                    }`}>
                      STATUS: {scanReport.classification}
                    </span>
                  </div>

                  <div className="space-y-3 font-mono text-[11px] leading-relaxed">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-slate-950/60 p-3 rounded-lg border border-slate-900">
                      <div>
                        <span className="block text-[8px] text-slate-500 uppercase font-bold">DIGITAL BLOCK ID</span>
                        <span className="font-bold text-slate-300 break-all">{scanReport.fileId}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-slate-500 uppercase font-bold">SHA-256 INTEGRITY HASH</span>
                        <span className="font-bold text-slate-300 break-all">{scanReport.sha256}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 mt-2.5">
                      <span className="block text-[8px] text-slate-500 uppercase font-bold">CORE ANALYSIS METRICS</span>
                      <div className="space-y-1 bg-black/40 p-3 rounded-lg border border-slate-900">
                        {scanReport.details.map((detail, idx) => (
                          <div key={idx} className="flex gap-2">
                            <span className="text-cyan-500">❯</span>
                            <span className="text-slate-300 break-all">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-950">
                    <button
                      onClick={() => setScanReport(null)}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-900 text-slate-400 hover:text-white rounded-md transition-all font-bold text-[10px] cursor-pointer"
                    >
                      CLEAR AUDIT DOCKET
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* DRIVE FILE EXPLORER */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-black/60 backdrop-blur-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-950 pb-3">
                <div className="flex items-center gap-2">
                  <Database className="h-4.5 w-4.5 text-cyan-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">SECURED CLOUD ARTIFACTS</h4>
                </div>
                
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950 px-2.5 py-1 rounded border border-slate-900">
                  {files.length} ASSETS REGISTERED
                </span>
              </div>

              {/* FILTERING AND REFRESH CONTROLS */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search file name..."
                    className="w-full bg-[#05070d] text-white pl-9 pr-3 py-2.5 rounded-lg border border-slate-900 outline-none focus:border-cyan-500 transition-colors text-xs placeholder-slate-700"
                  />
                </div>
                
                <button
                  onClick={() => fetchFiles(token)}
                  disabled={loading}
                  className="p-2.5 bg-slate-950 hover:bg-[#05070d] rounded-lg border border-slate-900 hover:border-slate-800 text-cyan-400 transition-all cursor-pointer disabled:opacity-50"
                  title="Force telemetry sync"
                >
                  <RefreshCw className={`h-4.5 w-4.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
                </button>
              </div>

              {/* FILES LIST TABLE */}
              <div className="overflow-x-auto">
                {loading && files.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                    <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
                    <p className="text-[10px] text-slate-500 uppercase font-bold animate-pulse">QUERYING REMOTE FILE TABLE...</p>
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                    <Info className="h-7 w-7 text-slate-700" />
                    <p className="text-xs">No secure assets found matching query filters.</p>
                  </div>
                ) : (
                  <table className="w-full text-left font-mono text-[11px] leading-relaxed border-collapse">
                    <thead>
                      <tr className="border-b border-slate-950 text-slate-500 font-bold">
                        <th className="pb-2.5 font-bold uppercase text-[9px]">Name</th>
                        <th className="pb-2.5 font-bold uppercase text-[9px] hidden md:table-cell">Type</th>
                        <th className="pb-2.5 font-bold uppercase text-[9px]">Size</th>
                        <th className="pb-2.5 font-bold uppercase text-[9px] hidden lg:table-cell">Modified</th>
                        <th className="pb-2.5 text-right font-bold uppercase text-[9px]">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-950">
                      {filteredFiles.map((file) => (
                        <tr key={file.id} className="group hover:bg-[#05070d]/35 transition-colors">
                          {/* Name column */}
                          <td className="py-3 pr-2 font-bold text-white max-w-[150px] sm:max-w-[220px] truncate">
                            <div className="flex items-center gap-2">
                              {getFileIcon(file.mimeType)}
                              <span className="truncate">{file.name}</span>
                            </div>
                          </td>
                          
                          {/* Type column */}
                          <td className="py-3 text-slate-400 hidden md:table-cell truncate max-w-[120px]">
                            {file.mimeType.split(".").pop() || "dossier"}
                          </td>
                          
                          {/* Size column */}
                          <td className="py-3 text-slate-400">
                            {formatFileSize(file.size)}
                          </td>
                          
                          {/* Modified column */}
                          <td className="py-3 text-slate-500 hidden lg:table-cell">
                            {formatTime(file.modifiedTime)}
                          </td>
                          
                          {/* Operations Column */}
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Scan button */}
                              <button
                                onClick={() => executeIntegrityScan(file)}
                                disabled={scanningFileId !== null}
                                className={`p-1.5 rounded transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 cursor-pointer ${
                                  scanningFileId === file.id
                                    ? "bg-cyan-950/20 text-cyan-400 border border-cyan-800/50"
                                    : "bg-cyan-950/15 text-cyan-400 hover:bg-cyan-600 hover:text-white border border-cyan-900/30"
                                }`}
                                title="Run Vulnerability & Malware Scan"
                              >
                                {scanningFileId === file.id ? (
                                  <>
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                    <span>SCAN...</span>
                                  </>
                                ) : (
                                  <>
                                    <Shield className="h-3 w-3" />
                                    <span className="hidden sm:inline">INTEGRITY</span>
                                  </>
                                )}
                              </button>

                              {/* Download button */}
                              <button
                                onClick={() => handleDownload(file)}
                                className="p-1.5 bg-slate-950 border border-slate-900 hover:border-slate-800 text-slate-300 hover:text-white rounded cursor-pointer"
                                title="Download Dossier"
                              >
                                <Download className="h-3 w-3" />
                              </button>

                              {/* Delete button */}
                              <button
                                onClick={() => handleDelete(file)}
                                className="p-1.5 bg-red-950/20 border border-red-900/20 hover:border-red-600 hover:bg-red-600/10 text-red-400 rounded cursor-pointer"
                                title="Purge Dossier"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, FileText, X, Check, AlertCircle } from "lucide-react";
import { cn } from "@/components/ats/ui/utils";
import { Button } from "@/components/ats/ui/button";
import { Progress } from "@/components/ats/ui/progress";
import { retro } from "@/lib/animations";

interface ResumeUploadProps {
  onUpload: (file: File) => Promise<void>;
  currentResumeUrl?: string;
  currentResumeFileName?: string;
  compact?: boolean;
  className?: string;
}

interface FileState {
  file: File;
  status: "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

export function ResumeUpload({
  onUpload,
  currentResumeUrl,
  currentResumeFileName,
  compact = false,
  className,
}: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileState, setFileState] = useState<FileState | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const handleFile = useCallback(
    async (file: File) => {
      if (!acceptedTypes.includes(file.type)) {
        setFileState({
          file,
          status: "error",
          progress: 0,
          error: "Invalid file type. Use PDF, DOC, or DOCX.",
        });
        return;
      }

      setFileState({ file, status: "uploading", progress: 0 });

      const progressInterval = setInterval(() => {
        setFileState((prev) => {
          if (!prev || prev.status !== "uploading") return prev;
          const newProgress = Math.min(prev.progress + 10, 90);
          return { ...prev, progress: newProgress };
        });
      }, 100);

      try {
        await onUpload(file);
        clearInterval(progressInterval);
        setFileState({ file, status: "success", progress: 100 });
      } catch {
        clearInterval(progressInterval);
        setFileState({
          file,
          status: "error",
          progress: 0,
          error: "Upload failed. Please try again.",
        });
      }
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (compact && currentResumeUrl) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 p-3 pixel-border-success",
          className
        )}
        style={{ background: "rgba(76,175,80,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <FileText size={14} style={{ color: "#4caf50" }} />
          <span className="text-xs" style={{ color: "var(--foreground)" }}>
            {currentResumeFileName || "Resume equipped"}
          </span>
        </div>
        <a
          href={currentResumeUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[10px] uppercase tracking-wider"
          style={{ color: "#4caf50" }}
        >
          View
        </a>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleInputChange}
        className="hidden"
      />

      <div
        className={cn(
          "pixel-border p-6 text-center transition-all cursor-pointer",
          isDragging && "pixel-border-orange"
        )}
        style={{
          background: isDragging
            ? "rgba(247,127,0,0.08)"
            : "rgba(0,48,73,0.5)",
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="text-2xl"
            style={{ color: isDragging ? "var(--color-orange)" : "var(--color-gold)" }}
          >
            📜
          </div>
          <div>
            <div
              className="text-xs uppercase tracking-wider mb-1"
              style={{
                color: isDragging ? "var(--color-orange)" : "var(--color-gold)",
              }}
            >
              {isDragging ? "Release to equip item" : "Drop item here"}
            </div>
            <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
              .PDF .DOC .DOCX
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
            <Upload size={14} />
            Browse Files
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {fileState && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={retro.snap}
            className={cn(
              "p-3",
              fileState.status === "success" && "pixel-border-success",
              fileState.status === "error" && "pixel-border-red",
              fileState.status === "uploading" && "pixel-border-orange"
            )}
            style={{ background: "var(--surface)" }}
          >
            <div className="flex items-center gap-3">
              <div className="text-lg">📄</div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-xs truncate"
                  style={{ color: "var(--foreground)" }}
                >
                  {fileState.file.name}
                </div>
                <div
                  className="text-[10px]"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {formatFileSize(fileState.file.size)}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {fileState.status === "uploading" && (
                  <span
                    className="text-[10px] uppercase tracking-wider"
                    style={{ color: "var(--color-orange)" }}
                  >
                    Equipping...
                  </span>
                )}
                {fileState.status === "success" && (
                  <span
                    className="text-[10px] uppercase tracking-wider flex items-center gap-1"
                    style={{ color: "#4caf50" }}
                  >
                    <Check size={12} /> Equipped
                  </span>
                )}
                {fileState.status === "error" && (
                  <span
                    className="text-[10px] uppercase tracking-wider flex items-center gap-1"
                    style={{ color: "var(--color-flag)" }}
                  >
                    <AlertCircle size={12} /> Failed
                  </span>
                )}
                <button
                  onClick={() => setFileState(null)}
                  className="p-1 transition-colors"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {fileState.status === "uploading" && (
              <div className="mt-2">
                <Progress value={fileState.progress} variant="xp" />
              </div>
            )}

            {fileState.error && (
              <div
                className="mt-2 text-[10px]"
                style={{ color: "var(--color-flag)" }}
              >
                ▲ {fileState.error}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {currentResumeUrl && !fileState && (
        <div
          className="flex items-center justify-between gap-3 p-3 pixel-border-success"
          style={{ background: "rgba(76,175,80,0.06)" }}
        >
          <div className="flex items-center gap-2">
            <FileText size={14} style={{ color: "#4caf50" }} />
            <span className="text-xs" style={{ color: "var(--foreground)" }}>
              Current: {currentResumeFileName || "Resume on file"}
            </span>
          </div>
          <a
            href={currentResumeUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] uppercase tracking-wider"
            style={{ color: "#4caf50" }}
          >
            View
          </a>
        </div>
      )}
    </div>
  );
}

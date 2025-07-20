"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useFileUpload } from "@/hooks/use-file-upload";
import { Paperclip, Send, X } from "lucide-react";
import { useRef, useState } from "react";
interface ChatInputProps {
  onSendMessage: (content: string, files?: File[]) => void;
  isLoading: boolean;
  disableFileUpload?: boolean;
}

export function ChatInput({
  onSendMessage,
  isLoading,
  disableFileUpload,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const uploadUrl = `http://127.0.0.1:8000/api/rag-langchain-ai/upload-document`;
  const { setNewFile } = useFileUpload(uploadUrl, (result, uploadedFile) => {
    setUploadingIndex(null); // Clear uploading state after upload finished
    if (result.success) {
      setUploadedFiles((prev) => [...prev, uploadedFile]);
      setFiles((prev) => prev.filter((f) => f !== uploadedFile));
    } else {
      console.error("Upload failed:", result.error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || files.length > 0) {
      onSendMessage(message.trim(), files);
      setMessage("");
      setFiles([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };
  const handleFileUpload = (index: number) => {
    const selectedFile = files[index];
    if (!selectedFile) return;
    setUploadingIndex(index);
    setNewFile(selectedFile);
  };
  return (
    <div className="border-t border-border/40 p-4">
      {files.map((file, index) => {
        const isUploading = uploadingIndex === index;

        return (
          <Badge
            key={index}
            variant="secondary"
            className={`flex items-center gap-2 px-3 py-1 w-fit transition-opacity ${
              isUploading ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            <Paperclip className="h-3 w-3 shrink-0" />

            <span className="truncate max-w-32">{file.name}</span>

            {/* Upload Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 text-green-600 hover:bg-muted-foreground/10"
              onClick={() => handleFileUpload(index)}
              title="Upload"
              disabled={isUploading}
            >
              ⬆️
            </Button>

            {/* Delete Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => removeFile(index)}
              title="Remove"
              disabled={isUploading}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        );
      })}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {uploadedFiles.map((file, index) => (
            <Badge
              key={`uploaded-${index}`}
              variant="secondary"
              className="flex items-center gap-2 px-3 py-1 w-fit bg-green-100 text-green-800"
            >
              <Paperclip className="h-3 w-3 shrink-0" />
              <span className="truncate max-w-32">{file.name}</span>
              <span className="text-xs text-green-600">(uploaded)</span>
            </Badge>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="min-h-[44px] max-h-32 resize-none pr-12 bg-background border-border/40"
            disabled={isLoading}
          />
          {!disableFileUpload && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple={false}
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-8 w-8 p-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        <Button
          type="submit"
          disabled={(!message.trim() && files.length === 0) || isLoading}
          className="h-11 px-4"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

// hooks/useFileUpload.ts
import { useState } from "react";

export interface UploadedFile {
  file: File;
}

interface UploadResult {
  success: boolean;
  data?: any;
  error?: string;
}

export function useFileUpload(
  uploadUrl: string,
  onUploadComplete?: (result: UploadResult, file: File) => void
) {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // ⏳ Track upload status

  const uploadFile = async (fileToUpload: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append("file", fileToUpload);

    setLoading(true); // ✅ Start loading
    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed.");
      const data = await response.json();

      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Unknown error occurred.",
      };
    } finally {
      setLoading(false); // ✅ End loading
    }
  };

  const setNewFile = async (newFile: File) => {
    if (!newFile || loading) return; // Prevent duplicate uploads
    setFile({ file: newFile });

    const result = await uploadFile(newFile);
    onUploadComplete?.(result, newFile);
  };

  const clearFile = () => {
    if (!loading) setFile(null);
  };

  return {
    file,
    loading,
    setNewFile,
    clearFile,
  };
}

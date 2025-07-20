import { useState } from "react";
import { toast } from "sonner";

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
  const [loading, setLoading] = useState<boolean>(false);

  const uploadFile = async (fileToUpload: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append("file", fileToUpload);

    setLoading(true);
    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed.");
      const data = await response.json();

      toast.success(`✅ ${fileToUpload.name} uploaded successfully`);
      return { success: true, data };
    } catch (error: any) {
      toast.error(`❌ Upload failed: ${error.message || "Unknown error"}`);
      return {
        success: false,
        error: error.message || "Unknown error occurred.",
      };
    } finally {
      setLoading(false);
    }
  };

  const setNewFile = async (newFile: File) => {
    if (!newFile || loading) return;
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

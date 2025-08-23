import React, { useCallback, useState } from "react";
import { DownloadCloud } from "lucide-react";

interface StoredFile {
  id: string;
  name: string;
  compressed: Blob;
}

async function compressFile(file: File): Promise<Blob> {
  if ("CompressionStream" in window) {
    const stream = file.stream().pipeThrough(
      new CompressionStream("gzip")
    );
    return await new Response(stream).blob();
  }
  return file;
}

async function decompressBlob(blob: Blob): Promise<Blob> {
  if ("DecompressionStream" in window) {
    const stream = blob.stream().pipeThrough(
      new DecompressionStream("gzip")
    );
    return await new Response(stream).blob();
  }
  return blob;
}

export function ZenTransferModule() {
  const [files, setFiles] = useState<StoredFile[]>([]);

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file || file.type !== "video/mp4") return;
    const compressed = await compressFile(file);
    setFiles((prev) => [
      ...prev,
      { id: `${file.name}-${Date.now()}`, name: file.name, compressed },
    ]);
  }, []);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    void handleFiles(e.dataTransfer.files);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    void handleFiles(e.target.files);
  };

  const download = async (f: StoredFile) => {
    const blob = await decompressBlob(f.compressed);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = f.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-900/60 text-purple-100"
      >
        <p className="mb-4 text-lg">Drop an MP4 here</p>
        <input
          id="zen-transfer-input"
          type="file"
          accept="video/mp4"
          onChange={onInputChange}
          className="hidden"
        />
        <label
          htmlFor="zen-transfer-input"
          className="cursor-pointer px-4 py-2 rounded bg-purple-600 hover:bg-purple-500"
        >
          Select File
        </label>
      </div>
      <div className="space-y-4">
        {files.length === 0 && (
          <p className="text-purple-200">No files uploaded yet.</p>
        )}
        {files.map((f) => (
          <div
            key={f.id}
            className="flex items-center justify-between bg-purple-100/10 border border-purple-300/20 rounded p-3"
          >
            <span className="truncate pr-4">{f.name}</span>
            <button
              onClick={() => {
                void download(f);
              }}
              className="flex items-center gap-1 px-3 py-1 rounded bg-purple-600 text-white hover:bg-purple-500"
            >
              <DownloadCloud className="w-4 h-4" />
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


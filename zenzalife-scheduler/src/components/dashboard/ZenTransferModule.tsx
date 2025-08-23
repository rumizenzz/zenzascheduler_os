import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { deflate, inflate } from 'pako';
import { toast } from 'react-hot-toast';

interface StoredFile {
  name: string;
  path: string;
  type: string;
}

const bucket = 'zen-transfer';

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'mp4':
      return 'video/mp4';
    case 'mp3':
      return 'audio/mpeg';
    default:
      return 'application/octet-stream';
  }
}

export function ZenTransferModule() {
  const [files, setFiles] = useState<StoredFile[]>([]);

  const ensureBucket = useCallback(async () => {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      if (buckets && !buckets.find((b) => b.name === bucket)) {
        await supabase.storage.createBucket(bucket, { public: false });
      }
    } catch (error) {
      console.error('Bucket check failed', error);
    }
  }, []);

  const fetchFiles = useCallback(async () => {
    const { data, error } = await supabase.storage.from(bucket).list();
    if (error) {
      console.error('List error', error);
      return;
    }
    const listed =
      data?.filter((item) => item.name.endsWith('.gz')).map((item) => {
        const original = item.name.replace(/^[0-9]+_/, '').replace(/\.gz$/, '');
        return {
          name: original,
          path: item.name,
          type: getMimeType(original),
        } as StoredFile;
      }) || [];
    setFiles(listed);
  }, []);

  useEffect(() => {
    void ensureBucket();
    void fetchFiles();
  }, [ensureBucket, fetchFiles]);

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const compressed = deflate(new Uint8Array(arrayBuffer));
      const filePath = `${Date.now()}_${file.name}.gz`;
      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, compressed, { contentType: 'application/gzip' });
      if (error) throw error;
      toast.success('File uploaded');
      await fetchFiles();
    } catch (err: any) {
      console.error(err);
      toast.error('Upload failed');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDownload = async (file: StoredFile) => {
    const { data, error } = await supabase.storage.from(bucket).download(file.path);
    if (error || !data) {
      toast.error('Download failed');
      return;
    }
    const arrayBuffer = await data.arrayBuffer();
    const decompressed = inflate(new Uint8Array(arrayBuffer));
    const blob = new Blob([decompressed], { type: file.type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 text-white">
      <div
        className="flex-1 border-2 border-dashed border-purple-400 rounded-lg p-8 flex items-center justify-center harold-sky"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <p className="text-center text-purple-200">
          Drop files here to upload to ZenTransfer
        </p>
      </div>
      <div className="md:w-64 w-full bg-indigo-950/60 rounded-lg p-4 overflow-y-auto">
        <h2 className="text-sm font-semibold mb-2 text-purple-200">Files</h2>
        <ul className="space-y-2">
          {files.map((file) => (
            <li key={file.path} className="flex items-center justify-between text-xs">
              <span className="truncate">{file.name}</span>
              <button
                onClick={() => void handleDownload(file)}
                className="text-cyan-400 hover:underline"
              >
                Download
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

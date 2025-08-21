import React, { useState, type DragEvent, type ChangeEvent } from "react";

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
}

const FileUploader: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    handleFiles(Array.from(event.target.files));
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFiles(Array.from(event.dataTransfer.files));
  };

  const handleFiles = (incomingFiles: File[]) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const validFiles = incomingFiles.filter(
      (file) => allowedTypes.includes(file.type) && file.size <= maxSize
    );

    const newFiles = validFiles.map((file) => ({
      id: `${file.name}-${Date.now()}`,
      file,
      preview: file.type.startsWith("image") ? URL.createObjectURL(file) : undefined,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Upload Box */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition"
      >
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="fileInput"
        />
        <label htmlFor="fileInput" className="text-blue-600 cursor-pointer">
          Choose File
        </label>
        <p className="text-gray-500 text-sm">or drag and drop to upload</p>
        <p className="text-xs text-gray-400">PDF, JPG, JPEG, or PNG (max. 10 MB)</p>
      </div>

      {/* File Previews */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {files.map(({ id, file, preview }) => (
            <div
              key={id}
              className="relative w-32 h-32 border rounded-lg flex items-center justify-center shadow-sm"
            >
              {file.type === "application/pdf" ? (
                <img
                  src="https://cdn-icons-png.flaticon.com/512/337/337946.png"
                  alt="PDF"
                  className="w-12 h-12"
                />
              ) : (
                <img
                  src={preview}
                  alt={file.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              )}
              <button
                onClick={() => removeFile(id)}
                className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1 hover:bg-red-600"
              >
                ✕
              </button>
              <p className="absolute bottom-1 text-xs text-center px-1 truncate w-full">
                {file.name}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Submit / Update Button */}
      {files.length > 0 ? (
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
          Update Report
        </button>
      ) : (
        <button
          disabled
          className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
        >
          Submit Report
        </button>
      )}
    </div>
  );
};

export default FileUploader;

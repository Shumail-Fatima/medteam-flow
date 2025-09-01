import React, { useCallback, useMemo, useRef, useState, useImperativeHandle, forwardRef } from "react";
import axios, { type AxiosProgressEvent } from "axios";
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  LinearProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Container,
} from "@mui/material";
import {
  CloudUpload,
  Close,
  PictureAsPdf,
  CheckCircle,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

// ---- Config ---------------------------------------------------------------
import { API_BASE_URL } from '../constants/constants';
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ACCEPTED = ["application/pdf", "image/jpeg", "image/png"] as const;

// ---- Styled Components ---------------------------------------------------
const DropzoneContainer = styled(Paper)(({ theme }) => ({
  border: `2px dashed ${theme.palette.grey[300]}`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(6),
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",
  backgroundColor: theme.palette.grey[50],
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + "08",
  },
  "&:focus": {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: "2px",
  },
}));

const FilePreviewCard = styled(Card)(({ theme }) => ({
  position: "relative",
  width: 160,
  height: 160,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  transition: "transform 0.2s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[4],
  },
}));

const RemoveButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: -8,
  right: -8,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.grey[300]}`,
  width: 24,
  height: 24,
  zIndex: 1,
  "&:hover": {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  },
}));

const ProgressOverlay = styled(Box)({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: 4,
});

// ---- Types ----------------------------------------------------------------
interface UploadCandidate {
  id: string; // stable per selected file
  file: File;
  preview?: string; // for images only
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface UploadRecord {
  id?: number | string;
  name: string;
  type: string;
  size: number;
  createdAt: string; // ISO
  contentBase64: string; // base64 without data: prefix
}

// ---- Utilities ------------------------------------------------------------
const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const commaIdx = result.indexOf(",");
      resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const isAcceptedType = (type: string) => ACCEPTED.includes(type as (typeof ACCEPTED)[number]);

const prettyBytes = (n: number) => {
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};


async function uploadWithFormData(
  file: File,
  onUploadProgress?: (e: AxiosProgressEvent) => void
) {
  const form = new FormData();
  form.append("file", file);

  const { data } = await axios.post(`${API_BASE_URL}/uploads`, form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
  return data; // contains {id, name, type, size, path, createdAt}
}

// ---- Component ------------------------------------------------------------
export type FileUploaderHandle = {
  uploadAll: () => Promise<string[]>;
  clear: () => void;
};

const FileUploaderMockJSON = (
  { onUploaded }: { onUploaded?: (ids: string[]) => void },
  ref: React.Ref<FileUploaderHandle>
) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<UploadCandidate[]>([]);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState<Record<string, number>>({}); // per-file 0-100
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadedIds, setUploadedIds] = useState<string[]>([]);


  const totalProgress = useMemo(() => {
    if (!files.length) return 0;
    const sum = files.reduce((acc, f) => acc + (progress[f.id] ?? 0), 0);
    return Math.round(sum / files.length);
  }, [files, progress]);

  const openFilePicker = () => inputRef.current?.click();

  const onFilesChosen = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list);
    addFiles(incoming);
    if (inputRef.current) inputRef.current.value = ""; // allow re-selecting same files
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    addFiles(Array.from(e.dataTransfer.files));
  };

  const addFiles = (incoming: File[]) => {
    const accepted: UploadCandidate[] = [];
    const problems: string[] = [];

    // Deduplicate by name+size+lastModified
    const already = new Set(files.map((f) => `${f.file.name}|${f.file.size}|${f.file.lastModified}`));

    for (const f of incoming) {
      const key = `${f.name}|${f.size}|${f.lastModified}`;
      if (already.has(key)) continue;
      if (!isAcceptedType(f.type)) {
        problems.push(`${f.name}: unsupported type ${f.type || "(unknown)"}`);
        continue;
      }
      if (f.size > MAX_SIZE_BYTES) {
        problems.push(`${f.name}: exceeds ${prettyBytes(MAX_SIZE_BYTES)}`);
        continue;
      }
      accepted.push({
        id: `${f.name}-${f.size}-${f.lastModified}`,
        file: f,
        preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
      });
    }

    if (problems.length) setErrorMsg(problems.join("\n"));
    setFiles((prev) => [...prev, ...accepted]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setProgress((p) => {
      const { [id]: _omit, ...rest } = p;
      return rest;
    });
  };

  const prevent = (e: React.DragEvent) => e.preventDefault();

  const uploadAll = useCallback(async (): Promise<string[]> => {
    if (!files.length) return [];
    setStatus("uploading");
    setErrorMsg(null);
    try {
      const ids: string[] = [];
      for (const f of files) {
        setProgress((p) => ({ ...p, [f.id]: 0 }));
        const uploaded = await uploadWithFormData(f.file, (evt) => {
          const percent = evt.total ? Math.round((evt.loaded * 100) / evt.total) : 0;
          setProgress((p) => ({ ...p, [f.id]: percent }));
        });
        ids.push(uploaded.id);
        setProgress((p) => ({ ...p, [f.id]: 100 }));
      }
      setUploadedIds(ids);
      onUploaded?.(ids);
      setStatus("success");
      return ids;
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Upload failed");
      throw err;
    }
  }, [files, onUploaded]);

  const clear = useCallback(() => {
    setFiles([]);
    setProgress({});
    setUploadedIds([]);
    setStatus("idle");
    setErrorMsg(null);
  }, []);

  useImperativeHandle(ref, () => ({ uploadAll, clear }), [uploadAll, clear]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box component="div">
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Upload Reports
        </Typography>

        {/* Dropzone */}
        <DropzoneContainer
          elevation={0}
          onDragEnter={prevent}
          onDragOver={prevent}
          onDrop={onDrop}
          onClick={openFilePicker}
          role="button"
          aria-label="File upload dropzone"
          tabIndex={0}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            onChange={(e) => onFilesChosen(e.target.files)}
            style={{ display: "none" }}
          />
          
          <CloudUpload sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          
          <Typography variant="h6" color="primary" gutterBottom>
            Choose File
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            or drag and drop to upload
          </Typography>
          
          <Typography variant="caption" color="text.disabled">
            PDF, JPG, JPEG, or PNG (max. 10 MB)
          </Typography>
        </DropzoneContainer>

        {/* Errors */}
        {errorMsg && (
          <Alert 
            severity="error" 
            sx={{ mt: 2 }}
            icon={<ErrorIcon />}
          >
            <Typography variant="body2" component="pre" sx={{ whiteSpace: "pre-line" }}>
              {errorMsg}
            </Typography>
          </Alert>
        )}

        {/* File Previews */}
        {files.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", gap: 2 }}>
              {files.map(({ id, file, preview }) => (
                <FilePreviewCard key={id} elevation={2}>
                  <RemoveButton
                    size="small"
                    onClick={() => removeFile(id)}
                    aria-label={`Remove ${file.name}`}
                  >
                    <Close fontSize="small" />
                  </RemoveButton>

                  {file.type === "application/pdf" ? (
                    <CardContent sx={{ 
                      display: "flex", 
                      flexDirection: "column", 
                      alignItems: "center", 
                      justifyContent: "center",
                      height: "100%",
                      textAlign: "center"
                    }}>
                      <PictureAsPdf sx={{ fontSize: 40, color: "error.main", mb: 1 }} />
                      <Typography variant="caption" fontWeight="medium">
                        PDF
                      </Typography>
                      <Chip 
                        label={prettyBytes(file.size)} 
                        size="small" 
                        variant="outlined"
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  ) : (
                    <CardMedia
                      component="img"
                      image={preview}
                      alt={file.name}
                      sx={{ 
                        height: 120,
                        objectFit: "cover"
                      }}
                    />
                  )}

                  <Box sx={{ 
                    position: "absolute", 
                    bottom: 0, 
                    left: 0, 
                    right: 0,
                    bgcolor: "rgba(255, 255, 255, 0.9)",
                    p: 0.5
                  }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {file.name}
                    </Typography>
                  </Box>

                  {status === "uploading" && (
                    <ProgressOverlay>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress[id] ?? 0}
                        sx={{ height: 4 }}
                      />
                    </ProgressOverlay>
                  )}
                </FilePreviewCard>
              ))}
            </Stack>
          </Box>
        )}

        {/* Submit Section */}
        <Box sx={{ mt: 4, display: "flex", alignItems: "center", gap: 2 }}>
          <Button disabled startIcon={<CloudUpload />} sx={{ borderRadius: 2, textTransform: "none", px: 3, py: 1 }}>
            Upload on Save
          </Button>

          {status === "success" && (
            <Alert 
              severity="success" 
              variant="outlined"
              icon={<CheckCircle />}
              sx={{ py: 0 }}
            >
              Uploaded successfully
            </Alert>
          )}
          
          {status === "error" && (
            <Alert 
              severity="error" 
              variant="outlined"
              icon={<ErrorIcon />}
              sx={{ py: 0 }}
            >
              Upload failed. {errorMsg || "Try again."}
            </Alert>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default forwardRef<FileUploaderHandle, { onUploaded?: (ids: string[]) => void }>(FileUploaderMockJSON);
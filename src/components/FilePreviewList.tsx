// components/FilePreviewList.tsx
import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Chip,
} from "@mui/material";
import { PictureAsPdf } from "@mui/icons-material";
import { API_BASE_URL } from "../constants/constants";

interface FilePreviewListProps {
  files: { id: string; name?: string; type?: string; size?: number }[];
}

const prettyBytes = (n: number) => {
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

const FilePreviewList: React.FC<FilePreviewListProps> = ({ files }) => {
  if (!files || files.length === 0) {
    return <Typography color="text.secondary">No files uploaded.</Typography>;
  }

  return (
    <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 2 }}>
      {files.map((file) => (
        <Card key={file.id} sx={{ width: 160, height: 160, position: "relative" }}>
          {file.type?.startsWith("image/") ? (
            <CardMedia
              component="img"
              image={`${API_BASE_URL}/uploads/${file.id}`} // adjust depending on your backend
              alt={file.name}
              sx={{ height: 120, objectFit: "cover" }}
            />
          ) : (
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <PictureAsPdf sx={{ fontSize: 40, color: "error.main", mb: 1 }} />
              <Typography variant="caption">{file.name || "PDF"}</Typography>
              {file.size && (
                <Chip label={prettyBytes(file.size)} size="small" variant="outlined" sx={{ mt: 1 }} />
              )}
            </CardContent>
          )}
        </Card>
      ))}
    </Stack>
  );
};

export default FilePreviewList;

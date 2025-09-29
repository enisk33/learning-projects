/**
 * File Upload Component
 */

'use client';

import { Button, Text } from '@mantine/core';
import { FileButton } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';

interface FileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export function FileUpload({ file, onFileChange }: FileUploadProps) {
  return (
    <div>
      <Text className="text-sm font-medium text-gray-700 mb-2">Medya Dosyası</Text>
      <FileButton onChange={onFileChange} accept="image/*,video/*">
        {(props) => (
          <Button
            {...props}
            className="!w-full !h-32 !border-2 !border-dashed !border-border hover:!border-primary-400 hover:!bg-primary-50 rounded-xl transition-colors flex flex-col items-center justify-center gap-2 !bg-transparent !p-0 !m-0"
          >
            {file ? (
              <>
                <IconUpload size={24} className="text-primary-600" />
                <span className="text-sm font-medium text-primary-600">{file.name}</span>
                <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </>
            ) : (
              <>
                <IconUpload size={24} className="text-gray-400" />
                <span className="text-sm text-gray-600">Dosya seç veya sürükle</span>
              </>
            )}
          </Button>
        )}
      </FileButton>
    </div>
  );
}

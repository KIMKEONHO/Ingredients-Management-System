'use client';

import { useState, useRef, useCallback } from 'react';

interface ImageUploadProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  placeholder?: string;
  className?: string;
}

export default function ImageUpload({ 
  value, 
  onChange, 
  placeholder = "이미지를 드래그하거나 클릭하여 업로드하세요",
  className = ""
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 처리 함수
  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB 제한
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setIsUploading(true);

    try {
      // 실제 환경에서는 여기서 파일을 서버에 업로드하고 URL을 받아옵니다
      // 현재는 로컬에서 미리보기용으로만 처리
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onChange(result);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      alert('파일 업로드에 실패했습니다.');
      setIsUploading(false);
    }
  }, [onChange]);

  // 드래그 이벤트 핸들러
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  // 클릭으로 파일 선택
  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 파일 입력 변경
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  // 이미지 제거
  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  }, [onChange]);

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${isDragging 
            ? 'border-green-500 bg-green-50' 
            : value 
              ? 'border-green-300 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {value ? (
          <div className="space-y-2">
            <div className="relative inline-block">
              <img
                src={value}
                alt="업로드된 이미지"
                className="max-h-32 max-w-full rounded-lg shadow-sm"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
            <p className="text-xs text-gray-600">이미지를 클릭하거나 드래그하여 변경</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-center">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center text-xl transition-colors
                ${isDragging ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}
              `}>
                📷
              </div>
            </div>
            <div>
              <p className={`text-sm font-medium ${isDragging ? 'text-green-600' : 'text-gray-700'}`}>
                {isUploading ? '업로드 중...' : placeholder}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF 파일만 지원 (최대 5MB)
              </p>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              <span className="text-sm text-gray-600">업로드 중...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

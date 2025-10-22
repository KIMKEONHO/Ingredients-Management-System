'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onCrop: (croppedImageUrl: string, croppedFile: File) => void;
  aspectRatio?: number;
  title?: string;
}

export default function ImageCropModal({
  isOpen,
  imageUrl,
  onClose,
  onCrop,
  aspectRatio = 16 / 9,
  title = "이미지 크롭"
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isProcessing, setIsProcessing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // 이미지 로드 시 중앙 크롭 영역 설정
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspectRatio,
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  }, [aspectRatio]);

  // 크롭된 이미지를 캔버스에 그리기
  const drawCroppedImage = useCallback((
    image: HTMLImageElement,
    canvas: HTMLCanvasElement,
    crop: PixelCrop
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio;

    canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      Math.floor(crop.x * scaleX),
      Math.floor(crop.y * scaleY),
      Math.floor(crop.width * scaleX),
      Math.floor(crop.height * scaleY),
      0,
      0,
      Math.floor(crop.width * scaleX),
      Math.floor(crop.height * scaleY)
    );
  }, []);

  // 크롭 완료 처리
  const handleCropComplete = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      return;
    }

    setIsProcessing(true);

    try {
      // 크롭된 이미지를 캔버스에 그리기
      drawCroppedImage(imgRef.current, previewCanvasRef.current, completedCrop);

      // 캔버스를 Blob으로 변환
      previewCanvasRef.current.toBlob((blob) => {
        if (blob) {
          const croppedImageUrl = URL.createObjectURL(blob);
          const croppedFile = new File([blob], 'cropped-image.jpg', {
            type: 'image/jpeg',
          });
          
          onCrop(croppedImageUrl, croppedFile);
          onClose();
        }
        setIsProcessing(false);
      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error('이미지 크롭 처리 실패:', error);
      alert('이미지 크롭에 실패했습니다.');
      setIsProcessing(false);
    }
  }, [completedCrop, drawCroppedImage, onCrop, onClose]);

  // ESC 키로 모달 닫기
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // 모달이 열릴 때 키보드 이벤트 리스너 추가 및 body 스크롤 제어
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 크롭 영역 */}
        <div className="p-4">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              권장 비율: {aspectRatio === 16/9 ? '16:9 (와이드)' : aspectRatio === 4/3 ? '4:3 (표준)' : `${aspectRatio.toFixed(2)}:1`}
            </p>
            <p className="text-xs text-gray-500">
              드래그하여 크롭 영역을 조정하세요. 모서리를 드래그하여 크기를 변경할 수 있습니다.
            </p>
          </div>

          <div className="relative max-h-96 overflow-auto">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              className="max-w-full"
            >
              <img
                ref={imgRef}
                alt="크롭할 이미지"
                src={imageUrl}
                onLoad={onImageLoad}
                className="max-w-full h-auto"
              />
            </ReactCrop>
          </div>

          {/* 숨겨진 캔버스 */}
          <canvas
            ref={previewCanvasRef}
            style={{ display: 'none' }}
          />
        </div>

        {/* 버튼 영역 */}
        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleCropComplete}
            disabled={!completedCrop || isProcessing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                처리 중...
              </>
            ) : (
              '크롭 적용'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}




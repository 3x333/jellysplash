import { useRef } from 'react';
import type { ImageItem } from '../types';

interface ImageUploaderProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const incoming = Array.from(files).filter((f) => f.type.startsWith('image/'));

    const promises = incoming.map(
      (file) =>
        new Promise<ImageItem>((resolve) => {
          const url = URL.createObjectURL(file);
          const img = new Image();
          img.onload = () => resolve({ img, name: file.name, url });
          img.src = url;
        }),
    );

    Promise.all(promises).then((newItems) => {
      onChange([...images, ...newItems]);
    });
  };

  return (
    <div
      className="upload-zone"
      onClick={() => inputRef.current?.click()}
      onDrop={(e) => {
        e.preventDefault();
        loadFiles(e.dataTransfer.files);
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => loadFiles(e.target.files)}
      />
      {images.length === 0 ? (
        <p>Drop images here or click to browse</p>
      ) : (
        <p>
          {images.length} image{images.length !== 1 ? 's' : ''} loaded
        </p>
      )}
    </div>
  );
}

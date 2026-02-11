'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  label?: string;
  aspectRatio?: 'square' | 'video' | 'cover';
  maxSizeMB?: number;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  label = 'Upload immagine',
  aspectRatio = 'square',
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    cover: 'aspect-[21/9]',
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validazione tipo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Errore',
        description: 'Il file deve essere un\'immagine',
        variant: 'destructive',
      });
      return;
    }

    // Validazione dimensione
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast({
        title: 'Errore',
        description: `L'immagine non può superare ${maxSizeMB}MB`,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Crea preview locale
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload su servizio esterno (esempio con uploadthing, cloudinary, etc.)
      // Per ora usiamo base64 (non raccomandato per produzione)
      const base64 = await convertToBase64(file);
      onChange(base64);

      toast({
        title: 'Successo',
        description: 'Immagine caricata correttamente',
      });
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Errore durante il caricamento',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      {preview ? (
        <div className={`relative ${aspectClasses[aspectRatio]} w-full rounded-lg overflow-hidden border border-border group`}>
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
            >
              <X className="h-4 w-4 mr-1" />
              Rimuovi
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-1" />
              Cambia
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`${aspectClasses[aspectRatio]} w-full rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground group`}
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <>
              <ImageIcon className="h-8 w-8 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{label}</span>
              <span className="text-xs">Max {maxSizeMB}MB</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

interface MultiImageUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  label?: string;
}

export function MultiImageUpload({
  values = [],
  onChange,
  maxImages = 10,
  label = 'Aggiungi foto',
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (values.length + files.length > maxImages) {
      toast({
        title: 'Errore',
        description: `Puoi caricare massimo ${maxImages} immagini`,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const newImages: string[] = [];
      
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > 5) continue;

        const base64 = await convertToBase64(file);
        newImages.push(base64);
      }

      onChange([...values, ...newImages]);

      toast({
        title: 'Successo',
        description: `${newImages.length} ${newImages.length === 1 ? 'immagine caricata' : 'immagini caricate'}`,
      });
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Errore durante il caricamento',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleRemove = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {values.map((url, index) => (
          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
            <Image
              src={url}
              alt={`Gallery ${index + 1}`}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {values.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <Upload className="h-6 w-6" />
                <span className="text-xs text-center px-2">{label}</span>
              </>
            )}
          </button>
        )}
      </div>

      {values.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {values.length} / {maxImages} immagini
        </p>
      )}
    </div>
  );
}

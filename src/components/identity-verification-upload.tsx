'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileImage, AlertCircle, CheckCircle2, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type DocumentType = 'ID_CARD' | 'PASSPORT' | 'DRIVER_LICENSE';

interface UploadedFile {
  file: File;
  preview: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function IdentityVerificationUpload() {
  const { toast } = useToast();
  const [documentType, setDocumentType] = useState<DocumentType>('ID_CARD');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentFront, setDocumentFront] = useState<UploadedFile | null>(null);
  const [documentBack, setDocumentBack] = useState<UploadedFile | null>(null);
  const [selfie, setSelfie] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Formato file non valido. Usa JPG, PNG o WebP.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File troppo grande. Massimo 5MB.';
    }
    return null;
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (file: UploadedFile | null) => void,
    fieldName: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setErrors((prev) => [...prev, `${fieldName}: ${error}`]);
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: error,
      });
      return;
    }

    setErrors([]);
    const reader = new FileReader();
    reader.onloadend = () => {
      setter({
        file,
        preview: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const validationErrors: string[] = [];
    if (!documentFront) validationErrors.push('Carica il fronte del documento');
    if (documentType === 'ID_CARD' && !documentBack) {
      validationErrors.push('Carica il retro della carta d\'identità');
    }
    if (!selfie) validationErrors.push('Carica un selfie');

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsUploading(true);
    setErrors([]);

    try {
      const formData = new FormData();
      formData.append('documentType', documentType);
      if (documentNumber) formData.append('documentNumber', documentNumber);
      formData.append('documentFront', documentFront!.file);
      if (documentBack) formData.append('documentBack', documentBack.file);
      formData.append('selfie', selfie!.file);

      const response = await fetch('/api/identity/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle rate limiting specifically
        if (response.status === 429) {
          const resetDate = data.resetAt ? new Date(data.resetAt).toLocaleString('it-IT') : 'presto';
          throw new Error(
            data.error || `Troppi tentativi. Riprova il ${resetDate}`
          );
        }
        throw new Error(data.error || 'Errore durante l\'upload');
      }

      toast({
        title: '✅ Richiesta inviata con successo',
        description: 'I tuoi documenti sono in fase di revisione. Riceverai una email quando il processo sarà completato.',
        duration: 6000,
      });

      // Reset form
      setDocumentFront(null);
      setDocumentBack(null);
      setSelfie(null);
      setDocumentNumber('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: error.message,
      });
      setErrors([error.message]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Document Type Selection */}
      <Card className="border-white/10 bg-zinc-900/50 p-6">
        <Label className="text-lg font-semibold text-white">Tipo di Documento</Label>
        <RadioGroup
          value={documentType}
          onValueChange={(value: string) => setDocumentType(value as DocumentType)}
          className="mt-4 space-y-3"
        >
          <div className="flex items-center space-x-3 rounded-lg border border-white/10 bg-zinc-800/50 p-4">
            <RadioGroupItem value="ID_CARD" id="id-card" />
            <Label htmlFor="id-card" className="flex-1 cursor-pointer text-white">
              Carta d&apos;Identità
            </Label>
          </div>
          <div className="flex items-center space-x-3 rounded-lg border border-white/10 bg-zinc-800/50 p-4">
            <RadioGroupItem value="PASSPORT" id="passport" />
            <Label htmlFor="passport" className="flex-1 cursor-pointer text-white">
              Passaporto
            </Label>
          </div>
          <div className="flex items-center space-x-3 rounded-lg border border-white/10 bg-zinc-800/50 p-4">
            <RadioGroupItem value="DRIVER_LICENSE" id="license" />
            <Label htmlFor="license" className="flex-1 cursor-pointer text-white">
              Patente di Guida
            </Label>
          </div>
        </RadioGroup>
      </Card>

      {/* Document Number (Optional) */}
      <Card className="border-white/10 bg-zinc-900/50 p-6">
        <Label htmlFor="doc-number" className="text-white">
          Numero Documento (Opzionale)
        </Label>
        <input
          id="doc-number"
          type="text"
          value={documentNumber}
          onChange={(e) => setDocumentNumber(e.target.value)}
          className="mt-2 w-full rounded-lg border border-white/10 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-400 focus:border-blue-500 focus:outline-none"
          placeholder="ES123456789"
        />
      </Card>

      {/* Document Front */}
      <Card className="border-white/10 bg-zinc-900/50 p-6">
        <Label className="text-white">Fronte Documento *</Label>
        <div className="mt-4">
          {documentFront ? (
            <div className="relative">
              <img
                src={documentFront.preview}
                alt="Fronte"
                className="h-48 w-full rounded-lg object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute right-2 top-2"
                onClick={() => setDocumentFront(null)}
              >
                Rimuovi
              </Button>
            </div>
          ) : (
            <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/20 bg-zinc-800/50 transition hover:border-blue-500 hover:bg-zinc-800">
              <Upload className="mb-2 h-8 w-8 text-zinc-400" />
              <span className="text-sm text-zinc-400">Clicca per caricare</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, setDocumentFront, 'Fronte documento')}
              />
            </label>
          )}
        </div>
      </Card>

      {/* Document Back (only for ID_CARD) */}
      {documentType === 'ID_CARD' && (
        <Card className="border-white/10 bg-zinc-900/50 p-6">
          <Label className="text-white">Retro Documento *</Label>
          <div className="mt-4">
            {documentBack ? (
              <div className="relative">
                <img
                  src={documentBack.preview}
                  alt="Retro"
                  className="h-48 w-full rounded-lg object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={() => setDocumentBack(null)}
                >
                  Rimuovi
                </Button>
              </div>
            ) : (
              <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/20 bg-zinc-800/50 transition hover:border-blue-500 hover:bg-zinc-800">
                <Upload className="mb-2 h-8 w-8 text-zinc-400" />
                <span className="text-sm text-zinc-400">Clicca per caricare</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, setDocumentBack, 'Retro documento')}
                />
              </label>
            )}
          </div>
        </Card>
      )}

      {/* Selfie */}
      <Card className="border-white/10 bg-zinc-900/50 p-6">
        <Label className="text-white">Selfie con Documento *</Label>
        <p className="mt-1 text-sm text-zinc-400">
          Scatta un selfie tenendo il documento accanto al viso
        </p>
        <div className="mt-4">
          {selfie ? (
            <div className="relative">
              <img
                src={selfie.preview}
                alt="Selfie"
                className="h-48 w-full rounded-lg object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute right-2 top-2"
                onClick={() => setSelfie(null)}
              >
                Rimuovi
              </Button>
            </div>
          ) : (
            <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/20 bg-zinc-800/50 transition hover:border-blue-500 hover:bg-zinc-800">
              <Camera className="mb-2 h-8 w-8 text-zinc-400" />
              <span className="text-sm text-zinc-400">Clicca per scattare/caricare</span>
              <input
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={(e) => handleFileSelect(e, setSelfie, 'Selfie')}
              />
            </label>
          )}
        </div>
      </Card>

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc pl-4">
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={isUploading}
        className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500"
      >
        {isUploading ? 'Invio in corso...' : 'Invia Documenti'}
      </Button>

      {/* Privacy Note */}
      <Alert className="border-white/10 bg-zinc-900/50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm text-zinc-400">
          I tuoi documenti saranno trattati in conformità al GDPR e visualizzati solo dal team di verifica.
          Saranno eliminati dopo 90 giorni dall&apos;approvazione.
        </AlertDescription>
      </Alert>
    </form>
  );
}

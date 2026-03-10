import { useRef, useState } from "react";
import { useVehicleImages, useUploadVehicleImage, useDeleteVehicleImage, VehicleImage } from "@/hooks/useVehicleImages";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  vehicleId: string | undefined;
  /** When vehicleId is not yet available (new vehicle), buffer files locally */
  pendingFiles?: File[];
  onPendingFilesChange?: (files: File[]) => void;
}

export function VehiclePhotoUpload({ vehicleId, pendingFiles, onPendingFilesChange }: Props) {
  const { data: images = [], isLoading } = useVehicleImages(vehicleId);
  const upload = useUploadVehicleImage();
  const remove = useDeleteVehicleImage();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // If no vehicleId yet, buffer files
    if (!vehicleId) {
      const arr = Array.from(files);
      onPendingFilesChange?.([...(pendingFiles || []), ...arr]);
      return;
    }

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 10 * 1024 * 1024) {
          toast({ title: "Arquivo muito grande", description: "Máximo 10MB por foto", variant: "destructive" });
          continue;
        }
        await upload.mutateAsync({ vehicleId, file, position: images.length + i });
      }
      toast({ title: "📸 Fotos enviadas!" });
    } catch (err: any) {
      toast({ title: "Erro ao enviar foto", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async (img: VehicleImage) => {
    try {
      await remove.mutateAsync({ id: img.id, storagePath: img.storage_path });
      toast({ title: "Foto removida" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleRemovePending = (index: number) => {
    if (!pendingFiles || !onPendingFilesChange) return;
    onPendingFilesChange(pendingFiles.filter((_, i) => i !== index));
  };

  const allImages = images;
  const hasPending = pendingFiles && pendingFiles.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Existing images */}
        {allImages.map(img => (
          <div key={img.id} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-border">
            <img src={img.url} alt="Foto do veículo" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(img)}
              className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Pending files (not yet uploaded) */}
        {hasPending && pendingFiles!.map((file, i) => (
          <div key={`pending-${i}`} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-dashed border-primary/40">
            <img src={URL.createObjectURL(file)} alt="Pendente" className="w-full h-full object-cover opacity-70" />
            <button
              type="button"
              onClick={() => handleRemovePending(i)}
              className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-[9px] text-primary-foreground text-center py-0.5">
              Pendente
            </div>
          </div>
        ))}

        {/* Upload button */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-20 h-20 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : (
            <>
              <ImagePlus className="w-5 h-5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Adicionar</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  );
}

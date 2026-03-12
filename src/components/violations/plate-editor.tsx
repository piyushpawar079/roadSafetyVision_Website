// ===========================================
// LICENSE PLATE EDITOR COMPONENT (Admin Only)
// ===========================================

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useApi } from '@/hooks/use-api';
import { toast } from 'sonner';
import { Edit, Loader2, Check } from 'lucide-react';

interface PlateEditorProps {
  violationId: string;
  currentPlate: string;
  onUpdate?: () => void;
}

export function PlateEditor({
  violationId,
  currentPlate,
  onUpdate,
}: PlateEditorProps) {
  const [open, setOpen] = useState(false);
  const [plate, setPlate] = useState(currentPlate);
  const { execute, loading } = useApi();

  const handleSubmit = async () => {
    if (!plate.trim()) {
      toast.error('Please enter a license plate number');
      return;
    }

    const result = await execute(`/api/violations/${violationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ license_plate: plate.toUpperCase() }),
    });

    if (result?.success) {
      toast.success('License plate updated successfully');
      if ((result.data as any)?.notification_sent) {
        toast.info('Notification sent to vehicle owner');
      }
      setOpen(false);
      onUpdate?.();
    } else {
      toast.error(result?.message || 'Failed to update license plate');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="mr-2 h-4 w-4" />
          Edit Plate
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit License Plate</DialogTitle>
          <DialogDescription>
            Correct the license plate number if the OCR result is incorrect.
            If the corrected plate matches a registered vehicle, the owner will
            be notified automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="current-plate">Current Plate</Label>
            <Input
              id="current-plate"
              value={currentPlate}
              disabled
              className="font-mono bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-plate">Corrected Plate</Label>
            <Input
              id="new-plate"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              placeholder="Enter correct plate number"
              className="font-mono text-lg tracking-wider"
            />
            <p className="text-xs text-muted-foreground">
              Enter the plate number without spaces (e.g., MH12AB1234)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || plate === currentPlate}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Update Plate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
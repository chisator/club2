"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { exportRoutine } from "@/app/actions/trainer-actions"

interface ExportDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  routineId?: string
}

export function ExportImportDialog({
  isOpen,
  onOpenChange,
  routineId,
}: ExportDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFormat, setSelectedFormat] = useState<"json" | "csv">("json")

  const handleExport = async () => {
    if (!routineId) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await exportRoutine(routineId, selectedFormat)
      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      // Crear blob y descargar
      const blob = new Blob([result.data!], {
        type: selectedFormat === "json" ? "application/json" : "text/csv",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = result.filename!
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || "Error al exportar")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Descargar Rutina</DialogTitle>
          <DialogDescription>Descarga la rutina en tu formato preferido</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Formato de descarga</Label>
            <div className="flex gap-2">
              <Button
                variant={selectedFormat === "json" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFormat("json")}
              >
                JSON
              </Button>
              <Button
                variant={selectedFormat === "csv" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFormat("csv")}
              >
                CSV
              </Button>
            </div>
          </div>
          {error && <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">{error}</div>}
          <Button onClick={handleExport} disabled={isLoading || !routineId} className="w-full">
            {isLoading ? "Descargando..." : "Descargar Rutina"}
          </Button>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { exportRoutine, importRoutine } from "@/app/actions/trainer-actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ExportImportDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  routineId?: string
  athletes?: any[]
}

export function ExportImportDialog({
  isOpen,
  onOpenChange,
  routineId,
  athletes = [],
}: ExportImportDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFormat, setSelectedFormat] = useState<"json" | "csv">("json")
  const [importFile, setImportFile] = useState<File | null>(null)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

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

  const handleImport = async () => {
    if (!importFile || selectedUserIds.length === 0) {
      setError("Selecciona un archivo y al menos un usuario")
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const fileContent = await importFile.text()
      let routineData

      if (importFile.name.endsWith(".json")) {
        routineData = JSON.parse(fileContent)
      } else if (importFile.name.endsWith(".csv")) {
        // Parse CSV básico
        const lines = fileContent.split("\n")
        const headers = lines[0].split(",").map((h) => h.trim())
        const routineLine = lines[1].split(",")
        routineData = {
          routine: {
            title: routineLine[0]?.replace(/"/g, ""),
            description: routineLine[1]?.replace(/"/g, ""),
            start_date: routineLine[2]?.replace(/"/g, ""),
            end_date: routineLine[3]?.replace(/"/g, ""),
            exercises: [],
          },
        }
      } else {
        setError("Formato de archivo no soportado (JSON o CSV)")
        setIsLoading(false)
        return
      }

      const result = await importRoutine({
        title: routineData.routine.title,
        description: routineData.routine.description || "",
        start_date: routineData.routine.start_date,
        end_date: routineData.routine.end_date,
        exercises: routineData.routine.exercises || [],
        userIds: selectedUserIds,
      })

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      onOpenChange(false)
      window.location.reload()
    } catch (err: any) {
      setError(err.message || "Error al importar")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar / Importar Rutina</DialogTitle>
          <DialogDescription>Descarga o carga rutinas en diferentes formatos</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Exportar</TabsTrigger>
            <TabsTrigger value="import">Importar</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="importFile">Archivo (JSON o CSV)</Label>
              <Input
                id="importFile"
                type="file"
                accept=".json,.csv"
                onChange={(e) => {
                  setImportFile(e.target.files?.[0] || null)
                  setError(null)
                }}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>Asignar a usuarios</Label>
              <div className="grid gap-2 max-h-40 overflow-y-auto">
                {athletes.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No tienes usuarios asignados</p>
                ) : (
                  athletes.map((athlete) => (
                    <label key={athlete.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(athlete.id)}
                        onChange={(e) => {
                          if (e.target.checked)
                            setSelectedUserIds([...selectedUserIds, athlete.id])
                          else setSelectedUserIds(selectedUserIds.filter((id) => id !== athlete.id))
                        }}
                        disabled={isLoading}
                        className="accent-emerald-600"
                      />
                      <span className="text-sm">{athlete.full_name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {error && <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">{error}</div>}
            <Button
              onClick={handleImport}
              disabled={isLoading || !importFile || selectedUserIds.length === 0}
              className="w-full"
            >
              {isLoading ? "Importando..." : "Importar Rutina"}
            </Button>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

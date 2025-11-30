"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { deleteRoutine } from "@/app/actions/trainer-actions"
import { RenewRoutineDialog } from "@/components/renew-routine-dialog"
import { ExportImportDialog } from "@/components/export-import-dialog"

interface TrainerRoutineCardProps {
  routine: any
  isPast?: boolean
}

export function TrainerRoutineCard({ routine, isPast = false }: TrainerRoutineCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showRenewDialog, setShowRenewDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const exercises = Array.isArray(routine.exercises) ? routine.exercises : []

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta rutina? Esta acción no se puede deshacer.")) {
      return
    }
    setIsDeleting(true)
    const result = await deleteRoutine(routine.id)

    if (result.error) {
      alert(result.error)
      setIsDeleting(false)
      return
    }

    // eliminado correctamente
    window.location.reload()
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!menuRef.current) return
      if (e.target instanceof Node && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{routine.title}</CardTitle>
            <CardDescription className="mt-1">
              <Badge variant="outline" className="mr-2">
                {routine.sports?.name}
              </Badge>
              <span className="text-xs">
                {routine.start_date && routine.end_date
                  ? `${formatDate(routine.start_date)} - ${formatDate(routine.end_date)}`
                  : routine.end_date
                    ? formatDate(routine.end_date)
                    : routine.start_date
                      ? formatDate(routine.start_date)
                      : "Sin fecha"}
              </span>
            </CardDescription>
          </div>
          {isPast && (
            <Badge variant="secondary" className="bg-gray-200 dark:bg-gray-700">
              Finalizada
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {routine.description && <p className="text-sm text-muted-foreground mb-4">{routine.description}</p>}

        <div className="space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium">{exercises.length} ejercicios</p>
            <div className="relative">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)} className="text-xs sm:text-sm">
                  {showDetails ? "Ocultar" : "Ver"} detalles
                </Button>
                <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
                  <Link href={`/entrenador/editar-rutina/${routine.id}`}>Editar</Link>
                </Button>

                {/* Three-dots menu trigger */}
                <div ref={menuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setShowMenu((s) => !s)}
                    className="p-2 rounded hover:bg-muted/50 text-sm"
                    aria-label="Más acciones"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="5" r="1.5" />
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="12" cy="19" r="1.5" />
                    </svg>
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-44 rounded-md border bg-popover p-1 shadow-lg z-50">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false)
                          handleDelete()
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-accent/20 rounded"
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Eliminando..." : "Eliminar"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false)
                          setShowRenewDialog(true)
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent/20 rounded"
                        disabled={isDeleting}
                      >
                        Renovar
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false)
                          setShowExportDialog(true)
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent/20 rounded"
                        disabled={isDeleting}
                      >
                        Descargar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {showDetails && exercises.length > 0 && (
            <div className="mt-4 space-y-2 border-t pt-4">
              <p className="text-sm font-semibold">Ejercicios:</p>
              <ul className="space-y-2">
                {exercises.map((exercise: any, index: number) => (
                  <li key={index} className="text-sm bg-muted p-3 rounded-md">
                    <p className="font-medium">{exercise.name}</p>
                    {exercise.sets && <p className="text-muted-foreground">Series: {exercise.sets}</p>}
                    {exercise.reps && <p className="text-muted-foreground">Repeticiones: {exercise.reps}</p>}
                    {exercise.weight && <p className="text-muted-foreground">Peso: {exercise.weight}</p>}
                    {exercise.duration && <p className="text-muted-foreground">Duración: {exercise.duration}</p>}
                    {exercise.notes && <p className="text-muted-foreground mt-1">{exercise.notes}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>

      <RenewRoutineDialog
        isOpen={showRenewDialog}
        onOpenChange={setShowRenewDialog}
        routineId={routine.id}
        currentEndDate={routine.end_date}
      />

      <ExportImportDialog
        isOpen={showExportDialog}
        onOpenChange={setShowExportDialog}
        routineId={routine.id}
      />
    </Card>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImportExercisesDialog } from "@/components/import-exercises-dialog"

interface Exercise {
  name: string
  sets?: string
  reps?: string
  duration?: string
  notes?: string
}

interface CreateRoutineFormProps {
  athletes: any[]
  trainerId: string
}

export function CreateRoutineForm({ athletes, trainerId }: CreateRoutineFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showImportDialog, setShowImportDialog] = useState(false)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [exercises, setExercises] = useState<Exercise[]>([{ name: "", sets: "", reps: "", duration: "", notes: "" }])

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: "", reps: "", duration: "", notes: "" }])
  }

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const updateExercise = (index: number, field: keyof Exercise, value: string) => {
    const newExercises = [...exercises]
    newExercises[index] = { ...newExercises[index], [field]: value }
    setExercises(newExercises)
  }

  const handleImportExercises = (importedExercises: Exercise[]) => {
    // Reemplazar la lista actual de ejercicios con los importados
    // Mantener el primer ejercicio vacío si es que viene vacío, y añadir los importados
    const currentEmpty = exercises.filter((ex) => ex.name.trim() === "")
    if (currentEmpty.length === exercises.length) {
      // Si todos los ejercicios están vacíos, reemplazar completamente
      setExercises(importedExercises)
    } else {
      // Si hay ejercicios, concatenar los importados
      setExercises([...exercises, ...importedExercises])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validar que se seleccionó al menos un usuario
    if (!selectedUserIds || selectedUserIds.length === 0) {
      setError("Debes seleccionar al menos un usuario")
      setIsLoading(false)
      return
    }

    // Validar fechas
    if (!startDate || !endDate) {
      setError("Debes seleccionar fecha de inicio y fin")
      setIsLoading(false)
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("La fecha de inicio no puede ser posterior a la fecha de fin")
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      // Filtrar ejercicios vacíos
      const validExercises = exercises.filter((ex) => ex.name.trim() !== "")

      const { data: inserted, error: insertError } = await supabase
        .from("routines")
        .insert({
          title,
          description,
          trainer_id: trainerId,
          start_date: startDate ? new Date(startDate).toISOString() : null,
          end_date: endDate ? new Date(endDate).toISOString() : null,
          exercises: validExercises,
        })
        .select("id")
        .single()

      if (insertError || !inserted) throw insertError || new Error("No se pudo crear la rutina")

      // Insertar asignaciones múltiples
      const assignments = selectedUserIds.map((uid) => ({ routine_id: inserted.id, user_id: uid }))
      const { error: assignError } = await supabase.from("routine_user_assignments").insert(assignments)
      if (assignError) throw assignError

      router.push("/entrenador")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Error al crear la rutina")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Información de la Rutina</CardTitle>
          <CardDescription>Completa los datos básicos de la rutina</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título de la Rutina</Label>
            <Input
              id="title"
              placeholder="Ej: Entrenamiento de Resistencia"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe el objetivo de esta rutina..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label>Usuarios Deportistas</Label>
            <div className="grid gap-2">
              {athletes.length === 0 && <p className="text-sm text-muted-foreground">No tienes usuarios asignados</p>}
              {athletes.map((athlete) => (
                <label key={athlete.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(athlete.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedUserIds([...selectedUserIds, athlete.id])
                      else setSelectedUserIds(selectedUserIds.filter((id) => id !== athlete.id))
                    }}
                    className="accent-emerald-600"
                  />
                  <span className="text-sm">{athlete.full_name} ({athlete.email})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Fecha Inicio</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">Fecha Fin</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex-1 min-w-fit">
              <CardTitle>Ejercicios</CardTitle>
              <CardDescription>Agrega los ejercicios de la rutina</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setShowImportDialog(true)}>
                Importar Ejercicios
              </Button>
              <Button type="button" variant="outline" onClick={addExercise}>
                Agregar Ejercicio
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {exercises.map((exercise, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Ejercicio {index + 1}</h4>
                {exercises.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeExercise(index)}>
                    Eliminar
                  </Button>
                )}
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor={`exercise-name-${index}`}>Nombre del Ejercicio</Label>
                  <Input
                    id={`exercise-name-${index}`}
                    placeholder="Ej: Sentadillas"
                    value={exercise.name}
                    onChange={(e) => updateExercise(index, "name", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor={`exercise-sets-${index}`}>Series</Label>
                    <Input
                      id={`exercise-sets-${index}`}
                      placeholder="Ej: 3"
                      value={exercise.sets}
                      onChange={(e) => updateExercise(index, "sets", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor={`exercise-reps-${index}`}>Repeticiones</Label>
                    <Input
                      id={`exercise-reps-${index}`}
                      placeholder="Ej: 10"
                      value={exercise.reps}
                      onChange={(e) => updateExercise(index, "reps", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor={`exercise-duration-${index}`}>Duración</Label>
                    <Input
                      id={`exercise-duration-${index}`}
                      placeholder="Ej: 30 seg"
                      value={exercise.duration}
                      onChange={(e) => updateExercise(index, "duration", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`exercise-notes-${index}`}>Notas</Label>
                  <Textarea
                    id={`exercise-notes-${index}`}
                    placeholder="Instrucciones adicionales..."
                    value={exercise.notes}
                    onChange={(e) => updateExercise(index, "notes", e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {error && (
        <div className="mt-6 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          <p>{error}</p>
        </div>
      )}

      <div className="mt-6 flex gap-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Creando rutina..." : "Crear Rutina"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancelar
        </Button>
      </div>

      <ImportExercisesDialog 
        isOpen={showImportDialog} 
        onOpenChange={setShowImportDialog} 
        onImport={handleImportExercises}
      />
    </form>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { assignAthleteToSport } from "@/app/actions/admin-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface AssignmentsTableProps {
  assignments: any[]
  users: any[]
  sports: any[]
}

export function AssignmentsTable({ assignments, users, sports }: AssignmentsTableProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [athleteId, setAthleteId] = useState("")
  const [sportId, setSportId] = useState("")

  const athletes = users.filter((u) => u.role === "deportista")

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const result = await assignAthleteToSport({
      athleteId,
      sportId,
    })

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    setIsOpen(false)
    setAthleteId("")
    setSportId("")
    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Asignaciones Deportista-Deporte</CardTitle>
            <CardDescription>Asigna deportistas a deportes específicos</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>Nueva Asignación</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Asignación</DialogTitle>
                <DialogDescription>Asigna un deportista a un deporte</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="athlete">Deportista</Label>
                  <Select value={athleteId} onValueChange={setAthleteId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un deportista" />
                    </SelectTrigger>
                    <SelectContent>
                      {athletes.map((athlete) => (
                        <SelectItem key={athlete.id} value={athlete.id}>
                          {athlete.full_name} ({athlete.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sport">Deporte</Label>
                  <Select value={sportId} onValueChange={setSportId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un deporte" />
                    </SelectTrigger>
                    <SelectContent>
                      {sports.map((sport) => (
                        <SelectItem key={sport.id} value={sport.id}>
                          {sport.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Creando..." : "Crear Asignación"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Deportista</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Deporte</TableHead>
              <TableHead>Fecha de Asignación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">{assignment.profiles?.full_name}</TableCell>
                <TableCell>{assignment.profiles?.email}</TableCell>
                <TableCell>{assignment.sports?.name}</TableCell>
                <TableCell>{new Date(assignment.created_at).toLocaleDateString("es-ES")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

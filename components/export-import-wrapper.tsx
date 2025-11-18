"use client"

import { useState } from "react"
import { ExportImportDialog } from "@/components/export-import-dialog"

interface ExportImportWrapperProps {
  athletes: any[]
}

export function ExportImportWrapper({ athletes }: ExportImportWrapperProps) {
  const [isOpen, setIsOpen] = useState(false)

  return <ExportImportDialog isOpen={isOpen} onOpenChange={setIsOpen} athletes={athletes} />
}

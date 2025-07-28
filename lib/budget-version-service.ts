// Servicio para gestionar versiones de presupuesto
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { BudgetItem } from "@/lib/event-service"

// Definir tipos para las versiones de presupuesto
export interface BudgetVersion {
  id: string
  eventId: string
  name: string
  description: string
  createdAt: string
  items: BudgetItem[]
  createdBy: string
  status: "draft" | "pending" | "approved" | "rejected"
  approvedBy?: string
  approvedAt?: string
  comments?: string
}

export interface BudgetApproval {
  id: string
  versionId: string
  requestedBy: string
  requestedAt: string
  status: "pending" | "approved" | "rejected"
  approvedBy?: string
  approvedAt?: string
  comments?: string
}

// Definir el store para las versiones de presupuesto
interface BudgetVersionStoreState {
  versions: BudgetVersion[]
  approvals: BudgetApproval[]

  // Métodos para versiones
  createVersion: (version: Omit<BudgetVersion, "id" | "createdAt">) => string
  updateVersion: (id: string, updates: Partial<BudgetVersion>) => void
  deleteVersion: (id: string) => void
  getVersionsByEvent: (eventId: string) => BudgetVersion[]
  getVersionById: (id: string) => BudgetVersion | undefined
  getLatestVersionByEvent: (eventId: string) => BudgetVersion | undefined

  // Métodos para aprobaciones
  requestApproval: (versionId: string, requestedBy: string, comments?: string) => string
  approveVersion: (approvalId: string, approvedBy: string, comments?: string) => void
  rejectVersion: (approvalId: string, rejectedBy: string, comments?: string) => void
  getPendingApprovals: () => BudgetApproval[]
  getApprovalsByVersion: (versionId: string) => BudgetApproval[]
}

// Crear el store
export const useBudgetVersionStore = create<BudgetVersionStoreState>()(
  persist(
    (set, get) => ({
      versions: [],
      approvals: [],

      // Métodos para versiones
      createVersion: (versionData) => {
        const id = `version-${Date.now()}`
        const newVersion: BudgetVersion = {
          id,
          ...versionData,
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          versions: [...state.versions, newVersion],
        }))

        return id
      },

      updateVersion: (id, updates) => {
        set((state) => ({
          versions: state.versions.map((version) => (version.id === id ? { ...version, ...updates } : version)),
        }))
      },

      deleteVersion: (id) => {
        set((state) => ({
          versions: state.versions.filter((version) => version.id !== id),
          // También eliminar las aprobaciones asociadas
          approvals: state.approvals.filter((approval) => approval.versionId !== id),
        }))
      },

      getVersionsByEvent: (eventId) => {
        return get()
          .versions.filter((version) => version.eventId === eventId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      },

      getVersionById: (id) => {
        return get().versions.find((version) => version.id === id)
      },

      getLatestVersionByEvent: (eventId) => {
        const versions = get().getVersionsByEvent(eventId)
        return versions.length > 0 ? versions[0] : undefined
      },

      // Métodos para aprobaciones
      requestApproval: (versionId, requestedBy, comments) => {
        const id = `approval-${Date.now()}`
        const newApproval: BudgetApproval = {
          id,
          versionId,
          requestedBy,
          requestedAt: new Date().toISOString(),
          status: "pending",
          comments,
        }

        set((state) => ({
          approvals: [...state.approvals, newApproval],
        }))

        // Actualizar el estado de la versión
        const version = get().getVersionById(versionId)
        if (version) {
          get().updateVersion(versionId, { status: "pending" })
        }

        return id
      },

      approveVersion: (approvalId, approvedBy, comments) => {
        set((state) => ({
          approvals: state.approvals.map((approval) =>
            approval.id === approvalId
              ? {
                  ...approval,
                  status: "approved",
                  approvedBy,
                  approvedAt: new Date().toISOString(),
                  comments: comments || approval.comments,
                }
              : approval,
          ),
        }))

        // Actualizar el estado de la versión
        const approval = get().approvals.find((a) => a.id === approvalId)
        if (approval) {
          const version = get().getVersionById(approval.versionId)
          if (version) {
            get().updateVersion(approval.versionId, {
              status: "approved",
              approvedBy,
              approvedAt: new Date().toISOString(),
            })
          }
        }
      },

      rejectVersion: (approvalId, rejectedBy, comments) => {
        set((state) => ({
          approvals: state.approvals.map((approval) =>
            approval.id === approvalId
              ? {
                  ...approval,
                  status: "rejected",
                  approvedBy: rejectedBy,
                  approvedAt: new Date().toISOString(),
                  comments: comments || approval.comments,
                }
              : approval,
          ),
        }))

        // Actualizar el estado de la versión
        const approval = get().approvals.find((a) => a.id === approvalId)
        if (approval) {
          const version = get().getVersionById(approval.versionId)
          if (version) {
            get().updateVersion(approval.versionId, {
              status: "rejected",
              approvedBy: rejectedBy,
              approvedAt: new Date().toISOString(),
              comments: comments || version.comments,
            })
          }
        }
      },

      getPendingApprovals: () => {
        return get().approvals.filter((approval) => approval.status === "pending")
      },

      getApprovalsByVersion: (versionId) => {
        return get().approvals.filter((approval) => approval.versionId === versionId)
      },
    }),
    {
      name: "budget-version-store",
    },
  ),
)

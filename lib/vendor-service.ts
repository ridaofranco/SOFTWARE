// Servicio para gestionar proveedores
import { create } from "zustand"
import { persist } from "zustand/middleware"

// Definir tipos para los proveedores
export interface Vendor {
  id: string
  name: string
  contactName: string
  email: string
  phone: string
  address?: string
  category: string
  notes?: string
  rating?: number
  createdAt: string
  updatedAt: string
}

export interface VendorContract {
  id: string
  vendorId: string
  eventId: string
  description: string
  amount: number
  startDate: string
  endDate?: string
  status: "draft" | "pending" | "signed" | "completed" | "cancelled"
  createdAt: string
  updatedAt: string
  documents?: string[]
  notes?: string
}

export interface VendorReview {
  id: string
  vendorId: string
  eventId: string
  rating: number
  comment: string
  createdBy: string
  createdAt: string
}

// Definir el store para los proveedores
interface VendorStoreState {
  vendors: Vendor[]
  contracts: VendorContract[]
  reviews: VendorReview[]

  // Métodos para proveedores
  addVendor: (vendor: Omit<Vendor, "id" | "createdAt" | "updatedAt">) => string
  updateVendor: (id: string, updates: Partial<Vendor>) => void
  deleteVendor: (id: string) => void
  getVendorById: (id: string) => Vendor | undefined
  getVendorsByCategory: (category: string) => Vendor[]
  getAllVendors: () => Vendor[]

  // Métodos para contratos
  addContract: (contract: Omit<VendorContract, "id" | "createdAt" | "updatedAt">) => string
  updateContract: (id: string, updates: Partial<VendorContract>) => void
  deleteContract: (id: string) => void
  getContractById: (id: string) => VendorContract | undefined
  getContractsByVendor: (vendorId: string) => VendorContract[]
  getContractsByEvent: (eventId: string) => VendorContract[]

  // Métodos para reseñas
  addReview: (review: Omit<VendorReview, "id" | "createdAt">) => string
  updateReview: (id: string, updates: Partial<VendorReview>) => void
  deleteReview: (id: string) => void
  getReviewsByVendor: (vendorId: string) => VendorReview[]
  getAverageRatingForVendor: (vendorId: string) => number
}

// Crear el store
export const useVendorStore = create<VendorStoreState>()(
  persist(
    (set, get) => ({
      vendors: [],
      contracts: [],
      reviews: [],

      // Métodos para proveedores
      addVendor: (vendorData) => {
        const id = `vendor-${Date.now()}`
        const now = new Date().toISOString()

        const newVendor: Vendor = {
          id,
          ...vendorData,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          vendors: [...state.vendors, newVendor],
        }))

        return id
      },

      updateVendor: (id, updates) => {
        set((state) => ({
          vendors: state.vendors.map((vendor) =>
            vendor.id === id ? { ...vendor, ...updates, updatedAt: new Date().toISOString() } : vendor,
          ),
        }))
      },

      deleteVendor: (id) => {
        set((state) => ({
          vendors: state.vendors.filter((vendor) => vendor.id !== id),
          // También eliminar contratos y reseñas asociados
          contracts: state.contracts.filter((contract) => contract.vendorId !== id),
          reviews: state.reviews.filter((review) => review.vendorId !== id),
        }))
      },

      getVendorById: (id) => {
        return get().vendors.find((vendor) => vendor.id === id)
      },

      getVendorsByCategory: (category) => {
        return get().vendors.filter((vendor) => vendor.category === category)
      },

      getAllVendors: () => {
        return [...get().vendors].sort((a, b) => a.name.localeCompare(b.name))
      },

      // Métodos para contratos
      addContract: (contractData) => {
        const id = `contract-${Date.now()}`
        const now = new Date().toISOString()

        const newContract: VendorContract = {
          id,
          ...contractData,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          contracts: [...state.contracts, newContract],
        }))

        return id
      },

      updateContract: (id, updates) => {
        set((state) => ({
          contracts: state.contracts.map((contract) =>
            contract.id === id ? { ...contract, ...updates, updatedAt: new Date().toISOString() } : contract,
          ),
        }))
      },

      deleteContract: (id) => {
        set((state) => ({
          contracts: state.contracts.filter((contract) => contract.id !== id),
        }))
      },

      getContractById: (id) => {
        return get().contracts.find((contract) => contract.id === id)
      },

      getContractsByVendor: (vendorId) => {
        return get().contracts.filter((contract) => contract.vendorId === vendorId)
      },

      getContractsByEvent: (eventId) => {
        return get().contracts.filter((contract) => contract.eventId === eventId)
      },

      // Métodos para reseñas
      addReview: (reviewData) => {
        const id = `review-${Date.now()}`

        const newReview: VendorReview = {
          id,
          ...reviewData,
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          reviews: [...state.reviews, newReview],
        }))

        // Actualizar la calificación promedio del proveedor
        const vendor = get().getVendorById(reviewData.vendorId)
        if (vendor) {
          const avgRating = get().getAverageRatingForVendor(reviewData.vendorId)
          get().updateVendor(reviewData.vendorId, { rating: avgRating })
        }

        return id
      },

      updateReview: (id, updates) => {
        set((state) => ({
          reviews: state.reviews.map((review) => (review.id === id ? { ...review, ...updates } : review)),
        }))

        // Actualizar la calificación promedio del proveedor si se cambió la calificación
        if (updates.rating !== undefined) {
          const review = get().reviews.find((r) => r.id === id)
          if (review) {
            const avgRating = get().getAverageRatingForVendor(review.vendorId)
            get().updateVendor(review.vendorId, { rating: avgRating })
          }
        }
      },

      deleteReview: (id) => {
        const review = get().reviews.find((r) => r.id === id)

        set((state) => ({
          reviews: state.reviews.filter((review) => review.id !== id),
        }))

        // Actualizar la calificación promedio del proveedor
        if (review) {
          const avgRating = get().getAverageRatingForVendor(review.vendorId)
          get().updateVendor(review.vendorId, { rating: avgRating })
        }
      },

      getReviewsByVendor: (vendorId) => {
        return get().reviews.filter((review) => review.vendorId === vendorId)
      },

      getAverageRatingForVendor: (vendorId) => {
        const vendorReviews = get().reviews.filter((review) => review.vendorId === vendorId)

        if (vendorReviews.length === 0) return 0

        const sum = vendorReviews.reduce((total, review) => total + review.rating, 0)
        return Math.round((sum / vendorReviews.length) * 10) / 10 // Redondear a 1 decimal
      },
    }),
    {
      name: "vendor-store",
    },
  ),
)

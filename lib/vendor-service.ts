// Servicio para gestionar proveedores
import { create } from "zustand"
import { persist } from "zustand/middleware"

// Definir tipos para los proveedores
export interface Vendor {
  id: string
  name: string
  lastName: string
  dni: string
  birthDate: string
  role: string
  category: string
  location: string
  contactName: string
  email: string
  phone: string
  address?: string
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
  dancers: Vendor[] // Lista separada de bailarines para contratos
  technicalStaff: Vendor[] // Lista separada de montajistas y escenógrafos para contratos

  // Métodos para proveedores
  addVendor: (vendor: Omit<Vendor, "id" | "createdAt" | "updatedAt">) => string
  updateVendor: (id: string, updates: Partial<Vendor>) => void
  deleteVendor: (id: string) => void
  getVendorById: (id: string) => Vendor | undefined
  getVendorsByLocation: (location: string) => Vendor[]
  getVendorsByCategory: (category: string) => Vendor[]
  getAllVendors: () => Vendor[]
  clearAllVendors: () => void
  initializeVendorsData: () => void

  // Métodos para bailarines (solo para contratos)
  getDancers: () => Vendor[]
  getDancerById: (id: string) => Vendor | undefined

  // Métodos para personal técnico (solo para contratos)
  getTechnicalStaff: () => Vendor[]
  getTechnicalStaffById: (id: string) => Vendor | undefined

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

// Datos iniciales de proveedores SIN DUPLICADOS, SIN BAILARINES, SIN MONTAJISTAS, SIN ESCENÓGRAFOS
const initialVendorsData: Omit<Vendor, "id" | "createdAt" | "updatedAt">[] = [
  // PRODUCTORES ÚNICOS - ACTUALIZAR CATEGORÍA A FIEBRE DISCO
  {
    name: "Nicolas",
    lastName: "Coppolecchia",
    dni: "36729038",
    birthDate: "31/03/92",
    role: "PRODUCTOR",
    category: "FIEBRE DISCO",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Nicolas Coppolecchia",
    email: "nicolas.coppolecchia@fiebredisco.com",
    phone: "+54 11 1234 5678",
  },
  {
    name: "IVO JOSE",
    lastName: "CORTAZZO",
    dni: "36155303",
    birthDate: "25/03/1992",
    role: "PRODUCTOR",
    category: "FIEBRE DISCO",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Ivo Jose Cortazzo",
    email: "ivo.cortazzo@fiebredisco.com",
    phone: "+54 11 4567 8901",
  },
  {
    name: "Franco",
    lastName: "Ridao",
    dni: "40638516",
    birthDate: "04/10/1997",
    role: "PRODUCTOR",
    category: "FIEBRE DISCO",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Franco Ridao",
    email: "franco.ridao@fiebredisco.com",
    phone: "+54 11 5678 9012",
  },
  {
    name: "MARIANO",
    lastName: "HARGAIN",
    dni: "36929828",
    birthDate: "26/05/1992",
    role: "PRODUCTOR",
    category: "FIEBRE DISCO",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Mariano Hargain",
    email: "mariano.hargain@fiebredisco.com",
    phone: "+54 11 234 5678",
  },

  // COORDINADORES ÚNICOS
  {
    name: "MARIANGELES",
    lastName: "HOYOS",
    dni: "28230076",
    birthDate: "4/6/1980",
    role: "COORDINADORA DE MONTAJE",
    category: "ARTE",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Mariangeles Hoyos",
    email: "mariangeles.hoyos@arte.com",
    phone: "+54 11 345 6789",
  },
  {
    name: "Malena Luz",
    lastName: "Villanueva",
    dni: "30466585",
    birthDate: "24/8/83",
    role: "COORDINADORA DE ARTISTAS",
    category: "ARTE",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Malena Luz Villanueva",
    email: "malena.villanueva@arte.com",
    phone: "+54 11 3456 7890",
  },
  {
    name: "Nadia Magali",
    lastName: "Kucharczuk",
    dni: "34230324",
    birthDate: "10/12/1988",
    role: "DIRECTORA DE BAILARINES",
    category: "ARTE",
    location: "ROSARIO",
    contactName: "Nadia Magali Kucharczuk",
    email: "nadia.kucharczuk@arte.com",
    phone: "+54 341 456 7890",
  },

  // ASISTENTES DE PRODUCCIÓN - ACTUALIZAR PABLO A FIEBRE DISCO
  {
    name: "Pablo Andrés",
    lastName: "Dávila Montúfar",
    dni: "96013454",
    birthDate: "17/06/2000",
    role: "ASISTENTE DE PRODUCCIÓN",
    category: "FIEBRE DISCO",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Pablo Andrés Dávila Montúfar",
    email: "pablo.davila@fiebredisco.com",
    phone: "+54 11 8901 2345",
  },
  {
    name: "Lucas Nahuel",
    lastName: "Perez Longueira",
    dni: "40094538",
    birthDate: "19/01/1993",
    role: "ASISTENTE DE PRODUCCIÓN",
    category: "BOOKING",
    location: "MAR DEL PLATA",
    contactName: "Lucas Nahuel Perez Longueira",
    email: "lucas.perez@booking.com",
    phone: "+54 223 678 9012",
  },

  // DJ
  {
    name: "Axel Demian",
    lastName: "Murano Martelli",
    dni: "37345542",
    birthDate: "21/12/1992",
    role: "DJ",
    category: "BOOKING",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Axel Demian Murano Martelli",
    email: "axel.murano@booking.com",
    phone: "+54 11 6789 0123",
  },

  // GLITTER ÚNICOS
  {
    name: "Rocío Sol",
    lastName: "Maglioni",
    dni: "38455883",
    birthDate: "21/02/1996",
    role: "GLITTER",
    category: "ARTE",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Rocío Sol Maglioni",
    email: "rocio.maglioni@arte.com",
    phone: "+54 11 3456 7890",
  },
  {
    name: "Agustina Belén",
    lastName: "Benzo",
    dni: "43061586",
    birthDate: "15/11/2000",
    role: "GLITTER",
    category: "ARTE",
    location: "CÓRDOBA",
    contactName: "Agustina Belén Benzo",
    email: "agustina.benzo@arte.com",
    phone: "+54 351 6789 0123",
  },
  {
    name: "Juan Manuel",
    lastName: "Klocker",
    dni: "42979609",
    birthDate: "27/10/2000",
    role: "GLITTER",
    category: "ARTE",
    location: "CÓRDOBA",
    contactName: "Juan Manuel Klocker",
    email: "juan.klocker@arte.com",
    phone: "+54 351 7890 1234",
  },
  {
    name: "Dara",
    lastName: "Cejas",
    dni: "41590356",
    birthDate: "22/04/99",
    role: "GLITTER",
    category: "ARTE",
    location: "LA PLATA",
    contactName: "Dara Cejas",
    email: "dara.cejas@arte.com",
    phone: "+54 221 901 2345",
  },
  {
    name: "Rocio",
    lastName: "Saltiva",
    dni: "34343428",
    birthDate: "30/01/1989",
    role: "GLITTER",
    category: "ARTE",
    location: "ROSARIO",
    contactName: "Rocio Saltiva",
    email: "rocio.saltiva@arte.com",
    phone: "+54 341 456 7890",
  },

  // BOLETEROS
  {
    name: "Marlene Gisela",
    lastName: "Lopresto",
    dni: "36723330",
    birthDate: "14-11-1991",
    role: "BOLETERA",
    category: "BOOKING",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Marlene Gisela Lopresto",
    email: "marlene.lopresto@booking.com",
    phone: "+54 11 4567 8901",
  },
  {
    name: "Sabrina Nicole",
    lastName: "Villanueva",
    dni: "41458879",
    birthDate: "12/12/98",
    role: "BOLETERA",
    category: "BOOKING",
    location: "MAR DEL PLATA",
    contactName: "Sabrina Nicole Villanueva",
    email: "sabrina.villanueva@booking.com",
    phone: "+54 223 890 1234",
  },

  // VJ
  {
    name: "Juan Manuel",
    lastName: "Oromí",
    dni: "35375424",
    birthDate: "27/09/1990",
    role: "VJ",
    category: "ARTE",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Juan Manuel Oromí",
    email: "juan.oromi@arte.com",
    phone: "+54 11 4567 8901",
  },

  // ILUMINADORA
  {
    name: "Abril",
    lastName: "de rose",
    dni: "42248788",
    birthDate: "18/01/2000",
    role: "ILUMINADORA",
    category: "ARTE",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Abril de Rose",
    email: "abril.derose@arte.com",
    phone: "+54 11 5678 9012",
  },

  // VALIDADORES
  {
    name: "Kevin",
    lastName: "Garcia Escudero",
    dni: "36617436",
    birthDate: "13/04/1992",
    role: "VALIDADOR",
    category: "BOOKING",
    location: "MAR DEL PLATA",
    contactName: "Kevin Garcia Escudero",
    email: "kevin.garcia@booking.com",
    phone: "+54 223 456 7890",
  },
  {
    name: "Carla Noelia",
    lastName: "García Escudero",
    dni: "34500924",
    birthDate: "24/04/1989",
    role: "VALIDADOR",
    category: "BOOKING",
    location: "MAR DEL PLATA",
    contactName: "Carla Noelia García Escudero",
    email: "carla.garcia@booking.com",
    phone: "+54 223 567 8901",
  },
  {
    name: "Iara Belen",
    lastName: "Udijara",
    dni: "34179164",
    birthDate: "01/11/1988",
    role: "VALIDADOR",
    category: "BOOKING",
    location: "MAR DEL PLATA",
    contactName: "Iara Belen Udijara",
    email: "iara.udijara@booking.com",
    phone: "+54 223 678 9012",
  },
  {
    name: "Daniel Alejandro",
    lastName: "Busto",
    dni: "43520976",
    birthDate: "13/07/2001",
    role: "VALIDADORES",
    category: "BOOKING",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Daniel Alejandro Busto",
    email: "daniel.busto@booking.com",
    phone: "+54 11 7890 1234",
  },
  {
    name: "facundo",
    lastName: "Ponce",
    dni: "43872569",
    birthDate: "06/03/2002",
    role: "VALIDADORES",
    category: "BOOKING",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Facundo Ponce",
    email: "facundo.ponce@booking.com",
    phone: "+54 11 8901 2345",
  },
  {
    name: "María Florencia",
    lastName: "Orellana",
    dni: "45145136",
    birthDate: "14/11/2003",
    role: "VALIDADORES",
    category: "BOOKING",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "María Florencia Orellana",
    email: "maria.orellana@booking.com",
    phone: "+54 11 9012 3456",
  },
  {
    name: "joel",
    lastName: "gerschman",
    dni: "44099639",
    birthDate: "10/03/2002",
    role: "VALIDADORES",
    category: "BOOKING",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Joel Gerschman",
    email: "joel.gerschman@booking.com",
    phone: "+54 11 0123 4567",
  },

  // MARKETING
  {
    name: "Anael",
    lastName: "Balestriere",
    dni: "42363214",
    birthDate: "23/04/1998",
    role: "FOTOGRAFÍA",
    category: "MARKETING",
    location: "QUILMES",
    contactName: "Anael Balestriere",
    email: "anael.balestriere@marketing.com",
    phone: "+54 11 6789 0123",
  },
  {
    name: "Delfina",
    lastName: "Mason",
    dni: "45237389",
    birthDate: "23/11/2003",
    role: "CONTENIDO",
    category: "MARKETING",
    location: "QUILMES",
    contactName: "Delfina Mason",
    email: "delfina.mason@marketing.com",
    phone: "+54 11 7890 1234",
  },
  {
    name: "Matias",
    lastName: "de leonardi",
    dni: "44980360",
    birthDate: "29/08/03",
    role: "CONTENT",
    category: "MARKETING",
    location: "ROSARIO",
    contactName: "Matias de Leonardi",
    email: "matias.deleonardi@marketing.com",
    phone: "+54 341 567 8901",
  },
  {
    name: "Ligia Marina",
    lastName: "Majul Maino",
    dni: "41604996",
    birthDate: "12-02-1999",
    role: "FOTÓGRAFO",
    category: "MARKETING",
    location: "ROSARIO",
    contactName: "Ligia Marina Majul Maino",
    email: "ligia.majul@marketing.com",
    phone: "+54 341 6789 0123",
  },
  {
    name: "Laura",
    lastName: "Artigues",
    dni: "35533095",
    birthDate: "28/10/1990",
    role: "FOTOGRAFA",
    category: "MARKETING",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Laura Artigues",
    email: "laura.artigues@marketing.com",
    phone: "+54 11 2345 6789",
  },
  {
    name: "Valentina",
    lastName: "Vernaci",
    dni: "41568189",
    birthDate: "28/06/1999",
    role: "CONTENIDO",
    category: "MARKETING",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Valentina Vernaci",
    email: "valentina.vernaci@marketing.com",
    phone: "+54 11 3456 7890",
  },
  {
    name: "Sofía",
    lastName: "Marino Terol",
    dni: "47272350",
    birthDate: "02/05/2006",
    role: "MERCH",
    category: "MARKETING",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Sofía Marino Terol",
    email: "sofia.marino@marketing.com",
    phone: "+54 11 6789 0123",
  },
  {
    name: "Lucas",
    lastName: "López Cruz",
    dni: "38831776",
    birthDate: "3/11/1995",
    role: "FOTOGRAFÍA",
    category: "MARKETING",
    location: "MAR DEL PLATA",
    contactName: "Lucas López Cruz",
    email: "lucas.lopez@marketing.com",
    phone: "+54 223 789 0123",
  },
]

// BAILARINES SEPARADOS - SOLO PARA CONTRATOS
const dancersData: Omit<Vendor, "id" | "createdAt" | "updatedAt">[] = [
  // MONTEVIDEO
  {
    name: "Marvis Johanna",
    lastName: "Heredia",
    dni: "64239647",
    birthDate: "20/03/1997",
    role: "BAILARÍN",
    category: "ARTE",
    location: "MONTEVIDEO",
    contactName: "Marvis Johanna Heredia",
    email: "marvis.heredia@arte.com",
    phone: "+598 99 567 890",
  },
  {
    name: "Ezequiel",
    lastName: "Ferrao",
    dni: "51209960",
    birthDate: "09/10/2001",
    role: "BAILARÍN",
    category: "ARTE",
    location: "MONTEVIDEO",
    contactName: "Ezequiel Ferrao",
    email: "ezequiel.ferrao@arte.com",
    phone: "+598 99 678 901",
  },
  {
    name: "Sofia",
    lastName: "Manzzi",
    dni: "55553698",
    birthDate: "14/12/2005",
    role: "BAILARÍN",
    category: "ARTE",
    location: "MONTEVIDEO",
    contactName: "Sofia Manzzi",
    email: "sofia.manzzi@arte.com",
    phone: "+598 99 789 012",
  },
  {
    name: "Nahuel",
    lastName: "Jara",
    dni: "52838996",
    birthDate: "14/02/2000",
    role: "BAILARÍN",
    category: "ARTE",
    location: "MONTEVIDEO",
    contactName: "Nahuel Jara",
    email: "nahuel.jara@arte.com",
    phone: "+598 99 890 123",
  },
  {
    name: "Fabiana",
    lastName: "Silva",
    dni: "50242678",
    birthDate: "14/10/93",
    role: "BAILARÍN",
    category: "ARTE",
    location: "MONTEVIDEO",
    contactName: "Fabiana Silva",
    email: "fabiana.silva@arte.com",
    phone: "+598 99 901 234",
  },
  {
    name: "Santiago",
    lastName: "Rossi",
    dni: "51086667",
    birthDate: "18/09/98",
    role: "BAILARÍN",
    category: "ARTE",
    location: "MONTEVIDEO",
    contactName: "Santiago Rossi",
    email: "santiago.rossi@arte.com",
    phone: "+598 99 012 345",
  },

  // CÓRDOBA
  {
    name: "Emanuel de Jesús",
    lastName: "Fonseca",
    dni: "40835817",
    birthDate: "26/12/1997",
    role: "BAILARIN",
    category: "ARTE",
    location: "CÓRDOBA",
    contactName: "Emanuel de Jesús Fonseca",
    email: "emanuel.fonseca@arte.com",
    phone: "+54 351 8901 2345",
  },
  {
    name: "Cecilia Andrea",
    lastName: "Suarez",
    dni: "42217983",
    birthDate: "24/11/1999",
    role: "BAILARIN",
    category: "ARTE",
    location: "CÓRDOBA",
    contactName: "Cecilia Andrea Suarez",
    email: "cecilia.suarez@arte.com",
    phone: "+54 351 9012 3456",
  },
  {
    name: "Lucas Fernando",
    lastName: "Bustos Francheli",
    dni: "45693837",
    birthDate: "10/11/2004",
    role: "BAILARIN",
    category: "ARTE",
    location: "CÓRDOBA",
    contactName: "Lucas Fernando Bustos Francheli",
    email: "lucas.bustos@arte.com",
    phone: "+54 351 0123 4567",
  },
  {
    name: "Miranda hidalgo",
    lastName: "Puget",
    dni: "44460043",
    birthDate: "02/09/2002",
    role: "BAILARIN",
    category: "ARTE",
    location: "CÓRDOBA",
    contactName: "Miranda Hidalgo Puget",
    email: "miranda.puget@arte.com",
    phone: "+54 351 1234 5678",
  },
  {
    name: "Taiel Facundo",
    lastName: "Rivero",
    dni: "45408704",
    birthDate: "21/04/2004",
    role: "BAILARIN",
    category: "ARTE",
    location: "CÓRDOBA",
    contactName: "Taiel Facundo Rivero",
    email: "taiel.rivero@arte.com",
    phone: "+54 351 2345 6789",
  },

  // MENDOZA
  {
    name: "Giuliano",
    lastName: "Di Carlo",
    dni: "44878739",
    birthDate: "06/02/03",
    role: "BAILARÍN",
    category: "ARTE",
    location: "MENDOZA",
    contactName: "Giuliano Di Carlo",
    email: "giuliano.dicarlo@arte.com",
    phone: "+54 261 678 9012",
  },
  {
    name: "Joaquín",
    lastName: "Bartolomeo",
    dni: "36345475",
    birthDate: "30/10/92",
    role: "BAILARÍN",
    category: "ARTE",
    location: "MENDOZA",
    contactName: "Joaquín Bartolomeo",
    email: "joaquin.bartolomeo@arte.com",
    phone: "+54 261 789 0123",
  },
  {
    name: "Stefano Gianni",
    lastName: "Oliverio",
    dni: "44367351",
    birthDate: "16/10/02",
    role: "BAILARÍN",
    category: "ARTE",
    location: "MENDOZA",
    contactName: "Stefano Gianni Oliverio",
    email: "stefano.oliverio@arte.com",
    phone: "+54 261 890 1234",
  },
  {
    name: "Patricio",
    lastName: "Vera",
    dni: "41825084",
    birthDate: "31/03/99",
    role: "BAILARÍN",
    category: "ARTE",
    location: "MENDOZA",
    contactName: "Patricio Vera",
    email: "patricio.vera@arte.com",
    phone: "+54 261 901 2345",
  },
  {
    name: "Morena",
    lastName: "Buljevich",
    dni: "43465231",
    birthDate: "06/06/01",
    role: "BAILARÍN",
    category: "ARTE",
    location: "MENDOZA",
    contactName: "Morena Buljevich",
    email: "morena.buljevich@arte.com",
    phone: "+54 261 0123 4567",
  },
  {
    name: "Martina",
    lastName: "Jouas",
    dni: "45024433",
    birthDate: "18/07/03",
    role: "BAILARÍN",
    category: "ARTE",
    location: "MENDOZA",
    contactName: "Martina Jouas",
    email: "martina.jouas@arte.com",
    phone: "+54 261 1234 5678",
  },
  {
    name: "Guadalupe",
    lastName: "Molinari",
    dni: "45532468",
    birthDate: "11/03/04",
    role: "BAILARÍN",
    category: "ARTE",
    location: "MENDOZA",
    contactName: "Guadalupe Molinari",
    email: "guadalupe.molinari@arte.com",
    phone: "+54 261 2345 6789",
  },
  {
    name: "Matías",
    lastName: "Chavez",
    dni: "34195273",
    birthDate: "05/03/89",
    role: "BAILARÍN",
    category: "ARTE",
    location: "MENDOZA",
    contactName: "Matías Chavez",
    email: "matias.chavez@arte.com",
    phone: "+54 261 3456 7890",
  },
  {
    name: "Florencia Arias",
    lastName: "Luquez",
    dni: "42697412",
    birthDate: "16/11/00",
    role: "BAILARÍN",
    category: "ARTE",
    location: "MENDOZA",
    contactName: "Florencia Arias Luquez",
    email: "florencia.luquez@arte.com",
    phone: "+54 261 4567 8901",
  },
  {
    name: "Sofía",
    lastName: "Jofre",
    dni: "39235505",
    birthDate: "18/08/95",
    role: "BAILARÍN",
    category: "ARTE",
    location: "MENDOZA",
    contactName: "Sofía Jofre",
    email: "sofia.jofre@arte.com",
    phone: "+54 261 5678 9012",
  },

  // QUILMES
  {
    name: "Gabriel Hernán",
    lastName: "Rivero",
    dni: "40767336",
    birthDate: "08/09/1997",
    role: "BAILARÍN",
    category: "ARTE",
    location: "QUILMES",
    contactName: "Gabriel Hernán Rivero",
    email: "gabriel.rivero@arte.com",
    phone: "+54 11 7890 1234",
  },
  {
    name: "Brayan",
    lastName: "Martínez",
    dni: "94639045",
    birthDate: "1/11/2000",
    role: "BAILARÍN",
    category: "ARTE",
    location: "QUILMES",
    contactName: "Brayan Martínez",
    email: "brayan.martinez@arte.com",
    phone: "+54 11 8901 2345",
  },
  {
    name: "Agustín",
    lastName: "Costa",
    dni: "96285815",
    birthDate: "12/06/1997",
    role: "BAILARÍN",
    category: "ARTE",
    location: "QUILMES",
    contactName: "Agustín Costa",
    email: "agustin.costa@arte.com",
    phone: "+54 11 9012 3456",
  },
  {
    name: "Antonela",
    lastName: "Avalos Alos",
    dni: "41123791",
    birthDate: "01/09/1998",
    role: "Bailarin",
    category: "ARTE",
    location: "QUILMES",
    contactName: "Antonela Avalos Alos",
    email: "antonela.avalos@arte.com",
    phone: "+54 11 1234 5678",
  },
  {
    name: "Maria",
    lastName: "Jose Lopez",
    dni: "43152337",
    birthDate: "31/12/2000",
    role: "Bailarina",
    category: "ARTE",
    location: "QUILMES",
    contactName: "Maria Jose Lopez",
    email: "maria.lopez@arte.com",
    phone: "+54 11 2345 6789",
  },

  // ROSARIO
  {
    name: "María José",
    lastName: "Solis Minota",
    dni: "43127162",
    birthDate: "08/03/2001",
    role: "BAILARÍN",
    category: "ARTE",
    location: "ROSARIO",
    contactName: "María José Solis Minota",
    email: "maria.solis@arte.com",
    phone: "+54 341 890 1234",
  },
  {
    name: "Nicolas",
    lastName: "Bertalot",
    dni: "45638199",
    birthDate: "26/03/2004",
    role: "BAILARÍN",
    category: "ARTE",
    location: "ROSARIO",
    contactName: "Nicolas Bertalot",
    email: "nicolas.bertalot@arte.com",
    phone: "+54 341 901 2345",
  },
  {
    name: "Martin",
    lastName: "Aguero",
    dni: "45218409",
    birthDate: "22/7/2003",
    role: "BAILARÍN",
    category: "ARTE",
    location: "ROSARIO",
    contactName: "Martin Aguero",
    email: "martin.aguero@arte.com",
    phone: "+54 341 012 3456",
  },
  {
    name: "Candela",
    lastName: "Barroso",
    dni: "43844004",
    birthDate: "12/12/2001",
    role: "BAILARÍN",
    category: "ARTE",
    location: "ROSARIO",
    contactName: "Candela Barroso",
    email: "candela.barroso@arte.com",
    phone: "+54 341 123 4567",
  },
  {
    name: "Violeta",
    lastName: "Leviton",
    dni: "47508678",
    birthDate: "29/11/06",
    role: "BAILARÍN",
    category: "ARTE",
    location: "ROSARIO",
    contactName: "Violeta Leviton",
    email: "violeta.leviton@arte.com",
    phone: "+54 341 234 5678",
  },
  {
    name: "Alan",
    lastName: "Pavanello",
    dni: "44496143",
    birthDate: "20/11/2002",
    role: "BAILARÍN",
    category: "ARTE",
    location: "ROSARIO",
    contactName: "Alan Pavanello",
    email: "alan.pavanello@arte.com",
    phone: "+54 341 345 6789",
  },

  // CAPITAL/BUENOS AIRES
  {
    name: "Delfina Telechea",
    lastName: "Marzetti",
    dni: "45129868",
    birthDate: "06/08/2003",
    role: "BAILARIN",
    category: "ARTE",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Delfina Telechea Marzetti",
    email: "delfina.marzetti@arte.com",
    phone: "+54 11 5678 9012",
  },
  {
    name: "Alejo",
    lastName: "Martinez",
    dni: "42773499",
    birthDate: "22/07/2000",
    role: "BAILARIN",
    category: "ARTE",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Alejo Martinez",
    email: "alejo.martinez@arte.com",
    phone: "+54 11 6789 0123",
  },
  {
    name: "Valentin",
    lastName: "Pinoli",
    dni: "43779393",
    birthDate: "19/12/2001",
    role: "BAILARIN",
    category: "ARTE",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Valentin Pinoli",
    email: "valentin.pinoli@arte.com",
    phone: "+54 11 7890 1234",
  },
  {
    name: "Martina",
    lastName: "Torti",
    dni: "39282004",
    birthDate: "24/08/96",
    role: "BAILARIN",
    category: "ARTE",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Martina Torti",
    email: "martina.torti@arte.com",
    phone: "+54 11 8901 2345",
  },
  {
    name: "Tamara Lucia",
    lastName: "Vecces",
    dni: "44785693",
    birthDate: "06/05/2003",
    role: "BAILARIN",
    category: "ARTE",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Tamara Lucia Vecces",
    email: "tamara.vecces@arte.com",
    phone: "+54 11 9012 3456",
  },
  {
    name: "Maximo Rafael",
    lastName: "Guardiani",
    dni: "41514720",
    birthDate: "04/12/1998",
    role: "BAILARIN",
    category: "ARTE",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Maximo Rafael Guardiani",
    email: "maximo.guardiani@arte.com",
    phone: "+54 11 0123 4567",
  },
  {
    name: "Luz Aylen",
    lastName: "Mariani",
    dni: "43099585",
    birthDate: "27/11/2000",
    role: "BAILARIN",
    category: "ARTE",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Luz Aylen Mariani",
    email: "luz.mariani@arte.com",
    phone: "+54 11 1234 5678",
  },

  // MAR DEL PLATA
  {
    name: "Tania Rodriguez",
    lastName: "Anido",
    dni: "45922412",
    birthDate: "20/04/2004",
    role: "BAILARÍN",
    category: "ARTE",
    location: "MAR DEL PLATA",
    contactName: "Tania Rodriguez Anido",
    email: "tania.rodriguez@arte.com",
    phone: "+54 223 789 0123",
  },
  {
    name: "Alejo",
    lastName: "Guglielmino",
    dni: "44115207",
    birthDate: "04/03/2002",
    role: "BAILARÍN",
    category: "ARTE",
    location: "MAR DEL PLATA",
    contactName: "Alejo Guglielmino",
    email: "alejo.guglielmino@arte.com",
    phone: "+54 223 890 1234",
  },
  {
    name: "Martín",
    lastName: "Urbaneja",
    dni: "30720413",
    birthDate: "06/04/83",
    role: "BAILARÍN",
    category: "ARTE",
    location: "MAR DEL PLATA",
    contactName: "Martín Urbaneja",
    email: "martin.urbaneja@arte.com",
    phone: "+54 223 901 2345",
  },
  {
    name: "Victoria",
    lastName: "Tigrino",
    dni: "41854162",
    birthDate: "10/06/99",
    role: "BAILARÍN",
    category: "ARTE",
    location: "MAR DEL PLATA",
    contactName: "Victoria Tigrino",
    email: "victoria.tigrino@arte.com",
    phone: "+54 223 012 3456",
  },
  {
    name: "Bianca",
    lastName: "Belarmino Baggieri",
    dni: "41669477",
    birthDate: "05/04/99",
    role: "BAILARÍN",
    category: "ARTE",
    location: "MAR DEL PLATA",
    contactName: "Bianca Belarmino Baggieri",
    email: "bianca.belarmino@arte.com",
    phone: "+54 223 123 4567",
  },
  {
    name: "Gaspar",
    lastName: "Traverso",
    dni: "37719383",
    birthDate: "01/06/1993",
    role: "BAILARÍN",
    category: "ARTE",
    location: "MAR DEL PLATA",
    contactName: "Gaspar Traverso",
    email: "gaspar.traverso@arte.com",
    phone: "+54 223 234 5678",
  },
]

// PERSONAL TÉCNICO SEPARADO - MONTAJISTAS Y ESCENÓGRAFOS SOLO PARA CONTRATOS
const technicalStaffData: Omit<Vendor, "id" | "createdAt" | "updatedAt">[] = [
  // MONTAJISTAS ÚNICOS
  {
    name: "CRISTIAN",
    lastName: "ROMERO",
    dni: "24664791",
    birthDate: "08/06/1975",
    role: "MONTAJISTA",
    category: "ARTE",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Cristian Romero",
    email: "cristian.romero@arte.com",
    phone: "+54 11 7890 1234",
  },
  {
    name: "Juan Manuel",
    lastName: "Buera",
    dni: "37479854",
    birthDate: "16/06/1993",
    role: "MONTAJISTA",
    category: "ARTE",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Juan Manuel Buera",
    email: "juan.buera@arte.com",
    phone: "+54 11 8901 2345",
  },
  {
    name: "Alicia Doris",
    lastName: "Troncoso",
    dni: "20962609",
    birthDate: "9/10/1969",
    role: "MONTAJISTA",
    category: "ARTE",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Alicia Doris Troncoso",
    email: "alicia.troncoso@arte.com",
    phone: "+54 11 9012 3456",
  },
  {
    name: "Germán Raúl",
    lastName: "Sánchez Florez",
    dni: "22431260",
    birthDate: "06-10-71",
    role: "MONTAJISTA",
    category: "ARTE",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Germán Raúl Sánchez Florez",
    email: "german.sanchez@arte.com",
    phone: "+54 11 0123 4567",
  },
  {
    name: "Alejandra Gabriela",
    lastName: "Mateo",
    dni: "24083823",
    birthDate: "14/07/1974",
    role: "MONTAJISTA",
    category: "ARTE",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Alejandra Gabriela Mateo",
    email: "alejandra.mateo@arte.com",
    phone: "+54 11 1234 5678",
  },
  {
    name: "Juan Pablo",
    lastName: "Romero",
    dni: "43780881",
    birthDate: "09/10/2001",
    role: "MONTAJISTA",
    category: "ARTE",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Juan Pablo Romero",
    email: "juan.romero@arte.com",
    phone: "+54 11 2345 6789",
  },
  {
    name: "Laura Virginia",
    lastName: "Staffolani",
    dni: "23873666",
    birthDate: "04/06/80",
    role: "MONTAJISTA",
    category: "ARTE",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "Laura Virginia Staffolani",
    email: "laura.staffolani@arte.com",
    phone: "+54 11 2345 6789",
  },

  // ESCENÓGRAFOS
  {
    name: "Yamil Emmanuel",
    lastName: "Buabud",
    dni: "32810792",
    birthDate: "28/1/1987",
    role: "ESCENÓGRAFO",
    category: "ARTE",
    location: "MAR DEL PLATA",
    contactName: "Yamil Emmanuel Buabud",
    email: "yamil.buabud@arte.com",
    phone: "+54 223 901 2345",
  },
  {
    name: "Maria Florencia",
    lastName: "Mendes Roso",
    dni: "37605272",
    birthDate: "16/5/1992",
    role: "ESCENÓGRAFO",
    category: "ARTE",
    location: "MAR DEL PLATA",
    contactName: "Maria Florencia Mendes Roso",
    email: "maria.mendes@arte.com",
    phone: "+54 223 012 3456",
  },
  {
    name: "Micaela",
    lastName: "Perez Antrakidis",
    dni: "36382027",
    birthDate: "26/8/1991",
    role: "ESCENÓGRAFO",
    category: "ARTE",
    location: "MAR DEL PLATA",
    contactName: "Micaela Perez Antrakidis",
    email: "micaela.perez@arte.com",
    phone: "+54 223 123 4567",
  },
  {
    name: "Abigail",
    lastName: "Mendes Roso",
    dni: "47033943",
    birthDate: "15/06/2000",
    role: "ESCENÓGRAFO",
    category: "ARTE",
    location: "MAR DEL PLATA",
    contactName: "Abigail Mendes Roso",
    email: "abigail.mendes@arte.com",
    phone: "+54 223 234 5678",
  },
  {
    name: "Sergio Matias",
    lastName: "Oliva",
    dni: "36780936",
    birthDate: "29/02/1992",
    role: "ESCENOGRAFO",
    category: "ARTE",
    location: "MAR DEL PLATA",
    contactName: "Sergio Matias Oliva",
    email: "sergio.oliva@arte.com",
    phone: "+54 223 345 6789",
  },
]

// Crear el store
export const useVendorStore = create<VendorStoreState>()(
  persist(
    (set, get) => ({
      vendors: [],
      contracts: [],
      reviews: [],
      dancers: [],
      technicalStaff: [],

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

      getVendorsByLocation: (location) => {
        return get().vendors.filter((vendor) => vendor.location === location)
      },

      getVendorsByCategory: (category) => {
        return get().vendors.filter((vendor) => vendor.category === category)
      },

      getAllVendors: () => {
        return [...get().vendors].sort((a, b) => a.name.localeCompare(b.name))
      },

      clearAllVendors: () => {
        set(() => ({
          vendors: [],
          contracts: [], // También limpiar contratos
          reviews: [], // También limpiar reseñas
          dancers: [],
          technicalStaff: [],
        }))
      },

      initializeVendorsData: () => {
        // Siempre reemplazar con los datos iniciales específicos
        const now = new Date().toISOString()
        const vendorsWithIds = initialVendorsData.map((vendor, index) => ({
          id: `vendor-${Date.now()}-${index}`,
          ...vendor,
          createdAt: now,
          updatedAt: now,
        }))

        const dancersWithIds = dancersData.map((dancer, index) => ({
          id: `dancer-${Date.now()}-${index}`,
          ...dancer,
          createdAt: now,
          updatedAt: now,
        }))

        const technicalStaffWithIds = technicalStaffData.map((staff, index) => ({
          id: `technical-${Date.now()}-${index}`,
          ...staff,
          createdAt: now,
          updatedAt: now,
        }))

        set(() => ({
          vendors: vendorsWithIds,
          dancers: dancersWithIds,
          technicalStaff: technicalStaffWithIds,
          contracts: [], // También limpiar contratos
          reviews: [], // También limpiar reseñas
        }))
      },

      // Métodos para bailarines
      getDancers: () => {
        return [...get().dancers].sort((a, b) => a.name.localeCompare(b.name))
      },

      getDancerById: (id) => {
        return get().dancers.find((dancer) => dancer.id === id)
      },

      // Métodos para personal técnico
      getTechnicalStaff: () => {
        return [...get().technicalStaff].sort((a, b) => a.name.localeCompare(b.name))
      },

      getTechnicalStaffById: (id) => {
        return get().technicalStaff.find((staff) => staff.id === id)
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

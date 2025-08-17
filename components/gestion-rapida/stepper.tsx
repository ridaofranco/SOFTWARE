"use client"

import { Check } from "lucide-react"

interface StepperProps {
  currentStep: number
  totalSteps: number
  onStepChange: (step: number) => void
}

export function Stepper({ currentStep, totalSteps, onStepChange }: StepperProps) {
  const steps = [
    { number: 1, title: "Datos Generales", description: "Información básica del evento" },
    { number: 2, title: "Proveedores", description: "Selección de proveedores" },
    { number: 3, title: "Vista Previa", description: "Revisar detalles" },
    { number: 4, title: "Crear Evento", description: "Finalizar y exportar" },
  ]

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            {/* Step Circle */}
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 cursor-pointer transition-colors ${
                step.number < currentStep
                  ? "bg-green-500 border-green-500 text-white"
                  : step.number === currentStep
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "bg-white border-gray-300 text-gray-500"
              }`}
              onClick={() => onStepChange(step.number)}
            >
              {step.number < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">{step.number}</span>
              )}
            </div>

            {/* Step Info */}
            <div className="ml-3 hidden md:block">
              <p className={`text-sm font-medium ${step.number <= currentStep ? "text-gray-900" : "text-gray-500"}`}>
                {step.title}
              </p>
              <p className="text-xs text-gray-500">{step.description}</p>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${step.number < currentStep ? "bg-green-500" : "bg-gray-300"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Mobile Step Info */}
      <div className="mt-4 md:hidden">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">{steps[currentStep - 1].title}</p>
          <p className="text-xs text-gray-500">{steps[currentStep - 1].description}</p>
        </div>
      </div>
    </div>
  )
}

// Mock data for budget service
interface Expense {
  id: string
  description: string
  category: string
  budgeted: number
  actual: number
  date: string
  status: "pending" | "paid" | "cancelled"
}

interface Budget {
  id: string
  eventId: string
  totalBudget: number
  expenses: Expense[]
}

// Mock database
const budgets: Budget[] = [
  {
    id: "budget-1",
    eventId: "event-1",
    totalBudget: 15000,
    expenses: [
      {
        id: "expense-1",
        description: "Venue rental",
        category: "venue",
        budgeted: 5000,
        actual: 5200,
        date: "2023-05-15",
        status: "paid",
      },
      {
        id: "expense-2",
        description: "Catering services",
        category: "catering",
        budgeted: 3500,
        actual: 3200,
        date: "2023-05-20",
        status: "paid",
      },
      {
        id: "expense-3",
        description: "Audio equipment",
        category: "entertainment",
        budgeted: 1500,
        actual: 1450,
        date: "2023-05-18",
        status: "paid",
      },
    ],
  },
  {
    id: "budget-2",
    eventId: "event-2",
    totalBudget: 25000,
    expenses: [
      {
        id: "expense-4",
        description: "Conference hall",
        category: "venue",
        budgeted: 8000,
        actual: 8000,
        date: "2023-06-10",
        status: "paid",
      },
      {
        id: "expense-5",
        description: "Marketing campaign",
        category: "marketing",
        budgeted: 5000,
        actual: 4800,
        date: "2023-06-01",
        status: "paid",
      },
      {
        id: "expense-6",
        description: "Speaker fees",
        category: "staff",
        budgeted: 6000,
        actual: 6000,
        date: "2023-06-15",
        status: "paid",
      },
    ],
  },
  {
    id: "budget-3",
    eventId: "event-3",
    totalBudget: 10000,
    expenses: [
      {
        id: "expense-7",
        description: "Garden venue",
        category: "venue",
        budgeted: 3000,
        actual: 3000,
        date: "2023-07-05",
        status: "paid",
      },
      {
        id: "expense-8",
        description: "Decoration",
        category: "decoration",
        budgeted: 2000,
        actual: 2200,
        date: "2023-07-03",
        status: "paid",
      },
      {
        id: "expense-9",
        description: "Photographer",
        category: "staff",
        budgeted: 1500,
        actual: 1500,
        date: "2023-07-08",
        status: "paid",
      },
    ],
  },
]

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Get all budgets
export async function getAllBudgets(): Promise<Budget[]> {
  await delay(500)
  return [...budgets]
}

// Get budget for a specific event
export async function getBudgetForEvent(eventId: string): Promise<Budget> {
  await delay(300)
  const budget = budgets.find((b) => b.eventId === eventId)

  if (!budget) {
    // If no budget exists for this event, create a new one
    const newBudget: Budget = {
      id: `budget-${Date.now()}`,
      eventId,
      totalBudget: 0,
      expenses: [],
    }

    budgets.push(newBudget)
    return newBudget
  }

  return { ...budget }
}

// Add a new expense to an event's budget
export async function addExpenseToEvent(eventId: string, expense: Expense): Promise<void> {
  await delay(300)
  const budgetIndex = budgets.findIndex((b) => b.eventId === eventId)

  if (budgetIndex === -1) {
    // Create a new budget if it doesn't exist
    const newBudget: Budget = {
      id: `budget-${Date.now()}`,
      eventId,
      totalBudget: expense.budgeted,
      expenses: [expense],
    }

    budgets.push(newBudget)
  } else {
    // Add expense to existing budget
    budgets[budgetIndex].expenses.push(expense)
    budgets[budgetIndex].totalBudget = budgets[budgetIndex].expenses.reduce((sum, exp) => sum + exp.budgeted, 0)
  }
}

// Update an expense in an event's budget
export async function updateExpenseForEvent(eventId: string, updatedExpense: Expense): Promise<void> {
  await delay(300)
  const budgetIndex = budgets.findIndex((b) => b.eventId === eventId)

  if (budgetIndex === -1) return

  const expenseIndex = budgets[budgetIndex].expenses.findIndex((e) => e.id === updatedExpense.id)

  if (expenseIndex === -1) return

  budgets[budgetIndex].expenses[expenseIndex] = updatedExpense
  budgets[budgetIndex].totalBudget = budgets[budgetIndex].expenses.reduce((sum, exp) => sum + exp.budgeted, 0)
}

// Delete an expense from an event's budget
export async function deleteExpenseFromEvent(eventId: string, expenseId: string): Promise<void> {
  await delay(300)
  const budgetIndex = budgets.findIndex((b) => b.eventId === eventId)

  if (budgetIndex === -1) return

  budgets[budgetIndex].expenses = budgets[budgetIndex].expenses.filter((e) => e.id !== expenseId)
  budgets[budgetIndex].totalBudget = budgets[budgetIndex].expenses.reduce((sum, exp) => sum + exp.budgeted, 0)
}

// Get total budget and expenses across all events
export async function getTotalBudgetSummary(): Promise<{
  totalBudgeted: number
  totalActual: number
  variance: number
}> {
  await delay(500)

  const totalBudgeted = budgets.reduce(
    (sum, budget) => sum + budget.expenses.reduce((expSum, exp) => expSum + exp.budgeted, 0),
    0,
  )

  const totalActual = budgets.reduce(
    (sum, budget) => sum + budget.expenses.reduce((expSum, exp) => expSum + exp.actual, 0),
    0,
  )

  return {
    totalBudgeted,
    totalActual,
    variance: totalBudgeted - totalActual,
  }
}

// Get expenses by category across all events
export async function getExpensesByCategory(): Promise<
  {
    category: string
    budgeted: number
    actual: number
  }[]
> {
  await delay(500)

  const categories: Record<string, { budgeted: number; actual: number }> = {}

  budgets.forEach((budget) => {
    budget.expenses.forEach((expense) => {
      if (!categories[expense.category]) {
        categories[expense.category] = { budgeted: 0, actual: 0 }
      }

      categories[expense.category].budgeted += expense.budgeted
      categories[expense.category].actual += expense.actual
    })
  })

  return Object.entries(categories).map(([category, values]) => ({
    category,
    budgeted: values.budgeted,
    actual: values.actual,
  }))
}

// Get budget comparison between events
export async function getEventBudgetComparison(): Promise<
  {
    eventId: string
    eventName: string
    budgeted: number
    actual: number
  }[]
> {
  await delay(500)

  // This would normally fetch event names from an event service
  const eventNames: Record<string, string> = {
    "event-1": "Annual Conference",
    "event-2": "Product Launch",
    "event-3": "Team Building Retreat",
  }

  return budgets.map((budget) => {
    const totalBudgeted = budget.expenses.reduce((sum, exp) => sum + exp.budgeted, 0)
    const totalActual = budget.expenses.reduce((sum, exp) => sum + exp.actual, 0)

    return {
      eventId: budget.eventId,
      eventName: eventNames[budget.eventId] || "Unknown Event",
      budgeted: totalBudgeted,
      actual: totalActual,
    }
  })
}

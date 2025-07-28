"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { PlusCircle, Edit, Trash2 } from "lucide-react"
import {
  getBudgetForEvent,
  addExpenseToEvent,
  updateExpenseForEvent,
  deleteExpenseFromEvent,
} from "@/lib/budget-service"

interface Expense {
  id: string
  description: string
  category: string
  budgeted: number
  actual: number
  date: string
  status: "pending" | "paid" | "cancelled"
}

interface EventBudgetDetailsProps {
  eventId: string
}

export function EventBudgetDetails({ eventId }: EventBudgetDetailsProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null)
  const [newExpense, setNewExpense] = useState({
    description: "",
    category: "venue",
    budgeted: 0,
    actual: 0,
    status: "pending" as const,
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchBudget = async () => {
      const budget = await getBudgetForEvent(eventId)
      setExpenses(budget.expenses)
    }

    fetchBudget()
  }, [eventId])

  const handleAddExpense = async () => {
    try {
      await addExpenseToEvent(eventId, {
        ...newExpense,
        id: Math.random().toString(36).substring(2, 9),
        date: new Date().toISOString(),
      })

      // Refresh expenses
      const budget = await getBudgetForEvent(eventId)
      setExpenses(budget.expenses)

      setIsAddDialogOpen(false)
      setNewExpense({
        description: "",
        category: "venue",
        budgeted: 0,
        actual: 0,
        status: "pending",
      })

      toast({
        title: "Expense added",
        description: "The expense has been added to the event budget.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error adding the expense.",
        variant: "destructive",
      })
    }
  }

  const handleEditExpense = async () => {
    if (!currentExpense) return

    try {
      await updateExpenseForEvent(eventId, currentExpense)

      // Refresh expenses
      const budget = await getBudgetForEvent(eventId)
      setExpenses(budget.expenses)

      setIsEditDialogOpen(false)
      setCurrentExpense(null)

      toast({
        title: "Expense updated",
        description: "The expense has been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating the expense.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteExpenseFromEvent(eventId, expenseId)

      // Refresh expenses
      const budget = await getBudgetForEvent(eventId)
      setExpenses(budget.expenses)

      toast({
        title: "Expense deleted",
        description: "The expense has been deleted from the event budget.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error deleting the expense.",
        variant: "destructive",
      })
    }
  }

  const totalBudgeted = expenses.reduce((sum, expense) => sum + expense.budgeted, 0)
  const totalActual = expenses.reduce((sum, expense) => sum + expense.actual, 0)
  const variance = totalBudgeted - totalActual

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Event Budget</CardTitle>
          <CardDescription>Manage expenses for this event</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
              <DialogDescription>Add a new expense to the event budget.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select
                  value={newExpense.category}
                  onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="venue">Venue</SelectItem>
                    <SelectItem value="catering">Catering</SelectItem>
                    <SelectItem value="decoration">Decoration</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="budgeted" className="text-right">
                  Budgeted
                </Label>
                <Input
                  id="budgeted"
                  type="number"
                  value={newExpense.budgeted}
                  onChange={(e) => setNewExpense({ ...newExpense, budgeted: Number(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="actual" className="text-right">
                  Actual
                </Label>
                <Input
                  id="actual"
                  type="number"
                  value={newExpense.actual}
                  onChange={(e) => setNewExpense({ ...newExpense, actual: Number(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={newExpense.status}
                  onValueChange={(value: "pending" | "paid" | "cancelled") =>
                    setNewExpense({ ...newExpense, status: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddExpense}>Add Expense</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Budgeted</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No expenses found
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell className="capitalize">{expense.category}</TableCell>
                    <TableCell className="text-right">${expense.budgeted.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${expense.actual.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <span className={expense.budgeted - expense.actual >= 0 ? "text-green-600" : "text-red-600"}>
                        ${(expense.budgeted - expense.actual).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${
                          expense.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : expense.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {expense.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setCurrentExpense(expense)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Expense</DialogTitle>
                              <DialogDescription>Update the expense details.</DialogDescription>
                            </DialogHeader>
                            {currentExpense && (
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-description" className="text-right">
                                    Description
                                  </Label>
                                  <Input
                                    id="edit-description"
                                    value={currentExpense.description}
                                    onChange={(e) =>
                                      setCurrentExpense({ ...currentExpense, description: e.target.value })
                                    }
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-category" className="text-right">
                                    Category
                                  </Label>
                                  <Select
                                    value={currentExpense.category}
                                    onValueChange={(value) => setCurrentExpense({ ...currentExpense, category: value })}
                                  >
                                    <SelectTrigger className="col-span-3">
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="venue">Venue</SelectItem>
                                      <SelectItem value="catering">Catering</SelectItem>
                                      <SelectItem value="decoration">Decoration</SelectItem>
                                      <SelectItem value="entertainment">Entertainment</SelectItem>
                                      <SelectItem value="marketing">Marketing</SelectItem>
                                      <SelectItem value="staff">Staff</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-budgeted" className="text-right">
                                    Budgeted
                                  </Label>
                                  <Input
                                    id="edit-budgeted"
                                    type="number"
                                    value={currentExpense.budgeted}
                                    onChange={(e) =>
                                      setCurrentExpense({ ...currentExpense, budgeted: Number(e.target.value) })
                                    }
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-actual" className="text-right">
                                    Actual
                                  </Label>
                                  <Input
                                    id="edit-actual"
                                    type="number"
                                    value={currentExpense.actual}
                                    onChange={(e) =>
                                      setCurrentExpense({ ...currentExpense, actual: Number(e.target.value) })
                                    }
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-status" className="text-right">
                                    Status
                                  </Label>
                                  <Select
                                    value={currentExpense.status}
                                    onValueChange={(value: "pending" | "paid" | "cancelled") =>
                                      setCurrentExpense({ ...currentExpense, status: value })
                                    }
                                  >
                                    <SelectTrigger className="col-span-3">
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="paid">Paid</SelectItem>
                                      <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleEditExpense}>Save Changes</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(expense.id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
              <TableRow className="font-medium">
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell className="text-right">${totalBudgeted.toFixed(2)}</TableCell>
                <TableCell className="text-right">${totalActual.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <span className={variance >= 0 ? "text-green-600" : "text-red-600"}>${variance.toFixed(2)}</span>
                </TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

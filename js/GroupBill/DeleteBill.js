import { deleteDataDB } from '../utils/FirebaseUtils.js'

export const DeleteBill = {
  deleteHandler (expenseUID) {
    deleteDataDB(`expenses/${expenseUID}`).then(() => {
      this.fillUserCreatedExpenses(3)
      this.fillExpensesToPay(3)
    })
  },
}
import { FirebaseUtils } from '../utils/FirebaseUtils.js'
import { Templates } from './Templates.js'
import { AddBill } from './AddBill.js'
import { DeleteBill } from './DeleteBill.js'
import { EditBill } from './EditBill.js'

export class GroupBill {
  constructor () {
    this.createHandler = this.createHandler.bind(this)
    this.saveHandler = this.saveHandler.bind(this)
    this.updateParticipants = this.updateParticipants.bind(this)
    this.updateParticipantAmount = this.updateParticipantAmount.bind(this)
    this.distributeAmount = this.distributeAmount.bind(this)
    this.checkCorrectFields = this.checkCorrectFields.bind(this)
  }

  updateParticipantAmount (e) {
    const email = e.target.closest('.participants-item').dataset.email
    this.participantsList[email] = { sum: e.target.value }
  }

  handleEmptyInput (e) {
    if (e.target.value.trim() === '') e.target.value = 0
  }

  async updateParticipants (e) {
    e.preventDefault()
    try {
      const email = this.participantEmail.value
      await FirebaseUtils.checkUserExistence(email)
      if (this.participantsList[email]) {
        alert('User already in list')
        return
      }
      this.participantsList[email] = { sum: this.participantAmount.value }
      this.distributeAmount()
      this.updateParticipantsElement()
    } catch (err) {
      alert(err)
    }
  }

  showImagePreview (container, base64) {
    container.innerHTML = `<img src=${base64} />`
  }

  checkCorrectFields () {
    if (!this.checkOverallAmountCover() || !this.checkInputsFilled() ||
      this.checkParticipantsValue()) {
      this.createBtn.disabled = true
    } else {
      this.createBtn.disabled = false
    }
  }

  distributeAmount (e) {
    let overall = +this.totalAmount.value
    let totalParticipants = 0
    // remove users that have paid from overall amount
    Object.entries(this.participantsList).
      forEach(([_, { sum, hasPaid }]) => hasPaid
        ? overall -= +sum
        : totalParticipants++)
    const evenPart = overall / totalParticipants
    // update sums in list
    Object.entries(this.participantsList).forEach(([email, { _, hasPaid }]) => {
      if (hasPaid) return
      this.participantsList[email] = { sum: evenPart }
    })
    this.updateParticipantsElement()
  }

  preventMinus (e) {
    if (e.code === 'Minus' || e.code === 'NumpadSubtract') return false
  }

  checkParticipantsValue () {
    return Object.entries((this.participantsList)).
      find(([_, { sum }]) => sum == 0 || sum === '')
  }

  checkOverallAmountCover () {
    const acc = Object.entries(this.participantsList).
      reduce((acc, [_, { sum }]) => acc += +sum, 0)
    return acc === +this.totalAmount.value
  }

  updateParticipantsElement () {
    this.participantsListElement.innerHTML = Templates.getTemplateParticipants(
      this.participantsList)
    this.participantsInputs = document.querySelectorAll(
      '.participants-item__amount')
    this.participantsInputs.forEach((item) => {
      item.onkeydown = this.preventMinus
      item.addEventListener('input', this.updateParticipantAmount)
      item.addEventListener('change', this.handleEmptyInput)
    })
  }

  getBase64 (photo) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(photo)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  async fillUserCreatedExpenses (amount) {
    const listElement = document.querySelector('.user-created-expenses__list')
    const userCreatedExpensesSum = document.querySelector(
      '.user-created-expenses__sum')

    try {
      const [list, totalIncome] = await Templates.getTemplateUserCreatedExpenses(
        amount)
      if (list == '') throw new Error('No data')

      listElement.innerHTML = list
      userCreatedExpensesSum.innerHTML = totalIncome + ' $'
    } catch (error) {
      switch (document.documentElement.lang) {
        case 'ru': {
          listElement.innerHTML = `<li class="user-created-expenses__item">Нет счетов</li>`
        }
        case 'en': {
          listElement.innerHTML = `<li class="user-created-expenses__item">No expenses</li>`
        }
      }
      userCreatedExpensesSum.innerHTML = 0 + ' $'
    }
  }

  async fillExpensesToPay (amount) {
    const listElement = document.querySelector('.expenses-to-pay__list')
    const totalHaveToPayElement = document.querySelector(
      '.expenses-to-pay__sum')

    try {
      const [list, totalHaveToPay] = await Templates.getTemplateExpensesToPay(
        amount)
      if (list == '') throw new Error('No data')

      listElement.innerHTML = list
      totalHaveToPayElement.innerHTML = totalHaveToPay + ' $'

    } catch (error) {
      switch (document.documentElement.lang) {
        case 'ru': {
          listElement.innerHTML = `<li class="expense-to-pay__item" data-expense-id="not-an-item">Нет счетов</li>`
        }
        case 'en': {
          listElement.innerHTML = `<li class="expense-to-pay__item" data-expense-id="not-an-item">No expenses</li>`
        }
      }
      totalHaveToPayElement.innerHTML = 0 + ' $'
    }
  }

  async fillRecentPayments (amount) {
    const listElement = document.querySelector('.recent-payments__list')

    const currentUserEmail = firebase.auth().currentUser.email
    const [userUID, {}] = await FirebaseUtils.getUserUID(currentUserEmail)
    const recentPaymentsList = await FirebaseUtils.getInfoDB(
      `users/${userUID}/payments/`)
    const list = Templates.getTemplateRecentPayments(recentPaymentsList,
      amount)

    listElement.innerHTML = list
  }

  handleHideButton (cardName) {
    const setText = (target, { action, textRu, textEn }) => {
      switch (document.documentElement.lang) {
        case 'ru': {
          target.dataset.action = action
          target.textContent = textRu
          break
        }
        case 'en': {
          target.dataset.action = action
          target.textContent = textEn
          break
        }
      }
    }
    const showExpenses = (e, method) => {
      if (e.target.dataset.action === 'show') {
        method()
        setText(e.target, {
          textEn: 'Hide',
          textRu: 'Скрыть',
          action: 'hide',
        })
      } else {
        method(3)
        setText(e.target, {
          textEn: 'Show more',
          textRu: 'Больше',
          action: 'show',
        })
      }
    }
    if (cardName == 'user-created-expenses') {
      document.querySelector('.user-created-expenses__show-more-btn').
        addEventListener('click',
          (e) => showExpenses(e, this.fillUserCreatedExpenses))
    } else {
      document.querySelector('.expense-to-pay__show-more-btn').
        addEventListener('click',
          (e) => showExpenses(e, this.fillExpensesToPay))
    }
  }

  handleUserCreatedExpensesClicks () {
    document.querySelector('.user-created-expenses__list').
      addEventListener('click', (e) => {
        const expenseUID = e.target.closest(
          '.user-created-expenses__item').dataset.expenseId

        switch (e.target.dataset.action) {
          case 'delete': {
            this.deleteHandler(expenseUID)
            break
          }
          case 'edit': {
            window.location.hash = '#edit-expense'
            localStorage.setItem('expenseUIDEdit', expenseUID)
            break
          }
          default: {
            return
          }
        }
      })
  }

  async handleInfoExpense () {
    this.participantsList = {}
    const expenseUID = localStorage.getItem('expenseUIDInfo')
    const expense = await FirebaseUtils.getInfoDB(`expenses/${expenseUID}/`)

    Object.entries(expense.participants).
      forEach(([_, { email, hasPaid, sum }]) => {
        this.participantsList[email] = { sum, hasPaid }
      })
    const expenseInfoParticipants = document.querySelector(
      '.expense-info__participants')
    expenseInfoParticipants.innerHTML = Templates.getInfoParticipant(
      this.participantsList)

    document.querySelector('.expense-info__name').textContent = expense.name
    document.querySelector(
      '.expense-info__amount').textContent = expense.totalAmount + ' $'
    document.querySelector(
      '.expense-info__photo').innerHTML = `<img src="${expense.photo}" />`

    document.querySelector('.expense-info__pay').
      addEventListener('click', async (e) => {

        const currentUserEmail = firebase.auth().currentUser.email

        const [userUID, {}] = await FirebaseUtils.getUserUID(currentUserEmail)
        const [ownerUID, {}] = await FirebaseUtils.getUserUID(
          expense.ownerEmail)

        const [_, { sum }] = await FirebaseUtils.getParticipantInfo(expenseUID,
          currentUserEmail)

        await this.updateUserPaidStatus(expenseUID, currentUserEmail)
        await this.updateParticipantsHaveToPay(expenseUID, sum)

        await FirebaseUtils.addNewListItemDB(`users/${userUID}/payments/`, {
          expenseName: expense.name,
          isIncome: false,
          amount: sum,
          date: new Date().toLocaleDateString(),
        })

        await FirebaseUtils.addNewListItemDB(`users/${ownerUID}/payments/`, {
          expenseName: expense.name,
          isIncome: true,
          amount: sum,
          date: new Date().toLocaleDateString(),
        })

        alert('Successfully paid')
        window.location.hash = '#dashboard'
      })
  }

  async updateUserPaidStatus (expenseUID, participantEmail) {
    const [userUID] = await FirebaseUtils.getParticipantInfo(expenseUID,
      participantEmail)
    return await FirebaseUtils.updateDataDB(
      `expenses/${expenseUID}/participants/${userUID}/`, {
        hasPaid: true,
      })
  }

  async updateParticipantsHaveToPay (expenseUID, sum) {
    const haveToPay = await FirebaseUtils.getInfoDB(
      `expenses/${expenseUID}/participantsHaveToPay`)
    const newValue = haveToPay - sum
    if (newValue <= 0) return await FirebaseUtils.deleteDataDB(
      `expenses/${expenseUID}/`)
    return await FirebaseUtils.updateDataDB(`expenses/${expenseUID}/`, {
      participantsHaveToPay: newValue,
    })
  }

  handleExpensesToPayClicks () {
    document.querySelector('.expenses-to-pay__list').
      addEventListener('click', (e) => {
        const expenseUID = e.target.closest(
          '.expense-to-pay__item').dataset.expenseId
        if (expenseUID === 'not-an-item') return

        localStorage.setItem('expenseUIDInfo', expenseUID)
        window.location.hash = '#info-expense'
      })
  }
}

Object.assign(GroupBill.prototype, AddBill, EditBill, DeleteBill)
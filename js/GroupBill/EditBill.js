import { FirebaseUtils } from '../utils/FirebaseUtils.js'

export const EditBill = {
  async handleEditExpense () {
    this.handleNegativeParticipant = this.handleNegativeParticipant.bind(this)

    this.form = document.querySelector('.add-expense-form')

    this.form.addEventListener('input', this.checkCorrectFields)

    this.name = document.querySelector('#expense-name')
    this.totalAmount = document.querySelector('#expense-overall')

    this.totalAmount.onkeydown = this.preventMinus
    this.totalAmount.addEventListener('input', this.distributeAmount)
    this.totalAmount.addEventListener('change', this.handleEmptyInput)
    this.totalAmount.addEventListener('change', this.handleNegativeParticipant)

    this.photo = document.querySelector('#expense-photo')
    this.photo.addEventListener('change', async (e) => {
      this.showImagePreview(
        document.querySelector('.expense-photo-container'),
        await this.getBase64(e.target.files[0]))
    })

    this.participantEmail = document.querySelector('#participant-email')
    this.participantAmount = document.querySelector('#participant-sum')

    this.participantAmount.onkeydown = this.preventMinus
    this.participantAmount.addEventListener('change', this.handleEmptyInput)

    this.participantsListElement = document.querySelector('.participants-list')
    this.participantsList = {}

    await this.fillEditFields()

    this.updateParticipantsElement()

    this.createBtn = document.querySelector('.add-expense-form__sumbit')
    this.createBtn.addEventListener('click', this.saveHandler)

    this.participantsAddBtn = document.querySelector(
      '.add-expense-form__add-participant')
    this.participantsAddBtn.addEventListener('click', this.updateParticipants)

    this.checkCorrectFields()
  },
  handleNegativeParticipant (e) {
    const participantsHavePaidValue = Object.entries(this.participantsList).
      reduce((acc, [_, { sum, hasPaid }]) => {
        return hasPaid ? acc + +sum : acc
      }, 0)
    if (e.target.value < participantsHavePaidValue) {
      e.target.value = participantsHavePaidValue
      e.target.dispatchEvent(new InputEvent('input'))
    }
  },
  async fillEditFields () {
    const uid = localStorage.getItem('expenseUIDEdit')
    const expense = await FirebaseUtils.getInfoDB(`expenses/${uid}/`)

    Object.entries(expense.participants).
      forEach(([_, { email, hasPaid, sum }]) => {
        this.participantsList[email] = { sum, hasPaid }
      })
    this.name.value = expense.name
    this.totalAmount.value = expense.totalAmount
    this.photoBase64 = expense.photo

    if (this.photoBase64 != '') {
      this.showImagePreview(
        document.querySelector('.expense-photo-container'),
        this.photoBase64)
    }
  },
  async saveHandler (e) {
    e.preventDefault()

    let base64Photo
    try {
      base64Photo = await this.getBase64(this.photo.files[0])
    } catch (error) {
      base64Photo = this.photoBase64
    }

    const uid = localStorage.getItem('expenseUIDEdit')

    const participantsHaveToPay = Object.entries(this.participantsList).
      reduce((haveToPay, [email, { sum, hasPaid }]) => {
        if (hasPaid) return haveToPay
        return haveToPay + +sum
      }, 0)

    await FirebaseUtils.updateDataDB(`expenses/${uid}`, {
      name: this.name.value,
      totalAmount: +this.totalAmount.value,
      photo: base64Photo,
      participants: '',
      participantsHaveToPay,
    })
    await Object.entries(this.participantsList).
      forEach(async ([email, { sum, hasPaid = false }]) => {
        await FirebaseUtils.addNewListItemDB(`expenses/${uid}/participants/`, {
          email,
          sum,
          hasPaid,
        })
      })
    window.location.hash = '#dashboard'
  },
}
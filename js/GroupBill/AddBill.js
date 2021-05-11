import { FirebaseUtils } from '../utils/FirebaseUtils.js'

export const AddBill = {
  handleAddExpense () {
    this.form = document.querySelector('.add-expense-form')

    this.form.addEventListener('input', this.checkCorrectFields)

    this.name = document.querySelector('#expense-name')
    this.totalAmount = document.querySelector('#expense-overall')

    this.totalAmount.onkeydown = this.preventMinus
    this.totalAmount.addEventListener('input', this.distributeAmount)
    this.totalAmount.addEventListener('change', this.handleEmptyInput)

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
    this.participantsList = {
      [firebase.auth().currentUser.email]: { sum: 0 },
    }
    this.updateParticipantsElement()

    this.createBtn = document.querySelector('.add-expense-form__sumbit')
    this.createBtn.addEventListener('click', this.createHandler)

    this.participantsAddBtn = document.querySelector(
      '.add-expense-form__add-participant')
    this.participantsAddBtn.addEventListener('click', this.updateParticipants)

    this.checkCorrectFields()
  },
  checkInputsFilled () {
    if (this.name.value === '' || this.totalAmount.value === '') return false
    return true
  },
  async createHandler (e) {
    e.preventDefault()

    let base64Photo
    try {
      base64Photo = await this.getBase64(this.photo.files[0])
    } catch (error) {
      base64Photo = ''
    }

    const newItemKey = await FirebaseUtils.addNewListItemDB(`expenses/`, {
      name: this.name.value,
      totalAmount: +this.totalAmount.value,
      photo: base64Photo,
      ownerEmail: firebase.auth().currentUser.email,
      participants: '',
      participantsHaveToPay: +this.totalAmount.value,
    })
    await Object.entries(this.participantsList).
      forEach(async ([email, { sum, hasPaid = false }]) => {
        await FirebaseUtils.addNewListItemDB(
          `expenses/${newItemKey}/participants/`, {
            email,
            sum,
            hasPaid,
          })
      })
    window.location.hash = '#dashboard'
  },
}
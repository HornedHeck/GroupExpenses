import { FirebaseUtils } from '../utils/FirebaseUtils.js'

export const Templates = {
  getTemplateParticipants (participantsList) {
    return Object.entries(participantsList).map(([email, { sum, hasPaid }]) => {
      return `
        <li class="participants-item" data-email="${email}">
          <p class="participants-item__email">${email}</p>
          <input class="add-expense-form__input participants-item__amount" value="${sum}" type="number" ${hasPaid
        ? 'readonly'
        : ''} />
        </li>
      `
    }).join('')
  },
  async getTemplateUserCreatedExpenses (amount) {
    try {
      const expenses = await FirebaseUtils.getInfoDB(`expenses/`)
      let totalIncome = 0
      let list = Object.entries(expenses).
        map(
          ([uid, { ownerEmail, name, totalAmount, participantsHaveToPay }]) => {
            if (ownerEmail !== firebase.auth().currentUser.email) return ''
            totalIncome += +participantsHaveToPay
            return `
          <li class="user-created-expenses__item" data-expense-id="${uid}">
            <h3 class="user-created-expenses__name">${name}</h3>
            <p class="user-created-expenses__amount">${totalAmount} $</p>
            <div class="user-created-expenses__button-container">
              <button class="user-created-expenses__delete expense-control-btn" data-action="delete">${document.documentElement.lang ==
            'ru' ? 'Удалить' : 'Delete'}</button>
              <button class="user-created-expenses__edit expense-control-btn" data-action="edit">${document.documentElement.lang ==
            'ru' ? 'Редакт.' : 'Edit'}</button>
            </div>
          </li>
        `
          }).
        reverse()

      list = this.filterEmptyStrs(list)

      if (list.join('') === '') throw new Error('No data')

      if (amount) return [
        list.filter((_, index) => index < amount).join(''),
        totalIncome]

      return [list.join(''), totalIncome]

    } catch (error) {
      return [
        `<li class="user-created-expenses__item">${document.documentElement.lang ==
        'ru' ? 'Нет счетов' : 'No expenses'}</li>`,
        0,
      ]
    }
  },
  async getTemplateExpensesToPay (amount) {
    try {
      const expenses = await FirebaseUtils.getInfoDB(`expenses/`)
      let totalHaveToPay = 0
      let list = await Object.entries(expenses).
        map(([uid, { ownerEmail, name, participants }]) => {
          return Object.entries(participants).
            map(([_, { email, sum, hasPaid }]) => {
              if (email !== firebase.auth().currentUser.email ||
                hasPaid) return ''
              totalHaveToPay += +sum
              return `
            <li class="expense-to-pay__item" data-expense-id="${uid}">
              <h3 class="expense-to-pay__name">${name}</h3>
              <p class="expense-to-pay__owner">${ownerEmail}</p>
              <p class="expense-to-pay__your-amount">${sum} $</p>
            </li>
          `
            }).
            join('')
        }).
        reverse()

      list = this.filterEmptyStrs(list)

      if (list.join('') === '') throw new Error('No data')

      if (amount) return [
        list.filter((_, index) => index < amount).join(''),
        totalHaveToPay]

      return [list.join(''), totalHaveToPay]

    } catch (error) {
      return [
        `<li class="expense-to-pay__item" data-expense-id="not-an-item">${document.documentElement.lang ==
        'ru' ? 'Нет счетов' : 'No expenses'}</li>`,
        0,
      ]
    }
  },
  filterEmptyStrs (list) {
    return list.filter((item) => item != '')
  },
  getInfoParticipant (participantsList) {
    return Object.entries(participantsList).map(([email, { sum, hasPaid }]) => {

      const currentUserEmail = firebase.auth().currentUser.email
      const currentUserTemlpate = `
        <button class="expense-info__pay default-btn">Pay ${sum} $</button>
      `
      const ordinaryUserTemplate = `
        <p class="participant__sum">${sum} $</p>
      `

      return `
        <li class="participant ${hasPaid ? 'participant_paid' : ''}">
          <p class="participant__email">${email}</p>
          ${currentUserEmail === email
        ? currentUserTemlpate
        : ordinaryUserTemplate}
        </li>
      `
    }).join('')
  },
  getTemplateRecentPayments (recentPaymentsList, amount) {
    const list = Object.entries(recentPaymentsList).
      map(([_, { amount, expenseName, isIncome, date }]) => {
        return `
        <li class="recent-payments__item">
          <h3 class="recent-payments__name">${expenseName}</h3>
          <p class="recent-payments__amount ${isIncome
          ? 'recent-payments__plus'
          : 'recent-payments__minus'} recent-payments__label">
          ${isIncome ? '+' : '-'} ${amount}
          </p>
          <p class="recent-payments__date">${date}</p>
        </li>
      `
      })
    return list.reverse('').filter((_, index) => index <= amount).join('')
  },
}
import { Auth } from './User/Auth.js'
import { GroupBill } from './GroupBill/GroupBill.js'

const spa = document.getElementById('spa')
const auth = new Auth()
const groupBill = new GroupBill()

document.addEventListener('DOMContentLoaded', () => {
  window.location.hash = '#dashboard'
  window.location.hash = '#login'
})

window.addEventListener('hashchange', spaHandler)

async function spaHandler (location) {
  let viewName = window.location.hash.split('#')[1]
  if (typeof (location) === 'string') viewName = location

  switch (viewName) {
    case 'register': {
      spa.innerHTML = await getPage(viewName)
      setFieldsAuth()
      switch (document.documentElement.lang) {
        case 'ru': {
          changeAuthLink('Логин', '#login')
          break
        }
        case 'en': {
          changeAuthLink('Login', '#login')
          break
        }
      }

      break
    }
    case 'login': {
      spa.innerHTML = await getPage(viewName)
      setFieldsAuth(true)
      switch (document.documentElement.lang) {
        case 'ru': {
          changeAuthLink('Регистрация', '#register')
          break
        }
        case 'en': {
          changeAuthLink('Register', '#register')
          break
        }
      }
      break
    }
    case 'dashboard': {
      if (!firebase.auth().currentUser) {
        spa.innerHTML = await getPage('login')
        break
      }

      spa.innerHTML = await getPage(viewName)
      groupBill.fillUserCreatedExpenses(3)
      groupBill.fillExpensesToPay(3)
      groupBill.fillRecentPayments(5)
      groupBill.handleHideButton('user-created-expenses')
      groupBill.handleHideButton('expense-to-pay')

      groupBill.handleUserCreatedExpensesClicks()
      groupBill.handleExpensesToPayClicks()

      break
    }
    case 'add-expense': {
      if (!firebase.auth().currentUser) {
        spa.innerHTML = await getPage('login')
        break
      }
      spa.innerHTML = await getPage(viewName)
      groupBill.handleAddExpense()
      break
    }
    case 'edit-expense': {
      if (!firebase.auth().currentUser) {
        spa.innerHTML = await getPage('login')
        break
      }
      spa.innerHTML = await getPage(viewName)
      groupBill.handleEditExpense()
      break
    }
    case 'info-expense': {
      if (!firebase.auth().currentUser) {
        spa.innerHTML = await getPage('login')
        break
      }
      spa.innerHTML = await getPage(viewName)
      groupBill.handleInfoExpense()
      break
    }
    default: {
      spa.innerHTML = await getPage(viewName)
    }
  }
}

async function getPage (viewName) {
  let res
  if (document.documentElement.lang === 'en') {
    res = await fetch(`../views/${viewName}.html`)
  } else {
    res = await fetch(`../views/ru/${viewName}.html`)
  }
  return await res.text()
}

function changeAuthLink (text, href) {
  const authLink = document.querySelector('.auth-link')
  authLink.textContent = text
  authLink.href = href
}

function setFieldsAuth (isLogin = false) {
  auth.setBtn(document.querySelector('.login__button'), isLogin)
  auth.setForm(document.querySelector('.login'))
  auth.setFields({
    email: document.querySelector('#login__email'),
    password: document.querySelector('#login__password'),
    error: document.querySelector('.error'),
  })
  auth.setAuthLinkHandler(changeAuthLink)
}

document.querySelector('#language').addEventListener('change', (e) => {
  switch (e.target.value) {
    case 'ru': {
      window.location.href = '../index.ru.html'
      break
    }
    case 'en': {
      window.location.href = '../index.html'
      break
    }
  }
})
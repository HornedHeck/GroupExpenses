import { addNewListItemDB } from '../utils/FirebaseUtils.js'

export class Auth {
  constructor () {
    this.loginHandler = this.loginHandler.bind(this)
    this.registerHandler = this.registerHandler.bind(this)

    firebase.auth().onAuthStateChanged((user) => user
      ? this.stateChangeHandler(true)
      : this.stateChangeHandler(false))
  }

  setForm (form) {
    this.form = form
    this.form.onsubmit = () => false
  }

  setFields ({ email, password, error }) {
    this.emailField = email
    this.passwordField = password
    this.errorField = error
  }

  setBtn (btn, isLogin = false) {
    this.btn = btn
    if (isLogin) {
      this.btn.addEventListener('click', this.loginHandler)
    } else {
      this.btn.addEventListener('click', this.registerHandler)
    }
  }

  setLogoutBtn (btn) {
    this.logoutBtn = btn
    this.logoutBtn.addEventListener('click', this.logoutHandler)
  }

  setAuthLinkHandler (handler) {
    this.changeAuthLink = handler
  }

  loginHandler () {
    firebase.auth().signInWithEmailAndPassword(
      this.emailField.value,
      this.passwordField.value,
    ).catch((error) => this.errorField.textContent = error.message)
  }

  registerHandler () {
    firebase.auth().
      createUserWithEmailAndPassword(
        this.emailField.value,
        this.passwordField.value,
      ).then((userCredential) => {
      addNewListItemDB(`users/`, {
        email: userCredential.user.email,
      })
    }).catch((error) => this.errorField.textContent = error.message)
  }

  async logoutHandler () {
    await firebase.auth().signOut()
  }

  stateChangeHandler (login) {
    if (login) {
      switch (document.documentElement.lang) {
        case 'ru': {
          this.changeAuthLink('Выйти', '#login')
          break
        }
        case 'en': {
          this.changeAuthLink('Log out', '#login')
          break
        }
      }
      this.setLogoutBtn(document.querySelector('.auth-link'))
      window.location.hash = '#dashboard'
    } else {
      window.location.hash = '#login'
    }
  }
}
const themeSwitcher = document.querySelector('#theme-switcher')
const themeSwitcherLabel = document.querySelector('.theme-switcher__label')

themeSwitcher.addEventListener('change', toggleTheme)
document.body.addEventListener('DOMContentLoaded', () => {
  toggleTheme()
})

function setTheme (themeName) {
  localStorage.setItem('theme', themeName)
  document.documentElement.className = themeName
}

function toggleTheme () {
  themeSwitcherLabel.classList.toggle('theme-switcher__label_active')
  localStorage.getItem('theme') === 'theme-dark'
    ? setTheme('theme-light')
    : setTheme('theme-dark')
}

(function () {
  if (localStorage.getItem('theme') === 'theme-dark') {
    themeSwitcherLabel.classList.toggle('theme-switcher__label_active')
    setTheme('theme-dark')
  } else {
    setTheme('theme-light')
  }
})()
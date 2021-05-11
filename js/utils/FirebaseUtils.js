export const FirebaseUtils = {
  async addNewListItemDB (refTemplate, fields) {
    const dbRef = firebase.database().ref(refTemplate)
    const newItem = dbRef.push()
    await newItem.set(fields)
    return newItem.key
  },
  async setDataDB (refTemplate, fields) {
    await firebase.database().ref(refTemplate).set(fields)
  },
  async updateDataDB (refTemplate, fields) {
    await firebase.database().ref(refTemplate).update(fields)
  },
  async deleteDataDB (refTemplate) {
    await firebase.database().ref(refTemplate).remove()
  },
  async getInfoDB (refTemplate) {
    return new Promise((resolve, reject) => {
      const dbRef = firebase.database().ref(refTemplate)
      dbRef.get().then((snapshot) => {
        if (snapshot.exists()) {
          resolve(snapshot.val())
        } else {
          reject('No data available')
        }
      }).catch((error) => {
        reject(error)
      })
    })
  },
  async checkUserExistence (userEmail) {
    const entries = await this.getInfoDB(`users`)
    return new Promise((resolve, reject) => {
      Object.entries(entries).forEach(([_, { email }]) => {
        if (email === userEmail) resolve(true)
      })
      reject('User doesn\'t exist')
    })
  },
  async getUserUID (userEmail) {
    const users = await this.getInfoDB(`users/`)
    return Object.entries(users).find(([_, { email }]) => email === userEmail)
  },
  async getParticipantInfo (expenseUID, participantEmail) {
    const participants = await this.getInfoDB(
      `expenses/${expenseUID}/participants/`)
    return Object.entries(participants).
      find(([_, { email }]) => email === participantEmail)
  },
}
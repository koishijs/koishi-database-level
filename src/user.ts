import { observe } from 'koishi-utils'
import { injectMethods, UserData, createUser } from 'koishi-core'

import { sublevels } from './database'

sublevels.userDB = { keyEncoding: 'json', valueEncoding: 'json' }

injectMethods('level', {
  async getUser (userId, defaultAuthority = 0) {
    const data = await this.subs.userDB.get(userId).catch(() => undefined) as UserData | void
    let fallback: UserData
    if (data) {
      return data
    } else if (defaultAuthority < 0) {
      return null
    } else {
      fallback = createUser(userId, defaultAuthority)
      if (defaultAuthority) {
        await this.subs.userDB.put(userId, fallback)
      }
    }
    return data || fallback
  },

  async getUsers (ids) {
    const users = await Promise.all(ids.map(id => this.getUser(id, -1)))
    return users.filter(Boolean)
  },

  getAllUsers () {
    return new Promise<UserData[]>(resolve => {
      const datas = []
      this.subs.userDB.createValueStream()
        .on('data', data => {
          datas.push(data)
        })
        .on('end', () => resolve(datas))
    })
  },

  async setUser (userId, data) {
    const originalData = await this.getUser(userId)
    const newData: UserData = { ...originalData, ...data }
    await this.subs.userDB.put(userId, newData)
  },

  async observeUser (user, defaultAuthority = 0) {
    if (typeof user === 'number') {
      const data = await this.getUser(user, defaultAuthority)
      return data && observe(data, diff => this.setUser(user, diff))
    } else if ('_diff' in user) {
      return user
    } else {
      return observe(user, diff => this.setUser(user.id, diff))
    }
  },

  getUserCount () {
    return new Promise<number>(resolve => {
      let userNum = 0
      this.subs.userDB.createKeyStream()
        .on('data', () => {
          userNum++
        })
        .on('end', () => resolve(userNum))
    })
  },
})

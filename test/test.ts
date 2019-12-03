import '../src'
import { createApp } from 'koishi-core'

import { assert } from 'chai'

const newApp = () => createApp({
  database: {
    level: { path: './db' },
  },
})

describe('LEVEL', function () {
  context('init', function () {
    it('createApp', function () {
      const app = newApp()
      assert.isObject(app)
    })
  })

  context('user', function () {
    const app = newApp()
    it('getUser unknow user', async function () {
      const userId = 123
      const user = await app.database.getUser(userId)
      assert.strictEqual(userId, user.id)
    })
  })

  context('group', function () {
    const app = newApp()
    it('getUser unknow user', async function () {
      const groupId = 123
      const group = await app.database.getGroup(groupId)
      assert.strictEqual(groupId, group.id)
    })
  })
})

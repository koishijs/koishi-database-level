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

  const app = newApp()
  context('user', function () {
    afterEach(async function () {
      // @ts-ignore
      await app.database.level.subs.userDB.clear()
    })

    it('getUser unknow user', async function () {
      const userId = 123
      const user = await app.database.getUser(userId)
      assert.strictEqual(userId, user.id)
    })

    it('setUser', async function () {
      const id = 233
      const flag = 8
      await app.database.setUser(id, { flag })
      const user = await app.database.getUser(id)
      assert.strictEqual(flag, user.flag)
    })

    it('getAllUsers', async function () {
      const num = 451
      await Promise.all(Array(num).fill(undefined).map((_, i) => app.database.getUser(i + 1, 1)))
      const users = await app.database.getAllUsers()
      assert.strictEqual(num, users.length)
      assert.isNumber(users[num - 1].id)
    })

    it('getUsers', async function () {
      const sum = (nums: number[]) => nums.reduce((a, b) => a + b)
      const num = 233
      const ids = [12, 21, 100, 200]
      const idsSum = sum(ids)

      await Promise.all(Array(num).fill(undefined).map((_, i) => app.database.getUser(i + 1, 1)))
      const users = await app.database.getUsers(ids)
      const userIdsSum = sum(users.map(({ id }) => id))

      assert.strictEqual(idsSum, userIdsSum)
    })

    it('observeUser diff update', async function () {
      const id = 2
      const flag = 823

      const observableUser = await app.database.observeUser(id)
      observableUser.flag = 823
      await observableUser._update()

      const user = await app.database.getUser(id)
      assert.strictEqual(flag, user.flag)
    })

    it('getUserCount', async function () {
      const num = 321
      await Promise.all(Array(num).fill(undefined).map((_, i) => app.database.getUser(i + 1, 1)))
      const count = await app.database.getUserCount()
      assert.strictEqual(num, count)
    })
  })

  context('group', function () {
    beforeEach(async function () {
      // @ts-ignore
      await app.database.level.subs.groupDB.clear()
    })

    it('getGroup unknow group', async function () {
      const groupId = 123
      const group = await app.database.getGroup(groupId)
      assert.strictEqual(groupId, group.id)
    })

    it('setGroup', async function () {
      const groupId = 123
      const flag = 238
      await app.database.setGroup(groupId, { flag })
      const group = await app.database.getGroup(groupId)
      assert.strictEqual(flag, group.flag)
    })

    it('getAllGroups', async function () {
      const num = 233
      await Promise.all(Array(num).fill(undefined).map((_, i) => app.database.getGroup(i + 1, 1)))
      const groups = await app.database.getAllGroups(undefined, [1])
      assert.strictEqual(num, groups.length)
      assert.isNumber(groups[num - 1].id)
    })

    it('getGroupCount', async function () {
      const num = 133
      await Promise.all(Array(num).fill(undefined).map((_, i) => app.database.getGroup(i + 1, 1)))
      const count = await app.database.getGroupCount()
      assert.strictEqual(num, count)
    })
  })
})

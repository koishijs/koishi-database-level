import { assignees as assigneeIds, injectMethods, GroupData, createGroup, groupFields } from 'koishi-core'

import { sublevels } from './database'

sublevels.groupDB = { keyEncoding: 'json', valueEncoding: 'json' }

injectMethods('level', {
  async getGroup (groupId, selfId = 0): Promise<GroupData> {
    const data = await this.subs.groupDB.get(groupId).catch(() => undefined) as GroupData | void
    let fallback: GroupData
    if (!data) {
      fallback = createGroup(groupId, selfId)
      if (selfId && groupId) {
        await this.subs.groupDB.put(groupId, fallback)
      }
    }

    return data || fallback
  },

  getAllGroups (_, assignees = assigneeIds) {
    return new Promise<GroupData[]>(resolve => {
      const groups: GroupData[] = []
      this.subs.groupDB.createValueStream()
        .on('data', (group: GroupData) => {
          if (assignees) {
            if (assignees.includes(group.assignee)) {
              groups.push(group)
            }
          } else {
            groups.push(group)
          }
        })
        .on('end', () => resolve(groups))
    })
  },

  async setGroup (groupId, data) {
    const originalData = await this.getGroup(groupId)
    const newData: GroupData = { ...originalData, ...data }
    await this.subs.groupDB.put(groupId, newData)
  },
})

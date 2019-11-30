import { assignees as assigneeIds, injectMethods, GroupData, createGroup, groupFields } from 'koishi-core'

injectMethods('level', {
  async getGroup (groupId, selfId = 0): Promise<GroupData> {
    const data = await this.groupDB.get(groupId).catch(() => undefined) as GroupData | void
    let fallback: GroupData
    if (!data) {
      fallback = createGroup(groupId, selfId)
      if (selfId && groupId) {
        await this.groupDB.put(groupId, fallback)
      }
    }

    return data || fallback
  },

  getAllGroups (_keys = groupFields, assignees = assigneeIds) {
    return new Promise<GroupData[]>(resolve => {
      const groups: GroupData[] = []
      this.groupDB.createValueStream()
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
    await this.groupDB.put(groupId, newData)
  },
})

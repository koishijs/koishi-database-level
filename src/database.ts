import { registerSubdatabase } from 'koishi-core'

import leveldown from 'leveldown'
import levelup, { LevelUp, LevelUpChain } from 'levelup'
import sub from 'subleveldown'

type LevelConfig = {
  path: string
}

type encodings = 'utf8' | 'json' | 'binary' | 'hex' | 'ascii' | 'base64' | 'ucs2' | 'utf16le' | 'utf-16le' | 'none'

type CodecEncoder = {
  encode: (val: any) => any
  decode: (val: any) => any
  buffer: boolean
  type: string
}

type encodingOption = CodecEncoder | encodings

type subConfig = { name?: string, valueEncoding: encodingOption, keyEncoding: encodingOption }

export const sublevels: Record<string, subConfig> = {}

class LevelDatabase {
  private baseDB: LevelUp
  public subs: Record<string, LevelUp>

  constructor({ path }: LevelConfig) {
    this.baseDB = levelup(leveldown(path))

    Object.entries(sublevels)
      .forEach(([name, config]) => {
        this.subs[name] = this.separate({ name, ...config })
      })
  }

  separate ({ name, valueEncoding, keyEncoding }: subConfig): LevelUp {
    return sub(this.baseDB, name, { valueEncoding, keyEncoding })
  }
}

registerSubdatabase('level', LevelDatabase)

declare module 'koishi-core/dist/database' {
  interface Subdatabases {
    level: LevelDatabase
  }

  interface DatabaseConfig {
    level: LevelConfig
  }
}

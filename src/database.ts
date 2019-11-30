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

type subConfig = { name: string, valueEncoding: encodingOption, keyEncoding: encodingOption }

class LevelDatabase {
  private baseDB: LevelUp
  public userDB: LevelUp
  public groupDB: LevelUp

  constructor ({ path }: LevelConfig) {
    this.baseDB = levelup(leveldown(path))

    this.userDB = this.separate({ name: 'user', keyEncoding: 'json', valueEncoding: 'json' })
    this.groupDB = this.separate({ name: 'user', keyEncoding: 'json', valueEncoding: 'json' })
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

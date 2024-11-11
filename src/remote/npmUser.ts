import { Author, Avatars, DateClass, DistTags } from "./npmPackage"

export interface NpmUserPackageObject {
  id: number
  name: string
  private: boolean
  publish_requires_tfa: null
  settings: null
  created: DateClass
  updated: DateClass
  version: string
  is_high_impact: boolean
  freeze_status: null
  description: string
  maintainers: string[]
  "dist-tags": DistTags
  lastPublish: {
    maintainer: string
    time: string
    formattedTime: string
  }
  types: {
    typescript: {
      bundled: string
    }
  }
  publisher: Author
  date: DateClass
}

export interface NpmUserPackage {
  total: number
  urls: Record<string, unknown>
  objects: NpmUserPackageObject[]
}

export interface NpmUserResources {
  fullname?: string
  github?: null
  twitter?: null
}

export interface NpmUserScopeUser {
  type: "user"
  name: string
  parent: {
    name: string
    avatars: Avatars
    resource: NpmUserResources
  }
  created: string
  updated: string
  urls: {
    detail: string
    refresh: string
    teams: string
    packages: string
    addPackage: null
  }
  id: number
  account: null
  resource: NpmUserResources
}

export interface NpmUserScopeOrg {
  type: "org"
  parent: {
    deleted: null
    name: string
    description: null
    tfa_enforced: boolean
    created: string
    updated: string
    resource: NpmUserResources
  }
  created: string
  updated: string
  account: null
}

export interface NpmUser {
  scope: NpmUserScopeOrg | NpmUserScopeUser
  packages: NpmUserPackage
  pagination: {
    perPage: number
    page: number
  }
  user: null
  auditLogEnabled: boolean
  isAccountLinkEnabledForUser?: boolean
  userEmailVerified: null
  notifications: []
}

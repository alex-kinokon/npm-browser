import type { Author, Avatars, Capsule, DateClass } from "./npmPackage"

export interface NpmSite {
  showMFABanner: boolean
  setupTfaOnAccountLink: string
  packageCount: number
  downloadStats: {
    month: number
    week: number
  }
  mostDependedModules: string[]
  recentlyUpdatedPackages: RecentlyUpdatedPackage[]
  user: Author
  auditLogEnabled: boolean
  userEmailVerified: boolean
  csrftoken: string
  notifications: any[]
  npmExpansions: string[]
}

export interface RecentlyUpdatedPackage extends Capsule {
  publisher: {
    name: string
    avatars: Avatars
  }
  date: DateClass
  version: string
}

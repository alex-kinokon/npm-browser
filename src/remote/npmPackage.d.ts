export interface NpmPackage {
  canEditPackage: boolean
  capsule: Capsule
  dependents: Dependents
  downloads: Download[]
  ghapi: string
  isStarred: boolean
  linkingAllowedForPackage: boolean
  package: string
  packageLinkingCallToActionHref: null
  packageUrl: string
  packageVersion: Packument
  packument: Packument
  private: boolean
  isSecurityPlaceholder: boolean
  provenance: Provenance
  starAction: string
  versionsDownloads: VersionsDownloads
  readme: Readme
  undefined: boolean
  documentContext: DocumentContext
  user: null
  auditLogEnabled: boolean
  userEmailVerified: null
  csrftoken: string
  notifications: any[]
  npmExpansions: string[]
}

export interface Capsule {
  name: string
  description: string
  maintainers: string[]
  "dist-tags": DistTags
  lastPublish: LastPublish
  types: Types
}

interface DistTags {
  latest: string
}

interface LastPublish {
  maintainer: string
  time: Date
}

interface Types {
  typescript?: {
    package: string
    bundled?: "typesVersions"
  }
}

interface Dependents {
  dependentsCount: number
  dependentsTruncated: string[]
}

interface DocumentContext {
  "readme.data": string
}

interface Download {
  downloads: number
  label: string
}

interface Packument {
  author: Author
  description: string
  homepage: string
  repository: string
  keywords?: string[]
  maintainers: Author[]
  name: string
  version: string
  versions: Version[]
  deprecated?: string
  deprecations: string[]
  distTags?: DistTags
}

export interface Author {
  name: string
  avatars: Avatars
}

interface Avatars {
  small: string
  medium: string
  large: string
}

interface Version {
  version: string
  date: DateClass
  deprecated: string
  dist: Dist
}

export interface DateClass {
  ts: number
  rel: string
}

interface Dist {
  shasum: string
  tarball: string
  integrity: string
  signatures: Signature[]
}

interface Signature {
  keyid: string
  sig: string
}

interface Provenance {
  enabled: boolean
  feedbackUrl: string
}

interface Readme {
  data: string
  ref: string
}

interface VersionsDownloads {
  [key: string]: number
}

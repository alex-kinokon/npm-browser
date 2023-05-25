export interface NpmSearchResult {
  objects: Object[]
  total: number
  time: string
}

export interface Object {
  package: Package
  score: {
    final: number
    detail: {
      quality: number
      popularity: number
      maintenance: number
    }
  }
  searchScore: number
}

export interface Package {
  name: string
  scope: string
  version: string
  description: string
  keywords?: string[]
  date: Date
  links: {
    npm: string
    homepage: string
    repository?: string
    bugs?: string
  }
  publisher: Publisher
  maintainers: Publisher[]
  author?: {
    name: string
    email?: string
    username?: string
    url?: string
  }
}

interface Publisher {
  username: string
  email: string
}

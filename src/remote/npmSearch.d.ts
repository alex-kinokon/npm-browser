export interface SearchResult {
  name: string
  scope: "unscoped"
  version: string
  description: string
  keywords: string[]
  date: string
  links: {
    npm: string
    homepage: string
    repository: string
    bugs: string
  }
  author: {
    name: string
  }
  publisher: Person
  maintainers: Person[]
}

interface Person {
  username: string
  email: string
}

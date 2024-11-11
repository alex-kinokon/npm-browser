export interface ProvenanceSummary {
  subjectAlternativeName: string
  certificateIssuer: string
  issuer: string
  issuerDisplayName: "GitHub Actions"
  buildTrigger: "workflow_dispatch"
  buildConfigUri: string
  sourceRepositoryUri: string
  sourceRepositoryDigest: string
  sourceRepositoryRef: string
  runInvocationUri: string
  expiresAt: string
  includedAt: string
  resolvedSourceRepositoryCommitUri: string
  transparencyLogUri: string
  buildConfigDisplayName: string
  resolvedBuildConfigUri: string
  artifactName: string
}

export interface Provenance {
  summary: ProvenanceSummary
  sourceCommitResponseCode: number
  sourceCommitUnreachable: boolean
  sourceCommitNotFound: boolean
}

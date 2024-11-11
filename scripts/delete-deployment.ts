#!/usr/bin/env tsx
import assert from "node:assert"

import "dotenv/config"
import ky, { type HTTPError } from "ky"

const name = "har-browser"

// Run `wrangler pages deployment list` to print the list of deployments
interface DeploymentResult {
  id: string
  short_id: string
  project_id: string
  project_name: string
  environment: "production"
  url: string
  created_on: string
  modified_on: string
  latest_stage: {
    name: "deploy"
    started_on: null
    ended_on: string
    status: "success"
  }
  deployment_trigger: {
    type: "ad_hoc"
    metadata: {
      branch: string
      commit_hash: string
      commit_message: string
      commit_dirty: boolean
    }
  }
  stages: {
    name: "queued" | "initialize" | "clone_repo" | "build" | "deploy"
    started_on: string | null
    ended_on: null
    status: "active" | "idle" | "success"
  }[]
  build_config: {
    build_command: null
    destination_dir: null
    build_caching: null
    root_dir: null
    web_analytics_tag: null
    web_analytics_token: null
  }
  env_vars: Record<string, never>
  compatibility_date: string
  compatibility_flags: []
  build_image_major_version: number
  usage_model: null
  aliases: null
  is_skipped: boolean
  production_branch: string
}
interface Deployments {
  result: DeploymentResult[]
  success: boolean
  errors: []
  messages: []
  result_info: {
    page: number
    per_page: number
    count: number
    total_count: number
    total_pages: number
  }
}

async function main() {
  const { CLOUDFLARE_ID, CLOUDFLARE_TOKEN } = process.env
  assert(CLOUDFLARE_ID, "Missing CLOUDFLARE_ID")
  assert(CLOUDFLARE_TOKEN, "Missing CLOUDFLARE_TOKEN")

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ID}/pages/projects/${name}/deployments`

  const headers: HeadersInit = {
    "Content-Type": "application/json;charset=UTF-8",
    Authorization: "Bearer " + CLOUDFLARE_TOKEN,
  }

  const deployments: Deployments = await ky.get(endpoint, { headers }).json()

  const results = deployments.result
    .map((item) => ({
      id: item.id,
      created: new Date(item.created_on),
    }))
    .toSorted((a, b) => +a.created - +b.created)
  results.pop()

  for (const deployment of results) {
    // Delete the deployment
    console.log(
      `Deleting deployment ${deployment.id} from ${deployment.created.toLocaleString()}`,
    )
    try {
      await ky.delete(`${endpoint}/${deployment.id}`, { headers })
    } catch (err) {
      const e: HTTPError = err
      console.error(e.message)
    }
  }
}

void main()

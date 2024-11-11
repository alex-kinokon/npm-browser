/* eslint-disable unicorn/consistent-destructuring */
import { Callout, Intent } from "@blueprintjs/core"
import {
  WarningSign as AlertIcon,
  SymbolSquare as StopIcon,
  Tick as VerifiedIcon,
} from "@blueprintjs/icons"
import { css } from "@emotion/css"
import { useQuery } from "@tanstack/react-query"
import React from "react"

import { useT } from "~/Locale"
import { getPackageInfo, getProvenance } from "~/remote"
import type { ProvenanceSummary } from "~/remote/provenance"

import type { PackageIdentifier } from "./package"

export function ProvenanceView({
  id: { name, version },
}: {
  id: PackageIdentifier
}) {
  const t = useT()
  const { data: npm } = useQuery(getPackageInfo(name))
  const { data: provenance } = useQuery({
    ...getProvenance(name, version),
    enabled: npm?.provenance.enabled,
  })

  if (!provenance) {
    return null
  }

  const unreachable = provenance.sourceCommitUnreachable

  return (
    <Callout
      css="mb-2 rounded"
      icon={
        unreachable ? (
          provenance.sourceCommitNotFound ? (
            <StopIcon />
          ) : (
            <AlertIcon />
          )
        ) : (
          <VerifiedIcon />
        )
      }
      intent={
        unreachable
          ? provenance.sourceCommitNotFound
            ? Intent.DANGER
            : Intent.WARNING
          : Intent.PRIMARY
      }
      title={t({
        en: "Provenance",
        fr: "Origine",
        ja: "起源",
        "zh-Hant": "來源",
      })}
    >
      {unreachable ? (
        <SourceCommitUnreachableMessage
          code={provenance.sourceCommitResponseCode}
        />
      ) : (
        <ProvenanceDetailsContainer summary={provenance.summary} />
      )}
    </Callout>
  )
}

function SourceCommitUnreachableMessage({ code }: { code: number }) {
  const t = useT()

  switch (code) {
    case 404:
      return t({
        en: "Error 404 Not Found. Unable to find the source commit for this package.",
        fr: "Erreur 404 Introuvable. Impossible de trouver le commit source pour ce paquet.",
        ja: "エラー: 404。このパッケージのソースコミットが見つかりません。",
        "zh-Hant": "錯誤: 404 未找到。無法找到此套件的原始提交。",
      })
    case 408:
      return t({
        en: "Error 408 Timeout fetching the source commit for this package.",
        fr: "Erreur 408 Délai d’attente lors de la récupération du commit source pour ce paquet.",
        ja: "エラー: 408。このパッケージのソースコミットを取得できません。",
        "zh-Hant": "錯誤: 408 超時。無法取得此套件的原始提交。",
      })
    default:
      return t({
        en: `Error ${code}. Unable to fetch the source commit for this package.`,
        fr: `Erreur ${code}. Impossible de récupérer le commit source pour ce paquet.`,
        ja: `エラー: ${code}。このパッケージのソースコミットを取得できません。`,
        "zh-Hant": `錯誤: ${code}。無法取得此套件的原始提交。`,
      })
  }
}

export function ProvenanceDetailsContainer({
  summary,
}: {
  summary: ProvenanceSummary
}) {
  const t = useT()
  const { sourceRepositoryUri } = summary

  const shortDigest = summary.sourceRepositoryDigest?.slice(0, 7)
  let repoHostWithProject = sourceRepositoryUri
  try {
    const repoUrl = new URL(sourceRepositoryUri)
    repoHostWithProject = repoUrl.host + repoUrl.pathname
  } catch {}

  return (
    <div
      className={css`
        a:link {
          text-decoration: none;
          &:hover,
          &:focus {
            text-decoration: underline;
          }
        }
      `}
    >
      <div>
        <div>
          {t({
            en: "Built and signed on",
            fr: "Construit et signé par",
          })}{" "}
          <strong>{summary.issuerDisplayName}</strong>.{" "}
          <a
            href={summary.runInvocationUri}
            rel="noopener noreferrer"
            target="_blank"
          >
            {t({
              en: "View build summary",
              fr: "Voir le résumé de la construction",
              ja: "ビルドの概要を表示",
              "zh-Hant": "查看構建摘要",
            })}
          </a>
        </div>
      </div>
      <table
        className={css`
          border-collapse: collapse;
          margin-top: 5px;
          th {
            font-weight: 500;
            text-align: left;
          }
          th,
          td {
            margin: 0;
            padding: 0;
          }
          th {
            padding-right: 6px;
          }
        `}
      >
        <tbody>
          <tr>
            <th>
              {t({
                en: "Source Commit",
                fr: "Commit source",
                ja: "ソースコミット",
                "zh-Hant": "源提交",
              })}
            </th>
            <td>
              <a
                href={summary.resolvedSourceRepositoryCommitUri}
                rel="noopener noreferrer"
                target="_blank"
              >
                {[repoHostWithProject, shortDigest].filter(Boolean).join("@")}
              </a>
            </td>
          </tr>
          <tr>
            <th>
              {t({
                en: "Build File",
                fr: "Fichier de construction",
                ja: "ビルドファイル",
                "zh-Hant": "構建文件",
              })}
            </th>
            <td>
              <a
                href={summary.resolvedBuildConfigUri}
                rel="noopener noreferrer"
                target="_blank"
              >
                {summary.buildConfigDisplayName}
              </a>
            </td>
          </tr>
          <tr>
            <th>
              {t({
                en: "Public Ledger",
                fr: "Registre public",
                ja: "公開台帳",
                "zh-Hant": "公共總帳",
              })}
            </th>
            <td>
              <a
                href={summary.transparencyLogUri}
                rel="noopener noreferrer"
                target="_blank"
              >
                {t({
                  en: "Transparency log entry",
                  fr: "Entrée du registre de transparence",
                })}
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

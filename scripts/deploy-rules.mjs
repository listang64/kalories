import { createSign } from 'node:crypto'
import { readFile } from 'node:fs/promises'

const PROJECT = 'kalories-20c02'
const RULES_API = `https://firebaserules.googleapis.com/v1/projects/${PROJECT}`
const RELEASE = `projects/${PROJECT}/releases/cloud.firestore`

function fail(message) {
  console.error(`::error::${message}`)
  process.exit(1)
}

function readAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) fail('Secret FIREBASE_SERVICE_ACCOUNT absent : ajoute la clé du compte de service dans les secrets du dépôt.')
  try {
    const account = JSON.parse(raw)
    if (account.project_id !== PROJECT) fail(`La clé appartient au projet ${account.project_id}, pas à ${PROJECT}.`)
    return account
  } catch {
    fail('Secret FIREBASE_SERVICE_ACCOUNT illisible : colle le contenu complet du fichier JSON.')
  }
}

async function accessToken(account) {
  const now = Math.floor(Date.now() / 1000)
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url')
  const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({
    iss: account.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 600,
  })}`
  const signature = createSign('RSA-SHA256').update(unsigned).sign(account.private_key, 'base64url')
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${signature}`,
    }),
  })
  const data = await response.json()
  if (!response.ok) fail(`Connexion Google refusée : ${data.error_description ?? data.error}`)
  return data.access_token
}

async function call(token, method, url, body) {
  const response = await fetch(url, {
    method,
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await response.json()
  if (!response.ok) {
    const issues = (data.error?.details ?? []).flatMap((detail) => detail.sourceIssues ?? [])
    for (const issue of issues) console.error(`L${issue.sourcePosition?.line} : ${issue.description}`)
    fail(`${method} ${url} → ${response.status} ${data.error?.message ?? ''}`)
  }
  return data
}

const account = readAccount()
const content = await readFile(new URL('../firestore.rules', import.meta.url), 'utf8')
const token = await accessToken(account)
const current = await call(token, 'GET', `${RULES_API}/releases/cloud.firestore`)
const live = await call(token, 'GET', `https://firebaserules.googleapis.com/v1/${current.rulesetName}`)
if (live.source?.files?.some((file) => file.content === content)) {
  console.log(`Règles Firestore déjà à jour : ${current.rulesetName}`)
  process.exit(0)
}
const ruleset = await call(token, 'POST', `${RULES_API}/rulesets`, {
  source: { files: [{ name: 'firestore.rules', content }] },
})
const release = await call(token, 'PATCH', `${RULES_API}/releases/cloud.firestore`, {
  release: { name: RELEASE, rulesetName: ruleset.name },
})
if (release.rulesetName !== ruleset.name) fail('La publication des règles n’a pas été confirmée.')
console.log(`Règles Firestore publiées : ${ruleset.name}`)

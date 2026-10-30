/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['context']
 * INFO: Tag scanner: tag slices, tree output, coverage check.
 */

// Tag scanner: collects file tags, prints tag slices, verifies coverage.
// Usage:
//   node context/tags.js --tags        list tags with file counts
//   node context/tags.js t1 [t2 ...] [--not t3 ...] [--filter dir ...]   print tree; --not excludes tags, --filter keeps only the given prefixes
//   --show-info                                       append the INFO line to the tree names
//   node context/tags.js --check       fail on untagged files, conflicts, headers without SPDX

import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const JSON_PATH = join(ROOT, 'context', 'tags.json')

// Languages allowed to carry tags in the file header; extend here if needed.
const IN_FILE_LANGS = new Set(['.js', '.jsx', '.rs'])
const HEADER_LINES = 10

// Tracked plus untracked-but-not-ignored files, checked for existence:
// the scanner shows the project on disk, not a stale git index.
const listFiles = () =>
  execSync('git ls-files --cached --others --exclude-standard', {
    cwd: ROOT,
    encoding: 'utf8',
  })
    .split('\n')
    .filter(Boolean)
    .filter(f => existsSync(join(ROOT, f)))

const loadJson = () => JSON.parse(readFileSync(JSON_PATH, 'utf8'))

// In-file tags and INFO live in the SPDX header of js/jsx/rs only; all other files are json-only.
const inFileHeader = file => {
  if (!IN_FILE_LANGS.has(file.slice(file.lastIndexOf('.')))) return null
  const head = readFileSync(join(ROOT, file), 'utf8').split('\n', HEADER_LINES)
  const line = head.find(l => /TAGS:\s*\[/.test(l))
  const info = head.find(l => /INFO:\s*\S/.test(l))
  return {
    tags: line ? [...line.matchAll(/'([^']*)'/g)].map(m => m[1]).filter(Boolean) : null,
    info: info ? info.match(/INFO:\s*(.+)$/)[1].trim() : null,
    spdx: head.some(l => /SPDX-License-Identifier/.test(l)),
  }
}

function collect() {
  const files = listFiles()
  const json = loadJson()
  const index = new Map()
  const info = new Map()
  const problems = []
  for (const file of files) {
    const fromJson = json[file]
    const header = inFileHeader(file)
    const fromFile = header?.tags ?? null
    if (fromJson && fromFile) {
      problems.push(`conflict: ${file} is tagged in tags.json and in the file header`)
      index.set(file, fromJson)
    } else {
      index.set(file, fromJson ?? fromFile)
    }
    // INFO describes content, not tagging — it is kept even for a json/header conflict
    if (header?.info) info.set(file, header.info)
    if (fromFile && !header.spdx) {
      problems.push(`error: ${file} has TAGS but no SPDX-License-Identifier in the header`)
    }
  }
  for (const file of Object.keys(json)) {
    if (!files.includes(file)) {
      problems.push(`error: tags.json entry has no file: ${file}`)
    }
  }
  return { index, info, problems }
}

// Render matched paths as a directory tree; showInfo appends the INFO line.
function printTree(entries, info, showInfo) {
  const tree = {}
  let dirs = 0
  let files = 0
  for (const [p] of entries) {
    const parts = p.split('/')
    let node = tree
    for (let i = 0; i < parts.length; i++) {
      if (i === parts.length - 1) {
        ;(node[''] ??= []).push(showInfo && info.get(p) ? `${parts[i]} — ${info.get(p)}` : parts[i])
        files++
      } else if (node[parts[i]]) {
        node = node[parts[i]]
      } else {
        node = node[parts[i]] ??= {}
        dirs++
      }
    }
  }
  const walk = (node, prefix) => {
    const dirs = Object.keys(node)
      .filter(k => k !== '')
      .sort()
    const files = (node[''] ?? []).sort()
    const entries = [...dirs.map(d => [d, false]), ...files.map(f => [f, true])]
    entries.forEach(([name, isFile], i) => {
      const last = i === entries.length - 1
      process.stdout.write(`${prefix}${last ? '└── ' : '├── '}${name}\n`)
      if (!isFile) walk(node[name], `${prefix}${last ? '    ' : '│   '}`)
    })
  }
  walk(tree, '')
  console.log(`\n${dirs} directories, ${files} files`)
}

const [command, ...args] = process.argv.slice(2)
const { index, info, problems } = collect()

if (command === '--tags') {
  const counts = new Map()
  for (const tags of index.values()) {
    if (!tags) continue
    for (const t of tags) counts.set(t, (counts.get(t) ?? 0) + 1)
  }
  for (const [tag, count] of [...counts].sort()) {
    console.log(`${tag}: ${count}`)
  }
} else if (command === '--check') {
  const untagged = [...index.entries()].filter(([, tags]) => !tags).map(([f]) => f)
  for (const p of problems) console.log(p)
  for (const f of untagged) console.log(`untagged: ${f}`)
  if (untagged.length || problems.length) {
    process.exit(1)
  }
  console.log('OK')
} else if (command) {
  // --not starts excluded tags, --filter starts kept path prefixes; empty wanted prints all
  const showInfo = [command, ...args].includes('--show-info')
  const all = [command, ...args].filter(a => a !== '--show-info')
  const buckets = { wanted: new Set(), excluded: new Set(), filtered: [] }
  let key = 'wanted'
  for (const a of all) {
    if (a === '--not') key = 'excluded'
    else if (a === '--filter') key = 'filtered'
    else if (key === 'filtered') buckets.filtered.push(a)
    else buckets[key].add(a)
  }
  const { wanted, excluded, filtered } = buckets
  const unknown = [...wanted, ...excluded, ...filtered].filter(a => a.startsWith('--'))
  if (unknown.length) {
    console.log(`error: unknown option(s): ${unknown.join(', ')}`)
    process.exit(1)
  }
  const matched = [...index.entries()]
    .filter(([f, tags]) => wanted.size === 0 || (tags?.some(t => wanted.has(t)) ?? false))
    .filter(([f]) => filtered.length === 0 || filtered.some(d => f === d || f.startsWith(`${d}/`)))
    .filter(([, tags]) => !tags?.some(t => excluded.has(t)))
    .sort(([a], [b]) => (a > b ? 1 : a < b ? -1 : 0))
  if (matched.length) {
    printTree(matched, info, showInfo)
  } else {
    console.log(
      `no files for tags: ${[...wanted].join(', ')}${[...excluded].length ? ` (excluding ${[...excluded].join(', ')})` : ''}`
    )
  }
} else {
  console.log(
    'usage: node context/tags.js [--tags | --check | [--show-info] t1 [t2 ...] [--not t3 ...] [--filter dir ...]]'
  )
}

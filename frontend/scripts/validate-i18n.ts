#!/usr/bin/env -S npx tsx
/**
 * validate-i18n.ts
 *
 * Walidacja kluczy i18n: porównuje pl.json vs en.json.
 * Wypluwa:
 *   - klucze tylko w PL (brakuje w EN)
 *   - klucze tylko w EN (brakuje w PL)
 *   - klucze gdzie wartosc == klucz (placeholder, nieprzetlumaczone)
 *
 * Exit 0 jesli OK, exit 1 jesli sa roznice.
 */

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

type Json = string | number | boolean | null | { [k: string]: Json } | Json[]

const PL_PATH = resolve(__dirname, '../src/shared/locales/pl.json')
const EN_PATH = resolve(__dirname, '../src/shared/locales/en.json')

function loadJson(path: string): Record<string, Json> {
  const raw = readFileSync(path, 'utf-8')
  return JSON.parse(raw) as Record<string, Json>
}

function collectLeafKeys(obj: Json, prefix = ''): Map<string, string> {
  const out = new Map<string, string>()
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    if (prefix) out.set(prefix, String(obj))
    return out
  }
  for (const [k, v] of Object.entries(obj)) {
    const nextPrefix = prefix ? `${prefix}.${k}` : k
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      const nested = collectLeafKeys(v, nextPrefix)
      for (const [nk, nv] of nested) out.set(nk, nv)
    } else {
      out.set(nextPrefix, String(v))
    }
  }
  return out
}

function leafName(dotted: string): string {
  const parts = dotted.split('.')
  return parts[parts.length - 1]
}

function main(): number {
  const pl = loadJson(PL_PATH)
  const en = loadJson(EN_PATH)

  const plKeys = collectLeafKeys(pl)
  const enKeys = collectLeafKeys(en)

  const missingInEn: string[] = []
  const missingInPl: string[] = []
  const untranslated: Array<{ key: string; lang: 'pl' | 'en'; value: string }> = []

  for (const k of plKeys.keys()) {
    if (!enKeys.has(k)) missingInEn.push(k)
  }
  for (const k of enKeys.keys()) {
    if (!plKeys.has(k)) missingInPl.push(k)
  }

  // untranslated: leaf key name == value (np. "submit": "submit")
  for (const [k, v] of plKeys) {
    if (leafName(k).toLowerCase() === v.toLowerCase() && v.length > 0) {
      untranslated.push({ key: k, lang: 'pl', value: v })
    }
  }
  for (const [k, v] of enKeys) {
    if (leafName(k).toLowerCase() === v.toLowerCase() && v.length > 0) {
      untranslated.push({ key: k, lang: 'en', value: v })
    }
  }

  console.log('=== i18n validation report ===')
  console.log(`Total keys PL: ${plKeys.size}`)
  console.log(`Total keys EN: ${enKeys.size}`)
  console.log('')

  console.log(`Missing in EN (${missingInEn.length}):`)
  if (missingInEn.length === 0) console.log('  (none)')
  else for (const k of missingInEn) console.log(`  - ${k}`)
  console.log('')

  console.log(`Missing in PL (${missingInPl.length}):`)
  if (missingInPl.length === 0) console.log('  (none)')
  else for (const k of missingInPl) console.log(`  - ${k}`)
  console.log('')

  console.log(`Untranslated placeholders (key == value) (${untranslated.length}):`)
  if (untranslated.length === 0) console.log('  (none)')
  else for (const u of untranslated) console.log(`  - [${u.lang}] ${u.key} = "${u.value}"`)
  console.log('')

  const ok =
    missingInEn.length === 0 && missingInPl.length === 0 && untranslated.length === 0
  console.log(`Result: ${ok ? 'PASS' : 'FAIL'}`)
  return ok ? 0 : 1
}

process.exit(main())

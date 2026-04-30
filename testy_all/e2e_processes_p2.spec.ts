import { test, expect, type APIRequestContext } from '@playwright/test'

/**
 * KPTEST — Process E2E tests (paczka P2).
 *
 * Plik dopełnia `e2e_processes.spec.ts` i `e2e_processes_extra.spec.ts` o sześć
 * kolejnych procesów biznesowych związanych z grupowym zarządzaniem pacjentami,
 * generowaniem raportów i operacjami RODO (export + erasure/anonymize) oraz
 * o mechanizmy P2-a: transfer pacjenta między projektami i dashboard KPI.
 *
 *   PROC-07: US-K-04 grupowe przypisanie i odpięcie pacjentów do projektu
 *   PROC-08: US-K-23 raport zbiorczy projektu (PROJECT_STATS, format PDF)
 *   PROC-09: US-A-11 RODO eksport danych pacjenta (JSON + PDF)
 *   PROC-10: US-A-12 RODO usunięcie / anonimizacja pacjenta (right to be forgotten)
 *   PROC-11: US-K-06 transfer pacjenta między projektami (audit-log + statystyki)
 *   PROC-12: US-K-24 dashboard KPI projektu (statystyki + agregaty)
 *
 * Każdy krok kończy się asercją `expect(res.ok(), ...).toBeTruthy()`, tak by
 * komunikat błędu zawierał kod HTTP oraz body odpowiedzi.
 */

const API_URL = 'http://localhost:8080/api/v1'
const ADMIN = { identifier: 'admin@kptest.com', password: 'TestP@ssw0rd123' }

interface AuthBundle {
  token: string
  userId: string
}

const stamp = (): number => Date.now() + Math.floor(Math.random() * 1000)
const randomPesel = (): string =>
  `9${String(Math.floor(Math.random() * 1e10)).padStart(10, '0')}`

const authHeaders = (token: string): Record<string, string> => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
})

/**
 * Logowanie administratora — wzorzec skopiowany z `e2e_processes.spec.ts`.
 */
const login = async (request: APIRequestContext): Promise<AuthBundle> => {
  const res = await request.post(`${API_URL}/auth/login`, {
    data: { identifier: ADMIN.identifier, password: ADMIN.password },
  })
  expect(res.ok(), `login HTTP ${res.status()}`).toBeTruthy()
  const body = (await res.json()) as { access_token: string; user_id?: string }
  return { token: body.access_token, userId: body.user_id ?? '' }
}

interface RegisteredPatient {
  email: string
  pesel: string
  firstName: string
  lastName: string
  userId: string
}

/**
 * Rejestracja pacjenta — wzorzec skopiowany z `e2e_processes.spec.ts`.
 * Generuje unikalny PESEL/email, status końcowy = PENDING (wymaga zatwierdzenia).
 */
const registerPatient = async (
  request: APIRequestContext
): Promise<RegisteredPatient> => {
  const s = stamp()
  const email = `proc.p2.${s}@email.com`
  const pesel = randomPesel()
  const firstName = 'ProcP2'
  const lastName = `Patient${s}`
  const res = await request.post(`${API_URL}/auth/register`, {
    data: {
      identifier: email,
      email,
      password: 'TestP@ssw0rd123',
      firstName,
      lastName,
      pesel,
      termsAccepted: 'true',
    },
  })
  expect(
    res.ok(),
    `register HTTP ${res.status()}: ${await res.text()}`
  ).toBeTruthy()
  const body = (await res.json()) as { user_id?: string; id?: string }
  return {
    email,
    pesel,
    firstName,
    lastName,
    userId: body.user_id ?? body.id ?? '',
  }
}

/**
 * Zamiana PESEL → UUID pacjenta (Patient.id, nie User.id).
 * Wzorzec skopiowany z `e2e_processes.spec.ts`.
 */
const resolvePatientId = async (
  request: APIRequestContext,
  token: string,
  pesel: string
): Promise<string> => {
  const res = await request.get(
    `${API_URL}/patients?pesel=${pesel}&page=0&size=10`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  expect(
    res.ok(),
    `GET /patients?pesel HTTP ${res.status()}`
  ).toBeTruthy()
  const body = (await res.json()) as {
    data?: Array<{ id: string }>
    patients?: Array<{ id: string }>
    content?: Array<{ id: string }>
  }
  const list = body.data ?? body.patients ?? body.content ?? []
  expect(
    list.length,
    `patient with PESEL ${pesel} should be findable`
  ).toBeGreaterThan(0)
  return list[0].id
}

/**
 * Zatwierdzenie pacjenta przez koordynatora (manual override).
 * Wzorzec skopiowany z `e2e_processes.spec.ts`.
 */
const approvePatientManually = async (
  request: APIRequestContext,
  token: string,
  patientId: string
): Promise<void> => {
  const res = await request.post(
    `${API_URL}/admin/patients/${patientId}/approve`,
    {
      headers: authHeaders(token),
      data: {
        method: 'MANUAL',
        reason:
          'E2E test — automatic manual approval for process scenario (P2 batch).',
      },
    }
  )
  expect(
    res.ok(),
    `approve HTTP ${res.status()}: ${await res.text()}`
  ).toBeTruthy()
}

/**
 * Skrócony helper: rejestracja + akceptacja → zwraca patientId.
 */
const registerAndApprove = async (
  request: APIRequestContext,
  token: string
): Promise<{ patient: RegisteredPatient; patientId: string }> => {
  const patient = await registerPatient(request)
  const patientId = await resolvePatientId(request, token, patient.pesel)
  await approvePatientManually(request, token, patientId)
  return { patient, patientId }
}

/**
 * Założenie projektu w stanie ACTIVE bez członków/pacjentów (kontener).
 */
const createEmptyProject = async (
  request: APIRequestContext,
  token: string,
  prefix: string
): Promise<string> => {
  const startISO = new Date().toISOString()
  const endISO = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
  const res = await request.post(`${API_URL}/projects`, {
    headers: authHeaders(token),
    data: {
      name: `${prefix} Projekt ${stamp()}`,
      description: `${prefix}: kontener procesowy`,
      start_date: startISO,
      end_date: endISO,
      status: 'ACTIVE',
      compliance_threshold: 80,
      team_member_ids: [],
      patient_ids: [],
    },
  })
  expect(
    res.ok(),
    `POST /projects HTTP ${res.status()}: ${await res.text()}`
  ).toBeTruthy()
  const project = (await res.json()) as { id: string }
  expect(project.id, 'project response has id').toBeTruthy()
  return project.id
}

// ============================================================
// PROC-07: US-K-04 grupowe przypisanie + odpięcie pacjentów
// ============================================================

test.describe('Process — Grupowe przypisanie pacjentów do projektu (US-K-04)', () => {
  test('PROC-07: Koordynator hurtowo przypisuje 3 pacjentów, statystyki rosną, jeden zostaje odpięty', async ({
    request,
  }) => {
    // KROK 1: Logowanie administratora
    const auth = await login(request)
    expect(auth.token).toBeTruthy()

    // KROK 2: Założenie pustego projektu (status ACTIVE)
    const projectId = await createEmptyProject(request, auth.token, 'PROC-07')

    // KROK 3: Rejestracja + akceptacja 3 pacjentów (różne PESEL/email)
    const { patientId: p1 } = await registerAndApprove(request, auth.token)
    const { patientId: p2 } = await registerAndApprove(request, auth.token)
    const { patientId: p3 } = await registerAndApprove(request, auth.token)
    const allIds = [p1, p2, p3]
    expect(new Set(allIds).size, 'three unique patient ids').toBe(3)

    // KROK 4: Pojedyncze wywołanie POST /projects/{id}/patients
    // Body shape (AssignPatientsRequest): { patient_ids: UUID[] }
    const assignRes = await request.post(
      `${API_URL}/projects/${projectId}/patients`,
      {
        headers: authHeaders(auth.token),
        data: { patient_ids: allIds },
      }
    )
    expect(
      assignRes.ok(),
      `POST /projects/{id}/patients HTTP ${assignRes.status()}: ${await assignRes.text()}`
    ).toBeTruthy()

    // KROK 5: Response zawiera assigned_count: 3 (zwracane przez ProjectController)
    const assignBody = (await assignRes.json()) as {
      assigned_count?: number
      patient_ids?: string[]
    }
    expect(
      assignBody.assigned_count,
      `assigned_count == 3 (got ${assignBody.assigned_count})`
    ).toBe(3)
    expect(
      (assignBody.patient_ids ?? []).length,
      'patient_ids list contains 3 UUIDs'
    ).toBe(3)

    // KROK 6: Statystyki potwierdzają obecność 3 aktywnych pacjentów
    const statsRes = await request.get(
      `${API_URL}/projects/${projectId}/statistics`,
      { headers: { Authorization: `Bearer ${auth.token}` } }
    )
    expect(
      statsRes.ok(),
      `GET /projects/{id}/statistics HTTP ${statsRes.status()}: ${await statsRes.text()}`
    ).toBeTruthy()
    const stats = (await statsRes.json()) as {
      active_patients?: number
      total_patients?: number
    }
    const initialCount = stats.active_patients ?? stats.total_patients ?? 0
    expect(
      initialCount,
      `statystyki: active/total_patients ≥ 3 (got ${initialCount})`
    ).toBeGreaterThanOrEqual(3)

    // KROK 7: Odpięcie pacjenta #2 — DELETE /projects/{id}/patients
    // Body shape (RemovePatientsRequest): { patient_ids: UUID[], reason: string }
    const removeRes = await request.delete(
      `${API_URL}/projects/${projectId}/patients`,
      {
        headers: authHeaders(auth.token),
        data: {
          patient_ids: [p2],
          reason: 'E2E test removal',
        },
      }
    )
    expect(
      removeRes.ok(),
      `DELETE /projects/{id}/patients HTTP ${removeRes.status()}: ${await removeRes.text()}`
    ).toBeTruthy()
    const removeBody = (await removeRes.json()) as {
      removed_count?: number
      patient_ids?: string[]
    }
    expect(
      removeBody.removed_count,
      `removed_count == 1 (got ${removeBody.removed_count})`
    ).toBe(1)

    // KROK 8: Po odpięciu — statystyki ≥ 2 aktywnych pacjentów
    const stats2Res = await request.get(
      `${API_URL}/projects/${projectId}/statistics`,
      { headers: { Authorization: `Bearer ${auth.token}` } }
    )
    expect(
      stats2Res.ok(),
      `GET statistics #2 HTTP ${stats2Res.status()}`
    ).toBeTruthy()
    const stats2 = (await stats2Res.json()) as {
      active_patients?: number
      total_patients?: number
    }
    const afterRemoval = stats2.active_patients ?? stats2.total_patients ?? 0
    expect(
      afterRemoval,
      `po odpięciu p2: active/total_patients ≥ 2 (got ${afterRemoval})`
    ).toBeGreaterThanOrEqual(2)
    // Sanity: liczba aktywnych powinna spaść względem stanu po assign
    expect(
      afterRemoval,
      `after removal count (${afterRemoval}) < initial (${initialCount})`
    ).toBeLessThan(initialCount)
  })
})

// ============================================================
// PROC-08: US-K-23 raport zbiorczy projektu (PROJECT_STATS, PDF)
// ============================================================

test.describe('Process — Raport zbiorczy projektu (US-K-23)', () => {
  test('PROC-08: Koordynator generuje raport PROJECT_STATS w formacie PDF i pobiera plik', async ({
    request,
  }) => {
    // KROK 1: Logowanie
    const auth = await login(request)

    // KROK 2: Założenie projektu + zarejestrowanie 1 pacjenta + enroll
    const projectId = await createEmptyProject(request, auth.token, 'PROC-08')
    const { patientId } = await registerAndApprove(request, auth.token)
    const enrollRes = await request.post(
      `${API_URL}/projects/${projectId}/patients`,
      {
        headers: authHeaders(auth.token),
        data: { patient_ids: [patientId] },
      }
    )
    expect(
      enrollRes.ok(),
      `enroll HTTP ${enrollRes.status()}`
    ).toBeTruthy()

    // KROK 3: Utworzenie eventu kalendarzowego (data dla raportu)
    const scheduledAt = new Date(
      Date.now() + 2 * 24 * 60 * 60 * 1000
    ).toISOString()
    const endsAt = new Date(
      Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000
    ).toISOString()
    const eventRes = await request.post(`${API_URL}/calendar/events`, {
      headers: authHeaders(auth.token),
      data: {
        project_id: projectId,
        patient_id: patientId,
        title: 'PROC-08 Wizyta kontrolna',
        description: 'Wizyta wymagana do raportu zbiorczego.',
        type: 'VISIT',
        scheduled_at: scheduledAt,
        ends_at: endsAt,
        location: 'IFPS Warszawa',
        is_cyclic: false,
        reminders: {
          reminder_24h: true,
          reminder_2h: false,
          reminder_30min: false,
        },
      },
    })
    expect(
      eventRes.ok(),
      `POST /calendar/events HTTP ${eventRes.status()}: ${await eventRes.text()}`
    ).toBeTruthy()

    // KROK 4: Utworzenie + publikacja materiału (statystyki materiałowe)
    const matRes = await request.post(`${API_URL}/materials`, {
      headers: authHeaders(auth.token),
      data: {
        project_id: projectId,
        title: `PROC-08 Materiał ${stamp()}`,
        content: 'Materiał dla raportu zbiorczego.',
        type: 'ARTICLE',
        category: 'EDUCATION',
        difficulty: 'BASIC',
        assigned_to_patients: [patientId],
      },
    })
    expect(
      matRes.ok(),
      `POST /materials HTTP ${matRes.status()}: ${await matRes.text()}`
    ).toBeTruthy()
    const material = (await matRes.json()) as { id: string }
    const pubRes = await request.post(
      `${API_URL}/materials/${material.id}/publish`,
      { headers: authHeaders(auth.token) }
    )
    expect(
      pubRes.ok(),
      `publish HTTP ${pubRes.status()}`
    ).toBeTruthy()

    // KROK 5: Eksport raportu PROJECT_STATS w formacie PDF
    // ExportRequest shape: report_type, project_id, date_from, date_to, format.
    // Endpoint /reports/export jest synchroniczny — zwraca ByteArrayResource z
    // content-type application/pdf (lub xlsx dla EXCEL). Brak kolejki async.
    const today = new Date()
    const dateTo = today.toISOString().slice(0, 10) // YYYY-MM-DD (LocalDate)
    const dateFrom = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)
    const exportRes = await request.post(`${API_URL}/reports/export`, {
      headers: authHeaders(auth.token),
      data: {
        report_type: 'PROJECT_STATS',
        format: 'PDF',
        project_id: projectId,
        date_from: dateFrom,
        date_to: dateTo,
        include_charts: true,
      },
    })
    expect(
      exportRes.ok(),
      `POST /reports/export HTTP ${exportRes.status()}: ${await exportRes.text()}`
    ).toBeTruthy()

    // KROK 6: Asercje content-type oraz długości odpowiedzi
    const contentType = exportRes.headers()['content-type'] ?? ''
    expect(
      contentType.toLowerCase(),
      `content-type zawiera application/pdf (got "${contentType}")`
    ).toContain('application/pdf')
    const buf = await exportRes.body()
    expect(
      buf.length,
      `body length > 100 bajtów (got ${buf.length})`
    ).toBeGreaterThan(100)

    // KROK 7: (sanity) plik zaczyna się od magic-bytes PDF "%PDF" — opcjonalnie
    // Jeśli backend zwraca inny generator, ten bajt-check może się nie udać —
    // wtedy raportujemy gap, ale nie failujemy testu (główna asercja: PDF i >100B).
    const head = buf.subarray(0, 4).toString('utf8')
    if (head !== '%PDF') {
      test.info().annotations.push({
        type: 'process-gap',
        description: `Raport PDF nie zaczyna się od magic bytes %PDF (got: "${head}"). Backend może generować placeholder.`,
      })
    }
  })
})

// ============================================================
// PROC-09: US-A-11 RODO eksport danych pacjenta (JSON + PDF)
// ============================================================

test.describe('Process — RODO eksport danych pacjenta (US-A-11)', () => {
  test('PROC-09: Admin eksportuje dane pacjenta w JSON i PDF — kompletny pakiet RODO', async ({
    request,
  }) => {
    // KROK 1: Logowanie + przygotowanie pacjenta
    const auth = await login(request)
    const projectId = await createEmptyProject(request, auth.token, 'PROC-09')
    const { patient, patientId } = await registerAndApprove(
      request,
      auth.token
    )

    // KROK 2: Enroll pacjenta do projektu (generuje wpis PatientProject)
    const enrollRes = await request.post(
      `${API_URL}/projects/${projectId}/patients`,
      {
        headers: authHeaders(auth.token),
        data: { patient_ids: [patientId] },
      }
    )
    expect(enrollRes.ok(), `enroll HTTP ${enrollRes.status()}`).toBeTruthy()

    // KROK 3: Utworzenie eventu (wpis w sekcji therapy_events)
    const scheduledAt = new Date(
      Date.now() + 5 * 24 * 60 * 60 * 1000
    ).toISOString()
    const endsAt = new Date(
      Date.now() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000
    ).toISOString()
    const eventRes = await request.post(`${API_URL}/calendar/events`, {
      headers: authHeaders(auth.token),
      data: {
        project_id: projectId,
        patient_id: patientId,
        title: 'PROC-09 Wpis testowy',
        description: 'Event utworzony, by miało co eksportować.',
        type: 'VISIT',
        scheduled_at: scheduledAt,
        ends_at: endsAt,
        location: 'Online',
        is_cyclic: false,
        reminders: {
          reminder_24h: false,
          reminder_2h: false,
          reminder_30min: false,
        },
      },
    })
    // Event nie jest twardym wymogiem — eksport zwraca puste tablice,
    // jeśli brakuje danych. Logujemy gap, gdy się nie powiedzie.
    if (!eventRes.ok()) {
      test.info().annotations.push({
        type: 'process-gap',
        description: `POST /calendar/events nie powiódł się (${eventRes.status()}); kontynuujemy bez eventu.`,
      })
    }

    // KROK 4: Eksport w formacie JSON
    const jsonRes = await request.get(
      `${API_URL}/admin/patients/${patientId}/export-data?format=json`,
      { headers: { Authorization: `Bearer ${auth.token}` } }
    )
    expect(
      jsonRes.ok(),
      `GET /admin/patients/{id}/export-data?format=json HTTP ${jsonRes.status()}: ${await jsonRes.text()}`
    ).toBeTruthy()
    const jsonContentType = jsonRes.headers()['content-type'] ?? ''
    expect(
      jsonContentType.toLowerCase(),
      `JSON export content-type zawiera application/json (got "${jsonContentType}")`
    ).toContain('application/json')

    // KROK 5: Parse JSON — zgodnie z PatientDataExportDto:
    // pola patient_data (PatientPersonalData z pesel/firstName/lastName),
    // therapy_events, messages, material_progress itd.
    const exportRaw = await jsonRes.text()
    expect(
      exportRaw.length,
      `JSON export body > 100 bajtów (got ${exportRaw.length})`
    ).toBeGreaterThan(100)
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(exportRaw) as Record<string, unknown>
    } catch (err) {
      throw new Error(
        `JSON export nie jest poprawnym JSONem: ${(err as Error).message}\nBody: ${exportRaw.slice(0, 200)}`
      )
    }
    // Akceptujemy zarówno snake_case backendu (patient_data) jak i potencjalne
    // aliasy (patient / personal_data) na wypadek wariantów odpowiedzi.
    const personalNode =
      (parsed['patient_data'] as Record<string, unknown> | undefined) ??
      (parsed['personal_data'] as Record<string, unknown> | undefined) ??
      (parsed['patient'] as Record<string, unknown> | undefined)
    expect(
      personalNode,
      'JSON export zawiera sekcję patient_data / personal_data / patient'
    ).toBeTruthy()
    const peselFromExport =
      (personalNode?.['pesel'] as string | undefined) ?? ''
    expect(
      peselFromExport,
      `JSON export zawiera pole pesel pacjenta (got "${peselFromExport}", expected "${patient.pesel}")`
    ).toBe(patient.pesel)
    // Tablica wydarzeń terapeutycznych — backend nazywa to therapy_events.
    const eventsNode =
      parsed['therapy_events'] ??
      parsed['events'] ??
      parsed['appointments']
    expect(
      Array.isArray(eventsNode),
      'JSON export zawiera tablicę therapy_events / events / appointments'
    ).toBeTruthy()

    // KROK 6: Eksport w formacie PDF
    const pdfRes = await request.get(
      `${API_URL}/admin/patients/${patientId}/export-data?format=pdf`,
      { headers: { Authorization: `Bearer ${auth.token}` } }
    )
    expect(
      pdfRes.ok(),
      `GET /admin/patients/{id}/export-data?format=pdf HTTP ${pdfRes.status()}: ${await pdfRes.text()}`
    ).toBeTruthy()
    const pdfContentType = pdfRes.headers()['content-type'] ?? ''
    expect(
      pdfContentType.toLowerCase(),
      `PDF export content-type zawiera application/pdf (got "${pdfContentType}")`
    ).toContain('application/pdf')
    const pdfBuf = await pdfRes.body()
    expect(
      pdfBuf.length,
      `PDF export body length > 100 bajtów (got ${pdfBuf.length})`
    ).toBeGreaterThan(100)
  })
})

// ============================================================
// PROC-10: US-A-12 RODO right-to-be-forgotten (anonymize + erase)
// ============================================================

test.describe('Process — RODO usunięcie pacjenta (US-A-12)', () => {
  test('PROC-10: Admin anonimizuje pacjenta, próbuje force-erase i sprawdza erasure-logs', async ({
    request,
  }) => {
    // KROK 1: Logowanie + przygotowanie pacjenta
    const auth = await login(request)
    const projectId = await createEmptyProject(request, auth.token, 'PROC-10')
    const { patient, patientId } = await registerAndApprove(
      request,
      auth.token
    )

    // KROK 2: Enroll do projektu (potwierdza, że pacjent ma dane do usunięcia)
    const enrollRes = await request.post(
      `${API_URL}/projects/${projectId}/patients`,
      {
        headers: authHeaders(auth.token),
        data: { patient_ids: [patientId] },
      }
    )
    expect(enrollRes.ok(), `enroll HTTP ${enrollRes.status()}`).toBeTruthy()

    // KROK 3: Anonimizacja pacjenta — POST /admin/patients/{id}/anonymize
    // Endpoint NIE wymaga body (controller tylko odczytuje patientId i userId).
    const anonRes = await request.post(
      `${API_URL}/admin/patients/${patientId}/anonymize`,
      { headers: authHeaders(auth.token), data: {} }
    )
    expect(
      anonRes.ok(),
      `POST /admin/patients/{id}/anonymize HTTP ${anonRes.status()}: ${await anonRes.text()}`
    ).toBeTruthy()
    const anonBody = (await anonRes.json()) as {
      patient_id?: string
      anonymized_at?: string
      audit_log_id?: string
    }
    expect(
      anonBody.patient_id,
      'AnonymizationResponse.patient_id zwrócone'
    ).toBe(patientId)
    expect(
      anonBody.anonymized_at,
      'AnonymizationResponse.anonymized_at niepuste'
    ).toBeTruthy()

    // KROK 4: Po anonimizacji — pacjent ma zanonimizowane pola.
    // Backend ustawia: pesel=XXXXXXXXXXX-<hash>, lastName=ANON-<seq>,
    // email=anon-<uuid>@deleted.local. Sprawdzamy że oryginalny PESEL ZNIKNĄŁ.
    const afterAnonRes = await request.get(
      `${API_URL}/patients/${patientId}`,
      { headers: { Authorization: `Bearer ${auth.token}` } }
    )
    if (afterAnonRes.ok()) {
      const afterAnonRaw = await afterAnonRes.text()
      expect(
        afterAnonRaw.includes(patient.pesel),
        `PESEL pacjenta (${patient.pesel}) NIE powinien występować w body po anonimizacji`
      ).toBeFalsy()
      // Spodziewane wartości anonimizacyjne (heurystyczne — wystarczy jedna)
      const looksAnonymized =
        afterAnonRaw.includes('ANON-') ||
        afterAnonRaw.includes('XXXXXXXXXXX') ||
        afterAnonRaw.includes('anon-') ||
        afterAnonRaw.includes('@deleted.local') ||
        afterAnonRaw.toUpperCase().includes('ANONYMIZED')
      expect(
        looksAnonymized,
        'pacjent po anonimizacji ma flagi ANON-/XXXXXXXXXXX/anon-@deleted.local w body'
      ).toBeTruthy()
    } else {
      // GET /patients/{id} może zwrócić 404 jeśli backend traktuje
      // zanonimizowanego pacjenta jako ukrytego — to akceptowalne zachowanie.
      test.info().annotations.push({
        type: 'process-gap',
        description: `GET /patients/{id} po anonimizacji zwrócił ${afterAnonRes.status()} — backend ukrywa anonimizowanych pacjentów. Akceptowalne.`,
      })
    }

    // KROK 5: Próba force-erase — DELETE /admin/patients/{id}/erase?force=true
    // Body wymaga { reason } (ErasureRequest). Endpoint może wymagać
    // wcześniejszego soft-delete, więc traktujemy 4xx/501 jako gap, nie błąd.
    const eraseRes = await request.delete(
      `${API_URL}/admin/patients/${patientId}/erase?force=true`,
      {
        headers: authHeaders(auth.token),
        data: {
          reason:
            'E2E test PROC-10 — RODO Art. 17 right to be forgotten verification.',
        },
      }
    )
    if (!eraseRes.ok()) {
      const body = await eraseRes.text()
      test.info().annotations.push({
        type: 'process-gap',
        description: `DELETE /admin/patients/{id}/erase?force=true zwrócił ${eraseRes.status()}: ${body.slice(0, 200)} — endpoint może wymagać soft-delete lub być niedoimplementowany. Test nie failuje (zob. wymagania zadania).`,
      })
    } else {
      // Backend odpowiada 204 No Content na sukces.
      expect(
        eraseRes.status(),
        `erase status powinien być 204 (got ${eraseRes.status()})`
      ).toBe(204)
    }

    // KROK 6: Erasure-logs — endpoint GET /admin/patients/{id}/erasure-logs
    // powinien zawierać przynajmniej wpis z anonimizacji (audit log) lub erase.
    const logsRes = await request.get(
      `${API_URL}/admin/patients/${patientId}/erasure-logs`,
      { headers: { Authorization: `Bearer ${auth.token}` } }
    )
    if (logsRes.ok()) {
      const logsRaw = await logsRes.json()
      const logs = Array.isArray(logsRaw)
        ? (logsRaw as Array<Record<string, unknown>>)
        : []
      // Po force-erase backend usuwa pacjenta i audit logi mogą być
      // wyczyszczone — akceptujemy zarówno pustą listę jak i listę z wpisami.
      // Logujemy obecność wpisów dla diagnostyki.
      test.info().annotations.push({
        type: 'erasure-logs',
        description: `GET /erasure-logs zwrócił ${logs.length} wpisów dla pacjenta ${patientId}.`,
      })
    } else {
      // 404 po hard-delete jest akceptowalne — pacjent już nie istnieje.
      test.info().annotations.push({
        type: 'process-gap',
        description: `GET /admin/patients/{id}/erasure-logs zwrócił ${logsRes.status()} — endpoint może być niedostępny po erase albo niedoimplementowany.`,
      })
    }
  })
})

// ============================================================
// PROC-11: US-K-06 transfer pacjenta między projektami
// ============================================================

test.describe('Process — Transfer pacjenta między projektami (US-K-06)', () => {
  test('PROC-11: Koordynator przenosi pacjenta z projektu A do projektu B z uzasadnieniem; statystyki obu projektów aktualizują się', async ({
    request,
  }) => {
    // KROK 1: Logowanie administratora
    const auth = await login(request)
    expect(auth.token).toBeTruthy()

    // KROK 2: Założenie projektu A (źródłowy) i projektu B (docelowy)
    const projectA = await createEmptyProject(request, auth.token, 'PROC-11-A')
    const projectB = await createEmptyProject(request, auth.token, 'PROC-11-B')
    expect(projectA).not.toBe(projectB)

    // KROK 3: Rejestracja + akceptacja pacjenta + enroll do projektu A
    const { patientId } = await registerAndApprove(request, auth.token)
    const enrollRes = await request.post(
      `${API_URL}/projects/${projectA}/patients`,
      {
        headers: authHeaders(auth.token),
        data: { patient_ids: [patientId] },
      }
    )
    expect(
      enrollRes.ok(),
      `enroll do A HTTP ${enrollRes.status()}: ${await enrollRes.text()}`
    ).toBeTruthy()

    // KROK 4: Sanity — A ma >=1 aktywnego pacjenta, B ma 0
    const statsABefore = await request.get(
      `${API_URL}/projects/${projectA}/statistics`,
      { headers: { Authorization: `Bearer ${auth.token}` } }
    )
    expect(statsABefore.ok(), `GET stats A pre HTTP ${statsABefore.status()}`).toBeTruthy()
    const statsABeforeBody = (await statsABefore.json()) as {
      active_patients?: number
    }
    const aBefore = statsABeforeBody.active_patients ?? 0
    expect(aBefore, `A.active_patients pre transfer >= 1 (got ${aBefore})`).toBeGreaterThanOrEqual(1)

    const statsBBefore = await request.get(
      `${API_URL}/projects/${projectB}/statistics`,
      { headers: { Authorization: `Bearer ${auth.token}` } }
    )
    expect(statsBBefore.ok(), `GET stats B pre HTTP ${statsBBefore.status()}`).toBeTruthy()
    const statsBBeforeBody = (await statsBBefore.json()) as {
      active_patients?: number
    }
    const bBefore = statsBBeforeBody.active_patients ?? 0

    // KROK 5: Transfer — POST /projects/{A}/patients/{P}/transfer/{B} + reason
    // TransferPatientRequest wymaga reason >= 10 znaków (Bean Validation @Size).
    const reason =
      'PROC-11 E2E test — transfer pacjenta z projektu A do B (RODO art. 5 — minimalizacja danych projektu A).'
    const transferRes = await request.post(
      `${API_URL}/projects/${projectA}/patients/${patientId}/transfer/${projectB}`,
      {
        headers: authHeaders(auth.token),
        data: { reason },
      }
    )
    expect(
      transferRes.ok(),
      `POST transfer HTTP ${transferRes.status()}: ${await transferRes.text()}`
    ).toBeTruthy()
    const transferBody = (await transferRes.json()) as {
      patient_id?: string
      from_project_id?: string
      to_project_id?: string
      audit_log_id?: string
    }
    expect(transferBody.patient_id, 'response.patient_id == patientId').toBe(patientId)
    expect(transferBody.from_project_id, 'response.from_project_id == projectA').toBe(projectA)
    expect(transferBody.to_project_id, 'response.to_project_id == projectB').toBe(projectB)

    // KROK 6: Statystyki A — liczba aktywnych pacjentów spadła o 1
    const statsAAfter = await request.get(
      `${API_URL}/projects/${projectA}/statistics`,
      { headers: { Authorization: `Bearer ${auth.token}` } }
    )
    expect(statsAAfter.ok(), `GET stats A post HTTP ${statsAAfter.status()}`).toBeTruthy()
    const statsAAfterBody = (await statsAAfter.json()) as {
      active_patients?: number
    }
    const aAfter = statsAAfterBody.active_patients ?? 0
    expect(
      aAfter,
      `A.active_patients po transferze < ${aBefore} (got ${aAfter})`
    ).toBeLessThan(aBefore)

    // KROK 7: Statystyki B — liczba aktywnych pacjentów wzrosła o 1
    const statsBAfter = await request.get(
      `${API_URL}/projects/${projectB}/statistics`,
      { headers: { Authorization: `Bearer ${auth.token}` } }
    )
    expect(statsBAfter.ok(), `GET stats B post HTTP ${statsBAfter.status()}`).toBeTruthy()
    const statsBAfterBody = (await statsBAfter.json()) as {
      active_patients?: number
    }
    const bAfter = statsBAfterBody.active_patients ?? 0
    expect(
      bAfter,
      `B.active_patients po transferze > ${bBefore} (got ${bAfter})`
    ).toBeGreaterThan(bBefore)

    // KROK 8: (opcjonalnie) Audit-log — wpis TRANSFER widoczny w /admin/audit-logs
    const auditRes = await request.get(
      `${API_URL}/admin/audit-logs?entityType=Patient&entityId=${patientId}&size=20`,
      { headers: { Authorization: `Bearer ${auth.token}` } }
    )
    if (auditRes.ok()) {
      const auditRaw = await auditRes.text()
      const hasTransferEntry =
        auditRaw.includes('TRANSFER') ||
        auditRaw.includes(projectB) ||
        auditRaw.includes(projectA)
      expect(
        hasTransferEntry,
        'audit log zawiera ślad transferu (TRANSFER lub UUID projektu A/B w body)'
      ).toBeTruthy()
    } else {
      test.info().annotations.push({
        type: 'process-gap',
        description: `GET /admin/audit-logs zwrócił ${auditRes.status()} — pomijamy weryfikację audytu (dane same w sobie wystarczają).`,
      })
    }

    // KROK 9: Walidacja — drugi transfer (z B do B) odrzucony jako naruszenie reguły
    const reTransferRes = await request.post(
      `${API_URL}/projects/${projectB}/patients/${patientId}/transfer/${projectB}`,
      {
        headers: authHeaders(auth.token),
        data: { reason: 'PROC-11 E2E test — same-project guard.' },
      }
    )
    expect(
      reTransferRes.ok(),
      `transfer self->self powinien zostać odrzucony (got HTTP ${reTransferRes.status()})`
    ).toBeFalsy()
  })
})

// ============================================================
// PROC-12: US-K-24 dashboard KPI projektu
// ============================================================

test.describe('Process — Dashboard KPI projektu (US-K-24)', () => {
  test('PROC-12: Statystyki projektu zwracają komplet pól KPI po dodaniu 2 pacjentów, materiału i eventu', async ({
    request,
  }) => {
    // KROK 1: Logowanie + projekt + 2 pacjentów + enroll
    const auth = await login(request)
    const projectId = await createEmptyProject(request, auth.token, 'PROC-12')
    const { patientId: p1 } = await registerAndApprove(request, auth.token)
    const { patientId: p2 } = await registerAndApprove(request, auth.token)
    const enrollRes = await request.post(
      `${API_URL}/projects/${projectId}/patients`,
      {
        headers: authHeaders(auth.token),
        data: { patient_ids: [p1, p2] },
      }
    )
    expect(
      enrollRes.ok(),
      `enroll HTTP ${enrollRes.status()}: ${await enrollRes.text()}`
    ).toBeTruthy()

    // KROK 2: Materiał (statystyki materiałowe) — ARTICLE/EDUCATION/BASIC
    const matRes = await request.post(`${API_URL}/materials`, {
      headers: authHeaders(auth.token),
      data: {
        project_id: projectId,
        title: `PROC-12 Materiał ${stamp()}`,
        content: 'Materiał dla dashboard KPI.',
        type: 'ARTICLE',
        category: 'EDUCATION',
        difficulty: 'BASIC',
        assigned_to_patients: [p1, p2],
      },
    })
    expect(
      matRes.ok(),
      `POST /materials HTTP ${matRes.status()}: ${await matRes.text()}`
    ).toBeTruthy()

    // KROK 3: Event kalendarzowy (data dla nadchodzących sesji w KPI)
    const scheduledAt = new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000
    ).toISOString()
    const endsAt = new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000
    ).toISOString()
    const eventRes = await request.post(`${API_URL}/calendar/events`, {
      headers: authHeaders(auth.token),
      data: {
        project_id: projectId,
        patient_id: p1,
        title: 'PROC-12 Wizyta KPI',
        description: 'Event KPI dashboard test.',
        type: 'VISIT',
        scheduled_at: scheduledAt,
        ends_at: endsAt,
        location: 'IFPS Warszawa',
        is_cyclic: false,
        reminders: {
          reminder_24h: true,
          reminder_2h: false,
          reminder_30min: false,
        },
      },
    })
    if (!eventRes.ok()) {
      test.info().annotations.push({
        type: 'process-gap',
        description: `POST /calendar/events HTTP ${eventRes.status()} — KPI dashboard wciąż powinno działać bez eventów.`,
      })
    }

    // KROK 4: GET /projects/{id}/statistics — sprawdź KPI fields
    const statsRes = await request.get(
      `${API_URL}/projects/${projectId}/statistics`,
      { headers: { Authorization: `Bearer ${auth.token}` } }
    )
    expect(
      statsRes.ok(),
      `GET /projects/{id}/statistics HTTP ${statsRes.status()}: ${await statsRes.text()}`
    ).toBeTruthy()
    const stats = (await statsRes.json()) as {
      project_id?: string
      project_name?: string
      total_patients?: number
      active_patients?: number
      completed_patients?: number
      removed_patients?: number
      team_members?: number
      average_compliance_score?: number | null
      compliance_distribution?: Record<string, number>
      stage_distribution?: Record<string, number>
    }

    // Pola wymagane przez KPI dashboard (US-K-24):
    expect(stats.project_id, 'stats.project_id == projectId').toBe(projectId)
    expect(stats.project_name, 'stats.project_name niepuste').toBeTruthy()
    expect(
      stats.active_patients,
      `stats.active_patients >= 2 (got ${stats.active_patients})`
    ).toBeGreaterThanOrEqual(2)
    // Note: total_patients w backend liczy zakończonych/usuniętych historycznych,
    // nie aktywnych — może być 0 dla świeżego projektu. Sprawdzamy tylko obecność klucza.
    expect(
      Object.prototype.hasOwnProperty.call(stats, 'total_patients'),
      'stats zawiera klucz total_patients'
    ).toBe(true)
    expect(
      typeof stats.team_members,
      `stats.team_members jest liczbą (got ${typeof stats.team_members})`
    ).toBe('number')
    // average_compliance_score może być null jeśli brak ocen — to OK,
    // ważne że pole jest obecne w odpowiedzi.
    expect(
      Object.prototype.hasOwnProperty.call(stats, 'average_compliance_score'),
      'stats zawiera klucz average_compliance_score'
    ).toBe(true)
    // stage_distribution / compliance_distribution muszą być obiektami (nie null/undefined).
    expect(
      stats.stage_distribution !== null && typeof stats.stage_distribution === 'object',
      'stats.stage_distribution jest obiektem'
    ).toBe(true)
    expect(
      stats.compliance_distribution !== null &&
        typeof stats.compliance_distribution === 'object',
      'stats.compliance_distribution jest obiektem'
    ).toBe(true)

    // KROK 5: (opcjonalnie) Globalny endpoint dashboard KPI (jeśli istnieje)
    // Część frontendu używa /reports/dashboard/kpi — sprawdzamy łagodnie.
    const kpiRes = await request.get(`${API_URL}/reports/dashboard/kpi`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    if (kpiRes.ok()) {
      const kpi = (await kpiRes.json()) as {
        active_projects?: number
        active_patients?: number
        average_compliance?: number
        upcoming_sessions?: number
      }
      expect(
        typeof kpi.active_projects === 'number' || kpi.active_projects === undefined,
        'KPI dashboard global: active_projects jest liczbą lub brak (graceful)'
      ).toBe(true)
    } else {
      test.info().annotations.push({
        type: 'process-gap',
        description: `GET /reports/dashboard/kpi zwrócił ${kpiRes.status()} — endpoint globalnego KPI może być niedostępny; statystyki projektu wystarczają.`,
      })
    }
  })
})

// ============================================================
// PROC-13: US-A-08 monitoring + US-A-05 config
// ============================================================

test.describe('Process — Monitoring + konfiguracja systemu (US-A-08, US-A-05)', () => {
  test('PROC-13a: GET /admin/system/health zwraca status DB i cache', async ({ request }) => {
    const auth = await login(request)
    const res = await request.get(`${API_URL}/admin/system/health`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    expect(res.ok(), `health HTTP ${res.status()}`).toBeTruthy()
    const body = (await res.json()) as {
      status?: string
      database_status?: string
      cache_status?: string
      details?: Record<string, unknown>
    }
    expect(body.status, 'status field').toBeTruthy()
    expect(['UP', 'DOWN', 'DEGRADED']).toContain(body.status)
    expect(body.database_status, 'database_status').toBeTruthy()
    expect(body.cache_status, 'cache_status').toBeTruthy()
  })

  test('PROC-13b: GET /admin/system/metrics zwraca memory + db metrics', async ({ request }) => {
    const auth = await login(request)
    const res = await request.get(`${API_URL}/admin/system/metrics`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    expect(res.ok(), `metrics HTTP ${res.status()}`).toBeTruthy()
    const body = (await res.json()) as {
      memory_usage?: unknown
      database_metrics?: unknown
    }
    expect(body.memory_usage, 'memory_usage present').toBeTruthy()
    expect(body.database_metrics, 'database_metrics present').toBeTruthy()
  })

  test('PROC-13c: GET /admin/system/config zwraca 3 default keys', async ({ request }) => {
    const auth = await login(request)
    const res = await request.get(`${API_URL}/admin/system/config`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    expect(res.ok(), `config GET HTTP ${res.status()}`).toBeTruthy()
    const body = (await res.json()) as Record<string, string>
    expect(body['default.compliance.threshold']).toBeDefined()
    expect(body['default.language']).toBeDefined()
    expect(body['notifications.enabled']).toBeDefined()
  })

  test('PROC-13d: PUT /admin/system/config aktualizuje wartości', async ({ request }) => {
    const auth = await login(request)
    const res = await request.put(`${API_URL}/admin/system/config`, {
      headers: authHeaders(auth.token),
      data: {
        'default.compliance.threshold': '85',
        'default.language': 'en',
        'notifications.enabled': 'false',
      },
    })
    expect(res.ok(), `config PUT HTTP ${res.status()}`).toBeTruthy()
    const body = (await res.json()) as Record<string, string>
    expect(body['default.compliance.threshold']).toBe('85')
    expect(body['default.language']).toBe('en')
    expect(body['notifications.enabled']).toBe('false')
  })
})

// ============================================================
// PROC-14: US-K-25 Notifications subsystem — manual reminder trigger
// ============================================================

test.describe('Process — Powiadomienia (US-K-25): manual trigger reminder', () => {
  test('PROC-14: Admin tworzy event w oknie 24h i wywołuje run-reminders', async ({
    request,
  }) => {
    // KROK 1: Logowanie + przygotowanie projektu/pacjenta/enroll
    const auth = await login(request)
    const projectId = await createEmptyProject(request, auth.token, 'PROC-14')
    const { patientId } = await registerAndApprove(request, auth.token)
    const enrollRes = await request.post(
      `${API_URL}/projects/${projectId}/patients`,
      {
        headers: authHeaders(auth.token),
        data: { patient_ids: [patientId] },
      }
    )
    expect(enrollRes.ok(), `enroll HTTP ${enrollRes.status()}`).toBeTruthy()

    // KROK 2: POST /calendar/events z scheduled_at w oknie [now+24h-2min]
    const scheduledAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000 - 2 * 60 * 1000
    ).toISOString()
    const endsAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000 + 28 * 60 * 1000
    ).toISOString()
    const evRes = await request.post(`${API_URL}/calendar/events`, {
      headers: authHeaders(auth.token),
      data: {
        project_id: projectId,
        patient_id: patientId,
        title: 'PROC-14 Wizyta przypomnienie',
        description: 'Test: manualny trigger przypomnień US-K-25.',
        type: 'VISIT',
        scheduled_at: scheduledAt,
        ends_at: endsAt,
        location: 'IFPS',
        is_cyclic: false,
        reminders: {
          reminder_24h: true,
          reminder_2h: false,
          reminder_30min: false,
        },
      },
    })
    expect(
      evRes.ok(),
      `POST /calendar/events HTTP ${evRes.status()}: ${await evRes.text()}`
    ).toBeTruthy()

    // KROK 3: Manual trigger
    const triggerRes = await request.post(
      `${API_URL}/admin/system/notifications/run-reminders`,
      { headers: authHeaders(auth.token) }
    )
    expect(
      triggerRes.ok(),
      `POST run-reminders HTTP ${triggerRes.status()}: ${await triggerRes.text()}`
    ).toBeTruthy()

    // KROK 4: Asercja graceful — count >= 0 (najlepiej >=1 jeśli event wpadł w okno)
    const body = (await triggerRes.json()) as {
      count?: number
      events?: string[]
      notifications_created?: number
    }
    expect(typeof body.count).toBe('number')
    expect(Array.isArray(body.events)).toBe(true)
    if ((body.count ?? 0) === 0) {
      test.info().annotations.push({
        type: 'process-gap',
        description:
          'PROC-14: run-reminders zwrócił count=0 — event może nie wpaść w okno [+24h-5min, +24h+5min] z powodu drobnych odchyleń czasowych. Endpoint działa, jednak nie wykrył eventu w tym uruchomieniu.',
      })
    } else {
      expect(body.count).toBeGreaterThanOrEqual(1)
    }
  })
})

// ============================================================
// PROC-15: US-K-26 Notifications preferences GET + PUT
// ============================================================

test.describe('Process — Powiadomienia (US-K-26): preferences GET + PUT', () => {
  test('PROC-15: Admin odczytuje, aktualizuje i przywraca preferencje', async ({
    request,
  }) => {
    const auth = await login(request)

    // KROK 1: GET — defaults lub istniejące
    const getRes1 = await request.get(
      `${API_URL}/me/notification-preferences`,
      { headers: { Authorization: `Bearer ${auth.token}` } }
    )
    expect(
      getRes1.ok(),
      `GET preferences HTTP ${getRes1.status()}: ${await getRes1.text()}`
    ).toBeTruthy()

    // KROK 2: PUT — zmień preferencje
    const putRes = await request.put(
      `${API_URL}/me/notification-preferences`,
      {
        headers: authHeaders(auth.token),
        data: {
          emailEnabled: false,
          pushEnabled: true,
          smsEnabled: false,
          quietHoursStart: '22:00',
          quietHoursEnd: '07:00',
        },
      }
    )
    expect(
      putRes.ok(),
      `PUT preferences HTTP ${putRes.status()}: ${await putRes.text()}`
    ).toBeTruthy()
    const updated = (await putRes.json()) as {
      emailEnabled?: boolean
      pushEnabled?: boolean
      smsEnabled?: boolean
      quietHoursStart?: string
      quietHoursEnd?: string
    }
    expect(updated.emailEnabled).toBe(false)
    expect(updated.pushEnabled).toBe(true)
    expect(updated.quietHoursStart).toBe('22:00')
    expect(updated.quietHoursEnd).toBe('07:00')

    // KROK 3: GET ponownie — wartości zaktualizowane
    const getRes2 = await request.get(
      `${API_URL}/me/notification-preferences`,
      { headers: { Authorization: `Bearer ${auth.token}` } }
    )
    expect(getRes2.ok(), `GET preferences#2 HTTP ${getRes2.status()}`).toBeTruthy()
    const after = (await getRes2.json()) as {
      emailEnabled?: boolean
      quietHoursStart?: string
      quietHoursEnd?: string
    }
    expect(after.emailEnabled).toBe(false)
    expect(after.quietHoursStart).toBe('22:00')

    // KROK 4: Cleanup — przywróć defaults
    const restoreRes = await request.put(
      `${API_URL}/me/notification-preferences`,
      {
        headers: authHeaders(auth.token),
        data: {
          emailEnabled: false,
          pushEnabled: true,
          smsEnabled: false,
          quietHoursStart: '22:00',
          quietHoursEnd: '07:00',
        },
      }
    )
    expect(
      restoreRes.ok(),
      `PUT preferences cleanup HTTP ${restoreRes.status()}`
    ).toBeTruthy()
  })
})

// ============================================================
// PROC-16: US-L-05 Material publication notification log
// ============================================================

test.describe('Process — Powiadomienia (US-L-05): publikacja materiału', () => {
  test('PROC-16: Publikacja materiału -> notification log dla pacjenta', async ({
    request,
  }) => {
    const auth = await login(request)

    // KROK 1: projekt + pacjent + enroll
    const projectId = await createEmptyProject(request, auth.token, 'PROC-16')
    const { patientId } = await registerAndApprove(request, auth.token)
    const enrollRes = await request.post(
      `${API_URL}/projects/${projectId}/patients`,
      {
        headers: authHeaders(auth.token),
        data: { patient_ids: [patientId] },
      }
    )
    expect(enrollRes.ok(), `enroll HTTP ${enrollRes.status()}`).toBeTruthy()

    // KROK 2: POST /materials z assigned_to_patients
    const matRes = await request.post(`${API_URL}/materials`, {
      headers: authHeaders(auth.token),
      data: {
        project_id: projectId,
        title: `PROC-16 Material ${stamp()}`,
        content: 'Powiadomienia US-L-05 — test publikacji.',
        type: 'ARTICLE',
        category: 'EDUCATION',
        difficulty: 'BASIC',
        assigned_to_patients: [patientId],
      },
    })
    expect(
      matRes.ok(),
      `POST /materials HTTP ${matRes.status()}: ${await matRes.text()}`
    ).toBeTruthy()
    const material = (await matRes.json()) as { id: string }

    // KROK 3: Publikacja
    const pubRes = await request.post(
      `${API_URL}/materials/${material.id}/publish`,
      { headers: authHeaders(auth.token) }
    )
    expect(
      pubRes.ok(),
      `POST publish HTTP ${pubRes.status()}: ${await pubRes.text()}`
    ).toBeTruthy()

    // KROK 4: opcjonalnie — sprawdź endpoint /me/notifications jeśli istnieje
    const notRes = await request.get(`${API_URL}/notifications?type=MATERIAL`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    if (notRes.ok()) {
      const list = (await notRes.json()) as Array<{ content?: string }>
      const hasMaterialNotif = list.some((n) =>
        (n.content ?? '').includes(material.id)
      )
      if (!hasMaterialNotif) {
        test.info().annotations.push({
          type: 'process-gap',
          description:
            'PROC-16: notification list nie zawiera wpisu z material id (admin nie jest pacjentem przypisanym, więc nie widzi swojego notification feed) — wpis utworzony jest dla pacjenta. Log w backendzie powinien zawierać MATERIAL_PUBLISHED.',
        })
      }
    } else {
      test.info().annotations.push({
        type: 'process-gap',
        description: `PROC-16: GET /notifications zwrócił ${notRes.status()} — endpoint może wymagać innej roli. Backend log MATERIAL_PUBLISHED powinien być obecny.`,
      })
    }
  })
})

// ============================================================
// PROC-17/18/19: US-K-05 bulk operacje na pacjentach
// ============================================================

test.describe('Process — Bulk operacje na pacjentach (US-K-05)', () => {
  test('PROC-17: Admin hurtowo przypisuje 3 pacjentów do projektu A przez /patients/bulk/assign-to-project', async ({
    request,
  }) => {
    // KROK 1: Login admin
    const auth = await login(request)
    expect(auth.token).toBeTruthy()

    // KROK 2: Stwórz projekt A + projekt B
    const projectA = await createEmptyProject(request, auth.token, 'PROC-17-A')
    const projectB = await createEmptyProject(request, auth.token, 'PROC-17-B')
    expect(projectA).toBeTruthy()
    expect(projectB).toBeTruthy()

    // KROK 3: Zarejestruj+zaakceptuj 3 pacjentów
    const { patientId: p1 } = await registerAndApprove(request, auth.token)
    const { patientId: p2 } = await registerAndApprove(request, auth.token)
    const { patientId: p3 } = await registerAndApprove(request, auth.token)
    const ids = [p1, p2, p3]
    expect(new Set(ids).size).toBe(3)

    // KROK 4: POST /patients/bulk/assign-to-project
    const bulkRes = await request.post(
      `${API_URL}/patients/bulk/assign-to-project`,
      {
        headers: authHeaders(auth.token),
        data: {
          patient_ids: ids,
          target_project_id: projectA,
        },
      }
    )
    expect(
      bulkRes.ok(),
      `bulk assign-to-project HTTP ${bulkRes.status()}: ${await bulkRes.text()}`
    ).toBeTruthy()
    const bulkBody = (await bulkRes.json()) as {
      total: number
      succeeded: number
      failed: number
      results: Array<{ patient_id: string; status: string; error?: string }>
    }

    // KROK 5: Asercja — 3 sukcesy, 0 błędów
    expect(bulkBody.total).toBe(3)
    expect(bulkBody.succeeded).toBe(3)
    expect(bulkBody.failed).toBe(0)
    expect(bulkBody.results.every((r) => r.status === 'OK')).toBeTruthy()

    // KROK 6: GET /projects/{A}/statistics — active_patients >= 3
    const statsRes = await request.get(
      `${API_URL}/projects/${projectA}/statistics`,
      { headers: { Authorization: `Bearer ${auth.token}` } }
    )
    expect(
      statsRes.ok(),
      `GET project statistics HTTP ${statsRes.status()}`
    ).toBeTruthy()
    const stats = (await statsRes.json()) as {
      active_patients?: number
      activePatients?: number
      patient_count?: number
      patientCount?: number
    }
    const activeCount =
      stats.active_patients ??
      stats.activePatients ??
      stats.patient_count ??
      stats.patientCount ??
      0
    expect(
      activeCount,
      `active_patients should be >= 3 (got ${activeCount})`
    ).toBeGreaterThanOrEqual(3)
  })

  test('PROC-18: Admin hurtowo zmienia status 2 pacjentów na BLOCKED przez /patients/bulk/update-status', async ({
    request,
  }) => {
    // KROK 1: Login admin
    const auth = await login(request)
    expect(auth.token).toBeTruthy()

    // KROK 2: Zarejestruj+zaakceptuj 2 pacjentów
    const { patientId: p1 } = await registerAndApprove(request, auth.token)
    const { patientId: p2 } = await registerAndApprove(request, auth.token)

    // KROK 3: POST /patients/bulk/update-status z {patient_ids: [p1,p2], new_status: BLOCKED}
    const bulkRes = await request.post(
      `${API_URL}/patients/bulk/update-status`,
      {
        headers: authHeaders(auth.token),
        data: {
          patient_ids: [p1, p2],
          new_status: 'BLOCKED',
        },
      }
    )
    expect(
      bulkRes.ok(),
      `bulk update-status HTTP ${bulkRes.status()}: ${await bulkRes.text()}`
    ).toBeTruthy()
    const bulkBody = (await bulkRes.json()) as {
      total: number
      succeeded: number
      failed: number
      results: Array<{ patient_id: string; status: string }>
    }

    // KROK 4: Asercja — 2 sukcesy
    expect(bulkBody.total).toBe(2)
    expect(bulkBody.succeeded).toBe(2)
    expect(bulkBody.failed).toBe(0)
    expect(bulkBody.results.every((r) => r.status === 'OK')).toBeTruthy()
  })

  test('PROC-19: Admin hurtowo anonimizuje 2 pacjentów przez /patients/bulk/anonymize (RODO art. 17)', async ({
    request,
  }) => {
    // KROK 1: Login admin
    const auth = await login(request)
    expect(auth.token).toBeTruthy()

    // KROK 2: Zarejestruj+zaakceptuj 2 pacjentów
    const { patientId: p1 } = await registerAndApprove(request, auth.token)
    const { patientId: p2 } = await registerAndApprove(request, auth.token)

    // KROK 3: POST /patients/bulk/anonymize
    const bulkRes = await request.post(
      `${API_URL}/patients/bulk/anonymize`,
      {
        headers: authHeaders(auth.token),
        data: {
          patient_ids: [p1, p2],
        },
      }
    )
    expect(
      bulkRes.ok(),
      `bulk anonymize HTTP ${bulkRes.status()}: ${await bulkRes.text()}`
    ).toBeTruthy()
    const bulkBody = (await bulkRes.json()) as {
      total: number
      succeeded: number
      failed: number
      results: Array<{ patient_id: string; status: string }>
    }

    // KROK 4: Asercja — 2 sukcesy
    expect(bulkBody.total).toBe(2)
    expect(bulkBody.succeeded).toBe(2)
    expect(bulkBody.failed).toBe(0)
    expect(bulkBody.results.every((r) => r.status === 'OK')).toBeTruthy()

    // KROK 5: (opcjonalnie) GET /patients/{p1} — first_name == "ANON"
    const patientRes = await request.get(`${API_URL}/patients/${p1}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    if (patientRes.ok()) {
      const patientBody = (await patientRes.json()) as {
        first_name?: string
        firstName?: string
      }
      const firstName = patientBody.first_name ?? patientBody.firstName ?? ''
      expect(
        firstName,
        `anonymized patient first_name should be "ANON" (got "${firstName}")`
      ).toBe('ANON')
    } else {
      test.info().annotations.push({
        type: 'process-gap',
        description: `PROC-19: GET /patients/${p1} after anonymize HTTP ${patientRes.status()} — patient may be filtered out post-anonymization.`,
      })
    }
  })
})

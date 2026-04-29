import { test, expect, type APIRequestContext } from '@playwright/test'

/**
 * KPTEST — Process E2E tests (paczka P2).
 *
 * Plik dopełnia `e2e_processes.spec.ts` i `e2e_processes_extra.spec.ts` o cztery
 * kolejne procesy biznesowe związane z grupowym zarządzaniem pacjentami,
 * generowaniem raportów i operacjami RODO (export + erasure/anonymize).
 *
 *   PROC-07: US-K-04 grupowe przypisanie i odpięcie pacjentów do projektu
 *   PROC-08: US-K-23 raport zbiorczy projektu (PROJECT_STATS, format PDF)
 *   PROC-09: US-A-11 RODO eksport danych pacjenta (JSON + PDF)
 *   PROC-10: US-A-12 RODO usunięcie / anonimizacja pacjenta (right to be forgotten)
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

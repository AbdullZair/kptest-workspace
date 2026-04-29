import { test, expect, type APIRequestContext } from '@playwright/test'

/**
 * KPTEST — Process E2E tests (rozszerzenie).
 *
 * Plik dopełnia `e2e_processes.spec.ts` o trzy kolejne procesy biznesowe.
 * Każdy test odzwierciedla pełny ciąg akcji w portalu (po API), nie pojedyncze
 * wywołanie endpointu.
 *
 *   PROC-04: cykl życia eventu (utworzenie → reschedule → complete)
 *   PROC-05: wątek wiadomości (start → reply → odczyt → unread count)
 *   PROC-06: cykl pacjenta w projekcie (enroll → archive → read-only)
 *
 * Każdy krok kończy się asercją `expect(res.ok(), ...).toBeTruthy()` — tak,
 * by przy błędzie komunikat zawierał kod HTTP oraz body odpowiedzi.
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
 * Logowanie + pobranie identyfikatora użytkownika.
 *
 * `POST /auth/login` zwraca tylko `access_token` (bez `user_id`), więc po
 * zalogowaniu dociągamy profil z `GET /auth/me`, aby uzyskać UUID admina —
 * jest wymagany przez `/messages/*` jako `?userId=`.
 */
const login = async (request: APIRequestContext): Promise<AuthBundle> => {
  const res = await request.post(`${API_URL}/auth/login`, {
    data: { identifier: ADMIN.identifier, password: ADMIN.password },
  })
  expect(res.ok(), `login HTTP ${res.status()}`).toBeTruthy()
  const body = (await res.json()) as { access_token: string }
  const token = body.access_token

  const meRes = await request.get(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  expect(meRes.ok(), `GET /auth/me HTTP ${meRes.status()}`).toBeTruthy()
  const me = (await meRes.json()) as { user_id?: string; userId?: string }
  return { token, userId: me.user_id ?? me.userId ?? '' }
}

interface RegisteredPatient {
  email: string
  pesel: string
  firstName: string
  lastName: string
  userId: string
}

const registerPatient = async (
  request: APIRequestContext
): Promise<RegisteredPatient> => {
  const s = stamp()
  const email = `proc.extra.${s}@email.com`
  const pesel = randomPesel()
  const firstName = 'ProcExtra'
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
  expect(res.ok(), `register HTTP ${res.status()}: ${await res.text()}`).toBeTruthy()
  const body = (await res.json()) as { user_id?: string; id?: string }
  return { email, pesel, firstName, lastName, userId: body.user_id ?? body.id ?? '' }
}

/**
 * /auth/register zwraca User.id, a operacje na pacjencie wymagają Patient.id —
 * trzeba je rozwiązać po PESEL.
 */
const resolvePatientId = async (
  request: APIRequestContext,
  token: string,
  pesel: string
): Promise<string> => {
  const res = await request.get(`${API_URL}/patients?pesel=${pesel}&page=0&size=10`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  expect(res.ok(), `GET /patients?pesel HTTP ${res.status()}`).toBeTruthy()
  const body = (await res.json()) as {
    data?: Array<{ id: string }>
    patients?: Array<{ id: string }>
    content?: Array<{ id: string }>
  }
  const list = body.data ?? body.patients ?? body.content ?? []
  expect(list.length, `patient with PESEL ${pesel} should be findable`).toBeGreaterThan(0)
  return list[0].id
}

const approvePatientManually = async (
  request: APIRequestContext,
  token: string,
  patientId: string
): Promise<void> => {
  const res = await request.post(`${API_URL}/admin/patients/${patientId}/approve`, {
    headers: authHeaders(token),
    data: {
      method: 'MANUAL',
      reason: 'E2E test — automatyczna manualna akceptacja dla scenariusza procesowego.',
    },
  })
  expect(res.ok(), `approve HTTP ${res.status()}: ${await res.text()}`).toBeTruthy()
}

// ============================================================
// PROC-04: cykl życia eventu (utworzenie → reschedule → complete)
// ============================================================

test.describe('Process — Cykl życia eventu (utworzenie → reschedule → complete)', () => {
  test('PROC-04: Event jest tworzony, przesuwany (PUT) i finalnie oznaczany jako wykonany', async ({
    request,
  }) => {
    // KROK 1: Logowanie administratora
    const auth = await login(request)
    expect(auth.token).toBeTruthy()

    // KROK 2: Założenie projektu (kontener dla eventu)
    const projStart = new Date().toISOString()
    const projRes = await request.post(`${API_URL}/projects`, {
      headers: authHeaders(auth.token),
      data: {
        name: `PROC-04 Projekt ${stamp()}`,
        description: 'PROC-04: cykl życia eventu terapeutycznego',
        start_date: projStart,
        status: 'ACTIVE',
        compliance_threshold: 80,
        team_member_ids: [],
        patient_ids: [],
      },
    })
    expect(
      projRes.ok(),
      `POST /projects HTTP ${projRes.status()}: ${await projRes.text()}`
    ).toBeTruthy()
    const project = (await projRes.json()) as { id: string }

    // KROK 3: Rejestracja + akceptacja + enrollment pacjenta
    const patient = await registerPatient(request)
    const patientId = await resolvePatientId(request, auth.token, patient.pesel)
    await approvePatientManually(request, auth.token, patientId)

    const enrollRes = await request.post(`${API_URL}/projects/${project.id}/patients`, {
      headers: authHeaders(auth.token),
      data: { patient_ids: [patientId] },
    })
    expect(
      enrollRes.ok(),
      `POST /projects/{id}/patients HTTP ${enrollRes.status()}: ${await enrollRes.text()}`
    ).toBeTruthy()

    // KROK 4: Utworzenie eventu (VISIT, +3 dni)
    const initialScheduled = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    const initialEnds = new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000
    ).toISOString()
    const initialTitle = `PROC-04 Wizyta ${stamp()}`
    const eventRes = await request.post(`${API_URL}/calendar/events`, {
      headers: authHeaders(auth.token),
      data: {
        project_id: project.id,
        patient_id: patientId,
        title: initialTitle,
        description: 'Pierwsza wizyta — cykl życia eventu (PROC-04).',
        type: 'VISIT',
        scheduled_at: initialScheduled,
        ends_at: initialEnds,
        location: 'IFPS Warszawa, gabinet 12',
        is_cyclic: false,
        reminders: { reminder_24h: true, reminder_2h: true, reminder_30min: false },
      },
    })
    expect(
      eventRes.ok(),
      `POST /calendar/events HTTP ${eventRes.status()}: ${await eventRes.text()}`
    ).toBeTruthy()
    const event = (await eventRes.json()) as { id: string; status?: string }
    expect(event.id).toBeTruthy()

    // KROK 5: Reschedule eventu — PUT zmienia scheduled_at na +5 dni i tytuł
    const reschedScheduled = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    const reschedEnds = new Date(
      Date.now() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000
    ).toISOString()
    const reschedTitle = `(reschedule) ${initialTitle}`
    const updateRes = await request.put(`${API_URL}/calendar/events/${event.id}`, {
      headers: authHeaders(auth.token),
      data: {
        title: reschedTitle,
        description: 'Wizyta przesunięta — pacjent niedyspozycyjny w pierwotnym terminie.',
        type: 'VISIT',
        scheduled_at: reschedScheduled,
        ends_at: reschedEnds,
        location: 'IFPS Warszawa, gabinet 12',
        is_cyclic: false,
        reminders: { reminder_24h: true, reminder_2h: true, reminder_30min: false },
      },
    })
    expect(
      updateRes.ok(),
      `PUT /calendar/events/{id} HTTP ${updateRes.status()}: ${await updateRes.text()}`
    ).toBeTruthy()

    // KROK 6: GET eventu po ID — weryfikacja, że zmiany się zapisały
    const afterUpdateRes = await request.get(`${API_URL}/calendar/events/${event.id}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    expect(
      afterUpdateRes.ok(),
      `GET /calendar/events/{id} po PUT HTTP ${afterUpdateRes.status()}: ${await afterUpdateRes.text()}`
    ).toBeTruthy()
    const afterUpdate = (await afterUpdateRes.json()) as {
      title?: string
      scheduled_at?: string
      scheduledAt?: string
    }
    expect(afterUpdate.title, 'tytuł po reschedule').toBe(reschedTitle)
    const newScheduled = afterUpdate.scheduled_at ?? afterUpdate.scheduledAt ?? ''
    expect(
      new Date(newScheduled).getTime(),
      'scheduled_at po reschedule równa się przesłanej wartości (±1s)'
    ).toBeGreaterThanOrEqual(new Date(reschedScheduled).getTime() - 1000)
    expect(
      new Date(newScheduled).getTime(),
      'scheduled_at po reschedule równa się przesłanej wartości (±1s)'
    ).toBeLessThanOrEqual(new Date(reschedScheduled).getTime() + 1000)

    // KROK 7: Oznaczenie eventu jako wykonany — body zgodne z CompleteEventRequest (patient_notes)
    const completeRes = await request.post(
      `${API_URL}/calendar/events/${event.id}/complete`,
      {
        headers: authHeaders(auth.token),
        data: { patient_notes: 'Wizyta zrealizowana, pacjent w dobrym stanie.' },
      }
    )
    expect(
      completeRes.ok(),
      `POST /calendar/events/{id}/complete HTTP ${completeRes.status()}: ${await completeRes.text()}`
    ).toBeTruthy()

    // KROK 8: GET eventu po complete — status powinien być COMPLETED
    const afterCompleteRes = await request.get(
      `${API_URL}/calendar/events/${event.id}`,
      { headers: { Authorization: `Bearer ${auth.token}` } }
    )
    expect(
      afterCompleteRes.ok(),
      `GET /calendar/events/{id} po complete HTTP ${afterCompleteRes.status()}`
    ).toBeTruthy()
    const afterComplete = (await afterCompleteRes.json()) as { status?: string }
    expect(afterComplete.status, 'status eventu po complete = COMPLETED').toBe('COMPLETED')
  })
})

// ============================================================
// PROC-05: wątek wiadomości (start → reply → odczyt → licznik)
// ============================================================

test.describe('Process — Wątek wiadomości (start → reply → odczyt → unread count)', () => {
  test('PROC-05: Personel zakłada wątek, dopisuje kolejną wiadomość, oznacza jako przeczytane i sprawdza licznik', async ({
    request,
  }) => {
    // KROK 1: Logowanie administratora — token i user_id (potrzebne jako ?userId=)
    const auth = await login(request)
    expect(auth.userId, 'admin user_id z /auth/me').toBeTruthy()

    // KROK 2: Założenie projektu (każdy wątek wymaga projektu wg CreateThreadRequest.projectId)
    const projStart = new Date().toISOString()
    const projRes = await request.post(`${API_URL}/projects`, {
      headers: authHeaders(auth.token),
      data: {
        name: `PROC-05 Projekt ${stamp()}`,
        description: 'PROC-05: kontener dla wątku wiadomości',
        start_date: projStart,
        status: 'ACTIVE',
        compliance_threshold: 80,
        team_member_ids: [],
        patient_ids: [],
      },
    })
    expect(
      projRes.ok(),
      `POST /projects HTTP ${projRes.status()}: ${await projRes.text()}`
    ).toBeTruthy()
    const project = (await projRes.json()) as { id: string }

    // KROK 3: Rejestracja + akceptacja + enrollment pacjenta
    const patient = await registerPatient(request)
    const patientId = await resolvePatientId(request, auth.token, patient.pesel)
    await approvePatientManually(request, auth.token, patientId)

    const enrollRes = await request.post(`${API_URL}/projects/${project.id}/patients`, {
      headers: authHeaders(auth.token),
      data: { patient_ids: [patientId] },
    })
    expect(
      enrollRes.ok(),
      `POST /projects/{id}/patients HTTP ${enrollRes.status()}`
    ).toBeTruthy()

    // KROK 4: Utworzenie wątku — body zgodne z CreateThreadRequest (projectId, title, type)
    // UWAGA: brak SNAKE_CASE strategy → klucze camelCase, choć inne DTO używają @JsonProperty.
    const threadTitle = `PROC-05 Wątek ${stamp()}`
    const threadRes = await request.post(
      `${API_URL}/messages/threads?userId=${auth.userId}`,
      {
        headers: authHeaders(auth.token),
        data: {
          projectId: project.id,
          title: threadTitle,
          type: 'INDIVIDUAL',
        },
      }
    )
    expect(
      threadRes.ok(),
      `POST /messages/threads HTTP ${threadRes.status()}: ${await threadRes.text()}`
    ).toBeTruthy()
    const thread = (await threadRes.json()) as { id: string }
    expect(thread.id, 'thread.id').toBeTruthy()

    // KROK 5: Wysłanie pierwszej wiadomości w wątku
    const msg1Res = await request.post(
      `${API_URL}/messages/threads/${thread.id}/messages?userId=${auth.userId}`,
      {
        headers: authHeaders(auth.token),
        data: {
          content: 'Dzień dobry, witamy w terapii. Zespół czeka na pierwsze pytania.',
          priority: 'INFO',
        },
      }
    )
    expect(
      msg1Res.ok(),
      `POST /messages/threads/{id}/messages #1 HTTP ${msg1Res.status()}: ${await msg1Res.text()}`
    ).toBeTruthy()
    const msg1 = (await msg1Res.json()) as { id: string }

    // KROK 6: Druga wiadomość w wątku — symuluje reply personelu
    const msg2Res = await request.post(
      `${API_URL}/messages/threads/${thread.id}/messages?userId=${auth.userId}`,
      {
        headers: authHeaders(auth.token),
        data: {
          content: 'Dziękujemy za rejestrację. W razie pytań prosimy o kontakt.',
          priority: 'INFO',
        },
      }
    )
    expect(
      msg2Res.ok(),
      `POST /messages/threads/{id}/messages #2 HTTP ${msg2Res.status()}: ${await msg2Res.text()}`
    ).toBeTruthy()
    const msg2 = (await msg2Res.json()) as { id: string }

    // KROK 7: Lista wiadomości wątku — co najmniej 2 sztuki
    const listRes = await request.get(
      `${API_URL}/messages/threads/${thread.id}/messages?page=0&size=50`,
      { headers: { Authorization: `Bearer ${auth.token}` } }
    )
    expect(
      listRes.ok(),
      `GET /messages/threads/{id}/messages HTTP ${listRes.status()}: ${await listRes.text()}`
    ).toBeTruthy()
    const messages = (await listRes.json()) as Array<{ id: string }>
    expect(
      Array.isArray(messages),
      'response /messages/threads/{id}/messages jest tablicą'
    ).toBeTruthy()
    expect(messages.length, 'co najmniej 2 wiadomości w wątku').toBeGreaterThanOrEqual(2)
    expect(
      messages.some((m) => m.id === msg1.id) && messages.some((m) => m.id === msg2.id),
      'lista zawiera obie wysłane wiadomości'
    ).toBeTruthy()

    // KROK 8: Oznaczenie pierwszej wiadomości jako przeczytanej
    const readRes = await request.post(
      `${API_URL}/messages/messages/${msg1.id}/read?userId=${auth.userId}`,
      { headers: authHeaders(auth.token) }
    )
    expect(
      readRes.ok(),
      `POST /messages/messages/{id}/read HTTP ${readRes.status()}: ${await readRes.text()}`
    ).toBeTruthy()

    // KROK 9: Sprawdzenie licznika nieprzeczytanych — nie powinien rzucać błędu
    const unreadRes = await request.get(
      `${API_URL}/messages/unread/count?userId=${auth.userId}`,
      { headers: { Authorization: `Bearer ${auth.token}` } }
    )
    expect(
      unreadRes.ok(),
      `GET /messages/unread/count HTTP ${unreadRes.status()}: ${await unreadRes.text()}`
    ).toBeTruthy()
    const unread = (await unreadRes.json()) as { count?: number }
    expect(
      typeof unread.count,
      'odpowiedź /messages/unread/count zawiera liczbowy field "count"'
    ).toBe('number')
    expect(unread.count, 'unread count >= 0').toBeGreaterThanOrEqual(0)
  })
})

// ============================================================
// PROC-06: cykl pacjenta w projekcie (enroll → archive → read-only)
// ============================================================

test.describe('Process — Cykl pacjenta w projekcie (enroll → archive → read-only)', () => {
  test('PROC-06: Po archiwizacji projektu pacjent pozostaje w statystykach, projekt widoczny na liście archiwalnych', async ({
    request,
  }) => {
    // KROK 1: Logowanie administratora
    const auth = await login(request)
    expect(auth.token).toBeTruthy()

    // KROK 2: Rejestracja + akceptacja pacjenta (PENDING → ACTIVE)
    const patient = await registerPatient(request)
    const patientId = await resolvePatientId(request, auth.token, patient.pesel)
    await approvePatientManually(request, auth.token, patientId)

    // KROK 3: Założenie nowego projektu (status ACTIVE)
    const projStart = new Date().toISOString()
    const projectName = `PROC-06 Projekt ${stamp()}`
    const projRes = await request.post(`${API_URL}/projects`, {
      headers: authHeaders(auth.token),
      data: {
        name: projectName,
        description: 'PROC-06: cykl pacjenta + archiwizacja projektu',
        start_date: projStart,
        status: 'ACTIVE',
        compliance_threshold: 80,
        team_member_ids: [],
        patient_ids: [],
      },
    })
    expect(
      projRes.ok(),
      `POST /projects HTTP ${projRes.status()}: ${await projRes.text()}`
    ).toBeTruthy()
    const project = (await projRes.json()) as { id: string; name: string }
    expect(project.name).toBe(projectName)

    // KROK 4: Enrollment pacjenta w projekcie
    const enrollRes = await request.post(`${API_URL}/projects/${project.id}/patients`, {
      headers: authHeaders(auth.token),
      data: { patient_ids: [patientId] },
    })
    expect(
      enrollRes.ok(),
      `POST /projects/{id}/patients HTTP ${enrollRes.status()}: ${await enrollRes.text()}`
    ).toBeTruthy()

    // KROK 5: PUT projekt → status ARCHIVED (zgodnie z ProjectUpdateRequest)
    const archiveRes = await request.put(`${API_URL}/projects/${project.id}`, {
      headers: authHeaders(auth.token),
      data: {
        name: projectName,
        description: 'PROC-06: projekt zarchiwizowany przez test procesowy',
        start_date: projStart,
        status: 'ARCHIVED',
        compliance_threshold: 80,
      },
    })
    expect(
      archiveRes.ok(),
      `PUT /projects/{id} HTTP ${archiveRes.status()}: ${await archiveRes.text()}`
    ).toBeTruthy()

    // KROK 6: GET projekt — status powinien być ARCHIVED
    const getProjRes = await request.get(`${API_URL}/projects/${project.id}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    expect(
      getProjRes.ok(),
      `GET /projects/{id} HTTP ${getProjRes.status()}: ${await getProjRes.text()}`
    ).toBeTruthy()
    const projAfter = (await getProjRes.json()) as { status?: string }
    expect(projAfter.status, 'status projektu po PUT = ARCHIVED').toBe('ARCHIVED')

    // KROK 7: GET statistics — pacjent wciąż policzony (read-only state, nie usuwa enrollmentów)
    const statsRes = await request.get(`${API_URL}/projects/${project.id}/statistics`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    expect(
      statsRes.ok(),
      `GET /projects/{id}/statistics HTTP ${statsRes.status()}: ${await statsRes.text()}`
    ).toBeTruthy()
    const stats = (await statsRes.json()) as {
      active_patients?: number
      total_patients?: number
    }
    const patientsCounted = (stats.active_patients ?? 0) + (stats.total_patients ?? 0)
    expect(
      patientsCounted,
      'po archiwizacji co najmniej jeden pacjent (active lub total) >= 1'
    ).toBeGreaterThanOrEqual(1)

    // KROK 8: GET /projects?status=ARCHIVED — projekt jest na liście archiwalnych
    const listRes = await request.get(`${API_URL}/projects?status=ARCHIVED`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    expect(
      listRes.ok(),
      `GET /projects?status=ARCHIVED HTTP ${listRes.status()}: ${await listRes.text()}`
    ).toBeTruthy()
    const listRaw = await listRes.json()
    const projects: Array<{ id: string; status?: string }> = Array.isArray(listRaw)
      ? (listRaw as Array<{ id: string; status?: string }>)
      : ((listRaw as { data?: Array<{ id: string; status?: string }> }).data ??
         (listRaw as { content?: Array<{ id: string; status?: string }> }).content ??
         [])
    expect(
      projects.some((p) => p.id === project.id),
      `projekt ${project.id} widoczny na liście /projects?status=ARCHIVED`
    ).toBeTruthy()
  })
})

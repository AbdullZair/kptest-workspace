-- V5: baseline schema for entities that Hibernate ddl-auto:update created at runtime
-- but were never expressed as Flyway migrations. Idempotent so existing dev
-- databases (which already have these tables) treat the migration as a no-op
-- on rerun. Generated from a pg_dump of the dev schema, 2026-04-28.








CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid NOT NULL,
    action character varying(20) NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    entity_id uuid,
    entity_type character varying(100) NOT NULL,
    ip_address character varying(45),
    new_value jsonb,
    old_value jsonb,
    user_agent character varying(500),
    user_id uuid NOT NULL,
    CONSTRAINT audit_logs_action_check CHECK (((action)::text = ANY ((ARRAY['CREATE'::character varying, 'UPDATE'::character varying, 'DELETE'::character varying, 'VIEW'::character varying, 'LOGIN'::character varying, 'LOGOUT'::character varying])::text[])))
);



CREATE TABLE IF NOT EXISTS public.badge_rules (
    id uuid NOT NULL,
    category_filter character varying(100),
    created_at timestamp(6) with time zone NOT NULL,
    event_type character varying(100),
    period_days integer,
    quiz_id uuid,
    rule_type character varying(255) NOT NULL,
    threshold integer NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    badge_id uuid NOT NULL,
    CONSTRAINT badge_rules_rule_type_check CHECK (((rule_type)::text = ANY ((ARRAY['EVENTS_COMPLETED'::character varying, 'COMPLIANCE_THRESHOLD'::character varying, 'MATERIALS_READ'::character varying, 'QUIZ_PASSED'::character varying, 'DAYS_STREAK'::character varying, 'STAGE_COMPLETED'::character varying])::text[])))
);



CREATE TABLE IF NOT EXISTS public.badges (
    id uuid NOT NULL,
    is_active boolean NOT NULL,
    badge_category character varying(50),
    badge_color character varying(20),
    created_at timestamp(6) with time zone NOT NULL,
    created_by uuid NOT NULL,
    description text,
    is_hidden boolean NOT NULL,
    icon_url character varying(500),
    name character varying(200) NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    CONSTRAINT badges_badge_category_check CHECK (((badge_category)::text = ANY ((ARRAY['ENGAGEMENT'::character varying, 'COMPLIANCE'::character varying, 'EDUCATION'::character varying, 'MILESTONE'::character varying, 'STREAK'::character varying])::text[])))
);



CREATE TABLE IF NOT EXISTS public.educational_materials (
    id uuid NOT NULL,
    assigned_to_patients text,
    assigned_to_stages text,
    category character varying(100),
    completion_count integer NOT NULL,
    content text NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    created_by uuid NOT NULL,
    difficulty character varying(255) NOT NULL,
    external_url character varying(500),
    file_url character varying(500),
    project_id uuid NOT NULL,
    published boolean NOT NULL,
    published_at timestamp(6) with time zone,
    title character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    view_count integer NOT NULL,
    CONSTRAINT educational_materials_difficulty_check CHECK (((difficulty)::text = ANY ((ARRAY['BASIC'::character varying, 'INTERMEDIATE'::character varying, 'ADVANCED'::character varying])::text[]))),
    CONSTRAINT educational_materials_type_check CHECK (((type)::text = ANY ((ARRAY['ARTICLE'::character varying, 'PDF'::character varying, 'IMAGE'::character varying, 'VIDEO'::character varying, 'LINK'::character varying, 'AUDIO'::character varying])::text[])))
);



CREATE TABLE IF NOT EXISTS public.event_change_requests (
    id uuid NOT NULL,
    acceptance_comment text,
    attempt_number integer NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    event_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    proposed_date timestamp(6) with time zone NOT NULL,
    reason text,
    rejection_reason text,
    reviewed_at timestamp(6) with time zone,
    reviewed_by uuid,
    status character varying(255) NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    CONSTRAINT event_change_requests_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'ACCEPTED'::character varying, 'REJECTED'::character varying, 'CANCELLED'::character varying])::text[])))
);



CREATE TABLE IF NOT EXISTS public.inbox_thread_status (
    id uuid NOT NULL,
    assigned_to uuid,
    closed_at timestamp(6) with time zone,
    created_at timestamp(6) with time zone NOT NULL,
    resolved_at timestamp(6) with time zone,
    status character varying(255) NOT NULL,
    thread_id uuid NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    CONSTRAINT inbox_thread_status_status_check CHECK (((status)::text = ANY ((ARRAY['NEW'::character varying, 'IN_PROGRESS'::character varying, 'RESOLVED'::character varying, 'CLOSED'::character varying])::text[])))
);



CREATE TABLE IF NOT EXISTS public.material_progress (
    id uuid NOT NULL,
    completed_at timestamp(6) with time zone,
    created_at timestamp(6) with time zone NOT NULL,
    material_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    quiz_score integer,
    started_at timestamp(6) with time zone,
    status character varying(255) NOT NULL,
    time_spent_seconds integer NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    CONSTRAINT material_progress_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'IN_PROGRESS'::character varying, 'COMPLETED'::character varying])::text[])))
);



CREATE TABLE IF NOT EXISTS public.message_attachments (
    id uuid NOT NULL,
    file_name character varying(255) NOT NULL,
    file_size bigint NOT NULL,
    file_type character varying(100) NOT NULL,
    storage_path character varying(500) NOT NULL,
    uploaded_at timestamp(6) with time zone NOT NULL,
    message_id uuid NOT NULL
);



CREATE TABLE IF NOT EXISTS public.message_threads (
    id uuid NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    created_by uuid NOT NULL,
    last_message_at timestamp(6) with time zone,
    project_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    thread_type character varying(255) NOT NULL,
    updated_at timestamp(6) with time zone,
    CONSTRAINT message_threads_thread_type_check CHECK (((thread_type)::text = ANY ((ARRAY['INDIVIDUAL'::character varying, 'GROUP'::character varying])::text[])))
);



CREATE TABLE IF NOT EXISTS public.messages (
    id uuid NOT NULL,
    content text NOT NULL,
    internal_note character varying(1000),
    priority character varying(255) NOT NULL,
    read_at timestamp(6) with time zone,
    read_by text,
    sender_id uuid NOT NULL,
    sent_at timestamp(6) with time zone NOT NULL,
    parent_message_id uuid,
    thread_id uuid NOT NULL,
    CONSTRAINT messages_priority_check CHECK (((priority)::text = ANY ((ARRAY['INFO'::character varying, 'QUESTION'::character varying, 'URGENT'::character varying])::text[])))
);



CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id uuid NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    email_enabled boolean NOT NULL,
    event_notifications boolean NOT NULL,
    material_notifications boolean NOT NULL,
    message_notifications boolean NOT NULL,
    push_enabled boolean NOT NULL,
    quiet_hours_end character varying(5),
    quiet_hours_start character varying(5),
    reminder_notifications boolean NOT NULL,
    sms_enabled boolean NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    user_id uuid NOT NULL
);



CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid NOT NULL,
    action_url character varying(500),
    content text NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    read boolean NOT NULL,
    scheduled_for timestamp(6) with time zone,
    sent_at timestamp(6) with time zone,
    sent_email boolean NOT NULL,
    sent_push boolean NOT NULL,
    sent_sms boolean NOT NULL,
    title character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    user_id uuid NOT NULL,
    CONSTRAINT notifications_type_check CHECK (((type)::text = ANY ((ARRAY['MESSAGE'::character varying, 'EVENT'::character varying, 'MATERIAL'::character varying, 'SCHEDULE_CHANGE'::character varying, 'REMINDER'::character varying])::text[])))
);



CREATE TABLE IF NOT EXISTS public.patient_activation_codes (
    id uuid NOT NULL,
    code character varying(8) NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    expires_at timestamp(6) with time zone NOT NULL,
    is_used boolean NOT NULL,
    patient_id uuid NOT NULL,
    used_at timestamp(6) with time zone,
    used_by uuid
);



CREATE TABLE IF NOT EXISTS public.patient_badges (
    id uuid NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    earned_at timestamp(6) with time zone NOT NULL,
    notified boolean NOT NULL,
    badge_id uuid NOT NULL,
    patient_id uuid NOT NULL
);



CREATE TABLE IF NOT EXISTS public.patient_stage_progress (
    id uuid NOT NULL,
    completed_at timestamp(6) with time zone,
    completed_by uuid,
    completion_reason character varying(500),
    created_at timestamp(6) with time zone NOT NULL,
    started_at timestamp(6) with time zone,
    status character varying(255) NOT NULL,
    unlocked_at timestamp(6) with time zone,
    updated_at timestamp(6) with time zone NOT NULL,
    patient_project_id uuid NOT NULL,
    stage_id uuid NOT NULL,
    CONSTRAINT patient_stage_progress_status_check CHECK (((status)::text = ANY ((ARRAY['LOCKED'::character varying, 'AVAILABLE'::character varying, 'COMPLETED'::character varying])::text[])))
);



CREATE TABLE IF NOT EXISTS public.quiz_answer_selections (
    id uuid NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    is_correct boolean NOT NULL,
    points_earned integer NOT NULL,
    attempt_id uuid NOT NULL,
    question_id uuid NOT NULL
);



CREATE TABLE IF NOT EXISTS public.quiz_answers (
    id uuid NOT NULL,
    answer text NOT NULL,
    correct boolean NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    explanation text,
    order_index integer NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    question_id uuid NOT NULL
);



CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id uuid NOT NULL,
    completed_at timestamp(6) with time zone,
    created_at timestamp(6) with time zone NOT NULL,
    created_by uuid NOT NULL,
    max_score integer NOT NULL,
    passed boolean NOT NULL,
    percentage double precision NOT NULL,
    score integer NOT NULL,
    started_at timestamp(6) with time zone NOT NULL,
    time_spent_seconds integer,
    updated_at timestamp(6) with time zone NOT NULL,
    patient_id uuid NOT NULL,
    quiz_id uuid NOT NULL
);



CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id uuid NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    explanation text,
    order_index integer NOT NULL,
    points integer NOT NULL,
    question text NOT NULL,
    type character varying(255) NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    quiz_id uuid NOT NULL,
    CONSTRAINT quiz_questions_type_check CHECK (((type)::text = ANY ((ARRAY['SINGLE_CHOICE'::character varying, 'MULTI_CHOICE'::character varying, 'TRUE_FALSE'::character varying])::text[])))
);



CREATE TABLE IF NOT EXISTS public.quiz_selected_answers (
    selection_id uuid NOT NULL,
    answer_id uuid
);



CREATE TABLE IF NOT EXISTS public.quizzes (
    id uuid NOT NULL,
    active boolean NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    created_by uuid NOT NULL,
    description text,
    pass_threshold integer NOT NULL,
    time_limit_seconds integer,
    title character varying(255) NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    project_id uuid NOT NULL
);



CREATE TABLE IF NOT EXISTS public.reports (
    id uuid NOT NULL,
    data jsonb NOT NULL,
    date_from date NOT NULL,
    date_to date NOT NULL,
    generated_at timestamp(6) with time zone NOT NULL,
    generated_by uuid NOT NULL,
    patient_id uuid,
    project_id uuid,
    type character varying(255) NOT NULL,
    CONSTRAINT reports_type_check CHECK (((type)::text = ANY ((ARRAY['COMPLIANCE'::character varying, 'PATIENT_STATS'::character varying, 'PROJECT_STATS'::character varying, 'MATERIAL_STATS'::character varying])::text[])))
);



CREATE TABLE IF NOT EXISTS public.system_logs (
    id uuid NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    level character varying(10) NOT NULL,
    message text NOT NULL,
    source_class character varying(255),
    source_method character varying(255),
    stack_trace text,
    CONSTRAINT system_logs_level_check CHECK (((level)::text = ANY ((ARRAY['DEBUG'::character varying, 'INFO'::character varying, 'WARN'::character varying, 'ERROR'::character varying])::text[])))
);



CREATE TABLE IF NOT EXISTS public.therapy_events (
    id uuid NOT NULL,
    completed_at timestamp(6) with time zone,
    created_at timestamp(6) with time zone NOT NULL,
    description text,
    ends_at timestamp(6) with time zone,
    is_cyclic boolean NOT NULL,
    location character varying(255),
    patient_id uuid,
    patient_notes text,
    project_id uuid NOT NULL,
    recurrence_rule character varying(500),
    reminder_24h boolean,
    reminder_2h boolean,
    reminder_30min boolean,
    scheduled_at timestamp(6) with time zone NOT NULL,
    status character varying(255) NOT NULL,
    title character varying(200) NOT NULL,
    type character varying(255) NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    reminders text,
    CONSTRAINT therapy_events_status_check CHECK (((status)::text = ANY ((ARRAY['SCHEDULED'::character varying, 'COMPLETED'::character varying, 'MISSED'::character varying, 'CANCELLED'::character varying])::text[]))),
    CONSTRAINT therapy_events_type_check CHECK (((type)::text = ANY ((ARRAY['VISIT'::character varying, 'SESSION'::character varying, 'MEDICATION'::character varying, 'EXERCISE'::character varying, 'MEASUREMENT'::character varying, 'OTHER'::character varying])::text[])))
);



CREATE TABLE IF NOT EXISTS public.therapy_stages (
    id uuid NOT NULL,
    is_active boolean NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    created_by uuid NOT NULL,
    description text,
    name character varying(200) NOT NULL,
    order_index integer NOT NULL,
    unlock_mode character varying(255) NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    project_id uuid NOT NULL,
    required_quiz_id uuid,
    CONSTRAINT therapy_stages_unlock_mode_check CHECK (((unlock_mode)::text = ANY ((ARRAY['MANUAL'::character varying, 'AUTO_QUIZ'::character varying])::text[])))
);



DO $$ BEGIN ALTER TABLE ONLY public.audit_logs ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_table THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;



DO $$ BEGIN ALTER TABLE ONLY public.badge_rules ADD CONSTRAINT badge_rules_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_table THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;



DO $$ BEGIN ALTER TABLE ONLY public.badges ADD CONSTRAINT badges_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_table THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;



DO $$ BEGIN ALTER TABLE ONLY public.educational_materials ADD CONSTRAINT educational_materials_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_table THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;



DO $$ BEGIN ALTER TABLE ONLY public.event_change_requests ADD CONSTRAINT event_change_requests_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_table THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;



DO $$ BEGIN ALTER TABLE ONLY public.inbox_thread_status ADD CONSTRAINT inbox_thread_status_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_table THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;



DO $$ BEGIN ALTER TABLE ONLY public.material_progress ADD CONSTRAINT material_progress_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_table THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;



DO $$ BEGIN ALTER TABLE ONLY public.message_attachments ADD CONSTRAINT message_attachments_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_table THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;



DO $$ BEGIN ALTER TABLE ONLY public.message_threads ADD CONSTRAINT message_threads_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_table THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;



DO $$ BEGIN ALTER TABLE ONLY public.messages ADD CONSTRAINT messages_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_table THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;



DO $$ BEGIN ALTER TABLE ONLY public.notification_preferences ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_table THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;



DO $$ BEGIN ALTER TABLE ONLY public.notifications ADD CONSTRAINT notifications_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_table THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;



DO $$ BEGIN ALTER TABLE ONLY public.patient_activation_codes ADD CONSTRAINT patient_activation_codes_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_table THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;



DO $$ BEGIN ALTER TABLE ONLY public.patient_badges ADD CONSTRAINT patient_badges_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_table THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;



DO $$ BEGIN ALTER TABLE ONLY public.patient_stage_progress ADD CONSTRAINT patient_stage_progress_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_table THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;



DO $$ BEGIN ALTER TABLE ONLY public.quiz_answer_selections ADD CONSTRAINT quiz_answer_selections_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_table THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;



DO $$ BEGIN ALTER TABLE ONLY public.quiz_answers ADD CONSTRAINT quiz_answers_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_table THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;



DO $$ BEGIN ALTER TABLE ONLY public.quiz_attempts ADD CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_table THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;



DO $$ BEGIN ALTER TABLE ONLY public.quiz_questions ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_table THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;



DO $$ BEGIN ALTER TABLE ONLY public.quizzes ADD CONSTRAINT quizzes_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_table THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;



DO $$ BEGIN ALTER TABLE ONLY public.reports ADD CONSTRAINT reports_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_table THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;



DO $$ BEGIN ALTER TABLE ONLY public.system_logs ADD CONSTRAINT system_logs_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_table THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;



DO $$ BEGIN ALTER TABLE ONLY public.therapy_events ADD CONSTRAINT therapy_events_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_table THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;



DO $$ BEGIN ALTER TABLE ONLY public.therapy_stages ADD CONSTRAINT therapy_stages_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_table THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;



ALTER TABLE ONLY public.patient_activation_codes
    ADD CONSTRAINT uk_3euhvtudi5lfgbb074dgs6n0i UNIQUE (code);



ALTER TABLE ONLY public.inbox_thread_status
    ADD CONSTRAINT uk_fb0ld93wnj31oi9950kydwkyv UNIQUE (thread_id);



ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT uk_n2jopkbm16qv3xelbvoyjkd0g UNIQUE (user_id);



ALTER TABLE ONLY public.patient_badges
    ADD CONSTRAINT ukcnsetoyr3ccekrm73y9htwmp4 UNIQUE (patient_id, badge_id);



CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences USING btree (user_id);



CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications USING btree (created_at);



CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_for ON public.notifications USING btree (scheduled_for);



CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications USING btree (user_id);



CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications USING btree (user_id, read);



ALTER TABLE ONLY public.patient_badges
    ADD CONSTRAINT fk3r5cdh371wg7vkobhwrmu1fcv FOREIGN KEY (patient_id) REFERENCES public.patients(id);



ALTER TABLE ONLY public.patient_stage_progress
    ADD CONSTRAINT fk4a6ckn0l8ivgsb67hrw69lj1o FOREIGN KEY (stage_id) REFERENCES public.therapy_stages(id);



ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT fk4uvg3xfb15vwy1b3p26hqrcyg FOREIGN KEY (patient_id) REFERENCES public.patients(id);



ALTER TABLE ONLY public.quiz_answer_selections
    ADD CONSTRAINT fk5fudtuxs8nhysktdtfidb2w8f FOREIGN KEY (attempt_id) REFERENCES public.quiz_attempts(id);



ALTER TABLE ONLY public.therapy_stages
    ADD CONSTRAINT fk7mu94wwm9fflg8gi098aaab4k FOREIGN KEY (required_quiz_id) REFERENCES public.quizzes(id);



ALTER TABLE ONLY public.messages
    ADD CONSTRAINT fk8cs7qdu3mdbr08xirdmsfxpgk FOREIGN KEY (parent_message_id) REFERENCES public.messages(id);



ALTER TABLE ONLY public.quiz_answer_selections
    ADD CONSTRAINT fka0tuced1l633n4n3inbd596dj FOREIGN KEY (question_id) REFERENCES public.quiz_questions(id);



ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT fkanfmgf6ksbdnv7ojb0pfve54q FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id);



ALTER TABLE ONLY public.quiz_answers
    ADD CONSTRAINT fkb69mwpkm3kehim0klscpmmkc1 FOREIGN KEY (question_id) REFERENCES public.quiz_questions(id);



ALTER TABLE ONLY public.patient_stage_progress
    ADD CONSTRAINT fkc66abs3um34ogqxr1v8yafcmn FOREIGN KEY (patient_project_id) REFERENCES public.patient_projects(id);



ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT fkfwipvfipnnwsoacoyv5k7fbxc FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id);



ALTER TABLE ONLY public.quiz_selected_answers
    ADD CONSTRAINT fkg53spu469ngc26qv8lobmqqav FOREIGN KEY (selection_id) REFERENCES public.quiz_answer_selections(id);



ALTER TABLE ONLY public.message_attachments
    ADD CONSTRAINT fkj7twd218e2gqw9cmlhwvo1rth FOREIGN KEY (message_id) REFERENCES public.messages(id);



ALTER TABLE ONLY public.patient_badges
    ADD CONSTRAINT fkmfepfsqb96d1rueswikgkibh FOREIGN KEY (badge_id) REFERENCES public.badges(id);



ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT fkonnsjuprinpkux70uly7nvhtf FOREIGN KEY (project_id) REFERENCES public.projects(id);



ALTER TABLE ONLY public.badge_rules
    ADD CONSTRAINT fkouilh0u79yhibshuh3jy35lm6 FOREIGN KEY (badge_id) REFERENCES public.badges(id);



ALTER TABLE ONLY public.messages
    ADD CONSTRAINT fkp50ts6rmerpigf6yqek16p6ay FOREIGN KEY (thread_id) REFERENCES public.message_threads(id);



ALTER TABLE ONLY public.therapy_stages
    ADD CONSTRAINT fkrdk3gbx03mallsh3e3swreirk FOREIGN KEY (project_id) REFERENCES public.projects(id);




-- V2__data_processing_registry.sql
-- RODO compliance: Data Processing Activities Registry (Art. 30) and Erasure Logs (Art. 17)

-- Data Processing Activities table (RODO Article 30)
CREATE TABLE data_processing_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    purpose TEXT NOT NULL,
    legal_basis VARCHAR(50) NOT NULL,
    categories JSONB,
    recipients JSONB,
    retention_period VARCHAR(100),
    security_measures TEXT,
    data_controller VARCHAR(255),
    data_processor VARCHAR(255),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Data Processing Erasure Logs table (RODO Article 17 - Right to Erasure audit trail)
CREATE TABLE data_processing_erasure_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    reason TEXT NOT NULL,
    erased_by UUID NOT NULL REFERENCES users(id),
    erased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_data_processing_activities_legal_basis ON data_processing_activities(legal_basis);
CREATE INDEX idx_data_processing_activities_created_at ON data_processing_activities(created_at);
CREATE INDEX idx_data_processing_erasure_logs_patient_id ON data_processing_erasure_logs(patient_id);
CREATE INDEX idx_data_processing_erasure_logs_erased_at ON data_processing_erasure_logs(erased_at);

-- Comments for documentation
COMMENT ON TABLE data_processing_activities IS 'RODO Article 30: Registry of data processing activities';
COMMENT ON TABLE data_processing_erasure_logs IS 'RODO Article 17: Audit trail for patient data erasure requests';

COMMENT ON COLUMN data_processing_activities.legal_basis IS 'Legal basis: CONSENT, CONTRACT, LEGAL_OBLIGATION, VITAL_INTEREST, PUBLIC_TASK, LEGITIMATE_INTEREST';
COMMENT ON COLUMN data_processing_activities.categories IS 'JSONB array of data subject categories';
COMMENT ON COLUMN data_processing_activities.recipients IS 'JSONB array of data recipient categories';

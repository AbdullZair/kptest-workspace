-- V4__user_device_tokens.sql
-- User device tokens for push notifications

CREATE TABLE user_device_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, token)
);

-- Index for efficient user-based lookup
CREATE INDEX idx_user_device_tokens_user_id ON user_device_tokens(user_id);

-- Index for token lookup
CREATE INDEX idx_user_device_tokens_token ON user_device_tokens(token);

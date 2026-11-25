CREATE TABLE ai_service_config (
 config_id TEXT PRIMARY KEY NOT NULL CHECK(config_id='default'),
 ciphertext TEXT NOT NULL,
 iv TEXT NOT NULL,
 updated_at INTEGER NOT NULL,
 updated_by TEXT NOT NULL
);

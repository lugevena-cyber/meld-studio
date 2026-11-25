CREATE TABLE email_users (
 id TEXT PRIMARY KEY NOT NULL,
 email TEXT UNIQUE NOT NULL,
 password_hash TEXT NOT NULL,
 created_at INTEGER NOT NULL,
 password_changed_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE email_sessions (
 token_hash TEXT PRIMARY KEY NOT NULL,
 user_id TEXT NOT NULL REFERENCES email_users(id),
 expires_at INTEGER NOT NULL,
 created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX email_sessions_user ON email_sessions(user_id);
--> statement-breakpoint
CREATE INDEX email_sessions_expiry ON email_sessions(expires_at);
--> statement-breakpoint
CREATE TABLE email_challenges (
 email TEXT NOT NULL,
 purpose TEXT NOT NULL CHECK(purpose IN ('signup','reset')),
 challenge_id TEXT NOT NULL,
 code_hash TEXT NOT NULL,
 expires_at INTEGER NOT NULL,
 attempts INTEGER NOT NULL DEFAULT 0,
 consumed INTEGER NOT NULL DEFAULT 0,
 sent_at INTEGER NOT NULL,
 PRIMARY KEY(email,purpose)
);
--> statement-breakpoint
CREATE TABLE auth_rate_limits (
 key TEXT PRIMARY KEY NOT NULL,
 count INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);

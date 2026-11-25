CREATE TABLE documents (
 owner TEXT NOT NULL,
 kind TEXT NOT NULL,
 id TEXT NOT NULL,
 payload TEXT,
 revision INTEGER NOT NULL DEFAULT 1,
 deleted INTEGER NOT NULL DEFAULT 0,
 updated_at INTEGER NOT NULL,
 PRIMARY KEY (owner, kind, id)
);
--> statement-breakpoint
CREATE INDEX documents_owner_kind ON documents(owner,kind,deleted,updated_at);

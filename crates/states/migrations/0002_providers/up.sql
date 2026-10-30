CREATE TABLE providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    host TEXT NOT NULL,
    api_key TEXT,
    project TEXT
);

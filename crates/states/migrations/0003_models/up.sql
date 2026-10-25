CREATE TABLE models (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    provider_id INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    params TEXT,
    vision INTEGER,
    tools INTEGER,
    reasoning INTEGER,
    web INTEGER,
    display_name TEXT,
    system_prompt TEXT,
    temperature REAL,
    seed INTEGER,
    num_ctx INTEGER,
    num_predict INTEGER,
    UNIQUE(provider_id, name)
);

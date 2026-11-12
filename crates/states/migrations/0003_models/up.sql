CREATE TABLE models (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    provider_id INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    params TEXT,
    context_length INTEGER,
    capabilities TEXT,
    display_name TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    temperature REAL NOT NULL,
    seed INTEGER NOT NULL,
    top_p REAL NOT NULL,
    top_k INTEGER NOT NULL,
    min_p REAL NOT NULL,
    stop TEXT NOT NULL,
    num_ctx INTEGER NOT NULL,
    num_predict INTEGER NOT NULL,
    UNIQUE(provider_id, name)
);

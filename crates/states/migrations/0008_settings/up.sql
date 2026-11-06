CREATE TABLE settings (
    id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
    appearance_theme TEXT NOT NULL DEFAULT 'system',
    appearance_locale TEXT NOT NULL DEFAULT 'ru',
    appearance_accent TEXT,
    appearance_chat_font_size INTEGER,
    tasks_model_light INTEGER,
    tasks_model_heavy INTEGER,
    translation_model INTEGER,
    translation_mine TEXT,
    translation_answers TEXT,
    chat_streaming INTEGER,
    chat_context_limit INTEGER,
    notifications_ready INTEGER,
    notifications_updates INTEGER
);

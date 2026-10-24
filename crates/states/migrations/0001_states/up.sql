CREATE TABLE workspace (
    id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
    window_width INTEGER,
    window_height INTEGER,
    chat_input_size INTEGER,
    side_bar_size INTEGER,
    side_bar_collapsed INTEGER NOT NULL DEFAULT 0,
    theme TEXT NOT NULL DEFAULT 'system',
    locale TEXT NOT NULL DEFAULT 'ru'
);

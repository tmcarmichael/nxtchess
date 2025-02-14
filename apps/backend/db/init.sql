CREATE ROLE anon NOLOGIN;
GRANT USAGE ON SCHEMA public TO anon;

CREATE TABLE IF NOT EXISTS profiles (
    user_id   text PRIMARY KEY,
    username  text NOT NULL UNIQUE,
    rating    integer NOT NULL DEFAULT 1500,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON profiles TO anon;

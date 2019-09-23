create table "event" (
    login text not null references "user"(login),
    event_key text not null
    -- FIXME: continue
);
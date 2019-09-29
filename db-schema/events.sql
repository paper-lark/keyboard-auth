create type keyboard_event_type as enum (
    'KEYUP',
    'KEYDOWN'
);

create table keyboard_event (
    login text not null references "user"(login),
    "key" text not null,
    "type" keyboard_event_type not null,
    ts  timestamp(3) with time zone
);

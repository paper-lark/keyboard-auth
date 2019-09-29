create table "user" (
    login text not null primary key,
    token text not null
);

insert into "user" ("login", token) values ('test-user', '7E9E95A5-B43C-48AD-BCE3-BDF6B19F23A2');

import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { KeyboardEventEntity } from './KeyboardEventEntity';

@Entity()
export class UserEntity {
    @PrimaryColumn()
    login: string;

    @Column()
    token: string;

    @OneToMany(type => KeyboardEventEntity, event => event.user)
    events: KeyboardEventEntity;
}
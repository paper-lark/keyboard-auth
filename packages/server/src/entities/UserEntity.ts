import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { KeyboardInteractionEntity } from './KeyboardInteractionEntity';

@Entity()
export class UserEntity {
  @PrimaryColumn()
  login: string;

  @Column()
  token: string;

  @OneToMany(type => KeyboardInteractionEntity, event => event.user)
  interactions: KeyboardInteractionEntity;
}

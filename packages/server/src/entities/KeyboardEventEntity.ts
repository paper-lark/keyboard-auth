import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './UserEntity';
import { KeyboardEventType } from '../typings/common';

@Entity()
export class KeyboardEventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => UserEntity, user => user.events)
  user: UserEntity;

  @Column()
  key: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column()
  type: KeyboardEventType;
}

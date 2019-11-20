import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './UserEntity';

@Entity()
export class KeyboardInteractionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => UserEntity, user => user.interactions)
  user: UserEntity;

  @Column()
  key: string;

  @Column({ type: 'timestamp' })
  press: Date;

  @Column({ type: 'timestamp' })
  release: Date;
}

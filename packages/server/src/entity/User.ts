/* eslint-disable */
import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn } from 'typeorm'
import {IUser} from '../Interface'

@Entity()
export class User implements IUser {
    @Column()
    id: string

    @PrimaryColumn()
    token: string
}
import { userTypeEnum } from '../../enums/userTypeEnum.js';
import { userStatusEnum } from '../../enums/userStatusEnum.js';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const up = function (knex) {
    return knex.schema.createTable('user', (table) => {
        table.uuid('id', { primaryKey: true }).defaultTo(knex.fn.uuid());

        table.string('name').notNullable();
        table.string('surname');
        table.string('email').notNullable().unique();
        table.string('username').notNullable().unique();
        table.string('password');
        table.string('profile_picture_key');
        table.text('bio');
        table
            .enu('status', Object.values(userStatusEnum), {
                useNative: true,
                enumName: 'status',
            })
            .notNullable()
            .defaultTo('pending');
        table.boolean('email_verified').notNullable().defaultTo(false);
        table
            .enu('type', Object.values(userTypeEnum), {
                useNative: true,
                enumName: 'user_type',
            })
            .notNullable();

        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
    await knex.schema.dropTable('user');
    await knex.schema.raw(`DROP TYPE user_type;`);
    await knex.schema.raw(`DROP TYPE status;`);
};

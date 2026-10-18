// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

use anyhow::Result;
use diesel::prelude::*;

use crate::Store;
use crate::state::schema::states;

impl Store {
    pub(crate) fn get_raw(&self, key: &str) -> Result<Option<String>> {
        let mut conn = self.lock();
        Ok(states::table
            .filter(states::key.eq(key))
            .select(states::value)
            .first::<String>(&mut *conn)
            .optional()?)
    }

    pub(crate) fn set_raw(&self, key: &str, value: &str) -> Result<()> {
        let mut conn = self.lock();
        diesel::insert_into(states::table)
            .values((states::key.eq(key), states::value.eq(value)))
            .on_conflict(states::key)
            .do_update()
            .set(states::value.eq(value))
            .execute(&mut *conn)?;
        Ok(())
    }
}

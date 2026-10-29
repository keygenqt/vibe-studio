// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

//! Generic store operations over the SQLite connection.
//!
//! Pure generic functions: the caller passes the table, the functions
//! know nothing about concrete data types. `Store` owns a single
//! connection guarded by a mutex — SQLite gives one writer at a time,
//! a single connection is enough for the whole app.

use std::sync::Mutex;
use std::sync::MutexGuard;

use anyhow::Result;
use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;

/// Embedded SQLite storage. Single connection, single writer.
pub struct Store {
    pub(crate) conn: Mutex<SqliteConnection>,
}

impl Store {
    pub(crate) fn lock(&self) -> MutexGuard<'_, SqliteConnection> {
        self.conn.lock().expect("states store poisoned")
    }

    /// Finds one row of `table` by primary key; `None` = missing row.
    /// The row type must match the full column order of the table.
    pub(crate) fn find_by_id<T, R>(&self, table: T, id: i32) -> Result<Option<R>>
    where
        T: diesel::Table + diesel::query_dsl::methods::FindDsl<i32>,
        diesel::helper_types::Find<T, i32>:
            diesel::query_dsl::methods::LimitDsl + diesel::query_dsl::RunQueryDsl<SqliteConnection>,
        for<'conn> diesel::helper_types::Limit<diesel::helper_types::Find<T, i32>>:
            diesel::query_dsl::methods::LoadQuery<'conn, diesel::sqlite::SqliteConnection, R>,
    {
        Ok(table.find(id).first::<R>(&mut *self.lock()).optional()?)
    }

    /// Selects all rows of `table`. The row type must match the full
    /// column order of the table.
    pub(crate) fn select<T, R>(&self, table: T) -> Result<Vec<R>>
    where
        T: diesel::Table,
        for<'conn> T: diesel::query_dsl::methods::LoadQuery<'conn, diesel::sqlite::SqliteConnection, R>,
    {
        Ok(table.load::<R>(&mut *self.lock())?)
    }

    /// Selects rows of `table` matching `filter`. The row type must
    /// match the full column order of the table.
    #[allow(dead_code)]
    pub(crate) fn select_where<T, F, R>(&self, table: T, filter: F) -> Result<Vec<R>>
    where
        T: diesel::Table + diesel::query_dsl::methods::FilterDsl<F>,
        diesel::helper_types::Filter<T, F>: diesel::query_dsl::RunQueryDsl<SqliteConnection>,
        for<'conn> diesel::helper_types::Filter<T, F>:
            diesel::query_dsl::methods::LoadQuery<'conn, diesel::sqlite::SqliteConnection, R>,
    {
        Ok(table.filter(filter).load::<R>(&mut *self.lock())?)
    }

    /// Saves and returns a row: `Some(id)` updates or inserts if missing,
    /// `None` inserts.
    pub(crate) fn save<T, V, R>(&self, table: T, id: Option<i32>, values: V) -> Result<R>
    where
        T: diesel::Table + diesel::query_dsl::methods::FindDsl<i32> + Clone,
        diesel::helper_types::Find<T, i32>: diesel::query_builder::IntoUpdateTarget
            + diesel::query_dsl::methods::LimitDsl
            + diesel::query_dsl::RunQueryDsl<SqliteConnection>,
        for<'conn> diesel::helper_types::Limit<diesel::helper_types::Find<T, i32>>:
            diesel::query_dsl::methods::LoadQuery<'conn, SqliteConnection, R>,
        V: diesel::Insertable<T>
            + Clone
            + diesel::query_builder::AsChangeset<
                Target = <diesel::helper_types::Find<T, i32> as diesel::associations::HasTable>::Table,
            >,
        diesel::query_builder::InsertStatement<T, <V as diesel::Insertable<T>>::Values>:
            diesel::query_dsl::methods::ExecuteDsl<SqliteConnection>,
        diesel::helper_types::Update<diesel::helper_types::Find<T, i32>, V>:
            diesel::query_builder::AsQuery + diesel::query_dsl::methods::ExecuteDsl<SqliteConnection>,
    {
        let mut conn = self.lock();

        let last_insert_id = |conn: &mut SqliteConnection| -> Result<i32> {
            Ok(
                diesel::select(diesel::dsl::sql::<diesel::sql_types::Integer>("last_insert_rowid()"))
                    .get_result(conn)?,
            )
        };

        let saved_id = match id {
            Some(id) => {
                let affected = diesel::update(table.clone().find(id))
                    .set(values.clone())
                    .execute(&mut *conn)?;

                if affected == 0 {
                    diesel::insert_into(table.clone()).values(values).execute(&mut *conn)?;
                    last_insert_id(&mut *conn)?
                } else {
                    id
                }
            }
            None => {
                diesel::insert_into(table.clone()).values(values).execute(&mut *conn)?;
                last_insert_id(&mut *conn)?
            }
        };

        Ok(table.find(saved_id).first::<R>(&mut *conn)?)
    }

    /// Saves prepared rows and removes stored rows absent from the set.
    /// `None` ids insert; the whole reconciliation runs in one transaction.
    pub(crate) fn sync<T, V>(&self, table: T, stored_ids: &[i32], rows: Vec<(Option<i32>, V)>) -> Result<()>
    where
        T: diesel::Table + diesel::query_dsl::methods::FindDsl<i32> + Clone,
        diesel::helper_types::Find<T, i32>: diesel::query_builder::IntoUpdateTarget,
        diesel::query_builder::DeleteStatement<
            <diesel::helper_types::Find<T, i32> as diesel::associations::HasTable>::Table,
            <diesel::helper_types::Find<T, i32> as diesel::query_builder::IntoUpdateTarget>::WhereClause,
        >: diesel::query_dsl::methods::ExecuteDsl<SqliteConnection>,
        V: diesel::Insertable<T>
            + Clone
            + diesel::query_builder::AsChangeset<
                Target = <diesel::helper_types::Find<T, i32> as diesel::associations::HasTable>::Table,
            >,
        diesel::query_builder::InsertStatement<T, <V as diesel::Insertable<T>>::Values>:
            diesel::query_dsl::methods::ExecuteDsl<SqliteConnection>,
        diesel::helper_types::Update<diesel::helper_types::Find<T, i32>, V>:
            diesel::query_builder::AsQuery + diesel::query_dsl::methods::ExecuteDsl<SqliteConnection>,
    {
        let retained_ids: Vec<i32> = rows.iter().filter_map(|(id, _)| *id).collect();
        let mut conn = self.lock();

        conn.transaction::<(), anyhow::Error, _>(|conn| {
            for id in stored_ids {
                if !retained_ids.contains(id) {
                    diesel::delete(table.clone().find(*id)).execute(conn)?;
                }
            }

            for (id, values) in rows {
                match id {
                    Some(id) => {
                        let affected = diesel::update(table.clone().find(id))
                            .set(values.clone())
                            .execute(conn)?;

                        if affected == 0 {
                            diesel::insert_into(table.clone()).values(values).execute(conn)?;
                        }
                    }
                    None => {
                        diesel::insert_into(table.clone()).values(values).execute(conn)?;
                    }
                }
            }

            Ok(())
        })?;

        Ok(())
    }

    /// Removes one row by primary key, returns affected rows.
    pub(crate) fn delete<T>(&self, table: T, id: i32) -> Result<usize>
    where
        T: diesel::Table + diesel::query_dsl::methods::FindDsl<i32>,
        diesel::helper_types::Find<T, i32>: diesel::query_builder::IntoUpdateTarget,
        diesel::query_builder::DeleteStatement<
            <diesel::helper_types::Find<T, i32> as diesel::associations::HasTable>::Table,
            <diesel::helper_types::Find<T, i32> as diesel::query_builder::IntoUpdateTarget>::WhereClause,
        >: diesel::query_dsl::methods::ExecuteDsl<SqliteConnection>,
    {
        Ok(diesel::delete(table.find(id)).execute(&mut *self.lock())?)
    }

    /// Removes rows of `table` matching `filter`, returns affected rows.
    #[allow(dead_code)]
    pub(crate) fn delete_where<T, F>(&self, table: T, filter: F) -> Result<usize>
    where
        T: diesel::Table + diesel::query_dsl::methods::FilterDsl<F>,
        diesel::helper_types::Filter<T, F>: diesel::query_builder::IntoUpdateTarget,
        diesel::query_builder::DeleteStatement<
            <diesel::helper_types::Filter<T, F> as diesel::associations::HasTable>::Table,
            <diesel::helper_types::Filter<T, F> as diesel::query_builder::IntoUpdateTarget>::WhereClause,
        >: diesel::query_dsl::methods::ExecuteDsl<SqliteConnection>,
    {
        Ok(diesel::delete(table.filter(filter)).execute(&mut *self.lock())?)
    }
}

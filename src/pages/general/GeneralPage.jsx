/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The general settings section: the app preferences form.
 */
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Formik } from 'formik'
import { Box, Stack } from '@mui/material'

import { SaveButton } from '../../components/buttons'
import { PageHeader } from '../../components/views'
import { ErrorAlert, SuccessAlert } from '../../components/alerts'

import { AppearanceSection } from './elements/AppearanceSection'
import { TasksSection } from './elements/TasksSection'
import { TranslationSection } from './elements/TranslationSection'
import { ChatSection } from './elements/ChatSection'
import { NotificationsSection } from './elements/NotificationsSection'

// an ancestor that actually scrolls: overflow set and content taller than the box
function isScrollable(node) {
  const style = window.getComputedStyle(node)
  return /(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight
}

export function GeneralPage() {
  const { t } = useTranslation()
  const [savedOpen, setSavedOpen] = React.useState(false)
  const [submitError, setSubmitError] = React.useState(null)
  const rootRef = React.useRef(null)

  // the page scrolls in the shell's scroll area, not the window
  const scrollTop = () => {
    let node = rootRef.current?.parentElement
    while (node && !isScrollable(node)) node = node.parentElement
    node?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Formik
      initialValues={{
        // mock values: the workspace wiring lands with the states task
        theme: 'light',
        accent: '#1b7f5c',
        language: 'ru',
        fontSize: 15,
        taskModelLight: 'yandexgpt-5-lite',
        taskModelHeavy: 'yandexgpt-5-lite',
        translateModel: 'yandexgpt-5-lite',
        translateMine: 'ru',
        translateAnswers: 'ru',
        streaming: true,
        keepMessages: 50,
        notifyReady: true,
        notifyUpdates: true,
      }}
      onSubmit={async (_, { setSubmitting }) => {
        // layout only: the save command arrives with the states task
        await new Promise(resolve => setTimeout(resolve, 300))
        setSubmitting(false)
        setSavedOpen(true)
        await new Promise(resolve => setTimeout(resolve, 100))
        scrollTop()
      }}
    >
      {({ values, isSubmitting, setFieldValue, handleSubmit }) => (
        <Stack ref={rootRef} spacing={2}>
          <PageHeader
            title={t('general.t_general')}
            subtitle={t('general.t_general_description')}
          />
          <Box component={'form'} noValidate onSubmit={handleSubmit}>
            <SuccessAlert
              open={savedOpen}
              text={t('general.t_saved')}
              onClose={() => setSavedOpen(false)}
            />
            <ErrorAlert
              open={Boolean(submitError)}
              text={submitError ?? ''}
              onClose={() => setSubmitError(null)}
            />
            <Stack spacing={2}>
              <AppearanceSection values={values} onChange={setFieldValue} />
              <TasksSection values={values} onChange={setFieldValue} />
              <ChatSection values={values} onChange={setFieldValue} />
              <TranslationSection values={values} onChange={setFieldValue} />
              <NotificationsSection values={values} onChange={setFieldValue} />
              <Stack direction={'row'} spacing={2}>
                <Box sx={{ flexGrow: 1 }} />
                <SaveButton isSubmitting={isSubmitting} />
              </Stack>
            </Stack>
          </Box>
        </Stack>
      )}
    </Formik>
  )
}

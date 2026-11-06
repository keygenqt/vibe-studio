/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The general settings section: the app preferences form.
 */
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Formik } from 'formik'
import { Stack } from '@mui/material'

import { PageHeader } from '../../components/views'
import { ErrorSnackbar } from '../../components/snackbars'
import { useCoreProviders, useCoreSettings } from '../../hooks'
import { AppUtils } from '../../utils'
import { Methods } from '../../modules'

import { AppearanceSection } from './elements/AppearanceSection'
import { TasksSection } from './elements/TasksSection'
import { TranslationSection } from './elements/TranslationSection'
import { ChatSection } from './elements/ChatSection'
import { NotificationsSection } from './elements/NotificationsSection'

// autosave: persists the form after a short debounce, skips the initial load
function Autosave(props) {
  const { t } = useTranslation()
  const [error, setError] = React.useState(null)
  const savedRef = React.useRef(null)

  React.useEffect(() => {
    const payload = JSON.stringify(props.values)
    if (savedRef.current === null) {
      savedRef.current = payload
      return
    }
    if (payload === savedRef.current) return
    const timer = setTimeout(() => {
      savedRef.current = payload
      Methods.save_settings({
        appearance_theme: props.values.theme,
        appearance_locale: props.values.language,
        appearance_accent: props.values.accent,
        appearance_chat_font_size: props.values.fontSize,
        tasks_model_light: props.values.taskModelLight,
        tasks_model_heavy: props.values.taskModelHeavy,
        chat_streaming: props.values.streaming,
        chat_context_limit: props.values.contextLimit,
        translation_model: props.values.translateModel,
        translation_mine: props.values.translateMine,
        translation_answers: props.values.translateAnswers,
        notifications_ready: props.values.notifyReady,
        notifications_updates: props.values.notifyUpdates,
      }).catch(err => setError(AppUtils.backendMessage(t, err)))
    }, 500)
    return () => clearTimeout(timer)
  }, [props.values, t])

  return <ErrorSnackbar text={error} onClose={() => setError(null)} />
}

export function GeneralPage() {
  const { t } = useTranslation()
  const { ready, settings } = useCoreSettings()
  const { providers, models } = useCoreProviders()

  if (!ready) return null

  return (
    <Formik
      enableReinitialize
      initialValues={{
        theme: settings.appearance_theme,
        accent: settings.appearance_accent,
        language: settings.appearance_locale,
        fontSize: settings.appearance_chat_font_size,
        taskModelLight: settings.tasks_model_light,
        taskModelHeavy: settings.tasks_model_heavy,
        translateModel: settings.translation_model,
        translateMine: settings.translation_mine,
        translateAnswers: settings.translation_answers,
        streaming: settings.chat_streaming,
        contextLimit: settings.chat_context_limit,
        notifyReady: settings.notifications_ready,
        notifyUpdates: settings.notifications_updates,
      }}
    >
      {({ values, setFieldValue }) => (
        <Stack spacing={2}>
          <PageHeader
            title={t('general.t_general')}
            subtitle={t('general.t_general_description')}
          />
          <Autosave values={values} />
          <Stack spacing={2}>
            <AppearanceSection values={values} onChange={setFieldValue} />
            <TasksSection
              values={values}
              onChange={setFieldValue}
              providers={providers}
              models={models}
            />
            <ChatSection values={values} onChange={setFieldValue} />
            <TranslationSection
              values={values}
              onChange={setFieldValue}
              providers={providers}
              models={models}
            />
            <NotificationsSection values={values} onChange={setFieldValue} />
          </Stack>
        </Stack>
      )}
    </Formik>
  )
}

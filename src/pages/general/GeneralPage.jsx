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
import { ErrorState, WaitState } from '../../components/states'
import { ErrorSnackbar } from '../../components/snackbars'
import { SettingsMethod, useModels, useProviders, useSettings } from '../../core'
import { AppUtils } from '../../utils'

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
      SettingsMethod.save({
        appearanceTheme: props.values.theme,
        appearanceLocale: props.values.language,
        appearanceAccent: props.values.accent,
        appearanceChatFontSize: props.values.fontSize,
        tasksModelLight: props.values.taskModelLight,
        tasksModelHeavy: props.values.taskModelHeavy,
        chatStreaming: props.values.streaming,
        chatContextLimit: props.values.contextLimit,
        translationModel: props.values.translateModel,
        translationMine: props.values.translateMine,
        translationAnswers: props.values.translateAnswers,
        notificationsReady: props.values.notifyReady,
        notificationsUpdates: props.values.notifyUpdates,
      }).catch(err => setError(AppUtils.backendMessage(t, err)))
    }, 500)
    return () => clearTimeout(timer)
  }, [props.values, t])

  return <ErrorSnackbar text={error} onClose={() => setError(null)} />
}

export function GeneralPage() {
  const { t } = useTranslation()
  const settings = useSettings()
  const providers = useProviders()
  const models = useModels()

  // any resource failed: the error paints over the loader
  const failure = settings.error ?? providers.error ?? models.error
  if (failure) return <ErrorState text={failure} />

  // settings come with the startup gate; providers and models load here
  const ready = settings.ready && providers.ready && models.ready
  if (!ready) return <WaitState ready={false} />

  return (
    <Formik
      enableReinitialize
      initialValues={{
        theme: settings.settings.appearanceTheme,
        accent: settings.settings.appearanceAccent,
        language: settings.settings.appearanceLocale,
        fontSize: settings.settings.appearanceChatFontSize,
        taskModelLight: settings.settings.tasksModelLight,
        taskModelHeavy: settings.settings.tasksModelHeavy,
        translateModel: settings.settings.translationModel,
        translateMine: settings.settings.translationMine,
        translateAnswers: settings.settings.translationAnswers,
        streaming: settings.settings.chatStreaming,
        contextLimit: settings.settings.chatContextLimit,
        notifyReady: settings.settings.notificationsReady,
        notifyUpdates: settings.settings.notificationsUpdates,
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

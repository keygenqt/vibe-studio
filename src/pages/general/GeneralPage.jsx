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
import { OutletLayout } from '../../components/layouts'
import { SettingsMethod, UiMethod, useModels, useProviders, useSettings } from '../../core'
import { AppUtils } from '../../utils'

import { AppearanceSection } from './elements/AppearanceSection'
import { TasksSection } from './elements/TasksSection'
import { TranslationSection } from './elements/TranslationSection'
import { ChatSection } from './elements/ChatSection'
import { NotificationsSection } from './elements/NotificationsSection'

// autosave: persists the form after a short debounce, skips the initial load
function Autosave(props) {
  const { t } = useTranslation()
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
      }).catch(err => UiMethod.showError(AppUtils.backendMessage(t, err)))
    }, 500)
    return () => clearTimeout(timer)
  }, [props.values, t])

  return null
}

export function GeneralPage() {
  const { t } = useTranslation()
  const settings = useSettings()
  const { providers, ready: providersReady, error: providersError } = useProviders()
  const { models, ready: modelsReady, error: modelsError } = useModels()

  // any resource failed: the error paints over the loader
  const failure = settings.error ?? providersError ?? modelsError
  // settings come with the startup gate; providers and models load here
  const ready = settings.ready && providersReady && modelsReady

  return (
    <OutletLayout ready={ready} error={failure}>
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
                providers={providers ?? []}
                models={models ?? []}
              />
              <ChatSection values={values} onChange={setFieldValue} />
              <TranslationSection
                values={values}
                onChange={setFieldValue}
                providers={providers ?? []}
                models={models ?? []}
              />
              <NotificationsSection values={values} onChange={setFieldValue} />
            </Stack>
          </Stack>
        )}
      </Formik>
    </OutletLayout>
  )
}

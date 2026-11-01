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
import { useCoreProviders, useCoreSettings } from '../../hooks'
import { AppUtils } from '../../utils'
import { Methods } from '../../modules'

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
  const { ready, settings } = useCoreSettings()
  const { providers, models } = useCoreProviders()
  const [savedOpen, setSavedOpen] = React.useState(false)
  const [submitError, setSubmitError] = React.useState(null)
  const rootRef = React.useRef(null)

  if (!ready) return null

  // the page scrolls in the shell's scroll area, not the window
  const scrollTop = () => {
    let node = rootRef.current?.parentElement
    while (node && !isScrollable(node)) node = node.parentElement
    node?.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
        keepMessages: settings.chat_keep_messages,
        notifyReady: settings.notifications_ready,
        notifyUpdates: settings.notifications_updates,
      }}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          await Methods.save_settings({
            appearance_theme: values.theme,
            appearance_locale: values.language,
            appearance_accent: values.accent,
            appearance_chat_font_size: values.fontSize,
            tasks_model_light: values.taskModelLight,
            tasks_model_heavy: values.taskModelHeavy,
            chat_streaming: values.streaming,
            chat_keep_messages: values.keepMessages,
            translation_model: values.translateModel,
            translation_mine: values.translateMine,
            translation_answers: values.translateAnswers,
            notifications_ready: values.notifyReady,
            notifications_updates: values.notifyUpdates,
          })
          setSavedOpen(true)
        } catch (error) {
          setSubmitError(AppUtils.backendMessage(t, error))
        } finally {
          setSubmitting(false)
        }
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

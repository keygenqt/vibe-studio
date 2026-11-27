/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: Group form: name, model picker, system prompt.
 */
import PropTypes from 'prop-types'
import * as React from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useTheme } from '@mui/material/styles'
import { Box, Button, ListSubheader, MenuItem, Stack, TextField } from '@mui/material'

import { SaveButton } from '../../components/buttons'
import { DeleteDialog } from '../../components/dialogs'
import { ErrorAlert, SuccessAlert, InfoAlert } from '../../components/alerts'
import { AppNav, AppUtils } from '../../../utils'
import { ACCENT_COLORS } from '../../../theme'
import { ACCENTS } from '../../../constants'
import { GROUP_ICONS } from '../../components'
import { AppRoutes } from '../../../constants'
import { GroupsChatMethod, UiMethod, useFormState } from '../../../core'

export function GroupChatForm(props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const navigate = useNavigate()
  const formikRef = React.useRef(null)
  const { formState } = useFormState()
  const isEdit = Boolean(props.isEdit)
  const [openDelete, setOpenDelete] = React.useState(false)
  const [noModelsOpen, setNoModelsOpen] = React.useState(true)

  React.useEffect(() => {
    if (formState) {
      formikRef.current?.setStatus({ saved: true })
      UiMethod.clearFormState()
    }
  }, [])

  return (
    <Formik
      innerRef={formikRef}
      enableReinitialize
      initialValues={{
        name: props.name ?? '',
        modelId: props.modelId ?? '',
        systemPrompt: props.systemPrompt ?? '',
        icon: props.icon ?? 'letter',
        iconColor: props.iconColor ?? 'accent',
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string().trim().required(t('group_chat.t_validation_required')),
        modelId: Yup.number().required(t('group_chat.t_validation_required')),
        systemPrompt: Yup.string().notRequired(),
      })}
      onSubmit={async (values, { setErrors, setSubmitting, setStatus }) => {
        const saved = await AppUtils.submitForm(t, { setErrors, setSubmitting, setStatus }, () =>
          GroupsChatMethod.saveGroupChat({
            id: props.id || null,
            name: values.name,
            systemPrompt: values.systemPrompt || null,
            modelId: values.modelId,
            // 'accent' and 'letter' are the UI default markers, stored as null
            icon: values.icon === 'letter' ? null : values.icon,
            iconColor: values.iconColor === 'accent' ? null : values.iconColor,
          })
        )
        // the fresh insert opens its edit page; the plate meets it there
        if (!isEdit && saved) {
          UiMethod.setFormState(saved)
          AppNav.openWithReplace(navigate, AppRoutes.groupChat(saved.id))
        }
      }}
    >
      {({
        errors,
        touched,
        values,
        isSubmitting,
        handleBlur,
        handleChange,
        handleSubmit,
        setErrors,
        status,
        setStatus,
      }) => {
        return (
          <Box component={'form'} noValidate onSubmit={handleSubmit}>
            <DeleteDialog
              open={openDelete}
              title={t('group_chat.t_delete_title')}
              text={t('group_chat.t_delete_text')}
              onCancel={() => setOpenDelete(false)}
              onConfirm={() => {
                GroupsChatMethod.deleteGroupChat(props.id)
                  .then(() => AppNav.back(navigate))
                  .catch(error => {
                    setOpenDelete(false)
                    setErrors({ submit: AppUtils.backendMessage(t, error) })
                  })
              }}
            />
            <InfoAlert
              open={noModelsOpen && props.models.length === 0}
              text={t('group_chat.t_no_models')}
              onClose={() => setNoModelsOpen(false)}
            />
            <SuccessAlert
              open={Boolean(status?.saved)}
              text={t('group_chat.t_saved')}
              onClose={() => setStatus(undefined)}
            />
            <ErrorAlert
              open={Boolean(errors.submit)}
              text={errors.submit ?? ''}
              onClose={() => setErrors({ submit: null })}
            />
            <Stack spacing={2}>
              <TextField
                select
                fullWidth
                label={t('group_chat.t_color')}
                name={'iconColor'}
                variant={'filled'}
                value={values.iconColor}
                disabled={isSubmitting}
                onBlur={handleBlur}
                onChange={handleChange}
              >
                <MenuItem value={'accent'}>{t('group_chat.t_default')}</MenuItem>
                {ACCENTS.map(key => (
                  <MenuItem key={`color-${key}`} value={key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          flexShrink: 0,
                          borderRadius: '50%',
                          bgcolor: ACCENT_COLORS[key][theme.palette.mode].secondary.main,
                        }}
                      />
                      {t(`group_chat.t_color_${key}`)}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label={t('group_chat.t_icon')}
                name={'icon'}
                variant={'filled'}
                value={values.icon}
                disabled={isSubmitting}
                onBlur={handleBlur}
                onChange={handleChange}
              >
                <MenuItem value={'letter'}>{t('group_chat.t_default')}</MenuItem>
                {Object.entries(GROUP_ICONS).map(([key, { Icon, name }]) => (
                  <MenuItem key={`icon-${key}`} value={key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icon sx={{ fontSize: 20 }} />
                      {name}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                required
                label={t('group_chat.t_name')}
                name={'name'}
                variant={'filled'}
                value={values.name}
                helperText={touched.name && errors.name ? errors.name : ''}
                error={Boolean(touched.name && errors.name)}
                disabled={isSubmitting}
                onBlur={handleBlur}
                onChange={handleChange}
                slotProps={{ htmlInput: { autoComplete: 'off' } }}
              />
              <TextField
                select
                fullWidth
                required
                label={t('group_chat.t_model')}
                name={'modelId'}
                variant={'filled'}
                value={values.modelId}
                helperText={touched.modelId && errors.modelId ? errors.modelId : ''}
                error={Boolean(touched.modelId && errors.modelId)}
                disabled={isSubmitting || props.models.length === 0}
                onBlur={handleBlur}
                onChange={handleChange}
              >
                {props.providers
                  .filter(provider => props.models.some(model => model.providerId === provider.id))
                  .map(provider => [
                    <ListSubheader key={`provider-${provider.id}`}>{provider.name}</ListSubheader>,
                    ...props.models
                      .filter(model => model.providerId === provider.id)
                      .map(model => (
                        <MenuItem key={`model-${model.id}`} value={model.id}>
                          {model.displayName ? `${model.displayName} (${model.name})` : model.name}
                        </MenuItem>
                      )),
                  ])}
              </TextField>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label={t('group_chat.t_system_prompt')}
                name={'systemPrompt'}
                variant={'filled'}
                value={values.systemPrompt}
                disabled={isSubmitting}
                onBlur={handleBlur}
                onChange={handleChange}
              />
              <Stack direction={'row'} spacing={2}>
                {isEdit && (
                  <Button variant={'outlined'} color={'error'} onClick={() => setOpenDelete(true)}>
                    {t('group_chat.t_delete')}
                  </Button>
                )}
                <Box sx={{ flexGrow: 1 }} />
                <SaveButton isSubmitting={isSubmitting} disabled={props.models.length === 0} />
              </Stack>
            </Stack>
          </Box>
        )
      }}
    </Formik>
  )
}

GroupChatForm.propTypes = {
  isEdit: PropTypes.bool,
  id: PropTypes.number,
  name: PropTypes.string,
  systemPrompt: PropTypes.string,
  modelId: PropTypes.number,
  icon: PropTypes.string,
  iconColor: PropTypes.string,
  providers: PropTypes.array.isRequired,
  models: PropTypes.array.isRequired,
}

/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { Box, Button, ListSubheader, MenuItem, Stack, TextField } from '@mui/material'

import { SaveButton } from '../../../components/buttons'
import { DeleteDialog } from '../../../components/views'
import { ErrorAlert, SuccessAlert, InfoAlert } from '../../../components/alerts'
import { AppNav, AppUtils } from '../../../utils'
import { AppRoutes } from '../../../constants'
import { formSuccessClear, formSuccessSet } from '../../../store/impl/app'
import { Methods } from '../../../modules'

export function GroupChatForm(props) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const formSuccess = useSelector(state => state.app.formSuccess)
  const isEdit = Boolean(props.isEdit)
  const [openDelete, setOpenDelete] = React.useState(false)
  const [savedOpen, setSavedOpen] = React.useState(false)
  const [noModelsOpen, setNoModelsOpen] = React.useState(true)

  React.useEffect(() => {
    if (formSuccess) {
      setSavedOpen(true)
      dispatch(formSuccessClear())
    }
  }, [])

  return (
    <Formik
      enableReinitialize
      initialValues={{
        name: props.name ?? '',
        modelId: props.modelId ?? '',
        systemPrompt: props.systemPrompt ?? '',
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string().trim().required(t('group_chat.t_validation_required')),
        modelId: Yup.number().required(t('group_chat.t_validation_required')),
        systemPrompt: Yup.string().notRequired(),
      })}
      onSubmit={async (values, { setErrors, setSubmitting }) => {
        const saved = await AppUtils.submitForm(t, { setErrors, setSubmitting, setSavedOpen }, () =>
          Methods.save_group_chat({
            id: props.id || null,
            name: values.name,
            system_prompt: values.systemPrompt || null,
            model_id: values.modelId,
          })
        )
        if (saved && !isEdit) {
          dispatch(formSuccessSet(saved))
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
      }) => {
        return (
          <Box component={'form'} noValidate onSubmit={handleSubmit}>
            <DeleteDialog
              open={openDelete}
              title={t('group_chat.t_delete_title')}
              text={t('group_chat.t_delete_text')}
              onCancel={() => setOpenDelete(false)}
              onConfirm={() => {
                Methods.delete_group_chat(props.id)
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
              open={savedOpen}
              text={t('group_chat.t_saved')}
              onClose={() => setSavedOpen(false)}
            />
            <ErrorAlert
              open={Boolean(errors.submit)}
              text={errors.submit ?? ''}
              onClose={() => setErrors({ submit: null })}
            />
            <Stack spacing={2}>
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
                  .filter(provider => props.models.some(model => model.provider_id === provider.id))
                  .map(provider => [
                    <ListSubheader key={`provider-${provider.id}`}>{provider.name}</ListSubheader>,
                    ...props.models
                      .filter(model => model.provider_id === provider.id)
                      .map(model => (
                        <MenuItem key={`model-${model.id}`} value={model.id}>
                          {model.display_name
                            ? `${model.display_name} (${model.name})`
                            : model.name}
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
  providers: PropTypes.array.isRequired,
  models: PropTypes.array.isRequired,
}

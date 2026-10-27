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
import { Box, Button, MenuItem, Stack, TextField } from '@mui/material'

import { SaveButton } from '../../../components/buttons'
import { ErrorAlert, SuccessAlert } from '../../../components/views'
import { AppNav, AppUtils } from '../../../utils'
import { AppRoutes } from '../../../constants'
import { DeleteDialog } from './DeleteDialog'
import { formSuccessClear, formSuccessSet } from '../../../store/impl/app'
import { Methods } from '../../../modules'

export function ProviderForm(props) {
  const { t } = useTranslation()
  const { catalog } = props
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const formSuccess = useSelector(state => state.app.formSuccess)
  const isEdit = Boolean(props.isEdit)
  const [openDelete, setOpenDelete] = React.useState(false)
  const [savedOpen, setSavedOpen] = React.useState(false)

  React.useEffect(() => {
    // success handoff from before the mode switch: show once and clear
    if (formSuccess) {
      setSavedOpen(true)
      dispatch(formSuccessClear())
    }
  }, [])

  // edit keeps the stored kind, add starts from the first entry
  const current = catalog.find(info => info.provider === props.provider) ?? catalog[0]

  return (
    <Formik
      enableReinitialize
      initialValues={{
        provider: current.provider,
        name: props.name ?? current.name,
        host: props.host ?? current.default_host ?? '',
        apiKey: props.apiKey ?? '',
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string().trim().required(t('provider.t_validation_required')),
        host: Yup.string()
          .required(t('provider.t_validation_required'))
          .test('host', t('provider.t_validation_url'), value => {
            try {
              return Boolean(new URL(value).hostname)
            } catch {
              return false
            }
          }),
        apiKey: Yup.string().notRequired(),
      })}
      onSubmit={async (values, { setErrors, setSubmitting }) => {
        const saved = await AppUtils.submitForm(t, { setErrors, setSubmitting, setSavedOpen }, () =>
          Methods.save_provider({
            id: props.id || null,
            name: values.name,
            provider: values.provider,
            host: values.host,
            api_key: values.apiKey,
          })
        )
        if (saved && !isEdit) {
          dispatch(formSuccessSet(saved))
          AppNav.openWithReplace(navigate, AppRoutes.provider(saved.id))
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
        setFieldValue,
      }) => {
        // kind lookup, shared by the api key rule and the prefill
        const infoOf = kind => catalog.find(info => info.provider === kind)
        // the provider form
        return (
          <Box component={'form'} noValidate onSubmit={handleSubmit}>
            <DeleteDialog
              open={openDelete}
              title={t('provider.t_delete_title')}
              text={t('provider.t_delete_text')}
              onCancel={() => setOpenDelete(false)}
              onConfirm={() => {
                Methods.delete_provider(props.id)
                  .then(() => AppNav.back(navigate))
                  .catch(error => {
                    setOpenDelete(false)
                    setErrors({ submit: AppUtils.backendMessage(t, error) })
                  })
              }}
            />
            <SuccessAlert
              open={savedOpen}
              text={t('provider.t_saved')}
              onClose={() => setSavedOpen(false)}
            />
            <ErrorAlert
              open={Boolean(errors.submit)}
              text={errors.submit ?? ''}
              onClose={() => setErrors({ submit: null })}
            />
            <Stack spacing={2}>
              {!isEdit && (
                <TextField
                  select
                  fullWidth
                  label={t('provider.t_title')}
                  name={'provider'}
                  variant={'filled'}
                  value={values.provider}
                  onBlur={handleBlur}
                  onChange={e => {
                    const prev = infoOf(values.provider)
                    const next = infoOf(e.target.value)
                    // overwrite the previous kind's defaults, keep custom values
                    const prefill = (field, oldDefault, newDefault) => {
                      if (!values[field] || values[field] === (oldDefault ?? '')) {
                        setFieldValue(field, newDefault)
                      }
                    }
                    prefill('host', prev?.default_host, next?.default_host ?? '')
                    prefill('name', prev?.name, next?.name)
                    handleChange(e)
                  }}
                >
                  {catalog.map(info => (
                    <MenuItem key={`provider-${info.provider}`} value={info.provider}>
                      {info.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              <TextField
                fullWidth
                required
                label={t('provider.t_name')}
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
                fullWidth
                required
                label={t('provider.t_host')}
                name={'host'}
                variant={'filled'}
                value={values.host}
                helperText={touched.host && errors.host ? errors.host : ''}
                error={Boolean(touched.host && errors.host)}
                disabled={isSubmitting}
                onBlur={handleBlur}
                onChange={handleChange}
                slotProps={{ htmlInput: { autoComplete: 'off' } }}
              />
              <TextField
                fullWidth
                type={'password'}
                label={t('provider.t_api_key')}
                placeholder={t('provider.t_api_key_hint')}
                name={'apiKey'}
                variant={'filled'}
                value={values.apiKey}
                helperText={touched.apiKey && errors.apiKey ? errors.apiKey : ''}
                error={Boolean(touched.apiKey && errors.apiKey)}
                disabled={isSubmitting}
                onBlur={handleBlur}
                onChange={handleChange}
                slotProps={{ htmlInput: { autoComplete: 'off' } }}
              />
              <Stack direction={'row'} spacing={2}>
                {isEdit && (
                  <Button variant={'outlined'} color={'error'} onClick={() => setOpenDelete(true)}>
                    {t('provider.t_delete')}
                  </Button>
                )}
                <Box sx={{ flexGrow: 1 }} />
                <SaveButton isSubmitting={isSubmitting} />
              </Stack>
            </Stack>
          </Box>
        )
      }}
    </Formik>
  )
}

ProviderForm.propTypes = {
  catalog: PropTypes.array.isRequired,
  id: PropTypes.number,
  isEdit: PropTypes.bool,
  name: PropTypes.string,
  provider: PropTypes.string,
  host: PropTypes.string,
  apiKey: PropTypes.string,
}

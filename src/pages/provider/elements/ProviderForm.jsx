/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: Provider form: kind, name, host, API key.
 */
import PropTypes from 'prop-types'
import * as React from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { Box, Button, MenuItem, Stack, TextField } from '@mui/material'

import { SaveButton } from '../../../components/buttons'
import { DeleteDialog } from '../../../components/views'
import { ErrorAlert, SuccessAlert } from '../../../components/alerts'
import { AppNav, AppUtils } from '../../../utils'
import { AppRoutes } from '../../../constants'
import { ProvidersMethod, UiMethod, useFormState } from '../../../core'

export function ProviderForm(props) {
  const { t } = useTranslation()
  const { catalog } = props
  const navigate = useNavigate()
  const formikRef = React.useRef(null)
  const { formState } = useFormState()
  const isEdit = Boolean(props.isEdit)
  const [openDelete, setOpenDelete] = React.useState(false)
  const current = catalog.find(info => info.provider === props.provider) ?? catalog[0]

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
        provider: current.provider,
        name: props.name ?? current.name,
        host: props.host ?? current.defaultHost ?? '',
        apiKey: props.apiKey ?? '',
        project: props.project ?? '',
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string().trim().required(t('provider.t_validation_required')),
        host: Yup.string()
          .required(t('provider.t_validation_required'))
          .test('host', t('provider.t_validation_url'), AppUtils.validUrl),
        apiKey: Yup.string().notRequired(),
        project: Yup.string().notRequired(),
      })}
      onSubmit={async (values, { setErrors, setSubmitting, setStatus }) => {
        const saved = await AppUtils.submitForm(t, { setErrors, setSubmitting, setStatus }, () =>
          ProvidersMethod.saveProvider({
            id: props.id || null,
            name: values.name,
            provider: values.provider,
            host: values.host,
            apiKey: values.apiKey,
            project: values.project || null,
          })
        )

        // the fresh insert opens its edit page; the plate meets it there
        if (!isEdit && saved) {
          UiMethod.setFormState(saved)
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
        status,
        setStatus,
      }) => {
        const infoOf = kind => catalog.find(info => info.provider === kind)
        return (
          <Box component={'form'} noValidate onSubmit={handleSubmit}>
            <DeleteDialog
              open={openDelete}
              title={t('provider.t_delete_title')}
              text={t('provider.t_delete_text')}
              onCancel={() => setOpenDelete(false)}
              onConfirm={() => {
                ProvidersMethod.deleteProvider(props.id)
                  .then(() => AppNav.back(navigate))
                  .catch(error => {
                    setOpenDelete(false)
                    setErrors({ submit: AppUtils.backendMessage(t, error) })
                  })
              }}
            />
            <SuccessAlert
              open={Boolean(status?.saved)}
              text={t('provider.t_saved')}
              onClose={() => setStatus(undefined)}
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
                    const prefill = (field, oldDefault, newDefault) => {
                      if (!values[field] || values[field] === (oldDefault ?? '')) {
                        setFieldValue(field, newDefault)
                      }
                    }
                    prefill('host', prev?.defaultHost, next?.defaultHost ?? '')
                    prefill('name', prev?.name, next?.name)
                    setFieldValue('project', '')
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
              {values.provider === 'yandex' && (
                <TextField
                  fullWidth
                  label={t('provider.t_project')}
                  name={'project'}
                  variant={'filled'}
                  value={values.project}
                  helperText={touched.project && errors.project ? errors.project : ''}
                  error={Boolean(touched.project && errors.project)}
                  disabled={isSubmitting}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  slotProps={{ htmlInput: { autoComplete: 'off' } }}
                />
              )}
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

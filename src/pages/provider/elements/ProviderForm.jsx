/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Formik } from 'formik'
import * as Yup from 'yup'
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import DoneOutlined from '@mui/icons-material/DoneOutlined'

import { Methods } from '../../../modules'

export function ProviderForm(props) {
  const { t } = useTranslation()
  const isEdit = Boolean(props.isEdit)
  const [catalog, setCatalog] = React.useState(null)

  React.useEffect(() => {
    Methods.providers_catalog().then(setCatalog)
  }, [])

  if (!catalog) return null
  // edit mode keeps the stored kind; add mode starts from the first catalog entry
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
        name: Yup.string().required('Must not be null and not blank.'),
        host: Yup.string()
          .required('Must not be null and not blank.')
          // any scheme + host: Yup's .url() rejects localhost and IPs
          .test('host', 'Must be a valid URL.', value => {
            try {
              return Boolean(new URL(value).hostname)
            } catch {
              return false
            }
          }),
        apiKey: Yup.string().when('provider', {
          is: provider => catalog.find(info => info.provider === provider)?.cloud ?? false,
          then: schema => schema.required('Must not be null and not blank.'),
          otherwise: schema => schema.notRequired(),
        }),
      })}
      onSubmit={async (values, { setErrors, setSubmitting }) => {
        setErrors({ submit: null })
        try {
          // commit goes through Methods; the Rust answer is the truth
          await props.onSubmit?.(values)
        } catch (error) {
          setErrors({ submit: error.message ?? String(error) })
        } finally {
          setSubmitting(false)
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
        setFieldValue,
      }) => {
        const infoOf = kind => catalog.find(info => info.provider === kind)
        const onProviderChange = e => {
          const info = infoOf(e.target.value)
          // prefill the default host; keep a custom one
          if (!values.host || values.host === (infoOf(values.provider)?.default_host ?? '')) {
            setFieldValue('host', info.default_host ?? '')
          }
          // prefill the provider title; keep a custom one
          if (!values.name || values.name === (infoOf(values.provider)?.name ?? '')) {
            setFieldValue('name', info.name)
          }
          handleChange(e)
        }
        return (
          <Box component={'form'} noValidate onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {!isEdit && (
                <TextField
                  select
                  fullWidth
                  label={t('settings.t_provider')}
                  name={'provider'}
                  variant={'filled'}
                  value={values.provider}
                  onBlur={handleBlur}
                  onChange={onProviderChange}
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
                label={t('settings.t_name')}
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
                label={t('settings.t_host')}
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
              {infoOf(values.provider)?.cloud && (
                <TextField
                  fullWidth
                  type={'password'}
                  label={t('settings.t_api_key')}
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
              )}
              {errors.submit && (
                <Typography variant={'caption'} color={'error'}>
                  {errors.submit}
                </Typography>
              )}
              <Stack direction={'row'} spacing={2}>
                {isEdit && props.onDelete && (
                  <Button variant={'outlined'} color={'error'} onClick={props.onDelete}>
                    {t('settings.t_delete')}
                  </Button>
                )}
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  type={'submit'}
                  variant={'contained'}
                  size={'large'}
                  disabled={Boolean(isSubmitting)}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress
                        sx={{ mr: 0.5, height: '18px !important', width: '18px !important' }}
                      />
                    ) : (
                      <DoneOutlined color={'text.primary'} sx={{ height: 18 }} />
                    )
                  }
                >
                  {t('settings.t_save')}
                </Button>
              </Stack>
            </Stack>
          </Box>
        )
      }}
    </Formik>
  )
}

ProviderForm.propTypes = {
  isEdit: PropTypes.bool,
  name: PropTypes.string,
  provider: PropTypes.string,
  host: PropTypes.string,
  apiKey: PropTypes.string,
  onDelete: PropTypes.func,
  onSubmit: PropTypes.func,
}

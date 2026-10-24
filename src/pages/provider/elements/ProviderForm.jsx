/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
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
import DeleteOutlined from '@mui/icons-material/DeleteOutlined'
import DoneOutlined from '@mui/icons-material/DoneOutlined'

// draft: mirrors vibe_cluster::Provider
const PROVIDERS = ['Ollama', 'DeepSeek', 'Qwen', 'Kimi', 'Zhipu']
// draft: defaults from vibe-cluster docs; Qwen/Kimi/Zhipu pending source check
const DEFAULT_HOSTS = {
  Ollama: 'http://localhost:11434',
  DeepSeek: 'https://api.deepseek.com/v1',
}
// draft: vibe-cluster — api_key not needed for Ollama
const CLOUD = ['DeepSeek', 'Qwen', 'Kimi', 'Zhipu']

export function ProviderForm(props) {
  const isEdit = Boolean(props.isEdit)
  return (
    <Formik
      enableReinitialize
      initialValues={{
        provider: props.provider ?? 'Ollama',
        name: props.name ?? props.provider ?? 'Ollama',
        host: props.host ?? DEFAULT_HOSTS[props.provider ?? 'Ollama'] ?? '',
        apiKey: props.apiKey ?? '',
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string().required('Must not be null and not blank.'),
        host: Yup.string().required('Must not be null and not blank.').url('Must be a valid URL.'),
        apiKey: Yup.string().when('provider', {
          is: provider => CLOUD.includes(provider),
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
        const onProviderChange = e => {
          // prefill the default host; keep a custom one
          if (!values.host || values.host === DEFAULT_HOSTS[values.provider]) {
            setFieldValue('host', DEFAULT_HOSTS[e.target.value] ?? '')
          }
          // prefill the provider title; keep a custom one
          if (!values.name || values.name === values.provider) {
            setFieldValue('name', e.target.value)
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
                  label={'Provider'}
                  name={'provider'}
                  variant={'filled'}
                  value={values.provider}
                  onBlur={handleBlur}
                  onChange={onProviderChange}
                >
                  {PROVIDERS.map(item => (
                    <MenuItem key={`provider-${item}`} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              <TextField
                fullWidth
                required
                label={'Name'}
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
                label={'Host'}
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
              {CLOUD.includes(values.provider) && (
                <TextField
                  fullWidth
                  type={'password'}
                  label={'API key'}
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
                    Delete
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
                  Save
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

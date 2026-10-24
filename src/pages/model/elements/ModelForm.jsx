/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material'
import DoneOutlined from '@mui/icons-material/DoneOutlined'

import { AppUtils } from '../../../utils'

export function ModelForm(props) {
  return (
    <Formik
      enableReinitialize
      initialValues={{
        name: props.name ?? '',
        systemPrompt: props.systemPrompt ?? '',
        temperature: props.temperature ?? 0.2,
        seed: props.seed ?? 42,
        numCtx: props.numCtx ?? 4096,
        numPredict: props.numPredict ?? 2048,
      }}
      validationSchema={Yup.object().shape({
        temperature: Yup.number().min(0).max(2),
        seed: Yup.number().integer().min(0),
        numCtx: Yup.number().integer().min(1),
        numPredict: Yup.number().integer().min(1),
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
      {({ errors, touched, values, isSubmitting, handleBlur, handleChange, handleSubmit }) => (
        <Box component={'form'} noValidate onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label={'Name'}
              name={'name'}
              variant={'filled'}
              value={values.name}
              // empty name falls back to the derived model title
              placeholder={AppUtils.formatModelName(props.model)}
              helperText={touched.name && errors.name ? errors.name : ''}
              error={Boolean(touched.name && errors.name)}
              disabled={isSubmitting}
              onBlur={handleBlur}
              onChange={handleChange}
              slotProps={{ htmlInput: { autoComplete: 'off' } }}
            />
            <TextField
              fullWidth
              multiline
              minRows={4}
              label={'System prompt'}
              name={'systemPrompt'}
              variant={'filled'}
              value={values.systemPrompt}
              helperText={touched.systemPrompt && errors.systemPrompt ? errors.systemPrompt : ''}
              error={Boolean(touched.systemPrompt && errors.systemPrompt)}
              disabled={isSubmitting}
              onBlur={handleBlur}
              onChange={handleChange}
            />
            <Typography variant={'h6'}>{'Parameters'}</Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 2,
              }}
            >
              <TextField
                type={'number'}
                label={'Temperature'}
                name={'temperature'}
                variant={'filled'}
                value={values.temperature}
                helperText={touched.temperature && errors.temperature ? errors.temperature : ''}
                error={Boolean(touched.temperature && errors.temperature)}
                disabled={isSubmitting}
                onBlur={handleBlur}
                onChange={handleChange}
                slotProps={{ htmlInput: { min: 0, max: 2, step: 0.1 } }}
              />
              <TextField
                type={'number'}
                label={'Seed'}
                name={'seed'}
                variant={'filled'}
                value={values.seed}
                helperText={touched.seed && errors.seed ? errors.seed : ''}
                error={Boolean(touched.seed && errors.seed)}
                disabled={isSubmitting}
                onBlur={handleBlur}
                onChange={handleChange}
                slotProps={{ htmlInput: { min: 0, step: 1 } }}
              />
              <TextField
                type={'number'}
                label={'Num ctx'}
                name={'numCtx'}
                variant={'filled'}
                value={values.numCtx}
                helperText={touched.numCtx && errors.numCtx ? errors.numCtx : ''}
                error={Boolean(touched.numCtx && errors.numCtx)}
                disabled={isSubmitting}
                onBlur={handleBlur}
                onChange={handleChange}
                slotProps={{ htmlInput: { min: 1, step: 1 } }}
              />
              <TextField
                type={'number'}
                label={'Num predict'}
                name={'numPredict'}
                variant={'filled'}
                value={values.numPredict}
                helperText={touched.numPredict && errors.numPredict ? errors.numPredict : ''}
                error={Boolean(touched.numPredict && errors.numPredict)}
                disabled={isSubmitting}
                onBlur={handleBlur}
                onChange={handleChange}
                slotProps={{ htmlInput: { min: 1, step: 1 } }}
              />
            </Box>
            {errors.submit && (
              <Typography variant={'caption'} color={'error'}>
                {errors.submit}
              </Typography>
            )}
            <Stack direction={'row'} spacing={2}>
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
      )}
    </Formik>
  )
}

ModelForm.propTypes = {
  name: PropTypes.string,
  model: PropTypes.string.isRequired,
  systemPrompt: PropTypes.string,
  temperature: PropTypes.number,
  seed: PropTypes.number,
  numCtx: PropTypes.number,
  numPredict: PropTypes.number,
  onSubmit: PropTypes.func,
}

/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: Model form: display name, system prompt, parameters.
 */
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { Box, MenuItem, Stack, TextField, Typography } from '@mui/material'

import { SaveButton } from '../../components/buttons'
import { ErrorAlert, SuccessAlert } from '../../components/alerts'
import { AppUtils } from '../../../utils'
import { ProvidersMethod } from '../../../core'

export function ModelForm(props) {
  const { t } = useTranslation()

  // the bounds come from the model's spec: a missing bound adds no rule
  const bounded = (spec, base) => {
    let field = base
    if (spec?.min != null) field = field.min(spec.min, t('model.t_validation_min'))
    if (spec?.max != null) field = field.max(spec.max, t('model.t_validation_max'))
    return field
  }
  // before the defaults arrive every field shows; the family's
  // absent parameter stays out
  const shown = spec => props.defaults === null || spec != null

  return (
    <Formik
      enableReinitialize
      initialValues={{
        name: props.model.displayName,
        systemPrompt: props.model.systemPrompt,
        temperature: props.model.temperature,
        seed: props.model.seed,
        topP: props.model.topP,
        topK: props.model.topK,
        minP: props.model.minP,
        stop: props.model.stop.join('\n'),
        numCtx: props.model.numCtx,
        numPredict: props.model.numPredict,
        // the sentinel reads as the provider default
        effort: props.model.effort ?? 'default',
        reasoningMaxTokens: props.model.reasoningMaxTokens ?? '',
        // null reads as the server default: thinking on
        think: String(props.model.think ?? true),
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string().test('blank', t('provider.t_validation_required'), AppUtils.notBlank),
        systemPrompt: Yup.string().test(
          'blank',
          t('provider.t_validation_required'),
          AppUtils.notBlank
        ),
        temperature: bounded(props.defaults?.temperature, Yup.number()),
        seed: bounded(props.defaults?.seed, Yup.number().integer()),
        topP: bounded(props.defaults?.topP, Yup.number()),
        topK: bounded(props.defaults?.topK, Yup.number().integer()),
        minP: bounded(props.defaults?.minP, Yup.number()),
        numCtx: bounded(props.defaults?.numCtx, Yup.number().integer()),
        numPredict: bounded(props.defaults?.numPredict, Yup.number().integer()),
        // the select is constrained by its items; the empty value passes
        effort: Yup.string(),
        reasoningMaxTokens: bounded(props.defaults?.reasoningMaxTokens, Yup.number().integer()),
        think: Yup.string(),
      })}
      onSubmit={async (values, { setErrors, setSubmitting, setStatus }) => {
        await AppUtils.submitForm(t, { setErrors, setSubmitting, setStatus }, () => {
          ProvidersMethod.saveProviderModel(props.model, {
            displayName: values.name,
            systemPrompt: values.systemPrompt,
            temperature: Number(values.temperature),
            seed: Number(values.seed),
            topP: Number(values.topP),
            topK: Number(values.topK),
            minP: Number(values.minP),
            stop: values.stop
              .split('\n')
              .map(line => line.trim())
              .filter(Boolean),
            numCtx: Number(values.numCtx),
            numPredict: Number(values.numPredict),
            // the knobs ride their families only: think is Ollama's,
            // effort — the cloud schemas
            effort: props.kind !== 'ollama' && values.effort !== 'default' ? values.effort : null,
            reasoningMaxTokens:
              values.reasoningMaxTokens === '' ? null : Number(values.reasoningMaxTokens),
            think:
              props.kind === 'ollama' && props.model.capabilities?.effort === true
                ? values.think === 'true'
                : null,
          })
        })
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
      }) => (
        <Box component={'form'} noValidate onSubmit={handleSubmit}>
          <SuccessAlert
            open={Boolean(status?.saved)}
            text={t('model.t_saved')}
            onClose={() => setStatus(undefined)}
          />
          <ErrorAlert
            open={Boolean(errors.submit)}
            text={errors.submit ?? ''}
            onClose={() => setErrors({ submit: null })}
          />
          <Stack spacing={2}>
            <TextField
              fullWidth
              label={t('model.t_name')}
              name={'name'}
              variant={'filled'}
              value={values.name}
              placeholder={props.model.name}
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
              label={t('model.t_system_prompt')}
              name={'systemPrompt'}
              variant={'filled'}
              value={values.systemPrompt}
              helperText={touched.systemPrompt && errors.systemPrompt ? errors.systemPrompt : ''}
              error={Boolean(touched.systemPrompt && errors.systemPrompt)}
              disabled={isSubmitting}
              onBlur={handleBlur}
              onChange={handleChange}
            />
            <Typography variant={'h6'} color={'text.primary'}>
              {t('model.t_parameters')}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 2,
              }}
            >
              {shown(props.defaults?.temperature) && (
                <TextField
                  type={'number'}
                  label={t('model.t_temperature')}
                  name={'temperature'}
                  variant={'filled'}
                  value={values.temperature}
                  helperText={touched.temperature && errors.temperature ? errors.temperature : ''}
                  error={Boolean(touched.temperature && errors.temperature)}
                  disabled={isSubmitting}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  slotProps={{ htmlInput: { step: 0.1 } }}
                />
              )}
              {shown(props.defaults?.topP) && (
                <TextField
                  type={'number'}
                  label={t('model.t_top_p')}
                  name={'topP'}
                  variant={'filled'}
                  value={values.topP}
                  helperText={touched.topP && errors.topP ? errors.topP : ''}
                  error={Boolean(touched.topP && errors.topP)}
                  disabled={isSubmitting}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  slotProps={{ htmlInput: { step: 0.05 } }}
                />
              )}
              {shown(props.defaults?.minP) && (
                <TextField
                  type={'number'}
                  label={t('model.t_min_p')}
                  name={'minP'}
                  variant={'filled'}
                  value={values.minP}
                  helperText={touched.minP && errors.minP ? errors.minP : ''}
                  error={Boolean(touched.minP && errors.minP)}
                  disabled={isSubmitting}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  slotProps={{ htmlInput: { step: 0.05 } }}
                />
              )}
              {shown(props.defaults?.topK) && (
                <TextField
                  type={'number'}
                  label={t('model.t_top_k')}
                  name={'topK'}
                  variant={'filled'}
                  value={values.topK}
                  helperText={touched.topK && errors.topK ? errors.topK : ''}
                  error={Boolean(touched.topK && errors.topK)}
                  disabled={isSubmitting}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  slotProps={{ htmlInput: { step: 1 } }}
                />
              )}
              {shown(props.defaults?.seed) && (
                <TextField
                  type={'number'}
                  label={t('model.t_seed')}
                  name={'seed'}
                  variant={'filled'}
                  value={values.seed}
                  helperText={touched.seed && errors.seed ? errors.seed : ''}
                  error={Boolean(touched.seed && errors.seed)}
                  disabled={isSubmitting}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  slotProps={{ htmlInput: { step: 1 } }}
                />
              )}
              {shown(props.defaults?.numCtx) && (
                <TextField
                  type={'number'}
                  label={t('model.t_num_ctx')}
                  name={'numCtx'}
                  variant={'filled'}
                  value={values.numCtx}
                  helperText={touched.numCtx && errors.numCtx ? errors.numCtx : ''}
                  error={Boolean(touched.numCtx && errors.numCtx)}
                  disabled={isSubmitting}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  slotProps={{ htmlInput: { step: 1 } }}
                />
              )}
              {shown(props.defaults?.numPredict) && (
                <TextField
                  type={'number'}
                  label={t('model.t_num_predict')}
                  name={'numPredict'}
                  variant={'filled'}
                  value={values.numPredict}
                  helperText={touched.numPredict && errors.numPredict ? errors.numPredict : ''}
                  error={Boolean(touched.numPredict && errors.numPredict)}
                  disabled={isSubmitting}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  slotProps={{ htmlInput: { step: 1 } }}
                />
              )}
              {shown(props.defaults?.stop) && (
                <TextField
                  multiline
                  minRows={2}
                  label={t('model.t_stop')}
                  name={'stop'}
                  variant={'filled'}
                  value={values.stop}
                  helperText={touched.stop && errors.stop ? errors.stop : ''}
                  error={Boolean(touched.stop && errors.stop)}
                  disabled={isSubmitting}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  sx={{ gridColumn: '1 / -1' }}
                />
              )}
              {/* the reasoning knobs paint for the models whose
                  capability matrix carries effort */}
              {props.model.capabilities?.effort === true && props.kind !== 'ollama' && (
                <TextField
                  select
                  label={t('model.t_effort')}
                  name={'effort'}
                  variant={'filled'}
                  value={values.effort}
                  disabled={isSubmitting}
                  onBlur={handleBlur}
                  onChange={handleChange}
                >
                  <MenuItem value={'default'}>{t('model.t_default')}</MenuItem>
                  {props.defaults?.effort?.values.map(value => (
                    <MenuItem key={value} value={value}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              {props.model.capabilities?.effort === true && props.kind === 'ollama' && (
                <TextField
                  select
                  label={t('model.t_think')}
                  name={'think'}
                  variant={'filled'}
                  value={values.think}
                  disabled={isSubmitting}
                  onBlur={handleBlur}
                  onChange={handleChange}
                >
                  <MenuItem value={'true'}>{t('model.t_on')}</MenuItem>
                  <MenuItem value={'false'}>{t('model.t_off')}</MenuItem>
                </TextField>
              )}
              {shown(props.defaults?.reasoningMaxTokens) && (
                <TextField
                  type={'number'}
                  label={t('model.t_reasoning_max_tokens')}
                  name={'reasoningMaxTokens'}
                  variant={'filled'}
                  value={values.reasoningMaxTokens}
                  helperText={
                    touched.reasoningMaxTokens && errors.reasoningMaxTokens
                      ? errors.reasoningMaxTokens
                      : ''
                  }
                  error={Boolean(touched.reasoningMaxTokens && errors.reasoningMaxTokens)}
                  disabled={isSubmitting}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  slotProps={{ htmlInput: { step: 1 } }}
                />
              )}
            </Box>
            <Stack direction={'row'} spacing={2}>
              <Box sx={{ flexGrow: 1 }} />
              <SaveButton isSubmitting={isSubmitting} />
            </Stack>
          </Stack>
        </Box>
      )}
    </Formik>
  )
}

const specShape = PropTypes.shape({
  default: PropTypes.number.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
})

ModelForm.propTypes = {
  model: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    systemPrompt: PropTypes.string.isRequired,
    temperature: PropTypes.number.isRequired,
    seed: PropTypes.number.isRequired,
    topP: PropTypes.number.isRequired,
    topK: PropTypes.number.isRequired,
    minP: PropTypes.number.isRequired,
    stop: PropTypes.arrayOf(PropTypes.string).isRequired,
    numCtx: PropTypes.number.isRequired,
    numPredict: PropTypes.number.isRequired,
    effort: PropTypes.string,
    reasoningMaxTokens: PropTypes.number,
    think: PropTypes.bool,
    // the capability matrix of the model: flat keys, `effort` gates
    // the reasoning knobs
    capabilities: PropTypes.object,
  }).isRequired,
  // the provider kind: picks the switch (ollama) or the select
  kind: PropTypes.string,
  defaults: PropTypes.shape({
    temperature: specShape,
    seed: specShape,
    topP: specShape,
    topK: specShape,
    minP: specShape,
    stop: PropTypes.bool,
    numCtx: specShape,
    numPredict: specShape,
    reasoningMaxTokens: specShape,
    effort: PropTypes.shape({
      default: PropTypes.string,
      values: PropTypes.arrayOf(PropTypes.string).isRequired,
    }),
  }),
}

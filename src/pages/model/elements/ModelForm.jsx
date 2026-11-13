/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: Model form: display name, system prompt, parameters.
 */
import PropTypes from 'prop-types'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { Box, MenuItem, Stack, TextField, Typography } from '@mui/material'

import { SaveButton } from '../../../components/buttons'
import { ErrorAlert, SuccessAlert } from '../../../components/alerts'
import { AppUtils } from '../../../utils'
import { Methods } from '../../../modules'

export function ModelForm(props) {
  const { t } = useTranslation()
  const [savedOpen, setSavedOpen] = React.useState(false)

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
        name: props.model.display_name,
        systemPrompt: props.model.system_prompt,
        temperature: props.model.temperature,
        seed: props.model.seed,
        topP: props.model.top_p,
        topK: props.model.top_k,
        minP: props.model.min_p,
        stop: props.model.stop.join('\n'),
        numCtx: props.model.num_ctx,
        numPredict: props.model.num_predict,
        // the sentinel reads as the provider default
        effort: props.model.effort ?? 'default',
        reasoningMaxTokens: props.model.reasoning_max_tokens ?? '',
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
        topP: bounded(props.defaults?.top_p, Yup.number()),
        topK: bounded(props.defaults?.top_k, Yup.number().integer()),
        minP: bounded(props.defaults?.min_p, Yup.number()),
        numCtx: bounded(props.defaults?.num_ctx, Yup.number().integer()),
        numPredict: bounded(props.defaults?.num_predict, Yup.number().integer()),
        // the select is constrained by its items; the empty value passes
        effort: Yup.string(),
        reasoningMaxTokens: bounded(props.defaults?.reasoning_max_tokens, Yup.number().integer()),
        think: Yup.string(),
      })}
      onSubmit={async (values, { setErrors, setSubmitting }) => {
        const saved = await AppUtils.submitForm(t, { setErrors, setSubmitting, setSavedOpen }, () =>
          Methods.save_provider_model(props.model, {
            display_name: values.name,
            system_prompt: values.systemPrompt,
            temperature: Number(values.temperature),
            seed: Number(values.seed),
            top_p: Number(values.topP),
            top_k: Number(values.topK),
            min_p: Number(values.minP),
            stop: values.stop
              .split('\n')
              .map(line => line.trim())
              .filter(Boolean),
            num_ctx: Number(values.numCtx),
            num_predict: Number(values.numPredict),
            // the knobs ride their families only: think is Ollama's,
            // effort — the cloud schemas
            effort: props.kind !== 'ollama' && values.effort !== 'default' ? values.effort : null,
            reasoning_max_tokens:
              values.reasoningMaxTokens === '' ? null : Number(values.reasoningMaxTokens),
            think:
              props.kind === 'ollama' && props.model.capabilities?.effort === true
                ? values.think === 'true'
                : null,
          })
        )
        if (saved) props.onSaved?.(saved)
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
      }) => (
        <Box component={'form'} noValidate onSubmit={handleSubmit}>
          <SuccessAlert
            open={savedOpen}
            text={t('model.t_saved')}
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
              {shown(props.defaults?.top_p) && (
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
              {shown(props.defaults?.min_p) && (
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
              {shown(props.defaults?.top_k) && (
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
              {shown(props.defaults?.num_ctx) && (
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
              {shown(props.defaults?.num_predict) && (
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
              {shown(props.defaults?.reasoning_max_tokens) && (
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
    display_name: PropTypes.string.isRequired,
    system_prompt: PropTypes.string.isRequired,
    temperature: PropTypes.number.isRequired,
    seed: PropTypes.number.isRequired,
    top_p: PropTypes.number.isRequired,
    top_k: PropTypes.number.isRequired,
    min_p: PropTypes.number.isRequired,
    stop: PropTypes.arrayOf(PropTypes.string).isRequired,
    num_ctx: PropTypes.number.isRequired,
    num_predict: PropTypes.number.isRequired,
    effort: PropTypes.string,
    reasoning_max_tokens: PropTypes.number,
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
    top_p: specShape,
    top_k: specShape,
    min_p: specShape,
    stop: PropTypes.bool,
    num_ctx: specShape,
    num_predict: specShape,
    reasoning_max_tokens: specShape,
    effort: PropTypes.shape({
      default: PropTypes.string,
      values: PropTypes.arrayOf(PropTypes.string).isRequired,
    }),
  }),
  onSaved: PropTypes.func,
}

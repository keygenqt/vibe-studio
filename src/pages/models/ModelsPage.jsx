/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'hooks']
 */
import * as React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import SearchIcon from '@mui/icons-material/Search'
import { Box, Button, InputAdornment, Stack, TextField, Typography } from '@mui/material'

import { SaveButton } from '../../components/buttons'
import { ModelCard } from './elements/ModelCard'
import { PageHeader, ErrorAlert, SuccessAlert } from '../../components/views'
import { ErrorState, WaitState } from '../../components/states'
import { Methods } from '../../modules'
import { useCoreProviders } from '../../hooks'

export function ModelsPage() {
  const { t } = useTranslation()
  const { providerId } = useParams()
  const id = Number(providerId)

  const { catalog, providers, models, error: readError } = useCoreProviders({ providerId: id })
  // the row resolves from the store
  const provider = (providers ?? []).find(item => item.id === id) ?? null
  // the live catalog of the host; the store only feeds the selection
  const [liveModels, setLiveModels] = React.useState(null)
  const [error, setError] = React.useState(null)
  const [submitError, setSubmitError] = React.useState(null)
  const [savedOpen, setSavedOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  // the user's selection; null = mirrors the store rows
  const [picked, setPicked] = React.useState(null)
  const selected = picked ?? (models ?? []).map(model => model.name)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // an id with no row is a bad route, not an empty catalog
  React.useEffect(() => {
    if (providers !== null && !provider) {
      setError(new Error(t('error.t_text')))
    }
  }, [providers, provider, t])

  React.useEffect(() => {
    if (!provider) return undefined
    let active = true
    Methods.get_provider_models_by_type(provider)
      .then(list => {
        if (active) setLiveModels(list)
      })
      .catch(err => {
        if (active) setError(err)
      })
    return () => {
      active = false
    }
  }, [provider])

  // the commit: persist the selection against the live catalog;
  // a failed sync shows a banner — the page keeps its state
  const onSave = () => {
    setIsSubmitting(true)
    setSubmitError(null)
    Methods.save_provider_models(id, selected)
      .then(() => {
        // re-sync with the fresh store rows
        setPicked(null)
        setSavedOpen(true)
      })
      .catch(err => setSubmitError(err.message ?? String(err)))
      .finally(() => setIsSubmitting(false))
  }

  // readiness: loaded or failed — the loader never covers an error
  const failure = error ?? readError
  const pageReady = failure !== null || (Boolean(provider) && liveModels !== null)

  // avatar letter from the model name
  const avatarOf = name => name.charAt(0).toUpperCase()

  const color = (catalog ?? []).find(info => info.provider === provider?.provider)?.color

  // the search filter is active on a non-empty query
  const isFilter = query.length > 0
  const all = liveModels ?? []

  // matches of the filter, whatever the selection state
  const matched = isFilter ? all.filter(m => m.name.toLowerCase().includes(query)) : []

  // selected models hidden by the filter
  const pinned = isFilter
    ? all.filter(m => selected.includes(m.name) && !m.name.toLowerCase().includes(query))
    : []

  // everything the page shows: filter matches plus the selected ones it hides
  const visible = isFilter ? [...matched, ...pinned] : all

  // toggle: select all visible models, or clear them when everything is selected
  const allVisibleSelected = visible.length > 0 && visible.every(m => selected.includes(m.name))

  // page sections: a flat list, or Search + Selected groups under the filter
  const sections = [
    isFilter && { title: t('models.t_group_search'), models: matched },
    isFilter &&
      pinned.length > 0 && {
        title: t('models.t_group_selected'),
        models: pinned,
      },
    !isFilter && { models: all },
  ].filter(Boolean)

  return (
    <WaitState ready={pageReady}>
      {failure ? (
        <ErrorState text={failure.message ?? String(failure)} />
      ) : (
        <Stack>
          <PageHeader title={provider.name} subtitle={t('models.t_subtitle')} />
          <Box sx={{ pb: 2 }} />
          <SuccessAlert
            open={savedOpen}
            text={t('models.t_saved')}
            onClose={() => setSavedOpen(false)}
          />
          <ErrorAlert
            open={Boolean(submitError)}
            text={submitError ?? ''}
            onClose={() => setSubmitError(null)}
          />
          <Stack spacing={2}>
            <TextField
              hiddenLabel
              variant={'filled'}
              disabled={Boolean(isSubmitting)}
              placeholder={t('models.t_search')}
              value={query}
              onChange={event => {
                setQuery(event.target.value.trim().toLowerCase())
              }}
              sx={{ flexGrow: 1 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position={'start'}>
                      <SearchIcon fontSize={'small'} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            {all.length === 0 && (
              <Typography variant={'body2'} color={'text.secondary'}>
                {t('common.t_not_found')}
              </Typography>
            )}
            {sections.map(section => (
              <React.Fragment key={section.title ?? 'models'}>
                {section.title && (
                  <Typography
                    variant={'body2'}
                    color={'text.secondary'}
                    sx={{
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    {section.title}
                  </Typography>
                )}
                {section.models.map(model => (
                  <ModelCard
                    key={`model-${model.name}`}
                    avatar={avatarOf(model.name)}
                    name={model.name}
                    description={model.params ?? undefined}
                    vision={model.vision}
                    thinking={model.thinking}
                    tools={model.tools}
                    color={color}
                    checked={selected.includes(model.name)}
                    disabled={all.length === 0 || Boolean(isSubmitting)}
                    onToggle={() =>
                      setPicked(current =>
                        selected.includes(model.name)
                          ? selected.filter(item => item !== model.name)
                          : [...selected, model.name]
                      )
                    }
                  />
                ))}
                {section.title && section.models.length === 0 && (
                  <Typography variant={'body2'} color={'text.secondary'}>
                    {t('common.t_not_found')}
                  </Typography>
                )}
              </React.Fragment>
            ))}
            <Stack direction={'row'} spacing={2} alignItems={'center'}>
              {visible.length > 0 && (
                <Button
                  variant={'outlined'}
                  size={'large'}
                  disabled={Boolean(isSubmitting)}
                  sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                  onClick={() =>
                    setPicked(
                      allVisibleSelected
                        ? selected.filter(name => !visible.some(model => model.name === name))
                        : [...new Set([...selected, ...visible.map(model => model.name)])]
                    )
                  }
                >
                  {t(allVisibleSelected ? 'models.t_deselect_all' : 'models.t_select_all')}
                </Button>
              )}
              <Box sx={{ flexGrow: 1 }} />
              <SaveButton
                isSubmitting={isSubmitting}
                disabled={all.length === 0}
                onClick={onSave}
              />
            </Stack>
          </Stack>
        </Stack>
      )}
    </WaitState>
  )
}

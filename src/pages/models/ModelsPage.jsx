/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import * as React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import SearchIcon from '@mui/icons-material/Search'
import DoneOutlined from '@mui/icons-material/DoneOutlined'
import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import { ModelCard } from './elements/ModelCard'
import { PageHeader, ErrorAlert, SuccessAlert } from '../../components/views'
import { ErrorState, WaitState } from '../../components/states'
import { Methods } from '../../modules'

export function ModelsPage() {
  const { t } = useTranslation()
  const { providerId } = useParams()
  const id = Number(providerId)
  const [provider, setProvider] = React.useState(Methods.providers_last_by_id(id))
  // the live catalog of the host; the store only feeds the selection
  const [models, setModels] = React.useState(null)
  const [error, setError] = React.useState(null)
  const [submitError, setSubmitError] = React.useState(null)
  const [savedOpen, setSavedOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  // the user's selection; starts from the rows already in the store
  const [selected, setSelected] = React.useState(() =>
    (Methods.models_last_by_provider(id) ?? []).map(model => model.name)
  )
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    let live = true
    Methods.providers_get()
      .then(list => {
        if (!live) return null
        const found = list.find(item => item.id === id) ?? null
        setProvider(found)
        // an id with no row is a bad route, not an empty catalog
        if (!found) {
          setError(new Error(t('error.t_text')))
          return null
        }
        // the selection baseline is the store, the catalog is live
        Methods.models_get(id).then(rows => {
          if (live) setSelected(rows.map(model => model.name))
        })
        return Methods.provider_models(found).then(list => {
          if (live) setModels(list)
        })
      })
      .catch(err => {
        if (live) setError(err)
      })
    return () => {
      live = false
    }
  }, [providerId])

  // the commit: persist the selection against the live catalog;
  // a failed sync shows a banner — the page keeps its state
  const onSave = () => {
    setIsSubmitting(true)
    setSubmitError(null)
    Methods.models_sync(id, selected)
      .then(() => setSavedOpen(true))
      .catch(err => setSubmitError(err.message ?? String(err)))
      .finally(() => setIsSubmitting(false))
  }

  // readiness: loaded or failed — the loader never covers an error
  const ready = error !== null || (Boolean(provider) && models !== null)

  // avatar letter from the model name
  const avatarOf = name => name.charAt(0).toUpperCase()

  const color = Methods.providers_catalog_last_by(provider?.provider)?.color

  // the search filter is active on a non-empty query
  const isFilter = query.length > 0
  const all = models ?? []

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
    <WaitState ready={ready}>
      {error ? (
        <ErrorState text={error.message ?? String(error)} />
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
                      setSelected(current =>
                        current.includes(model.name)
                          ? current.filter(item => item !== model.name)
                          : [...current, model.name]
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
                    setSelected(current =>
                      allVisibleSelected
                        ? current.filter(name => !visible.some(model => model.name === name))
                        : [...new Set([...current, ...visible.map(model => model.name)])]
                    )
                  }
                >
                  {t(allVisibleSelected ? 'models.t_deselect_all' : 'models.t_select_all')}
                </Button>
              )}
              <Box sx={{ flexGrow: 1 }} />
              <Button
                variant={'contained'}
                color={'success'}
                size={'large'}
                disabled={all.length === 0 || Boolean(isSubmitting)}
                startIcon={
                  isSubmitting ? (
                    <CircularProgress
                      sx={{
                        mr: 0.5,
                        height: '18px !important',
                        width: '18px !important',
                      }}
                    />
                  ) : (
                    <DoneOutlined color={'text.primary'} sx={{ height: 18 }} />
                  )
                }
                onClick={onSave}
              >
                {t('common.t_save')}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      )}
    </WaitState>
  )
}

/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'hooks']
 * INFO: Model sync page: the live catalog with selection toggles.
 */
import * as React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import SearchIcon from '@mui/icons-material/Search'
import { Box, Button, InputAdornment, Stack, Switch, TextField, Typography } from '@mui/material'

import { SaveButton } from '../components/buttons'
import { ModelCard } from '../components/model'
import { PageHeader } from '../components/views'
import { SuccessAlert } from '../components/alerts'
import { OutletLayout } from '../../layouts'
import {
  ProvidersMethod,
  UiMethod,
  useCatalog,
  useModels,
  useProviderModelsByType,
  useProviders,
} from '../../core'

export function ModelsPage() {
  const { t } = useTranslation()
  const { providerId } = useParams()
  const id = Number(providerId)

  const { catalog } = useCatalog()
  const { providers } = useProviders()
  const { models } = useModels(id)
  const provider = (providers ?? []).find(item => item.id === id) ?? null
  // the live catalog of the provider host: the query hook owns the fetch
  const { models: liveModels, error: liveError } = useProviderModelsByType(provider)
  const [savedOpen, setSavedOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [picked, setPicked] = React.useState(null)
  const selected = picked ?? (models ?? []).map(model => model.name)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // the commit: persist the selection against the live catalog;
  // a failed sync shows a snackbar — the page keeps its state
  const onSave = () => {
    setIsSubmitting(true)
    ProvidersMethod.saveProviderModels(id, selected)
      .then(() => {
        setPicked(null)
        setSavedOpen(true)
      })
      .catch(err => UiMethod.showError(String(err)))
      .finally(() => setIsSubmitting(false))
  }

  // the routed provider is missing: the load failed
  const missing = providers !== null && !provider ? t('error.t_text') : null
  // readiness: loaded or failed — the loader never covers an error
  const failure = missing ?? liveError
  const pageReady = failure !== null || (Boolean(provider) && liveModels !== null)

  // accent color of this provider's type from the static catalog
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
    <OutletLayout ready={pageReady} error={failure}>
      <Stack>
        <PageHeader title={provider.name} subtitle={t('models.t_subtitle')} />
        <Box sx={{ pb: 2 }} />
        <SuccessAlert
          open={savedOpen}
          text={t('models.t_saved')}
          onClose={() => setSavedOpen(false)}
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
                  title={model.name}
                  description={model.params ?? undefined}
                  capabilities={model.capabilities}
                  context={model.contextLength ?? undefined}
                  color={color}
                  action={
                    <Switch
                      checked={selected.includes(model.name)}
                      disabled={all.length === 0 || Boolean(isSubmitting)}
                      onChange={() =>
                        setPicked(current =>
                          selected.includes(model.name)
                            ? selected.filter(item => item !== model.name)
                            : [...selected, model.name]
                        )
                      }
                      sx={{ flexShrink: 0 }}
                    />
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
            <SaveButton isSubmitting={isSubmitting} disabled={all.length === 0} onClick={onSave} />
          </Stack>
        </Stack>
      </Stack>
    </OutletLayout>
  )
}

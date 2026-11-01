/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: Model picker: models grouped by provider, like the group form.
 */
import PropTypes from 'prop-types'
import { ListSubheader, MenuItem, TextField } from '@mui/material'

export function ModelSelect(props) {
  const providers = props.providers ?? []
  const models = props.models ?? []
  return (
    <TextField
      select
      size="small"
      hiddenLabel
      variant={'filled'}
      value={props.value ?? ''}
      onChange={e => props.onChange(e.target.value === '' ? null : Number(e.target.value))}
      disabled={props.disabled || models.length === 0}
      sx={{ width: 230 }}
    >
      {providers
        .filter(provider => models.some(model => model.provider_id === provider.id))
        .map(provider => [
          <ListSubheader key={`provider-${provider.id}`}>{provider.name}</ListSubheader>,
          ...models
            .filter(model => model.provider_id === provider.id)
            .map(model => (
              <MenuItem key={`model-${model.id}`} value={model.id}>
                {model.display_name ? `${model.display_name} (${model.name})` : model.name}
              </MenuItem>
            )),
        ])}
    </TextField>
  )
}

ModelSelect.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  providers: PropTypes.array,
  models: PropTypes.array,
  disabled: PropTypes.bool,
}

/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import * as React from 'react'
import { Box, Button, Stack } from '@mui/material'

import { ModelCard } from './elements/ModelCard'
import { PageHeader } from '../../components/views'

// draft: hardcoded until the model state lands in Rust
const provider = { name: 'DeepSeek' }
const available = [
  { id: 1, name: 'gpt-4o', checked: true },
  { id: 2, name: 'gpt-4o-mini', checked: true },
  { id: 3, name: 'qwen2.5-coder:7b-instruct', checked: false },
  { id: 4, name: 'qwen2.5vl:7b', checked: false },
]

export function ModelsPage() {
  // selected model ids until the state lands in Rust
  const [selected, setSelected] = React.useState(
    available.filter(model => model.checked).map(model => model.id)
  )

  const onToggle = id => {
    setSelected(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id]
    )
  }

  return (
    <Stack spacing={2}>
      <PageHeader
        title={provider.name}
        subtitle={'Select the models available for this provider.'}
      />
      {available.map(model => (
        <ModelCard
          key={`model-${model.id}`}
          name={model.name}
          checked={selected.includes(model.id)}
          onToggle={() => onToggle(model.id)}
        />
      ))}
      <Stack direction={'row'} spacing={2}>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant={'contained'}
          size={'large'}
          onClick={() => console.log('sync models', selected)}
        >
          Save
        </Button>
      </Stack>
    </Stack>
  )
}

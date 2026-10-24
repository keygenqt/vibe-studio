import { useParams } from 'react-router'
import { Stack } from '@mui/material'

import { PageHeader } from '../../components/views'
import { AppUtils } from '../../utils'

import { ModelForm } from './elements/ModelForm'

// draft: hardcoded until model state lands in Rust
const model = {
  id: 1,
  name: '',
  model: 'qwen2.5-coder:7b',
  provider: 'Ollama',
  host: 'http://192.168.1.10:11434',
  systemPrompt: '',
  temperature: 0.2,
  seed: 42,
  numCtx: 4096,
  numPredict: 2048,
}

export function ModelPage() {
  const { modelId } = useParams()
  return (
    <Stack spacing={2}>
      <PageHeader
        title={model.name || AppUtils.formatModelName(model.model)}
        subtitle={`${model.provider} · ${model.host} · ${model.model}`}
      />
      <ModelForm
        key={`model-${modelId}`}
        name={model.name}
        model={model.model}
        systemPrompt={model.systemPrompt}
        temperature={model.temperature}
        seed={model.seed}
        numCtx={model.numCtx}
        numPredict={model.numPredict}
      />
    </Stack>
  )
}

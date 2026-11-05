/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The compress confirmation: the dialog with the task-model switch.
 */
import * as React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Switch,
} from '@mui/material'

export function CompressDialog(props) {
  const { t } = useTranslation()
  // the default is the chat's model: the switch enables the heavy one
  const [useTaskModel, setUseTaskModel] = React.useState(false)

  React.useEffect(() => {
    if (props.open) setUseTaskModel(false)
  }, [props.open])

  return (
    <Dialog open={props.open} onClose={props.onCancel}>
      <DialogTitle>{t('chat.t_compress_title')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t('chat.t_compress_text')}</DialogContentText>
        {props.hasTaskModel && (
          <FormControlLabel
            sx={{ mt: 2 }}
            control={
              <Switch
                checked={useTaskModel}
                onChange={event => setUseTaskModel(event.target.checked)}
              />
            }
            label={t('chat.t_compress_task_model')}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onCancel}>{t('common.t_cancel')}</Button>
        <Button
          color={'error'}
          variant={'contained'}
          disabled={props.busy}
          onClick={() => props.onConfirm(useTaskModel)}
        >
          {t('chat.t_compress')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

CompressDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  // the switch shows only with the heavy task model set
  hasTaskModel: PropTypes.bool.isRequired,
  // the run is going: the confirm waits
  busy: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
  // receives the switch state
  onConfirm: PropTypes.func.isRequired,
}

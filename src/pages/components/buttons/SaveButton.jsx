/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: Submit button with the progress spinner while saving.
 */
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Button, CircularProgress } from '@mui/material'
import DoneOutlined from '@mui/icons-material/DoneOutlined'

export function SaveButton(props) {
  const { t } = useTranslation()
  return (
    <Button
      // outside a form: a click handler instead of a submit
      type={props.onClick ? 'button' : 'submit'}
      variant={'contained'}
      color={'success'}
      size={'large'}
      disabled={Boolean(props.isSubmitting) || Boolean(props.disabled)}
      startIcon={
        props.isSubmitting ? (
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
      onClick={props.onClick}
    >
      {t('common.t_save')}
    </Button>
  )
}

SaveButton.propTypes = {
  isSubmitting: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
}

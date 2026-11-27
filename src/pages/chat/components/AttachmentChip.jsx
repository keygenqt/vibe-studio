/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The attachment chip: the icon by the content kind, the name, the size and the remove action.
 */
import PropTypes from 'prop-types'
import { Chip, Stack, Tooltip, Typography } from '@mui/material'
import ImageIcon from '@mui/icons-material/Image'
import AttachFile from '@mui/icons-material/AttachFile'

import { AppUtils } from '../../../utils'

export function AttachmentChip(props) {
  const { attachment, onDelete } = props
  const isImage = attachment.mime?.startsWith('image/')
  const chip = (
    <Chip
      size={'small'}
      label={
        <Stack direction={'row'} spacing={0.5} alignItems={'center'}>
          {isImage ? <ImageIcon sx={{ fontSize: 14 }} /> : <AttachFile sx={{ fontSize: 14 }} />}
          <Typography variant={'caption'} noWrap color={'text.primary'} sx={{ maxWidth: 180 }}>
            {attachment.name}
          </Typography>
          {attachment.size != null && (
            <Typography variant={'caption'} color={'text.secondary'}>
              {AppUtils.humanBytes(attachment.size)}
            </Typography>
          )}
        </Stack>
      }
      onDelete={onDelete}
    />
  )
  // the full path rides the tooltip: names repeat across directories
  return attachment.path != null ? <Tooltip title={attachment.path}>{chip}</Tooltip> : chip
}

AttachmentChip.propTypes = {
  // the attachment metadata: the kind comes from the content sniff
  attachment: PropTypes.shape({
    name: PropTypes.string.isRequired,
    path: PropTypes.string,
    mime: PropTypes.string,
    size: PropTypes.number,
  }).isRequired,
  // the remove action of the composer draft; the stored message
  // chips render without it
  onDelete: PropTypes.func,
}

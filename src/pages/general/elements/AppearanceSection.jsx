/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: Appearance block: theme, accent color, locale, chat font size.
 */
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import {
  ButtonBase,
  MenuItem,
  Slider,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'

import { GroupRow, GroupView } from '../../../components/views'
import { ACCENTS } from '../../../constants'
import { THEMES } from '../../../theme'

// native titles: language names are not translated
const LANGUAGES = [
  { value: 'ru', title: 'Русский' },
  { value: 'en', title: 'English' },
  { value: 'cn', title: '中文' },
]

export function AppearanceSection(props) {
  const { t } = useTranslation()
  const { values, onChange } = props
  return (
    <GroupView title={t('general.t_appearance')}>
      <GroupRow title={t('general.t_theme')} description={t('general.t_theme_description')}>
        <ToggleButtonGroup
          size="small"
          exclusive
          fullWidth
          color={'primary'}
          value={values.theme}
          sx={{ minWidth: 250 }}
          onChange={(_, value) => onChange('theme', value)}
        >
          <ToggleButton value={'light'}>{t('general.t_theme_light')}</ToggleButton>
          <ToggleButton value={'dark'}>{t('general.t_theme_dark')}</ToggleButton>
          <ToggleButton value={'system'}>{t('general.t_theme_system')}</ToggleButton>
        </ToggleButtonGroup>
      </GroupRow>
      <GroupRow title={t('general.t_accent')} description={t('general.t_accent_description')}>
        <Stack direction={'row'} spacing={1.5}>
          {ACCENTS.map(name => (
            <ButtonBase
              key={`accent-${name}`}
              onClick={() => onChange('accent', name)}
              sx={theme => {
                const color = THEMES[name][theme.palette.mode].palette.primary.main
                return {
                  width: 28,
                  height: 28,
                  borderRadius: 99,
                  bgcolor: color,
                  boxShadow:
                    values.accent === name
                      ? `0 0 0 2px ${theme.palette.background.paper}, 0 0 0 4px ${color}`
                      : 'none',
                }
              }}
            />
          ))}
        </Stack>
      </GroupRow>
      <GroupRow title={t('general.t_language')} description={t('general.t_language_description')}>
        <TextField
          select
          size="small"
          hiddenLabel
          variant={'filled'}
          value={values.language}
          onChange={e => onChange('language', e.target.value)}
          sx={{ width: 250 }}
        >
          {LANGUAGES.map(item => (
            <MenuItem key={`language-${item.value}`} value={item.value}>
              {item.title}
            </MenuItem>
          ))}
        </TextField>
      </GroupRow>
      <GroupRow title={t('general.t_font_size')} description={t('general.t_font_size_description')}>
        <Stack direction={'row'} spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant={'body2'} sx={{ flexShrink: 0, pr: 1 }}>
            A
          </Typography>
          <Slider
            value={values.fontSize}
            min={12}
            max={20}
            step={1}
            onChange={(_, value) => onChange('fontSize', value)}
            sx={{ width: 150, flexGrow: 1 }}
          />
          <Typography sx={{ flexShrink: 0, fontSize: 20, pl: 1 }}>A</Typography>
          <Typography
            variant={'body2'}
            color={'text.secondary'}
            sx={{ flexShrink: 0, textAlign: 'right' }}
          >
            {values.fontSize} px
          </Typography>
        </Stack>
      </GroupRow>
    </GroupView>
  )
}

AppearanceSection.propTypes = {
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
}

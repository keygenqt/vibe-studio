/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The loading view: a random phrase with its icon and the appearing dots; the delay is a compositor fade-in.
 */
import * as React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Box, Stack, Typography } from '@mui/material'
import AcUnit from '@mui/icons-material/AcUnit'
import Air from '@mui/icons-material/Air'
import AutoFixHigh from '@mui/icons-material/AutoFixHigh'
import BatteryChargingFull from '@mui/icons-material/BatteryChargingFull'
import Calculate from '@mui/icons-material/Calculate'
import CleaningServices from '@mui/icons-material/CleaningServices'
import Extension from '@mui/icons-material/Extension'
import Hub from '@mui/icons-material/Hub'
import LocalCafe from '@mui/icons-material/LocalCafe'
import Memory from '@mui/icons-material/Memory'
import MenuBook from '@mui/icons-material/MenuBook'
import Pets from '@mui/icons-material/Pets'
import RocketLaunch from '@mui/icons-material/RocketLaunch'
import Settings from '@mui/icons-material/Settings'
import Speed from '@mui/icons-material/Speed'
import Sync from '@mui/icons-material/Sync'
import Search from '@mui/icons-material/Search'
import VpnKey from '@mui/icons-material/VpnKey'
import WbSunny from '@mui/icons-material/WbSunny'

// the loading phrases: the key is the English phrase, translations live in the locales
const VARIANTS = [
  { icon: Settings, text: 'Turning the gears' },
  { icon: RocketLaunch, text: 'Starting the engine' },
  { icon: Calculate, text: 'Counting tokens' },
  { icon: Memory, text: 'Warming up the neurons' },
  { icon: MenuBook, text: 'Flipping through the context' },
  { icon: Speed, text: 'Gaining speed' },
  { icon: Extension, text: 'Plugging in the modules' },
  { icon: VpnKey, text: 'Picking the keys' },
  { icon: Sync, text: 'Synchronizing the universe' },
  { icon: WbSunny, text: 'Waking up the servers' },
  { icon: AcUnit, text: 'Cooling down the processor' },
  { icon: LocalCafe, text: 'Brewing the coffee' },
  { icon: Pets, text: 'Petting the cat' },
  { icon: Air, text: 'Airing the data center' },
  { icon: BatteryChargingFull, text: 'Charging the battery' },
  { icon: AutoFixHigh, text: 'Polishing the wording' },
  { icon: Hub, text: 'Connecting the nodes' },
  { icon: CleaningServices, text: 'Tidying up' },
  { icon: Search, text: 'Staring into the horizon' },
]

export function LoaderView(props) {
  const { delay = 0 } = props
  const { t } = useTranslation()
  // one phrase per mount: re-renders keep it stable
  const [variant] = React.useState(() => VARIANTS[Math.floor(Math.random() * VARIANTS.length)])
  const Icon = variant.icon

  return (
    <Stack
      spacing={1}
      sx={{
        // the fade-in is the delay: opacity rides the compositor thread and
        // keeps fading while the main thread is busy with the heavy render
        ...(delay > 0 && {
          opacity: 0,
          willChange: 'opacity',
          animation: `loader-fade-in ${delay}ms ease-out forwards`,
          '@keyframes loader-fade-in': {
            '0%, 70%': { opacity: 0 },
            '100%': { opacity: 1 },
          },
        }),
        justifyContent: 'center',
        alignItems: 'center',
        '@keyframes loader-dot-2': {
          '0%, 26%': { opacity: 0 },
          '30%, 88%': { opacity: 1 },
          '92%, 100%': { opacity: 0 },
        },
        '@keyframes loader-dot-3': {
          '0%, 56%': { opacity: 0 },
          '60%, 88%': { opacity: 1 },
          '92%, 100%': { opacity: 0 },
        },
      }}
    >
      <Icon sx={{ fontSize: 36, color: 'text.secondary' }} />
      <Stack direction={'row'} spacing={0.7} alignItems={'flex-end'}>
        <Typography variant={'body2'} color={'text.secondary'}>
          {t(variant.text)}
        </Typography>
        <Stack
          direction={'row'}
          spacing={0.25}
          sx={{ color: 'text.secondary', position: 'relative', top: 3 }}
        >
          <Box component={'span'}>{'•'}</Box>
          <Box component={'span'} sx={{ animation: 'loader-dot-2 1.5s linear infinite' }}>
            {'•'}
          </Box>
          <Box component={'span'} sx={{ animation: 'loader-dot-3 1.5s linear infinite' }}>
            {'•'}
          </Box>
        </Stack>
      </Stack>
    </Stack>
  )
}

LoaderView.propTypes = {
  delay: PropTypes.number,
}

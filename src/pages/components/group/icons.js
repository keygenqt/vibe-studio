/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The group icon catalog: the stored key maps to the icon component.
 */
import Code from '@mui/icons-material/Code'
import Science from '@mui/icons-material/Science'
import Work from '@mui/icons-material/Work'
import School from '@mui/icons-material/School'
import Favorite from '@mui/icons-material/Favorite'
import Star from '@mui/icons-material/Star'
import Lightbulb from '@mui/icons-material/Lightbulb'
import Forum from '@mui/icons-material/Forum'
import Event from '@mui/icons-material/Event'
import SmartToy from '@mui/icons-material/SmartToy'

// The stored icon names; an unknown key renders as the first letter.
// The stored icon names with their display names; an unknown key
// renders as the first letter.
export const GROUP_ICONS = {
  code: { Icon: Code, name: 'Code' },
  science: { Icon: Science, name: 'Science' },
  work: { Icon: Work, name: 'Work' },
  school: { Icon: School, name: 'School' },
  favorite: { Icon: Favorite, name: 'Favorite' },
  star: { Icon: Star, name: 'Star' },
  lightbulb: { Icon: Lightbulb, name: 'Lightbulb' },
  forum: { Icon: Forum, name: 'Forum' },
  event: { Icon: Event, name: 'Event' },
  smart_toy: { Icon: SmartToy, name: 'Smart Toy' },
}

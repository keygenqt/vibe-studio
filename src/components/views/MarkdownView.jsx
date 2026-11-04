/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The markdown view: the model answer with code highlighting and safe links.
 */
import * as React from 'react'
import PropTypes from 'prop-types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash'
import batch from 'react-syntax-highlighter/dist/esm/languages/prism/batch'
import c from 'react-syntax-highlighter/dist/esm/languages/prism/c'
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp'
import csharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp'
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css'
import dart from 'react-syntax-highlighter/dist/esm/languages/prism/dart'
import diff from 'react-syntax-highlighter/dist/esm/languages/prism/diff'
import docker from 'react-syntax-highlighter/dist/esm/languages/prism/docker'
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go'
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java'
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript'
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json'
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx'
import kotlin from 'react-syntax-highlighter/dist/esm/languages/prism/kotlin'
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown'
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup'
import php from 'react-syntax-highlighter/dist/esm/languages/prism/php'
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python'
import ruby from 'react-syntax-highlighter/dist/esm/languages/prism/ruby'
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust'
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql'
import swift from 'react-syntax-highlighter/dist/esm/languages/prism/swift'
import toml from 'react-syntax-highlighter/dist/esm/languages/prism/toml'
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx'
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript'
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml'
import zig from 'react-syntax-highlighter/dist/esm/languages/prism/zig'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import ContentCopy from '@mui/icons-material/ContentCopy'

import { Methods } from '../../modules'

// the highlight registry: a language outside it falls back to the
// plain code — the fallback works for the stream with a partial
// fence info (`jav`), not only for unknown languages
SyntaxHighlighter.registerLanguage('bash', bash)
SyntaxHighlighter.registerLanguage('batch', batch)
SyntaxHighlighter.registerLanguage('c', c)
SyntaxHighlighter.registerLanguage('cpp', cpp)
SyntaxHighlighter.registerLanguage('csharp', csharp)
SyntaxHighlighter.registerLanguage('css', css)
SyntaxHighlighter.registerLanguage('dart', dart)
SyntaxHighlighter.registerLanguage('diff', diff)
SyntaxHighlighter.registerLanguage('dockerfile', docker)
SyntaxHighlighter.registerLanguage('go', go)
SyntaxHighlighter.registerLanguage('html', markup)
SyntaxHighlighter.registerLanguage('java', java)
SyntaxHighlighter.registerLanguage('javascript', javascript)
SyntaxHighlighter.registerLanguage('json', json)
SyntaxHighlighter.registerLanguage('jsx', jsx)
SyntaxHighlighter.registerLanguage('kotlin', kotlin)
SyntaxHighlighter.registerLanguage('markdown', markdown)
SyntaxHighlighter.registerLanguage('php', php)
SyntaxHighlighter.registerLanguage('python', python)
SyntaxHighlighter.registerLanguage('ruby', ruby)
SyntaxHighlighter.registerLanguage('rust', rust)
SyntaxHighlighter.registerLanguage('sql', sql)
SyntaxHighlighter.registerLanguage('swift', swift)
SyntaxHighlighter.registerLanguage('toml', toml)
SyntaxHighlighter.registerLanguage('tsx', tsx)
SyntaxHighlighter.registerLanguage('typescript', typescript)
SyntaxHighlighter.registerLanguage('xml', markup)
SyntaxHighlighter.registerLanguage('yaml', yaml)
SyntaxHighlighter.registerLanguage('zig', zig)

// the lookup guard of the registry: the prism aliases resolve inside
// the grammars themselves — the set only keeps the check local
const REGISTERED = new Set([
  'bash',
  'sh',
  'shell',
  'batch',
  'bat',
  'cmd',
  'c',
  'cpp',
  'c++',
  'csharp',
  'cs',
  'css',
  'dart',
  'diff',
  'dockerfile',
  'docker',
  'go',
  'html',
  'xml',
  'svg',
  'java',
  'javascript',
  'js',
  'jsx',
  'json',
  'kotlin',
  'kt',
  'markdown',
  'md',
  'php',
  'python',
  'py',
  'ruby',
  'rb',
  'rust',
  'rs',
  'sql',
  'swift',
  'toml',
  'typescript',
  'ts',
  'tsx',
  'yaml',
  'yml',
  'zig',
])

// the highlighted code block: the language caption and the copy in
// the header, the prism colors over the theme mode
function CodeBlockBase(props) {
  const theme = useTheme()
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef(null)
  React.useEffect(() => () => timer.current && clearTimeout(timer.current), [])

  // resolves silently: a failed copy just skips the accent paint
  const onClickCopy = () => {
    if (copied) return
    Methods.clipboard_write_text(props.code)
      .then(() => {
        setCopied(true)
        timer.current = setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => {})
  }

  return (
    <Box
      sx={{
        my: 2,
        overflow: 'hidden',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack
        direction={'row'}
        justifyContent={'space-between'}
        alignItems={'center'}
        sx={theme => ({
          pl: 1.5,
          pr: 0.5,
          py: 0.25,
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
        })}
      >
        <Typography variant={'caption'} color={'text.primary'}>
          {props.language}
        </Typography>
        <IconButton size={'small'} onClick={onClickCopy}>
          <ContentCopy sx={{ fontSize: 14, color: copied ? 'primary.main' : 'text.secondary' }} />
        </IconButton>
      </Stack>
      <SyntaxHighlighter
        language={props.language}
        style={props.style}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: props.fontSize,
          lineHeight: 1.35,
          background: theme.palette.background.paper,
        }}
        codeTagProps={{ style: { lineHeight: 'inherit', fontSize: '0.9em' } }}
      >
        {props.code}
      </SyntaxHighlighter>
    </Box>
  )
}

CodeBlockBase.propTypes = {
  language: PropTypes.string.isRequired,
  code: PropTypes.string.isRequired,
  style: PropTypes.object.isRequired,
  fontSize: PropTypes.number.isRequired,
}

// the memo: the finished blocks of a growing answer keep their
// highlight — only the open block repaints per tick
const CodeBlock = React.memo(CodeBlockBase)

function MarkdownViewBase(props) {
  const theme = useTheme()
  const syntaxStyle = theme.palette.mode === 'dark' ? oneDark : oneLight

  // the components map is stable per theme and font size — it must
  // not be rebuilt on every stream chunk
  const components = React.useMemo(
    () => ({
      // the shell never navigates itself: an external link goes to
      // the browser through core, everything else is ignored
      a({ node, href, children, ...rest }) {
        return (
          <Box
            component={'a'}
            href={href}
            onClick={event => {
              event.preventDefault()
              if (href && /^https?:\/\//.test(href)) {
                Methods.open_in_browser(href).catch(() => {})
              }
            }}
            sx={{ color: 'primary.main' }}
            {...rest}
          >
            {children}
          </Box>
        )
      },
      // the scroll shell: the real table stretches to the full width
      // and scrolls inside the frame when wider
      table({ node, children, ...rest }) {
        return (
          <Box
            sx={{
              my: 2,
              overflowX: 'auto',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <table {...rest}>{children}</table>
          </Box>
        )
      },
      // a registered fenced block paints through the highlighter, an
      // inline code stays plain
      code({ node, children, className, ...rest }) {
        const match = /language-([\w+-]+)/.exec(className || '')
        if (match && REGISTERED.has(match[1])) {
          return (
            <CodeBlock
              language={match[1]}
              code={React.Children.toArray(children).join('').replace(/\n$/, '')}
              style={syntaxStyle}
              fontSize={props.fontSize}
            />
          )
        }
        return (
          <code {...rest} className={className}>
            {children}
          </code>
        )
      },
      // the highlighted block brings its own container — the markdown
      // `pre` steps aside; the plain code keeps the real `pre` and
      // the container styles over it
      pre({ node, children, ...rest }) {
        const child = React.Children.toArray(children).find(React.isValidElement)
        const className = React.isValidElement(child) ? String(child.props.className ?? '') : ''
        const match = /language-([\w+-]+)/.exec(className)
        if (match && REGISTERED.has(match[1])) {
          return <React.Fragment>{children}</React.Fragment>
        }
        return <pre {...rest}>{children}</pre>
      },
    }),
    [props.fontSize, syntaxStyle]
  )

  return (
    <Box
      sx={{
        fontSize: props.fontSize,
        minWidth: 0,
        color: 'text.primary',
        // the thin body reads on the dark only, the light theme
        // keeps the regular weight
        fontWeight: theme => (theme.palette.mode === 'dark' ? 300 : 400),
        lineHeight: 1.5,
        '& > *:first-child': { marginTop: 0 },
        '& > *:last-child': { marginBottom: 0 },
        '& p': { my: 1.5 },
        '& h1, & h2, & h3, & h4, & h5, & h6': {
          my: 1.5,
          fontWeight: 600,
          color: 'text.primary',
        },
        '& ul, & ol': { my: 1, pl: 3 },
        '& li': { my: 0.5 },
        '& li::marker': { color: 'text.secondary' },
        '& blockquote': theme => ({
          my: 2,
          ml: 0,
          pl: 1.5,
          py: 0.5,
          width: 1,
          borderLeft: '3px solid',
          borderColor: 'primary.main',
          backgroundColor: alpha(theme.palette.primary.main, 0.06),
          color: 'text.primary',
          boxSizing: 'border-box',
        }),
        '& hr': { my: 2, borderColor: 'divider' },
        '& img': { maxWidth: 1, borderRadius: 2 },
        // the framed table: a rounded outer border and only the inner
        // separators — the article tables of the site
        '& table': {
          width: 1,
          textAlign: 'center',
          borderCollapse: 'separate',
          borderSpacing: 0,
          '& th, & td': {
            px: 1.5,
            py: 0.75,
            borderRight: '1px solid',
            borderColor: 'divider',
          },
          '& th:last-child, & td:last-child': {
            borderRight: 'none',
          },
          '& td': {
            px: 1.5,
            py: 0.75,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          },
          '& th': {
            fontWeight: 600,
            borderBottom: '2px solid',
            borderColor: 'divider',
            backgroundColor: theme => alpha(theme.palette.primary.main, 0.08),
          },
          '& tr:last-child td': {
            borderBottom: 'none',
          },
        },
        // a fenced block without a registered language: plain code
        // over the quiet surface
        '& pre': theme => ({
          my: 2,
          p: 1.5,
          overflowX: 'auto',
          borderRadius: 2,
          backgroundColor: alpha(theme.palette.text.primary, 0.05),
          '& code': { whiteSpace: 'pre-wrap', fontSize: 'inherit', lineHeight: 1.5 },
        }),
        '& p > code, & li > code': theme => ({
          px: 0.5,
          borderRadius: 1,
          fontSize: '0.9em',
          color: 'primary.main',
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
        }),
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {props.text}
      </ReactMarkdown>
    </Box>
  )
}

MarkdownViewBase.propTypes = {
  // the markdown text of the answer or the translation
  text: PropTypes.string.isRequired,
  // the message text size in px
  fontSize: PropTypes.number.isRequired,
}

// the memo: the whole markdown pipeline (parse + highlight) runs only
// where the text changed — the stream repaints its bubble alone
export const MarkdownView = React.memo(MarkdownViewBase)

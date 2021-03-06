/* eslint-disable no-console */
import {readdirSync as directory, readFileSync as file} from 'fs'
import {join} from 'path'
import ava from 'ava'
import unified from 'unified'
import reParse from 'remark-parse'
import rebber from '../src'

const base = join(__dirname, 'fixtures')
const specs = directory(base).reduce((tests, contents) => {
  const parts = contents.split('.')
  if (!tests[parts[0]]) {
    tests[parts[0]] = {}
  }
  tests[parts[0]][parts[1]] = file(join(base, contents), 'utf-8')
  return tests
}, {})

ava('heading', t => {
  const spec = specs['heading']
  const {contents} = unified()
    .use(reParse)
    .use(rebber)
    .processSync(spec.fixture)

  t.deepEqual(contents, spec.expected)
})

ava('heading with custom config', t => {
  const [fixture, expected] = [specs['heading'].fixture, specs['heading-config'].expected]
  const {contents} = unified()
    .use(reParse)
    .use(rebber, {
      heading: [
        (val) => `\\LevelOneTitle{${val}}\n`,
        (val) => `\\LevelTwoTitle{${val}}\n`,
        (val) => `\\LevelThreeTitle{${val}}\n`,
        (val) => `\\LevelFourTitle{${val}}\n`,
        (val) => `\\LevelFiveTitle{${val}}\n`,
        (val) => `\\LevelSixTitle{${val}}\n`,
        (val) => `\\LevelSevenTitle{${val}}\n`,
      ]
    })
    .processSync(fixture)

  t.deepEqual(contents, expected)
})

ava('paragraph', t => {
  const spec = specs['paragraph']
  const {contents} = unified()
    .use(reParse)
    .use(rebber)
    .processSync(spec.fixture)

  t.deepEqual(contents.trim(), spec.expected.trim())
})

ava('inline-code', t => {
  const spec = specs['inline-code']
  const {contents} = unified()
    .use(reParse)
    .use(rebber)
    .processSync(spec.fixture)

  t.deepEqual(contents.trim(), spec.expected.trim())
})

ava('blockquote', t => {
  const spec = specs['blockquote']
  let compiled = unified()
    .use(reParse)
    .use(rebber)
    .processSync(spec.fixture)

  t.deepEqual(compiled.contents.trim(), spec.expected.trim())

  compiled = unified()
    .use(reParse)
    .use(rebber, {
      blockquote: {}
    })
    .processSync(spec.fixture)

  t.deepEqual(compiled.contents.trim(), spec.expected.trim())
})

ava('blockquote with custom config', t => {
  const [fixture, expected] = [specs['blockquote'].fixture, specs['blockquote-config'].expected]
  const {contents} = unified()
    .use(reParse)
    .use(rebber, {
      blockquote: {
        macro: 'Foo',
        useSource: true,
      },
    })
    .processSync(fixture)

  t.deepEqual(contents.trim(), expected.trim())
})

Object.keys(specs).filter(Boolean).filter(name => name.startsWith('mix-')).forEach(name => {
  const spec = specs[name]

  ava(name, t => {
    const {contents} = unified()
      .use(reParse)
      .use(rebber, {
        blockquote: {
          macro: 'Quotation',
          useSource: true,
        },
      })
      .processSync(spec.fixture)

    if (contents.trim() !== spec.expected.trim()) console.log(contents)
    t.deepEqual(contents.trim(), spec.expected.trim())
  })
})

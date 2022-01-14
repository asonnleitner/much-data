import * as fs from 'fs'
import { PathLike } from 'fs'
import * as fsp from 'fs/promises'
import * as path from 'path'
import { WORDS } from './constants'

interface StreamWriterOptions {
  overwrite?: boolean
}

type CaseType =
  'lower'
  | 'upper'
  | 'capital'
  | 'title'
  | 'kebab'
  | 'camel'
  | 'snake'

const streamWriter = async (data: string, pathname: PathLike, options: StreamWriterOptions = {
    overwrite: true
}): Promise<PathLike | never> => {
    const dir = path.dirname(String(pathname))

    const isExisting = fs.existsSync(pathname)
    const isExistingDir = fs.existsSync(dir)

    // create directory if not exists
    if (!isExistingDir) {
        await fsp.mkdir(dir, { recursive: true })
    }

    if (isExisting && !options.overwrite) {
        throw new Error(`File already exists: ${ pathname }`)
    }


    return new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(pathname)

        stream.write(data)
        stream.end()

        stream.on('finish', () => {
            resolve(pathname)
        })
        stream.on('error', (err) => {
            reject(err)
        })
    })
}

const makeArray = (length: number) => {
    const arr = []
    for (let i = 0; i < length; i++) {
        arr.push(i)
    }
    return arr
}

const pickWords = (wordsCount: number, wordsArray = WORDS) => {
    const pickedWords = []
    for (let i = 0; i < wordsCount; i++) {
        const randomIndex = Math.floor(Math.random() * wordsArray.length)
        pickedWords.push(wordsArray[randomIndex])
    }
    return pickedWords
}

const convertCase = (str: string, caseType: CaseType) => ({
    upper: str.toUpperCase(),
    lower: str.toLowerCase(),
    capital: str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(),
    title: str.toLowerCase().replace(/(^|\s)\S/g, (l) => l.toUpperCase()),
    kebab: str.toLowerCase().replace(/ /g, '-'),
    camel: str.toLowerCase().replace(/ /g, '').replace(/^\w/, l => l.toUpperCase()),
    snake: str.toLowerCase().replace(/ /g, '_')
}[caseType])

const main = async () => {
    const items = makeArray(1_000_000)

    const data = items.map((i) => {
        const words = pickWords(2).join(' ')
        return {
            id: i + 1,
            key: convertCase(words, 'kebab'),
            name: convertCase(words, 'title')
        }
    })

    await streamWriter(JSON.stringify(data), './data.json')
}

main().catch(console.error)

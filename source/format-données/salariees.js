// @ts-check


import { stringify } from 'yaml'

import { isSalarié_e } from './predicates'
import { parseArray } from './utils'

export const parseSalarié_es = (str) => parseArray(str, 'une liste de salarié⋅es', isSalarié_e) 
export const stringifySalarié_esYaml = (s) => stringify(s)
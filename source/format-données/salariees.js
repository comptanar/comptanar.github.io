// @ts-check


import { stringify } from 'yaml'

import { estSalarié_e } from './predicates'
import { parseYamlArray } from './utils'

export const parseSalarié_es = (str) => parseYamlArray(str, 'une liste de salarié⋅es', estSalarié_e) 
export const stringifySalarié_esYaml = (s) => stringify(s)
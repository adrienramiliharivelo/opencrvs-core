/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { getDefaultLanguage } from '@client/i18n/utils'
import type { GQLComment } from '@client/utils/gateway-deprecated-do-not-use'
import { HumanName } from './gateway'

interface INamesMap {
  [key: string]: string
}

export const createNamesMap = (names: HumanName[]): INamesMap =>
  names.filter(Boolean).reduce((prevNamesMap: INamesMap, name) => {
    if (!name.use) {
      prevNamesMap['default'] = `${name.firstNames || ''} ${
        name.familyName || ''
      }`.trim()
      return prevNamesMap
    }

    prevNamesMap[name.use] = `${name.firstNames || ''} ${
      name.familyName || ''
    }`.trim()
    prevNamesMap[name.use] =
      prevNamesMap[name.use] || prevNamesMap[getDefaultLanguage()]
    return prevNamesMap
  }, {})

export const extractCommentFragmentValue = (
  comments: GQLComment[],
  fragmentItem: string
): string => {
  let fragmentValue = ''

  for (const comment of comments) {
    if (comment.comment) {
      const commentFragments = comment.comment.split('&')
      for (const fragment of commentFragments) {
        if (fragment.includes(`${fragmentItem}=`)) {
          fragmentValue = fragment.replace(`${fragmentItem}=`, '')
          break
        }
      }
    }

    if (fragmentValue.length > 0) {
      break
    }
  }

  return fragmentValue
}

export const sentenceCase = (str: string): string =>
  str.replace(/\w\S*/g, (txt: string) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })

export const mergeArraysRemovingEmptyStrings = (
  strArrayA: string[],
  strArrayB: string[]
): string[] => {
  if (strArrayA.length !== strArrayB.length) {
    return strArrayA
  }
  const output = []
  for (let i = 0; i < strArrayA.length; i++) {
    if (strArrayA[i] === '') output.push(strArrayB[i])
    else output.push(strArrayA[i])
  }
  return output
}

export function getPercentage(total: number, current: number) {
  return current === 0 || total === 0 ? 0 : (current / total) * 100
}

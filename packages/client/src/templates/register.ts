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
export const certificateBaseTemplate = {
  definition: {
    pageMargins: [0, 0, 0, 0] as [number, number, number, number],
    defaultStyle: {
      font: 'notosans'
    },
    content: []
  },
  fonts: {
    en: {
      notosans: {
        normal: 'NotoSans-Light.ttf',
        bold: 'NotoSans-Regular.ttf',
        italics: 'NotoSans-Light.ttf',
        bolditalics: 'NotoSans-Regular.ttf'
      }
    }
  }
}

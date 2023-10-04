/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import {
  selectOrCreateDocRefResource,
  selectOrCreateCollectorPersonResource,
  selectOrCreateInformantSection,
  setInformantReference,
  getDownloadedExtensionStatus
} from './utils'
import {
  FATHER_TITLE,
  INFORMANT_TITLE,
  removeDuplicatesFromComposition
} from './templates'

import { clone, cloneDeep } from 'lodash'
import { DOWNLOADED_EXTENSION_URL } from './constants'
import {
  Bundle,
  Composition,
  FATHER_CODE,
  INFORMANT_CODE,
  Patient,
  RegistrationNumber,
  Task,
  TrackingID,
  URNReference
} from '..'

describe('Fhir util function testing', () => {
  describe('selectOrCreateDocRefResource()', () => {
    it('successfully creates a document entry even if section reference is wrong', () => {
      const mockFhirBundleCloned = clone(mockFhirBundle)
      // @ts-ignore
      mockFhirBundleCloned.entry[0].resource.section.push({
        title: 'Certificates',
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-sections',
              code: 'certificates'
            }
          ],
          text: 'Certificates'
        },
        entry: [
          {
            reference: 'urn:uuid:ab392b88-1861-44e8-b5b0-f6e0525b266ssw4'
          }
        ]
      })
      const documentRef = selectOrCreateDocRefResource(
        'certificates',
        'Certificates',
        mockFhirBundleCloned as Bundle,
        { _index: { certificates: 0 } },
        'certificates'
      )
      expect(documentRef).toBeDefined()
    })
  })
  describe('selectOrCreateCollectorPersonResource()', () => {
    it('returns a patientEntry', () => {
      const mockFhirBundleCloned = clone(mockFhirBundle)

      const patientEntry = selectOrCreateCollectorPersonResource(
        mockFhirBundleCloned,
        { _index: { certificates: 0 } },
        'BIRTH'
      )
      expect(patientEntry).toBeDefined()
    })
  })
  describe('removeDuplicatesFromComposition()', () => {
    it('should remove only specific duplicate entry', async () => {
      const mockCompositionCloned = clone(mockComposition)
      const composition = await removeDuplicatesFromComposition(
        // @ts-ignore
        mockCompositionCloned,
        '123',
        'abc'
      )
      expect(composition.relatesTo?.length).toEqual(1)
    })

    it('should remove all duplicates', async () => {
      const mockCompositionCloned = clone(mockComposition)
      const composition = await removeDuplicatesFromComposition(
        // @ts-ignore
        mockCompositionCloned,
        '123'
      )
      expect(composition.relatesTo?.length).toEqual(0)
    })
  })
  describe('setInformantReference()', () => {
    it('throws error if person entry is missing from the bundle', async () => {
      const mockFhirBundleCloned = cloneDeep(mockFhirBundle)
      mockFhirBundleCloned.entry[4].fullUrl = 'Invalid' as URNReference

      expect(() => {
        setInformantReference(
          FATHER_CODE,
          FATHER_TITLE,
          selectOrCreateInformantSection(
            INFORMANT_CODE,
            INFORMANT_TITLE,
            mockFhirBundleCloned as Bundle
          ),
          mockFhirBundleCloned as Bundle,
          { authHeader: 'token' }
        )
      }).toThrow(Error)
    })
  })

  describe('getDownloadedExtensionStatus()', () => {
    const task = {
      ...mockTask,
      extension: [
        {
          url: DOWNLOADED_EXTENSION_URL,
          valueString: 'test-value'
        }
      ]
    } as Task

    it('should return the status if the extension was found', () => {
      expect(getDownloadedExtensionStatus(task)).toBe('test-value')
    })

    it('should return undefined if the extension was not found', () => {
      expect(
        getDownloadedExtensionStatus({ ...task, extension: [] })
      ).toBeUndefined()
    })
  })
})

export const mockFhirBundle: Bundle<Composition | Task | Patient> = {
  resourceType: 'Bundle' as const,
  type: 'document' as const,
  entry: [
    {
      fullUrl: `urn:uuid:888` as URNReference,
      resource: {
        id: '111',
        identifier: {
          system: 'urn:ietf:rfc:3986' as URNReference,
          value: '0ab5e4cd-a49b-4bf3-b03a-08b2e65e642a'
        },
        resourceType: 'Composition',
        status: 'preliminary',
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-types',
              code: 'birth-declaration'
            }
          ],
          text: 'Birth Declaration'
        },
        class: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-classes',
              code: 'crvs-document'
            }
          ],
          text: 'CRVS Document'
        },
        subject: {},
        date: '2018-05-23T14:44:58+02:00',
        author: [],
        title: 'Birth Declaration',
        section: [
          {
            title: 'Child details',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'child-details'
                }
              ],
              text: 'Child details'
            },
            entry: [
              {
                reference:
                  'urn:uuid:ab392b88-1861-44e8-b5b0-f6e0525b2662  as URNReference'
              }
            ]
          },
          {
            title: "Mother's details",
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'mother-details'
                }
              ],
              text: "Mother's details"
            },
            entry: [
              {
                reference:
                  'urn:uuid:14fc828b-281c-4a2e-a9ef-44d4361fca57  as URNReference'
              }
            ]
          },
          {
            title: "Father's details",
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'father-details'
                }
              ],
              text: "Father's details"
            },
            entry: [
              {
                reference:
                  'urn:uuid:b9044443-c708-4977-b0e7-7e51ef0c9221  as URNReference'
              }
            ]
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:104ad8fd-e7b8-4e3e-8193-abc2c473f2c9' as URNReference,
      resource: {
        id: '222',
        resourceType: 'Task',
        status: 'ready',
        lastModified: '2018-05-23T14:44:58+02:00',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'DECLARED'
            }
          ]
        },
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'BIRTH'
            }
          ]
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/paper-form-id',
            value: '12345678'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'BDESC12' as TrackingID
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-registration-number',
            value: '12345678331' as RegistrationNumber
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:ab392b88-1861-44e8-b5b0-f6e0525b2662' as URNReference,
      resource: {
        id: '333',
        resourceType: 'Patient',
        name: [
          {
            family: ['অনিক'],
            given: ['অনিক'],
            use: 'bn'
          }
        ],
        gender: 'male'
      }
    },
    {
      fullUrl: 'urn:uuid:14fc828b-281c-4a2e-a9ef-44d4361fca57' as URNReference,
      resource: {
        id: '444',
        resourceType: 'Patient',
        name: [
          {
            use: 'en',
            given: ['Jane'],
            family: ['Doe']
          }
        ],
        gender: 'female',
        telecom: [
          {
            system: 'phone',
            value: '+8801622688231'
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:b9044443-c708-4977-b0e7-7e51ef0c9221' as URNReference,
      resource: {
        id: '555',
        resourceType: 'Patient',
        name: [
          {
            use: 'en',
            given: ['Jack'],
            family: ['Doe']
          }
        ],
        gender: 'male'
      }
    }
  ]
}
export const mockComposition = {
  identifier: {
    system: 'urn:ietf:rfc:3986',
    value: '{{urn_uuid}}'
  },
  resourceType: 'Composition',
  status: 'final', // 'final' when submitted | 'preliminary' when still a draft
  type: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/types',
        code: 'birth-registration'
      }
    ],
    text: 'Birth Registration'
  },
  class: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/classes',
        code: 'crvs-document'
      }
    ],
    text: 'CRVS Document'
  },
  subject: {
    reference: 'Patient/xyz' // A reference to the person being registered, by fullUrl
  },
  date: '{{logicalCompositionDate}}', // declaration date
  author: [
    {
      reference: 'Practitioner/xyz' // CHW that declared the event
    }
  ],
  title: 'Birth Registration',
  section: [
    {
      title: 'Child details',
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/sections',
            code: 'child-details'
          }
        ],
        text: 'Child details'
      },
      text: '',
      entry: [
        {
          reference: 'urn:uuid:xxx' // reference to a Patient resource contained below, by fullUrl
        },
        {
          reference: 'urn:uuid:xxx' // reference to a Patient resource contained below, by fullUrl
        }
      ]
    },

    {
      title: "Mother's details",
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/sections',
            code: 'mother-details'
          }
        ],
        text: "Mother's details"
      },
      text: '',
      entry: [
        {
          reference: 'urn:uuid:xxx' // reference to a Patient resource contained below, by fullUrl
        }
      ]
    },

    {
      title: "Father's details",
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/sections',
            code: 'father-details'
          }
        ],
        text: "Father's details"
      },
      text: '',
      entry: [
        {
          reference: 'urn:uuid:xxx' // reference to a Patient resource contained below, by fullUrl
        }
      ]
    },

    {
      title: "Informant's details",
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/sections',
            code: 'informant-details'
          }
        ],
        text: "Informant's details"
      },
      text: '',
      entry: [
        {
          reference: 'urn:uuid:xxx' // reference to a Patient resource contained below, by fullUrl
        }
      ]
    },

    {
      title: 'Birth Encounter',
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/sections',
            code: 'birth-encounter'
          }
        ],
        text: 'Birth encounter'
      },
      text: '',
      entry: [
        {
          reference: 'urn:uuid:xxx' // reference to Encounter resource contained below
        }
      ]
    },

    {
      title: 'Supporting documents',
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/sections',
            code: 'supporting-documents'
          }
        ],
        text: 'Supporting documents'
      },
      text: '',
      entry: [
        {
          reference: 'DocumentReference/xxx' // reference to a DocumentReference resource contained below
        },
        {
          reference: 'DocumentReference/yyy' // reference to a DocumentReference resource contained below
        },
        {
          reference: 'DocumentReference/zzz' // reference to a DocumentReference resource contained below
        }
      ]
    },

    {
      title: "Primary caregiver's details",
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/doc-sections',
            code: 'primary-caregiver-details'
          }
        ],
        text: "Primary caregiver's details"
      },
      entry: [
        {
          reference: 'urn:uuid:xxx' // reference to a Patient resource contained below, by fullUrl
        }
      ]
    }
  ],
  id: '123',
  relatesTo: [
    {
      code: 'duplicate',
      targetReference: {
        reference: 'Composition/xyz'
      }
    },
    {
      code: 'duplicate',
      targetReference: {
        reference: 'Composition/abc'
      }
    }
  ]
}

export const mockTask = {
  resourceType: 'Task',
  status: 'ready',
  intent: '',
  identifier: [
    {
      system: 'http://opencrvs.org/specs/id/birth-tracking-id',
      value: '123'
    },
    {
      system: 'http://opencrvs.org/specs/id/birth-registration-number',
      value: '123'
    },
    { system: 'http://opencrvs.org/specs/id/paper-form-id', value: '123' },
    { system: 'http://opencrvs.org/specs/id/paper-form-page', value: '123' },
    { system: 'http://opencrvs.org/specs/id/paper-form-book', value: '123' }
  ],
  businessStatus: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/reg-status',
        code: 'DECLARED | VERIFIED | REGISTERED | CERTIFIED'
      }
    ]
  },
  code: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/types',
        code: 'BIRTH'
      }
    ]
  },
  focus: {
    reference: 'Composition/123' // the composition encompassing this registration
  },
  authoredOn: '2016-10-31T08:25:05+10:00',
  lastModified: '2016-10-31T09:45:05+10:00',
  note: [
    {
      authorString: 'Practitioner/12121212',
      text: 'Comment',
      time: '2016-10-31T09:45:05+10:00'
    }
  ],
  extension: [
    {
      url: 'http://opencrvs.org/specs/extension/regLastUser',
      valueReference: { reference: 'Practitioner/123' }
    },
    {
      url: 'http://opencrvs.org/specs/extension/regLastLocation',
      valueReference: { reference: 'Location/123' }
    },
    {
      url: 'http://opencrvs.org/specs/extension/regLastOffice',
      valueReference: {
        reference: 'Location/43ac3486-7df1-4bd9-9b5e-728054ccd6ba'
      }
    },
    {
      url: 'http://opencrvs.org/specs/extension/contact-person',
      valueString: 'MOTHER'
    },
    {
      url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
      valueString: '01733333333'
    }
  ],
  meta: {
    versionId: '123'
  }
}

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
import * as Joi from 'joi'
import {
  getAllDocumentsHandler,
  getStatusWiseRegistrationCountHandler,
  advancedRecordSearch,
  searchAssignment,
  searchForBirthDeDuplication,
  searchForDeathDeDuplication
} from '@search/features/search/handler'
import { deduplicateHandler } from '@search/features/registration/deduplicate/handler'
import {
  assignEventHandler,
  unassignEventHandler
} from '@search/features/registration/assignment/handler'
import { deleteOCRVSIndexHandler } from '@search/features/delete/handler'
import { recordHandler } from '@search/features/registration/record/handler'
import { getRecordByIdHandler } from '@search/features/records/handler'

export const enum RouteScope {
  DECLARE = 'declare',
  VALIDATE = 'validate',
  REGISTER = 'register',
  SYSADMIN = 'sysadmin',
  CERTIFY = 'certify',
  NATLSYSADMIN = 'natlsysadmin',
  PERFORMANCE = 'performance',
  RECORD_SEARCH = 'recordsearch'
}

export const getRoutes = () => {
  const routes = [
    // used for tests to check JWT auth
    {
      method: 'GET',
      path: '/tokenTest',
      handler: (request: any, h: any) => {
        return 'success'
      },
      config: {
        tags: ['api']
      }
    },
    // add ping route by default for health check
    {
      method: 'GET',
      path: '/ping',
      handler: (request: any, h: any) => {
        // Perform any health checks and return true or false for success prop
        return {
          success: true
        }
      },
      config: {
        auth: false,
        tags: ['api'],
        description: 'Health check endpoint'
      }
    },
    {
      method: 'POST',
      path: '/search/assignment',
      handler: searchAssignment,
      config: {
        tags: ['api'],
        auth: {
          scope: [RouteScope.DECLARE, RouteScope.VALIDATE, RouteScope.REGISTER]
        },
        description: 'Handles searching declaration assignment'
      }
    },
    {
      method: 'GET',
      path: '/records/{recordId}',
      handler: getRecordByIdHandler,
      config: {
        tags: ['api'],
        auth: false,
        description: 'Fetch all FHIR entities concerning a record'
      }
    },
    {
      method: 'POST',
      path: '/record',
      handler: recordHandler,
      config: {
        tags: ['api'],
        description: 'Handles indexing a new or existing record'
      }
    },
    {
      method: 'POST',
      path: '/events/birth/{eventType}',
      handler: recordHandler,
      config: {
        tags: ['api'],
        description:
          'Handles indexing a new declaration and searching for duplicates or updating an existing declaration'
      }
    },
    {
      method: 'POST',
      path: '/events/death/{eventType}',
      handler: recordHandler,
      config: {
        tags: ['api'],
        description:
          'Handles indexing a new declaration or updating an existing declaration'
      }
    },
    {
      method: 'POST',
      path: '/events/marriage/{eventType}',
      handler: recordHandler,
      config: {
        tags: ['api'],
        description:
          'Handles indexing a new declaration or updating an existing declaration'
      }
    },
    {
      method: 'POST',
      path: '/events/not-duplicate',
      handler: deduplicateHandler,
      config: {
        tags: ['api'],
        description: 'Marks the declaration as not a duplicate'
      }
    },
    {
      method: 'POST',
      path: '/events/assigned',
      handler: assignEventHandler,
      config: {
        tags: ['api'],
        description:
          'Handles indexing a new declaration or updating an existing declaration'
      }
    },
    {
      method: 'POST',
      path: '/events/unassigned',
      handler: unassignEventHandler,
      config: {
        tags: ['api'],
        description:
          'Handles indexing a new declaration or updating an existing declaration'
      }
    },
    {
      method: 'POST',
      path: '/search/all',
      handler: getAllDocumentsHandler,
      config: {
        tags: ['api'],
        auth: {
          scope: [
            RouteScope.DECLARE,
            RouteScope.VALIDATE,
            RouteScope.REGISTER,
            RouteScope.SYSADMIN
          ]
        },
        description: 'Returns all the documents in the index'
      }
    },
    {
      method: 'POST',
      path: '/statusWiseRegistrationCount',
      handler: getStatusWiseRegistrationCountHandler,
      config: {
        tags: ['api'],
        auth: {
          scope: [
            RouteScope.DECLARE,
            RouteScope.VALIDATE,
            RouteScope.REGISTER,
            RouteScope.SYSADMIN,
            RouteScope.PERFORMANCE
          ]
        },
        validate: {
          payload: Joi.object({
            declarationJurisdictionId: Joi.string(),
            status: Joi.array().required(),
            event: Joi.string()
          })
        },
        description: 'Returns all the documents in the index'
      }
    },
    {
      method: 'POST',
      path: '/advancedRecordSearch',
      handler: advancedRecordSearch,
      config: {
        tags: ['api'],
        auth: {
          scope: [
            RouteScope.RECORD_SEARCH,
            RouteScope.DECLARE,
            RouteScope.VALIDATE,
            RouteScope.REGISTER,
            RouteScope.SYSADMIN
          ]
        },
        description:
          'Populates hierarchical location ids for the legacy indexes'
      }
    },
    {
      method: 'DELETE',
      path: '/elasticIndex',
      handler: deleteOCRVSIndexHandler,
      config: {
        tags: ['api'],
        auth: {
          scope: [RouteScope.NATLSYSADMIN]
        },
        description: 'Delete ocrvs index from elasticsearch'
      }
    },
    {
      method: 'POST',
      path: '/search/duplicates/birth',
      handler: searchForBirthDeDuplication,
      config: {
        tags: ['api'],
        auth: {
          scope: [
            RouteScope.DECLARE,
            RouteScope.VALIDATE,
            RouteScope.REGISTER,
            RouteScope.SYSADMIN
          ]
        },
        description: 'Handles searching from declarations'
      }
    },
    {
      method: 'POST',
      path: '/search/duplicates/death',
      handler: searchForDeathDeDuplication,
      config: {
        tags: ['api'],
        auth: {
          scope: [
            RouteScope.DECLARE,
            RouteScope.VALIDATE,
            RouteScope.REGISTER,
            RouteScope.SYSADMIN
          ]
        },
        description: 'Handle searching from death declarations'
      }
    }
  ]
  return routes
}

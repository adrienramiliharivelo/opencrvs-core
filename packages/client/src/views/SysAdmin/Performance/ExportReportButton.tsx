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
import { Box, ISearchLocation, Link } from '@client/../../components/lib'
import { userMessages } from '@client/i18n/messages'
import styled from '@client/styledComponents'
import { Toast } from '@opencrvs/components/lib/Toast'
import * as React from 'react'
import { FileText } from 'react-feather'
import {
  FormattedMessage,
  injectIntl,
  WrappedComponentProps as IntlShapeProps
} from 'react-intl'
import { ExportReportModal } from './ExportReportModal'
import { Event } from '@client/utils/gateway'

const ButtonIcon = styled(FileText)`
  position: relative;
  top: 3px;
  margin-right: 5px;
`

export type IExportReportFilters = {
  selectedLocation: ISearchLocation
  event: Event
  timeStart: Date
  timeEnd: Date
  officeSelected: boolean
} & IntlShapeProps

type State = {
  showModal: boolean
  showSuccessNotification: boolean
}

class ExportReportButtonComp extends React.Component<
  IExportReportFilters,
  State
> {
  constructor(props: IExportReportFilters) {
    super(props)
    this.state = {
      showModal: false,
      showSuccessNotification: false
    }
  }

  toggleReportExportModal = () => {
    this.setState({
      showModal: !this.state.showModal
    })
  }

  toggleSuccessNotification = () => {
    this.setState({
      showSuccessNotification: !this.state.showSuccessNotification
    })
  }

  handleSuccess = () => {
    this.toggleReportExportModal()
    this.toggleSuccessNotification()
  }

  render() {
    return (
      <>
        <Box>
          {/* How do I set this colour and font weight correctly? */}
          <ButtonIcon size={18} fontWeight="bold" color="#4972BB" />
          <Link font="bold14" onClick={this.toggleReportExportModal}>
            Export report
          </Link>
        </Box>
        <ExportReportModal
          show={this.state.showModal}
          onClose={this.toggleReportExportModal}
          onSuccess={this.handleSuccess}
          filterState={this.props}
        />
        {/* DO WE NEED A SUCCESS TOAST? */}
        {this.state.showSuccessNotification && (
          <Toast type="success" onClose={this.toggleSuccessNotification}>
            <FormattedMessage {...userMessages.phoneNumberUpdated} />
          </Toast>
        )}
      </>
    )
  }
}

export const ExportReportButton = injectIntl<'intl', IExportReportFilters>(
  ExportReportButtonComp
)

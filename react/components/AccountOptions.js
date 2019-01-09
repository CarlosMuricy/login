import React, { Component } from 'react'
import { injectIntl, intlShape } from 'react-intl'
import { Link } from 'render'

import { Button } from 'vtex.styleguide'
import { AuthService } from 'vtex.auth'

import { translate } from '../utils/translate'


// Component that shows account options to the user.
class AccountOptions extends Component {
  static propTypes = {
    /** Intl object*/
    intl: intlShape,
  }

  render() {
    const { intl } = this.props
    return (
      <div className="vtex-login__account-options items-center w-100">
        <div className="ma4 min-h-2 b--muted-4">
          <Link page={'store.account'}>
            <button
              className="vtex-button bw1 ba t-action ttu br2 t-action--small v-mid relative pv3 ph5 t-heading-5 bg-base b--transparent c-action-primary  hover-c-action-primary pointer"
              closeonclick=""
            >
              <span className="t-action--small">
                {translate('login.myAccount', intl)}
              </span>
            </button>
          </Link>
        </div>
        <hr className="mv2 o-30" />
        <div className="ma4 min-h-2 b--muted-4">
          <AuthService.RedirectLogout returnUrl="/">
            {({ action: logout }) => (
              <Button
                variation="tertiary"
                size="small"
                onClick={logout}
              >
                <span className="t-action--small">
                  {translate('login.logoutLabel', intl)}
                </span>
              </Button>
            )}
          </AuthService.RedirectLogout>
        </div>
      </div>
    )
  }
}

export default injectIntl(AccountOptions)

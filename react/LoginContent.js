import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { injectIntl } from 'react-intl'

import LoginOptions from './components/LoginOptions'
import EmailVerification from './components/EmailVerification'
import EmailAndPassword from './components/EmailAndPassword'
import CodeConfirmation from './components/CodeConfirmation'
import AccountOptions from './components/AccountOptions'
import RecoveryPassword from './components/RecoveryPassword'
import { steps } from './utils/steps'
import { setCookie } from './utils/set-cookie'

import './global.css'

const STEPS = [
  /* eslint-disable react/display-name, react/prop-types */
  (props, state, func, isOptionsMenuDisplayed) => (
    <EmailVerification
      next={steps.CODE_CONFIRMATION}
      previous={steps.LOGIN_OPTIONS}
      isCreatePassword={state.isCreatePassword}
      title={props.accessCodeTitle}
      email={state.email}
      onStateChange={func}
      showBackButton={!isOptionsMenuDisplayed}
    />
  ),
  (props, state, func, isOptionsMenuDisplayed) => (
    <EmailAndPassword
      next={steps.ACCOUNT_OPTIONS}
      previous={steps.LOGIN_OPTIONS}
      title={props.emailAndPasswordTitle}
      email={state.email}
      password={state.password}
      onStateChange={func}
      showBackButton={!isOptionsMenuDisplayed}
      loginCallback={props.loginCallback}
    />
  ),
  (props, state, func) => (
    <CodeConfirmation
      next={steps.ACCOUNT_OPTIONS}
      previous={steps.EMAIL_VERIFICATION}
      email={state.email}
      code={state.code}
      onStateChange={func}
      loginCallback={props.loginCallback}
    />
  ),
  () => (
    <AccountOptions />
  ),
  (props, state, func) => (
    <RecoveryPassword
      next={steps.ACCOUNT_OPTIONS}
      previous={steps.EMAIL_PASSWORD}
      email={state.email}
      onStateChange={func}
      loginCallback={props.loginCallback}
    />
  ),
  /* eslint-enable react/display-name react/prop-types */
]

class LoginContent extends Component {
  static propTypes = {
    /** User profile information */
    profile: PropTypes.shape({}),
    /** Which screen option will renderize  */
    isInitialScreenOptionOnly: PropTypes.bool,
    /** Step that will be render first */
    defaultOption: PropTypes.number,
    /** Title of login options */
    optionsTitle: PropTypes.string,
    /** Title of classic login */
    emailAndPasswordTitle: PropTypes.string,
    /** Title of access code login */
    accessCodeTitle: PropTypes.string,
    /** Function called after login success */
    loginCallback: PropTypes.func,
  }

  static defaultProps = {
    isInitialScreenOptionOnly: true,
    defaultOption: 0
  }

  state = {
    isOnInitialScreen: !this.props.profile,
    isCreatePassword: false,
    step: this.props.defaultOption,
    email: '',
    password: '',
    code: '',
  }

  componentDidMount() {
    if (location.href.indexOf('accountAuthCookieName') > 0) {
      setCookie(location.href)
    }
  }

  get shouldRenderLoginOptions() {
    return this.props.isInitialScreenOptionOnly ? this.state.isOnInitialScreen : true
  }

  get shouldRenderForm() {
    if (this.props.profile) {
      return true
    }

    return !this.props.isInitialScreenOptionOnly || !this.state.isOnInitialScreen
  }

  handleUpdateState = state => {
    if (state.hasOwnProperty('step') && state.step === -1) {
      state.step = 0
      state.isOnInitialScreen = true
    }

    this.setState({ ...state })
  }

  handleOptionsClick = option => {
    let nextStep

    if (option === 'loginOptions.emailVerification') {
      nextStep = 0
    } else if (option === 'loginOptions.emailAndPassword') {
      nextStep = 1
    }

    this.setState({
      step: nextStep,
      isOnInitialScreen: false,
      isCreatePassword: false,
    })
  }

  /**
   * Action after login success. If loginCallback isn't
   * a prop, it will call a root page redirect as default.
  */
  onLoginSuccess = () => {
    const { loginCallback } = this.props
    return loginCallback || location.replace('/')
  }

  render() {
    const { profile, isInitialScreenOptionOnly, optionsTitle, defaultOption } = this.props
    const { isOnInitialScreen } = this.state

    let step = this.state.step
    if (profile) {
      step = steps.ACCOUNT_OPTIONS
    } else if (isOnInitialScreen) {
      step = defaultOption
    }

    const render = STEPS[step](
      {
        loginCallback: this.onLoginSuccess,
        ...this.props,
      },
      this.state,
      this.handleUpdateState,
      this.shouldRenderLoginOptions
    )

    const className = classNames('vtex-login-content flex relative bg-white justify-around', {
      'vtex-login-content--initial-screen': this.state.isOnInitialScreen,
      'vtex-login-content--always-with-options flex-column-reverse items-center flex-row-ns items-baseline-ns':
        !isInitialScreenOptionOnly,
      'items-baseline': isInitialScreenOptionOnly,
    })

    const formClassName = classNames('vtex-login-content__form dn', {
      [`vtex-login-content__form--step-${step}`]: step >= 0,
      'vtex-login-content__form--visible db': this.shouldRenderForm,
    })

    return (
      <div className={className}>
        {!profile && this.shouldRenderLoginOptions && (
          <LoginOptions
            page="login-options"
            fallbackTitle="loginOptions.title"
            title={optionsTitle}
            options={['loginOptions.emailVerification', 'loginOptions.emailAndPassword']}
            currentStep={step === 0 ? 'loginOptions.emailVerification' : 'loginOptions.emailAndPassword'}
            isAlwaysShown={!isInitialScreenOptionOnly}
            onOptionsClick={this.handleOptionsClick}
          />
        )}
        <div className={formClassName}>
          {this.shouldRenderForm && render}
        </div>
      </div>
    )
  }
}

const LoginWithIntl = injectIntl(LoginContent)

LoginWithIntl.schema = {
  title: 'editor.login.title',
  type: 'object',
  properties: {
    isInitialScreenOptionOnly: {
      title: 'editor.login.isInitialScreenOptionOnly.title',
      type: 'boolean',
      default: true,
      isLayout: true,
    },
    defaultOption: {
      title: 'editor.login.defaultOption.title',
      type: 'number',
      default: 0,
      enum: [0, 1],
      enumNames: [
        'editor.login.defaultOption.token',
        'editor.login.defaultOption.emailAndPassword',
      ],
      widget: {
        'ui:widget': 'radio',
        'ui:options': {
          inline: true,
        },
      },
    },
    optionsTitle: {
      title: 'editor.login.optionsTitle.title',
      type: 'string',
    },
    emailAndPasswordTitle: {
      title: 'editor.login.emailAndPasswordTitle.title',
      type: 'string',
    },
    accessCodeTitle: {
      title: 'editor.login.accessCodeTitle.title',
      type: 'string',
    },
  },
}

export default LoginWithIntl


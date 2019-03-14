import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl, intlShape } from 'react-intl'
import { isMobile } from 'react-device-detect'

import { Input } from 'vtex.styleguide'
import { IconEyeSight } from 'vtex.store-icons'

import { translate } from '../utils/translate'
import Tooltip from './Tooltip'
import PasswordValidationContent from './PasswordValidationContent'

class PasswordInput extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showVerification: false,
      showPassword: false,
    }
    this.timeout = 0
  }

  handleEyeIcon = () =>
    this.setState({ showPassword: !this.state.showPassword })

  handlePasswordChange = event => {
    const lowerCaseLetters = /[a-z]/g
    const upperCaseLetters = /[A-Z]/g
    const numbers = /[0-9]/g

    const value = event.target.value

    if (this.timeout) {
      clearTimeout(this.timeout)
    }

    this.timeout = setTimeout(() => {
      this.setState({
        containsLowerLetter:
          value.length > 0 ? value.match(lowerCaseLetters) : undefined,
        containsUpperLetter:
          value.length > 0 ? value.match(upperCaseLetters) : undefined,
        containsNumber: value.length > 0 ? value.match(numbers) : undefined,
        atLeastEightCharacteres:
          value.length > 0 ? value.length >= 8 : undefined,
      })
    }, 200)

    this.props.onStateChange({ password: value })
  }

  render() {
    const {
      showVerification,
      containsLowerLetter,
      containsUpperLetter,
      containsNumber,
      atLeastEightCharacteres,
      showPassword,
    } = this.state

    const { intl, password, showPasswordVerificationIntoTooltip } = this.props

    const fields = [
      {
        id: 0,
        prefix: 'ABC',
        label: translate('login.password.uppercaseLetter', intl),
        valid: containsUpperLetter,
      },
      {
        id: 1,
        prefix: 'abc',
        label: translate('login.password.lowercaseLetter', intl),
        valid: containsLowerLetter,
      },
      {
        id: 2,
        prefix: '123',
        label: translate('login.password.number', intl),
        valid: containsNumber,
      },
      {
        id: 3,
        prefix: '***',
        label: translate('login.password.eightCharacteres', intl),
        valid: atLeastEightCharacteres,
      },
    ]

    return (
      <div className="relative">
        <Input
          type={`${showPassword ? 'text' : 'password'}`}
          value={password}
          onChange={this.handlePasswordChange}
          placeholder={
            this.props.placeholder ||
            translate('login.password.placeholder', intl)
          }
          onBlur={() => this.setState({ showVerification: false })}
          onFocus={() => this.setState({ showVerification: true })}
          suffixIcon={
            <span className="pointer" onClick={this.handleEyeIcon}>
              <IconEyeSight
                type="filled"
                state={showPassword ? 'off' : 'on'}
                size={16}
              />
            </span>
          }
        />
        {showVerification &&
          (!showPasswordVerificationIntoTooltip ? (
            <div className="pa2">
              <PasswordValidationContent fields={fields} />
            </div>
          ) : isMobile ? (
            <Tooltip
              top
              title={translate('login.password.tooltip.title', intl)}
            >
              <PasswordValidationContent fields={fields} />
            </Tooltip>
          ) : (
            <Tooltip title={translate('login.password.tooltip.title', intl)}>
              <PasswordValidationContent fields={fields} />
            </Tooltip>
          ))}
      </div>
    )
  }
}

PasswordInput.propTypes = {
  /** Password set on state */
  password: PropTypes.string.isRequired,
  /** Placeholder to appear into the input */
  placeholder: PropTypes.string.isRequired,
  /** Set the type of password verification ui */
  showPasswordVerificationIntoTooltip: PropTypes.bool,
  /** Function to change de active tab */
  onStateChange: PropTypes.func.isRequired,
  /** Intl object*/
  intl: intlShape,
}

export default injectIntl(PasswordInput)

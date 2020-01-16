import React, { useState } from 'react'
import axios from 'axios'

import { toast } from 'react-toastify'

const Register = ({ toggleRegistration, toggleLogin }) => {

  const notify = () => toast('Registered!' , {
    progressClassName: 'toast-progress'
  })

  const [register, setRegister] = useState({
    data: {
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      dexterity: 'RH',
      password: '',
      password_confirmation: ''
    },
    errors: {}
  })

  const handleChange = (e) => {
    const data = { ...register.data, [e.target.name]: e.target.value }
    // const errors = ''
    const errors = { ...register.errors, [e.target.name]: '' }
    setRegister({ data, errors })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // axios.post('/api/register', register.data)
    axios.post('/api/register', register.data, { headers: { 'Authorization': '' } })
      .then(() => {
        notify()
        toggleRegistration()
        toggleLogin()
      })
      .catch(err => {
        setRegister({ ...register, errors: err.response.data })
        // console.log('form data!', register.data)
        // console.log('error data!', err.response.data)
      })
  }


  return <>
    <div className='container has-text-centered'>
      <div className='columns'>
        <div className='column'>
          <form className='form has-text-centered' onSubmit={handleSubmit}>

            <div className='field'>
              <div className='control has-icons-left has-icons-right'>
                <input
                  onChange={handleChange}
                  type='text'
                  name='username'
                  className='input has-text-info'
                  placeholder='Username'
                />
                <span className='icon is-small is-left'>
                  <i className='fas fa-user'></i>
                </span>
                {/* <span className='icon is-small is-right'>
                  <i className='fas fa-check'></i>
                </span> */}
              </div>
              {register.errors.username && <small className='help is-danger'>
                {register.errors.username[0]}
              </small>}
              {/* can we implement this somehow? */}
              {/* <p className='help is-success'>This username is available</p> */}
            </div>

            <div className='field'>
              <p className='control has-icons-left'>
                <input
                  onChange={handleChange}
                  className='input has-text-info'
                  type='text'
                  name='first_name'
                  placeholder='First name'
                />
                <span className='icon is-small is-left'>
                  <i className='fas fa-id-card'></i>
                </span>
              </p>
              {register.errors.first_name && <small className='help is-danger'>
                {register.errors.first_name[0]}
              </small>}
            </div>

            <div className='field'>
              <p className='control has-icons-left'>
                <input
                  onChange={handleChange}
                  className='input has-text-info'
                  type='text'
                  name='last_name'
                  placeholder='Last name'
                />
                <span className='icon is-small is-left'>
                  <i className='fas fa-id-card'></i>
                </span>
              </p>
              {register.errors.last_name && <small className='help is-danger'>
                {register.errors.last_name[0]}
              </small>}
            </div>

            <div className='field'>
              <div className='control has-icons-left has-icons-right'>
                <input
                  onChange={handleChange}
                  className='input has-text-info'
                  name='email'
                  type='email'
                  placeholder='Email'
                />
                <span className='icon is-small is-left'>
                  <i className='fas fa-envelope'></i>
                </span>
                {/* <span className='icon is-small is-right'>
                  <i className='fas fa-exclamation-triangle'></i>
                </span> */}
              </div>
              {register.errors.email && <small className='help is-danger'>
                {register.errors.email[0]}
              </small>}
            </div>

            <div className='field'>
              <div className='control'>
                <p className='control has-icons-left'>
                  <input
                    onChange={handleChange}
                    className='input has-text-info'
                    type='password'
                    name='password'
                    placeholder='Password'
                  />
                  <span className='icon is-small is-left'>
                    <i className='fas fa-lock'></i>
                  </span>
                </p>
              </div>
              {register.errors.password && <small className='help is-danger'>
                {register.errors.password[0]}
              </small>}
            </div>

            <div className='field'>
              <div className='control'>
                <p className='control has-icons-left'>
                  <input
                    onChange={handleChange}
                    className='input has-text-info'
                    type='password'
                    name='password_confirmation'
                    placeholder='Password confirmation'
                  />
                  <span className='icon is-small is-left'>
                    <i className='fas fa-lock'></i>
                  </span>
                </p>
              </div>
              {register.errors.password_confirmation && <small className='help is-danger'>
                {register.errors.password_confirmation[0]}
              </small>}
            </div>

            <div className="field">
              <div className="control">
                <div className='control has-icons-left'>
                  <div className='select'>
                    <select
                      onChange={handleChange}
                      value={register.data.dexterity}
                      name='dexterity'>
                      <option value='RH'>Right-handed operation</option>
                      <option value='LH'>Left-handed operation</option>
                    </select>
                  </div>
                  <span className="icon is-small is-left">
                    <i className='fas fa-gamepad'></i>
                  </span>
                </div>
              </div>
            </div>

            <button className='button is-link'>
              Register
            </button>
          </form>
        </div>
      </div>
    </div>

  </>
}

export default Register
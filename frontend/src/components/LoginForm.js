import React, { useState, useContext } from 'react'
import axios from 'axios'
import Auth from '../lib/Auth'

import { toast } from 'react-toastify'
import UserContext from './UserContext'

const Login = ({ props }) => {
  // const [message, setMessage] = useState('')

  const notify = (message) => toast(`${message}` ,{
    progressClassName: 'toast-progress'
  })
  
  const [login, setLogin] = useState({
    data: {
      email: '',
      password: ''
    },
    errors: ''
  })
  const [userLogin, setUserLogin] = useState(UserContext)

  const handleChange = (e) => {
    const data = { ...login.data, [e.target.name]: e.target.value }
    const errors = ''
    setLogin({ data, errors })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // axios.post('/api/login', login.data)
    axios.post('/api/login', login.data, { headers: { 'Authorization': '' } })
      .then(resp => {
        Auth.setToken(resp.data.token)
        notify(resp.data.message)
        props.history.push(`/profile/${Auth.getUserId()}`)
        setUserLogin(resp.data)
      })
      .catch(() => {
        setLogin({ errors: 'Email or password incorrect' })
        // console.log(err.response.data)
      })
  }

  return <>
    <div className='container'>
      <div className='columns'>
        <div className='column has-text-centered'>
          <form className='form' onSubmit={handleSubmit}>

            <div className='field'>
              <p className='control has-icons-left has-icons-right'>
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
              </p>
            </div>
            <div className='field'>
              <p className='control has-icons-left'>
                <input
                  onChange={handleChange}
                  name='password'
                  className='input has-text-info'
                  type='password'
                  placeholder='Password'
                />
                <span className='icon is-small is-left'>
                  <i className='fas fa-lock'></i>
                </span>
              </p>
            </div>
            {login.errors && <small className='help is-danger'>
              {login.errors}
            </small>}
            <button className='button is-link'>
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  </>
}

export default Login
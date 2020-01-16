import React, { useState, useEffect, useMemo } from 'react'
import ReactDOM from 'react-dom'
import { HashRouter, Switch, Route, Link, withRouter, Redirect } from 'react-router-dom'
import SecureRoute from './lib/SecureRoute'

import 'bulma'
import './styles/main.scss'

import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Profile from './components/Profile'
import CitySelection from './components/CitySelection'
import Groups from './components/Groups'
import IndividualGroup from './components/IndividualGroup'
import WorldMap from './components/Worldmap'
import SearchBar from './components/SearchBar'
import MapPage from './components/MapPage'
import UserContext from './components/UserContext'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

toast.configure({
  autoClose: 8000,
  draggable: false
})

const App = () => {
  const [userLogin, setUserLogin] = useState(null)
  const loginInfo = useMemo(() => ({ userLogin, setUserLogin }), [userLogin, setUserLogin])
  const [searchModal, setSearchModal] = useState(false)

  const toggleSearch = () => {
    setSearchModal(!searchModal)
  }

  useEffect(() => {
    const listener = e => {
      if (e.key === 'Escape') {
        setSearchModal(false)
      }
    }
    window.addEventListener('keydown', listener)
  }, [])

  return <HashRouter>
    <UserContext.Provider
      value={loginInfo}>
      <Navbar toggleSearch={toggleSearch} />
      <Switch>
        <Redirect from='/reroute/:id' to='/profile/:id' />
        <Route exact path="/" component={Hero} />
        <SecureRoute exact path="/profile/:id" component={Profile} />
        <SecureRoute exact path="/city_selection" component={CitySelection} />
        <SecureRoute exact path="/groups" component={Groups} />
        <SecureRoute exact path="/groups/:id" component={IndividualGroup} />
        <SecureRoute exact path="/world_map" component={WorldMap} />
        <SecureRoute exact path="/SearchBar" component={SearchBar} />
        <SecureRoute exact path="/map" component={MapPage} />
      </Switch>
      <div id="searchbar" className={searchModal === true ? 'modal is-active' : 'modal'}>
        <div className="modal-background" onClick={toggleSearch}></div>
        <div className="modal-content modal-stats">
          <SearchBar toggleSearch={toggleSearch} limitSearch={searchModal}/>
        </div>
        <button className="modal-close is-large" aria-label="close" onClick={toggleSearch}></button>
      </div>
    </UserContext.Provider>
  </HashRouter >
}









ReactDOM.render(
  <App />,
  document.getElementById('root')
)


import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MapGL, { Marker, Popup } from 'react-map-gl'
import ReactFilestack from 'filestack-react'
// import { fileloaderKey } from '../config/environment'
import axios from 'axios'
import Auth from '../lib/Auth'
import { toast } from 'react-toastify'

import Mask from '../images/mask-dark-gradient.png'
import GroupForm from './GroupForm'
import GroupMembers from './GroupMembers'

require('dotenv').config()
const fileloaderKey = process.env.FS_KEY

// this is a public key but maybe change to different key and put in .env?
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ2VvcmdwIiwiYSI6ImNrMzM1bnN0azBuY2IzZnBiZ3d2eDA5dGQifQ.Ym1lHqYUfUUu2m897J4hcg' // Set your mapbox token here

// options for ReactFilestack
const options = {
  accept: 'image/*',
  transformations: {
    crop: true,
    circle: true,
    rotate: true
  }
}

/*
MAKE GROUPS PROFILE PAGE BASED ON LAYOUT OF INDIVIDUAL USER PROFILE

ADDITIONAL CONSIDERATIONS:
- for owners of the group, need to list out all the users who sent requests and provide option to approve
- for owners of the group, ened to provide option to edit and delete the group
*/

const IndividualGroup = (props) => {

  const notify = (message) => toast(message)

  // all the data
  const [members, setMembers] = useState([])
  const [group, setGroup] = useState({})
  const [towns, setTowns] = useState([])

  const [errors, setErrors] = useState('')

  // user status
  const [status, setStatus] = useState('')

  // states for stats modals
  const [continentModal, setContinentModal] = useState(false)
  const [countryModal, setCountryModal] = useState(false)
  const [cityModal, setCityModal] = useState(false)

  // buttons
  const [settingModal, setSettingModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [membershipModal, setMembershipModal] = useState(false)

  // scroll position
  const [scroll, setScroll] = useState(0)

  // info editing
  const [editableData, setEditableData] = useState({
    name: '',
    description: ''
  })


  // info from api get request will be stored here
  const [profile, setProfile] = useState({
    towns: [],
    badges: []
  })

  // TO DO write code to zoom to bounding box containing all places user has been to
  const [viewport, setViewport] = useState({
    latitude: 51.5,
    longitude: 0.13,
    zoom: 4,
    bearing: 0,
    pitch: 0
  })

  // marker popup
  const [showPopup, setShowPopup] = useState(false)

  // marker popup content
  const [popupInfo, setPopupInfo] = useState({
    latitude: 0,
    longitude: 0,
    message: ''
  })

  const closePopup = () => {
    setShowPopup(false)
  }

  const showMarkerInfo = (e) => {
    const cityId = parseInt(e.target.id)
    // console.log(cityId)
    const citySelected = towns.filter((elem) => {
      return elem.id === cityId
    })[0]
    const users = citySelected.members.map((member) => {
      return member.first_name
    }).join(', ').replace(/,(?=[^,]*$)/, ' and')
    const multipleUsers = ' have been to '
    const singleUserStart = 'Only '
    const singleUserEnd = ' has been to '
    let addGrammar
    if (citySelected.members.length <= 1) {
      addGrammar = singleUserStart.concat(users, singleUserEnd)
    } else {
      addGrammar = users.concat(multipleUsers)
    }
    const formattedOutput = addGrammar.concat(citySelected.name)
    setPopupInfo({
      latitude: parseFloat(citySelected.lat.replace(',', '.')),
      longitude: parseFloat(citySelected.lng.replace(',', '.')),
      message: formattedOutput
    })
    setShowPopup(true)
  }

  // a lot of pain to get to work but probably not even worth it - would make more sense to center on last added city and 'home' if coming via profile
  const midCoordinate = (towns) => {
    const arrLats = towns.map((town) => {
      return parseFloat(town.lat.replace(',', '.'))
    })
    const maxLat = Math.max(...arrLats)
    const minLat = Math.min(...arrLats)
    const midLat = (maxLat + minLat) / 2
    const arrLngs = towns.map((town) => {
      return parseFloat(town.lng.replace(',', '.'))
    })
    const maxLng = Math.max(...arrLngs)
    const minLng = Math.min(...arrLngs)
    const midLng = (maxLng + minLng) / 2
    setViewport({ latitude: midLat, longitude: midLng, zoom: 1 })
  }

  /// GET ALL NECESSARY DATA ****************************************************************************** //
  function fetchGroupData() {
    axios.get(`/api/groups/${props.match.params.id}`, {
      headers: { Authorization: `Bearer ${Auth.getToken()}` }
    })
      .then(resp => {
        setGroup(resp.data)
        determineStatus(resp.data)
        const memberData = [...members]
        fetchMemberData(resp.data.members, memberData)
        setEditableData({
          name: resp.data.name,
          description: resp.data.description
        })
      })
      .catch(err => {
        console.log(err)
        setErrors({ ...errors, ...err })
      })
  }

  function fetchMemberData(members, memberData) {
    members.forEach(member => {
      axios.get(`/api/profile/${member.id}`, {
        headers: { Authorization: `Bearer ${Auth.getToken()}` }
      })
        .then(resp => {
          memberData.push(resp.data)
          setMembers(memberData)
          calculateTowns(memberData)
        })
        .catch(err => {
          console.log(err)
          setErrors({ ...errors, ...err })
        })
    })
  }

  function calculateTowns(memberData) {
    const townData = []

    memberData.forEach(member => {

      member.towns
        .map(memberTown => {
          if (townData.find(town => town.id === memberTown.id) !== undefined) {
            townData
              .find(town => town.id === memberTown.id)
              .members.push(member)
            return townData

          } else {
            memberTown.members = []
            memberTown.members.push(member)
            townData.push(memberTown)
            return townData
          }

        })
    })
    setTowns(townData)
    // zoom map to center of all points
    Object.keys(townData).length > 0 && midCoordinate(townData)

  }

  function determineStatus(group) {
    const userID = Auth.getUserId()
    const memberIDs = group.members.map(member => member.id)
    const requestIDs = group.requests.map(request => request.id)

    if (userID === group.owner.id) {
      setStatus('owner')
    } else if (memberIDs.includes(userID)) {
      setStatus('member')
    } else if (requestIDs.includes(userID)) {
      setStatus('requester')
    } else {
      setStatus('unaffiliated')
    }
  }


  // IMAGE UPLOAD ****************************************************************************** //
  const handleImageUpload = (res) => {
    setEditableData({ ...editableData, image: res.filesUploaded[0].url })
  }

  // Django creates a user input window when an authorised path does is incorrectly authorised.

  const handleSubmit = () => {
    // console.log(token)
    // console.log('data to be sent', editableData)
    axios.put(`/api/groups/${group.id}/`, editableData, {
      headers: {
        Authorization: `Bearer ${Auth.getToken()}`
      }
    })
      .then(resp => {
        // console.log(resp, 'success')
        fetchGroupData()
        notify('Image uploaded')
      })
      .catch(err => console.log(err))
  }

  useEffect(() => {
    if (editableData.image) {
      // console.log('submitting')
      handleSubmit()
    }
  }, [editableData])

  // SETTINGS BUTTON ****************************************************************************** //
  const handleChange = (e) => {
    e.preventDefault()
    const editableDataUpdate = { ...editableData, [e.target.name]: e.target.value }
    if (editableDataUpdate.image) {
      delete editableData.image
    }
    setEditableData({ ...editableDataUpdate })
  }

  const modalSubmit = (e) => {
    e.preventDefault()
    const data = editableData
    // console.log(editableData)
    axios.put(`/api/groups/${group.id}/`, data,
      { headers: { Authorization: `Bearer ${Auth.getToken()}` } }
    )
      .then(resp => {
        fetchGroupData()
        toggleSettings()
        notify('Details successfully updated')
      })
      .catch(err => {
        setErrors({ ...err })
        console.log(err)
      })

  }

  function toggleSettings() {
    setSettingModal(!settingModal)
  }

  // GROUP MANAGEMENT BUTTON ****************************************************************************** //

  function toggleMemberManagement(e) {
    e.preventDefault()
    setMembershipModal(!membershipModal)
  }

  function handleMemberApprove(e) {
    e.preventDefault()
    const data = { id: e.target.id }
    axios.put(`/api/groups/${group.id}/membership/`, data,
      { headers: { Authorization: `Bearer ${Auth.getToken()}` } }
    )
      .then(resp => {
        fetchGroupData()
      })
      .catch(err => {
        setErrors({ ...err })
        console.log(err)
      })
  }

  function handleMemberRemove(e) {
    e.preventDefault()
    // console.log('remove!')
    const data = { id: e.target.id }
    axios.delete(`api/groups/${group.id}/membership/`,
      {
        data,
        headers: { Authorization: `Bearer ${Auth.getToken()}` }
      })
      .then(resp => {
        fetchGroupData()
      })
      .catch(err => {
        console.log(err)
        setErrors({ ...errors, ...err })
      })
  }

  function toggleDelete() {
    setDeleteModal(!deleteModal)
  }

  function handleDelete(e) {
    e.preventDefault()
    axios.delete(`api/groups/${group.id}/`,
      {
        headers: { Authorization: `Bearer ${Auth.getToken()}` }
      })
      .then(resp => {
        notify(`${group.name} deleted`)
        props.history.push('/groups')
      })
      .catch(err => {
        console.log(err)
        setErrors({ ...errors, ...err })
      })
  }

  // GROUP INTERACTION ****************************************************************************** //
  function sendRequest(e) {
    e.preventDefault()
    axios.get(`api/groups/${group.id}/membership/`, {
      headers: { Authorization: `Bearer ${Auth.getToken()}` }
    })
      .then(resp => {
        fetchGroupData()
        notify(`Request sent to ${group.name}!`)
      })
      .catch(err => {
        console.log(err)
        setErrors({ ...errors, ...err })
      })
  }

  function leaveGroup(e) {
    e.preventDefault()
    axios.delete(`api/groups/${group.id}/membership/`,
      {
        data: { id: Auth.getUserId() },
        headers: { Authorization: `Bearer ${Auth.getToken()}` }
      })
      .then(resp => {
        notify(`Left ${group.name}`)
        fetchGroupData()
      })
      .catch(err => {
        console.log(err)
        setErrors({ ...errors, ...err })
      })
  }

  // STATS ****************************************************************************** //
  const toggleContinent = () => {
    setContinentModal(!continentModal)
  }

  const toggleCountry = () => {
    setCountryModal(!countryModal)
  }

  const toggleCity = () => {
    setCityModal(!cityModal)
  }

  // work out which continents, countries or cities visited to show on modal
  const listContinentsCountries = (profile, size) => {
    const all = profile.map((elem) => {
      return elem[size]
    })
    // console.log(Array.from(new Set(all)))
    return Array.from(new Set(all))
  }

  // work out how many continents, countries, or cities visited to show on modal
  const countContinentsCountries = (profile, size) => {
    // console.log(listContinentsCountries(profile, size).length)
    return listContinentsCountries(profile, size).length
  }

  /// SCROLL POSITION ****************************************************************************** //

  function handleScroll() {
    setScroll(window.scrollY)
  }

  /// LIFE CYCLE ****************************************************************************** //

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    fetchGroupData()
  }, [])

  useEffect(() => {
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    const listener = e => {
      if (e.key === 'Escape') {
        setContinentModal(false)
        setCountryModal(false)
        setCityModal(false)
        setDeleteModal(false)
        setEditableData(false)
        setMembershipModal(false)
        setSettingModal(false)
        setShowPopup(false)
      }
    }
    window.addEventListener('keydown', listener)
  }, [])


  return (
    <div id="group-profile">
      {/* {console.log('MEMBER DATA', members)} */}
      {/* {console.log('GROUP DATA', group)} */}
      {/* {console.log('TOWN DATA', towns)} */}
      {/* {console.log('USER STATUS', status)} */}
      {/* {console.log('editable data', editableData)} */}
      {/* {console.log(scroll)} */}
      <MapGL
        {...viewport}
        position="absolute"
        width="100vw"
        height="64vh"
        mapStyle="mapbox://styles/mapbox/dark-v9"
        onViewportChange={setViewport}
        mapboxApiAccessToken={MAPBOX_TOKEN}
      >
        {towns.map((town, i) => {
          return <Marker
            key={i}
            latitude={parseFloat(town.lat.replace(',', '.'))}
            longitude={parseFloat(town.lng.replace(',', '.'))}
            offsetTop={-30}
            offsetLeft={-20}
          >
            <div className="marker" id={town.id} onClick={showMarkerInfo}></div>
            {/* {console.log(town.name_ascii, ' coordinates: lat ', parseFloat(town.lat.replace(',', '.')), 'lng ', parseFloat(town.lng.replace(',', '.')))} */}
          </Marker>
        })}
        {showPopup && <Popup
          anchor="top"
          longitude={popupInfo.longitude}
          latitude={popupInfo.latitude}
          closeButton={true}
          // closeOnClick={true} // not needed?
          onClose={closePopup}>
          <div>{popupInfo.message}</div>
        </Popup>}
      </MapGL>

      <section className="hero" id="user-profile-header">
        <div className="mobile-header">
          <div className="banner level is-mobile">
            <div className="level-left">
              <div className="name level-item">
                <div className="username title is-size-3">
                  {group.name}
                </div>
              </div>
            </div>

            <div className="level-right">
              <div className="buttons level-item">

                {status === 'owner' ?
                  <><button className="button is-danger" id='settings' onClick={toggleDelete}>
                    <span className="icon is-small">
                      <i className="fas fa-trash-alt"></i>
                    </span>
                  </button>
                    <button className="button is-link" id='settings' onClick={toggleMemberManagement}>
                      <span className="icon is-small">
                        <i className="fas fa-users-cog"></i>
                      </span>
                    </button>
                    <button className="button is-link" id='settings' onClick={toggleSettings}>
                      <span className="icon is-small">
                        <i className="fas fa-cog"></i>
                      </span>
                    </button></>
                  : <></>
                }

                {status === 'member' ?
                  <button className="button is-link" id='leave' onClick={leaveGroup}>
                    <span className="icon is-small">
                      <i className="fas fa-sign-out-alt"></i>
                    </span>
                  </button>
                  : <></>
                }

                {status === 'requester' ?
                  <button className="button is-primary" id='pending' disabled>
                    <span className="icon is-small">
                      <i className="fas fa-clock"></i>
                    </span>
                  </button>
                  : <></>
                }

                {status === 'unaffiliated' ?
                  <button className="button is-link" id='request' onClick={sendRequest}>
                    <span className="icon is-small">
                      <i className="fas fa-paper-plane"></i>
                    </span>
                  </button>
                  : <></>
                }

              </div>
            </div>
          </div>

          <div className="hero-body group-page">
            <ReactFilestack
              preload={true}
              apikey={fileloaderKey}
              options={options}
              customRender={({ onPick }) => (
                <div id="profile-banner-center" onClick={onPick}>
                  <figure className="image is-128x128">
                    {/* Class creates an oval. Look to change this so all propics are circles. */}
                    <img className="is-rounded" src={!group.image ? 'https://bulma.io/images/placeholders/128x128.png' && profile.image : group.image} />
                  </figure>
                  <div className={scroll < 100 ? 'down-arrow down bounce' : 'down-arrow down gone'}></div>
                </div>
              )}
              onSuccess={handleImageUpload}
            />
          </div>
        </div>

        <div className="level is-mobile stats">
          <div className="level-item has-text-centered" onClick={toggleContinent}>
            <div className="stat">
              <p className="heading">Continents</p>
              <p className="title">{countContinentsCountries(towns, 'continent')}</p>
            </div>
          </div>
          <div className="level-item has-text-centered" onClick={toggleCountry}>
            <div className="stat">
              <p className="heading">Countries</p>
              <p className="title">{countContinentsCountries(towns, 'country')}</p>
            </div>
          </div>
          <div className="level-item has-text-centered" onClick={toggleCity}>
            <div className="stat">
              <p className="heading">Cities</p>
              <p className="title">{towns.length}</p>
            </div>
          </div>
          <div className="level-item has-text-centered">
            <div>
              <p className="heading">Members</p>
              <p className="title unclickable">{group.members && group.members.length}</p>
            </div>
          </div>
        </div>

      </section>

      <section className="section" id="group-description">
        <div className="container">
          <h2 className="title is-size-3">
            Description
          </h2>
          <div className="text is-size-5">
            {group.description}
          </div>
        </div>
      </section>

      <section className="section" id="group-ranking">
        <div className="container">
          <h2 className="title is-size-3">
            Ranking
          </h2>
          <div className="text is-size-5">
            {members
              .sort(function (a, b) {
                if (a.score < b.score) { return 1 }
                if (a.score > b.score) { return -1 }
                return 0
              })
              .map((member, i) => {
                return <Link to={`/profile/${member.id}`} className="level is-mobile" key={i}>
                  <div className="level-left">
                    <div className="level-item position">
                      {i + 1}.

                      <figure className="image is-48x48 member-image" key={i}>
                        <img className="is-rounded" src={member.image} alt="member profile image" />
                      </figure>

                      <div className="level-item">
                        <span className="username">{member.username}</span>({member.first_name} {member.last_name})
                      </div>
                    </div>
                  </div>
                  <div className="level-right">
                    <div className="level-item is-size-3 score">
                      {member.score}
                    </div>
                  </div>

                </Link>
              })
            }
          </div>
        </div>
      </section>

      <div className={continentModal === true ? 'modal is-active' : 'modal'}>
        <div className="modal-background" onClick={toggleContinent}></div>
        <div className="modal-content modal-stats">
          <h2 className="title">Continents visited</h2>
          {listContinentsCountries(towns, 'continent').sort().map((continent, i) => {
            return <div key={i}>
              <p>{continent}</p>
            </div>
          })}
        </div>
        <button className="modal-close is-large" aria-label="close" onClick={toggleContinent}></button>
      </div>
      <div className={countryModal === true ? 'modal is-active' : 'modal'}>
        <div className="modal-background" onClick={toggleCountry}></div>
        <div className="modal-content modal-stats">
          <h2 className="title">Countries visited</h2>
          {listContinentsCountries(towns, 'country').sort().map((country, i) => {
            return <div key={i}>
              <p>{country}</p>
            </div>
          })}
        </div>
        <button className="modal-close is-large" aria-label="close" onClick={toggleCountry}></button>
      </div>
      <div className={cityModal === true ? 'modal is-active' : 'modal'}>
        <div className="modal-background" onClick={toggleCity}></div>
        <div className="modal-content modal-stats">
          <h2 className="title">Cities visited</h2>
          {towns.sort((a, b) => a.name_ascii.localeCompare(b.name_ascii)).map((town, i) => {
            return <div key={i}>
              <p>{town.name_ascii}</p>
            </div>
          })}
        </div>
        <button className="modal-close is-large" aria-label="close" onClick={toggleCity}></button>
      </div>

      <div className={settingModal === true ? 'modal is-active form' : 'modal form'}>
        <div className="modal-background" onClick={toggleSettings}></div>
        <div className="modal-content">
          <GroupForm
            handleChange={(e) => handleChange(e)}
            handleSubmit={(e) => modalSubmit(e)}
            details={editableData}
          // errors={errors}
          />
        </div>
        <button className="modal-close is-large" aria-label="close" onClick={toggleSettings}></button>
      </div>

      <div className={membershipModal === true ? 'modal is-active' : 'modal'}>
        <div className="modal-background" onClick={toggleMemberManagement}></div>
        <div className="modal-content">
          <GroupMembers
            group={group}
            handleMemberApprove={(e) => handleMemberApprove(e)}
            handleMemberRemove={(e) => handleMemberRemove(e)}
          />
        </div>
        <button className="modal-close is-large" aria-label="close" onClick={toggleSettings}></button>
      </div>


      <div className={deleteModal === true ? 'modal is-active' : 'modal'}>
        <div className="modal-background" onClick={toggleDelete}></div>
        <div className="modal-content">
          <div className="text is-size-3 question">
            Are you sure you want to delete {group.name}?
          </div>
          <button className="button is-danger" onClick={(e) => handleDelete(e)}>Yes!</button>
          <button className="button is-link" onClick={toggleDelete}>No...</button>
        </div>
        <button className="modal-close is-large" aria-label="close" onClick={toggleSettings}></button>
      </div>

    </div>
  )
}

export default IndividualGroup


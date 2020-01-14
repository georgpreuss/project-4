
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MapGL, { Marker } from 'react-map-gl'
import ReactFilestack from 'filestack-react'
import { fileloaderKey } from '../config/environment'
import axios from 'axios'
import Auth from '../lib/Auth'

import Mask from '../images/mask-dark-gradient.png'
import Settings from './SettingsForm'

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
  
  const [group, setGroup] = useState([])
  const [errors, setErrors] = useState('')

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

  // a lot of pain to get to work but probably not even worth it - would make more sense to center on last added city and 'home' if coming via profile
  const midCoordinate = (towns) => {
    const arrLats = towns.map((town) => {
      return parseFloat(town.lat.replace(',','.'))
    })
    const maxLat = Math.max(...arrLats)
    const minLat = Math.min(...arrLats)
    const midLat = (maxLat + minLat) / 2
    const arrLngs = towns.map((town) => {
      return parseFloat(town.lng.replace(',','.'))
    })
    const maxLng = Math.max(...arrLngs)
    const minLng = Math.min(...arrLngs)
    const midLng = (maxLng + minLng) / 2
    setViewport({ latitude: midLat, longitude: midLng, zoom: 1 })
  }

  // store profile image here
  const [data, setData] = useState({})


  function fetchGroupData() {
    axios.get(`/api/groups/${props.match.params.id}`, {
      headers: { Authorization: `Bearer ${Auth.getToken()}` }
    })
      .then(resp => {
        setData(resp.data)
        getGroupLocations(resp.data)
        
      })
      .catch(err => {
        console.log(err)
        setErrors({ ...errors, ...err })
      })
  }

  useEffect(() => {
    fetchGroupData()
  }, [])

  const getGroupLocations = (groupData) => {
    const towns = []
    groupData.members.forEach(member => {
      console.log(member)
      member.towns.map(memberTown => {
        if (towns.find[town => town.id === memberTown]) {
          (towns.find[town => town.id === memberTown]).members.push(member.id)
        } else {
          const newTown = {
            id: memberTown,
            members: [member.id]
          }
          towns.push(newTown)
        }
      })
    })
    console.log('GROUP TOWNS', towns)
  }

  const handleImageUpload = (res) => {
    setData({ ...data, image: res.filesUploaded[0].url })
  }

  // Django creates a user input window when an authorised path does is incorrectly authorised.

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value })
    // const errors = { ...register.errors, [e.target.name]: '' }
  }

  const modalSubmit = (e) => {
    e.preventDefault()

    // // console.log(token)
    // axios.put('api/profile', data, {
    //   headers: {
    //     Authorization: `Bearer ${Auth.getToken()}`
    //   }
    // })
    //   .then(resp => {
    //     console.log(resp, 'success')
    //     toggleSettings()
    //   })
    //   .catch(err => {
    //     console.log(err, 'failed')
    //     console.log(data, 'failed')
    //   })
  }

  const handleSubmit = () => {

    // // console.log(token)
    // axios.put('api/profile', data, {
    //   headers: {
    //     Authorization: `Bearer ${Auth.getToken()}`
    //   }
    // })
    //   .then(resp => console.log(resp, 'success'))
    //   .catch(err => console.log(err))
  }

  useEffect(() => {
    if (data.image) {
      handleSubmit()
    }
  }, [data])

  // toggle between profile info, true for left and false for right (links next to profile image)
  const [panel, setPanel] = useState(true)
  // states for stats modals
  const [continentModal, setContinentModal] = useState(false)
  const [countryModal, setCountryModal] = useState(false)
  const [cityModal, setCityModal] = useState(false)
  const [settingModal, setSettingModal] = useState(false)

  // show 'right' stats
  const showRight = () => {
    setPanel(false)
  }

  // show 'left' stats
  const showLeft = () => {
    setPanel(true)
  }

  const toggleContinent = () => {
    setContinentModal(!continentModal)
  }

  const toggleCountry = () => {
    setCountryModal(!countryModal)
  }

  const toggleCity = () => {
    setCityModal(!cityModal)
  }

  function toggleSettings() {
    setSettingModal(!settingModal)
  }

  // work out which continents, countries or cities visited to show on modal
  const listContinentsCountries = (profile, size) => {
    const all = profile.towns.map((elem) => {
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

  return (
    <div id="group-profile">
      {console.log(data)}
      <MapGL
        {...viewport}
        position="absolute"
        width="100vw"
        height="64vh"
        mapStyle="mapbox://styles/mapbox/dark-v9"
        onViewportChange={setViewport}
        mapboxApiAccessToken={MAPBOX_TOKEN}
      >
        {/* {profile.towns.map((country, i) => {
          return <Marker
            key={i}
            latitude={parseFloat(country.lat.replace(',', '.'))}
            longitude={parseFloat(country.lng.replace(',', '.'))}
            offsetTop={-30}
            offsetLeft={-20}
          >
            <div className="marker"></div>
            {console.log(country.name_ascii, ' coordinates: lat ', parseFloat(country.lat.replace(',', '.')), 'lng ', parseFloat(country.lng.replace(',', '.')))}
          </Marker>
        })} */}
      </MapGL>

      <section className="hero" id="user-profile-header">
        {console.log(data.email)}
        {/* <div className="is-link">
          Settings
        </div> */}
        <div className={settingModal === true ? 'modal is-active' : 'modal'}>
          <div className="modal-background" onClick={toggleSettings}></div>
          <div className="modal-content">
            <Settings
              toggleSettings={toggleSettings}
              handleChange={(e) => handleChange(e)}
              modalSubmit={(e) => modalSubmit(e)}
              data={data}
            />
          </div>
          <button className="modal-close is-large" aria-label="close" onClick={toggleSettings}></button>
        </div>


        <div className="mobile-header">
          <div className="banner level is-mobile">
            <div className="level-left">
              <div className="name level-item">
                <div className="username title is-size-3">
                  {data.name} 
                  <span className="fullname is-size-4"> ({data.first_name} {data.last_name})</span>
                </div>
              </div>
            </div>
            
            <div className="level-right">
              <div className="buttons level-item">
                <button className="button is-link" id='settings' onClick={toggleSettings}>
                  <span className="icon is-small">
                    <i className="fas fa-cog"></i>
                  </span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="hero-body level is-mobile">
            <i className={!panel ? 'level-item fas fa-chevron-left is-size-1' : 'level-item fas fa-chevron-left is-size-1 click-me'} onClick={showLeft}></i>
            <ReactFilestack
              preload={true}
              apikey={fileloaderKey}
              options={options}
              customRender={({ onPick }) => (
                <div onClick={onPick}>
                  <figure className="level-item image is-128x128">
                    {/* Class creates an oval. Look to change this so all propics are circles. */}
                    <img className="is-rounded" src={!data.image ? 'https://bulma.io/images/placeholders/128x128.png' && profile.image : data.image} />
                  </figure>
                </div>
              )}
              onSuccess={handleImageUpload}
            />
            <i className={panel ? 'level-item fas fa-chevron-right is-size-1' : 'level-item fas fa-chevron-right is-size-1 click-me'} onClick={showRight}></i>
          </div>
        </div>

        <div className="level is-mobile stats">
          <div className="level-item has-text-centered" onClick={toggleContinent}>
            <div className="stat">
              <p className="heading">Continents</p>
              <p className="title">{countContinentsCountries(profile, 'continent')}</p>
            </div>
          </div>
          <div className="level-item has-text-centered" onClick={toggleCountry}>
            <div className="stat">
              <p className="heading">Countries</p>
              <p className="title">{countContinentsCountries(profile, 'country')}</p>
            </div>
          </div>
          <div className="level-item has-text-centered" onClick={toggleCity}>
            <div className="stat">
              <p className="heading">Cities</p>
              <p className="title">{profile.towns.length}</p>
            </div>
          </div>
          <div className="level-item has-text-centered">
            <div>
              <p className="heading">Travel XP</p>
              <p className="title">{profile.score}</p>
            </div>
          </div>
        </div>

      </section>

      <section className={panel ? 'section' : 'section hide'} id="user-profile">
        {/* <div className="container">
          <h2 className="title">
            Badges
          </h2>
          <div className="display">

            {profile.badges.sort().map((badge, i) => {
              return <div className="badge" key={i}>
                <div className="image is-150x150">
                  <div className="badge" >
                    <img className="image is-150x150" style={{ backgroundImage: `url(${badge.image})` }} src={Mask} alt="" />
                    <div className="overlay">
                      <div className="is-size-6">{badge.name}</div>
                      <div className="is-size-7">{badge.description}</div>
                    </div>
                  </div>
                </div>
              </div>
            })}
          </div>
        </div> */}
      </section>

      <section className={panel ? 'section hide' : 'section'} id="user-profile">
        {/* <div className="container">
          <h2 className="title">
            Groups
          </h2>
          <div className="display">
            {profile.groups_joined.map((group, i) => {
              return <Link to={`/groups/${group.id}`} className="group-link" key={i}>
                <div className="image is-150x150">
                  <div className="group">
                    <div className="label">{group.name}</div>
                    <img className="image is-150x150 is-rounded" src={group.image} alt="" />
                    <div className="overlay">
                      <div className="is-size-7">{group.description}</div>
                    </div>
                  </div>
                </div>
              </Link>
            })}
          </div>
        </div> */}
      </section>
    
    {/* 

    //   <div className={continentModal === true ? 'modal is-active' : 'modal'}>
    //     <div className="modal-background" onClick={toggleContinent}></div>
    //     <div className="modal-content modal-stats">
    //       <h2 className="title">Continents visited</h2>
    //       {listContinentsCountries(profile, 'continent').sort().map((continent, i) => {
    //         return <div key={i}>
    //           <p>{continent}</p>
    //         </div>
    //       })}
    //     </div>
    //     <button className="modal-close is-large" aria-label="close" onClick={toggleContinent}></button>
    //   </div>

    //   <div className={countryModal === true ? 'modal is-active' : 'modal'}>
    //     <div className="modal-background" onClick={toggleCountry}></div>
    //     <div className="modal-content modal-stats">
    //       <h2 className="title">Countries visited</h2>
    //       {listContinentsCountries(profile, 'country').sort().map((country, i) => {
    //         return <div key={i}>
    //           <p>{country}</p>
    //         </div>
    //       })}
    //     </div>
    //     <button className="modal-close is-large" aria-label="close" onClick={toggleCountry}></button>
    //   </div>

    //   <div className={cityModal === true ? 'modal is-active' : 'modal'}>
    //     <div className="modal-background" onClick={toggleCity}></div>
    //     <div className="modal-content modal-stats">
    //       <h2 className="title">Cities visited</h2>
    //       {profile.towns.sort((a, b) => a.name_ascii.localeCompare(b.name_ascii)).map((town, i) => {
    //         return <div key={i}>
    //           <p>{town.name_ascii}</p>
    //         </div>
    //       })}
    //     </div>
    //     <button className="modal-close is-large" aria-label="close" onClick={toggleCity}></button>
    //   </div>*/}

    </div>
  )
}

export default IndividualGroup

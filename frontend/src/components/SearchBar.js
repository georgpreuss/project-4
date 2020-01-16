import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Auth from '../lib/Auth'
import UserCard from './UserCard'

const SearchBar = ({ toggleSearch, searchModal }) => {
  const [data, setData] = useState([])
  const [searchBar, setSearchBar] = useState('')


  useEffect(() => {
    axios.get('/api/users', {
      headers: { Authorization: `Bearer ${Auth.getToken()}` }
    })
      .then(response => {
        setData(response.data)
        // console.log(data)
        // console.log(response.data)
      })
      .catch(error => console.log(error))
  }, [searchModal])


  function handleSearchChange(e) {
    setSearchBar(e.target.value)
  }

  function filterData(alldata) {
    if (searchBar !== '') {
      return alldata.filter(user => {
        return (user.first_name.toLowerCase().includes(searchBar.toLowerCase()) || user.last_name.toLowerCase().includes(searchBar.toLowerCase()) || user.username.toLowerCase().includes(searchBar.toLowerCase())
        )
      })
    } else {
      return []
    }
  }


  return <>
    <div>
      <form className="form" id="user-search">
     
        <div className="field">
          <div className="control has-icons-left">
            <input className="input has-text-info is-large" type="search" placeholder="Search for your friends" onChange={handleSearchChange}></input>
            <span className="icon is-small is-left">
              <i className="fas fa-compass"></i>
            </span>
          </div>
        

        </div>
      </form>

    </div>
    <div className="section">
      <div className="container">
        <div className="columns is-multiline">
          {filterData(data)
            .map((user, i) => {
              return <UserCard key={i} user={user} toggleSearch={toggleSearch} />
            })}
        </div>
      </div>
    </div>
   
  </>
}
export default SearchBar
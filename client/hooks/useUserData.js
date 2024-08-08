import { useState, useEffect } from "react"
import api from "../utils/api"

export const useUserData = () => {
  const [ user, setUser ] = useState({})
  const username = localStorage.getItem('username')

  useEffect(() => {
    console.log(username)

    const fetchUserData = async () => {
      try { 
      const response = await api.get(`user/get-user-data/${username}`)

      console.log(response)
      setUser(response.data.currentUser)
      } catch (err) {
        console.log(err)
      }
    }
    fetchUserData()
  }, [])

  return { user }
}
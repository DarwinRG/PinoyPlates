import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import usePrivateApi from './usePrivateApi'

export const useUserData = () => {
  const [ user, setUser ] = useState({})
  const username = localStorage.getItem('username')
  const privateAxios = usePrivateApi()
  const navigate = useNavigate()

  useEffect(() => {

    const fetchUserData = async () => {
      try { 
      const response = await privateAxios.get(`user/get-user-data/${username}`)
      setUser(response.data.currentUser)
      } catch (err) {
        console.log(err)
      }
    }
    fetchUserData()
  }, [])

  return { user }
}
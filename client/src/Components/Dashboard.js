import React from 'react'
import useAuth from '../Hooks/useAuth'

export default function Dashboard({code}) {
  const accessToken = useAuth(code)
  return (
    <div>{code}</div>
  )
}

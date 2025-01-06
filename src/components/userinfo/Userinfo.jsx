import React from 'react'
import './userinfo.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil } from '@fortawesome/free-solid-svg-icons'
import avaterImage from '../../images/avatar1.png'
import { faVideo } from '@fortawesome/free-solid-svg-icons'
import { faEllipsis } from '@fortawesome/free-solid-svg-icons'
import { useUserStore } from '../lib/userStore';
export default function () {
  const { currentUser } = useUserStore();
  const getInitial = () => {
    // if (user?.username) return user.username.charAt(0).toUpperCase();
    if (currentUser?.username) return currentUser.username.charAt(0).toUpperCase();
    return '?'; // Fallback if name is not available
  };
  return (
    <div className='userinfo'>
        <div className='user'>
        <div className="user-profile">
                  <span className="profile-initial">{getInitial()}</span>
              </div>
            <span className="profile-title">{currentUser.username || 'User Name'}</span>
        </div>
        <div className='user-icons'>
        <FontAwesomeIcon icon= {faEllipsis}  />
        <FontAwesomeIcon icon={faVideo} className='fontawsome-icon' />
        <FontAwesomeIcon icon= {faPencil} />
        </div>
    </div>
  )
}

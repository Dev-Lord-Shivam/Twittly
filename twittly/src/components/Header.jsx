import { Flex, Image, Link, useColorMode, Button } from '@chakra-ui/react'
import React from 'react'
import LightLogo from '../../public/light-logo.svg'
import DarkLogo from '../../public/dark-logo.svg'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import userAtom from '../atoms/userAtom'
import { AiFillHome } from 'react-icons/ai'
import { RxAvatar } from 'react-icons/rx'
import { Link as RouterLink } from 'react-router-dom'
import { FiLogOut } from 'react-icons/fi'
import useLogout from '../hooks/useLogout'
import authScreenAtom from '../atoms/authAtom'
import { BsFillChatQuoteFill } from 'react-icons/bs'
import { FaSearch } from "react-icons/fa";

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const user = useRecoilValue(userAtom)
  const logout = useLogout();
  const setAuthScreen = useSetRecoilState(authScreenAtom)

  return (
    <Flex justifyContent={"space-between"} mt={6} mb={12} >
      {user && (
        <Link as={RouterLink} to='/'>
          <AiFillHome size={24} />
        </Link>
      )}
      {!user && (
        <Link as={RouterLink} onClick={
          () => setAuthScreen('login')
        }
          to={"/auth"}
        >
          Login
        </Link>
      )}
      <Image
        cursor={"pointer"}
        alt='logo'
        justifyContent={'center'}
        w={6}
        src={colorMode === "dark" ? LightLogo : DarkLogo}
        onClick={toggleColorMode}
      />
      {user && (
        <Flex alignItems={'center'} gap={4}>
          <Link as={RouterLink} to={`/${user.username}`}>
            <RxAvatar size={24} />
          </Link>
          <Link as={RouterLink} to={`/find`}>
             <FaSearch size={20} />
          </Link>
          <Link as={RouterLink} to={`/chat`}>
            <BsFillChatQuoteFill size={20} />
          </Link>
          <Button
            size={'sm'}
            onClick={logout}
          ><FiLogOut size={20} /> </Button>
        </Flex>
      )}

      {!user && (
        <Link as={RouterLink} onClick={
          () => setAuthScreen('signup')
        }
          to={"/auth"}
        >
          Sing up
        </Link>
      )}
    </Flex>
  )
}

export default Header

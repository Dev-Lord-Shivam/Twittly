

import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
  Avatar,
  Center,
} from '@chakra-ui/react'
import { useRef, useState } from 'react'
import { useRecoilState } from 'recoil';
import userAtom from '../atoms/userAtom';
import usePreviewImg from '../hooks/usePreviewImg';
import useShowToast from '../hooks/useShowToast';


export default function UpdateProfilePage() {

  const [user, setUser] = useRecoilState(userAtom)
  const fileRef = useRef(null);
  const showToast = useShowToast();
  const { handleImageChange, imgUrl } = usePreviewImg()
  const [updating, setUpdating] = useState(false);
  const [inputs, setInputs] = useState({
    name: user.name,
    email: user.email,
    username: user.username,
    bio: user.bio,
    password: ''
  });

  const handleUpdatProfile = async (e) => {

    e.preventDefault();
    if (updating) return;
    setUpdating(true);
    try {

      const res = await fetch(`/api/users/update/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...inputs, profilePic: imgUrl }),
      });
      const data = await res.json()
      
      if (data.error) {
        showToast("Error", data.error, "error")
        return;
      }
      showToast("Success", "Profile updated successfully", "success")
      setUser(data)
      localStorage.setItem("user-threads", JSON.stringify(data));
    } catch (error) {
      showToast("Error", error, "error")
    } finally {
      setUpdating(false);
    }

  }



  return (
    <form onSubmit={handleUpdatProfile}>
      <Flex
        align={'center'}
        justify={'center'}
        my={6}
      >
        <Stack
          spacing={4}
          w={'full'}
          maxW={'md'}
          bg={useColorModeValue('white', 'gray.dark')}
          rounded={'xl'}
          boxShadow={'lg'}
          p={6}
          my={12}>
          <Heading lineHeight={1.1} fontSize={{ base: '2xl', sm: '3xl' }} textAlign={'center'}>
            User Profile Edit
          </Heading>
          <FormControl>

            <Stack direction={['column', 'row']} spacing={6}>
              <Center>
                <Avatar size="xl" src={imgUrl || user.profilePic} >
                </Avatar>
              </Center>
              <Center w="full">
                <Button w="full" onClick={() => fileRef.current.click()}>Change Avatar</Button>
                <Input type='file' hidden ref={fileRef} onChange={handleImageChange} />
              </Center>
            </Stack>
          </FormControl>
          <FormControl>
            <FormLabel>Full name</FormLabel>
            <Input
              placeholder="Full name"
              _placeholder={{ color: 'gray.500' }}
              type="text"
              onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
              value={inputs.name}
            />
          </FormControl>
          <FormControl>
            <FormLabel>User name</FormLabel>
            <Input
              placeholder="UserName"
              _placeholder={{ color: 'gray.500' }}
              type="text"
              onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
              value={inputs.username}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Email address</FormLabel>
            <Input
              placeholder="your-email@example.com"
              _placeholder={{ color: 'gray.500' }}
              type="email"
              onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
              value={inputs.email}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Bio</FormLabel>
            <Input
              placeholder="Bio"
              _placeholder={{ color: 'gray.500' }}
              type="text"
              onChange={(e) => setInputs({ ...inputs, bio: e.target.value })}
              value={inputs.bio}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              placeholder="password"
              _placeholder={{ color: 'gray.500' }}
              type="password"
              onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
              value={inputs.password}
            />
          </FormControl>
          <Stack spacing={6} direction={['column', 'row']}>
            <Button
              bg={'red.400'}
              color={'white'}
              w="full"
              _hover={{
                bg: 'red.500',
              }}>
              Cancel
            </Button>
            <Button
              bg={'blue.400'}
              color={'white'}
              w="full"
              _hover={{
                bg: 'blue.500',
              }}
              type='submit'
              isLoading={updating}
            >
              Submit
            </Button>
          </Stack>
        </Stack>
      </Flex>
    </form>
  )
}
import React, { useEffect } from 'react'
import UserHeader from '../components/UserHeader'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import useShowToast from '../hooks/useShowToast'
import { Flex, Spinner } from '@chakra-ui/react'
import Posts from '../components/Posts'
import useGetUserProfile from '../hooks/useGetUserProfile'
import postAtom from '../atoms/postAtom'
import { useRecoilState } from 'recoil'


const UserPage = () => {
 
  const {user,loading} = useGetUserProfile()
  const { username } = useParams();
  const showToast = useShowToast();
  // const [posts,setPosts] = useState([]);
  const [posts,setPosts] = useRecoilState(postAtom)
  const [fetchingPosts,setFetchingPosts] = useState(true);

  useEffect(() => {

    
    const getPosts = async() => {
      setFetchingPosts(true)
      try {
         const res = await fetch(`/api/posts/user/${username}`);
         const data = await res.json();
         if(data.error){
          showToast("Error",data.error,"error")
          return;
        }
        setPosts(data)
      } catch (error) {
        showToast("Error",error,"error")
        setPosts([])
      }
      finally{
        setFetchingPosts(false);
      }
    }

    getPosts();
  }, [username,showToast,setPosts]);

  if(!user && !loading) return <h1>User not found</h1>;
  if(!user && loading) {
    return (
      <Flex justifyContent={'center'}>
        <Spinner size={'xl'} />
      </Flex>
      
    )
  }

  return (
    <>
      <UserHeader user={user} />
      {!fetchingPosts && posts.length === 0 && <h1>User dosent have post</h1>}
      {fetchingPosts && (
        <Flex justifyContent={'center'} my={12}>
          <Spinner size={'xl'} />
        </Flex>
      )}
      {posts.map((post) => (
        <Posts key={post._id} post={post} postedBy={post.postedBy} />
      ))}
      {/* <UserPost likes={1200} replies={481} postImg='/post1.png' postTitle='Lets talk about Tweets.'/>
      <UserPost likes={3028} replies={540} postImg='/post3.png' postTitle='Looking fwd to visit india.'/>
      <UserPost likes={8990} replies={688} postImg='/post2.jpg' postTitle='Fursia giving justic to mad max lagacy.'/> */}
    </>
  )
}

export default UserPage

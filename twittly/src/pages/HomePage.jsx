import { Box, Flex, Spinner, Button, useColorModeValue } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import useShowToast from '../hooks/useShowToast'
import Posts from '../components/Posts'
import { useRecoilState } from 'recoil'
import postAtom from '../atoms/postAtom'
import SuggestedUsers from '../components/SuggestedUsers'

const HomePage = () => {
  const showToast = useShowToast()
  const [posts, setPosts] = useRecoilState(postAtom);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getFeedPosts = async () => {
      setLoading(true)
      setPosts([]);
      try {
        const res = await fetch("/api/posts/feed");
        const data = await res.json()
        if (data.error) {
          showToast("Error", data.message, "error")
          return;
        }

        setPosts(data)
      } catch (error) {
        showToast("Error", error.message, "error")
      } finally {
        setLoading(false)
      }
    };
    getFeedPosts()
  }, [showToast, setPosts]);

  return (
      <Flex gap={10} alignItems={'flex-start'}>
        <Box flex={70}>
          {!loading && posts.length == 0 && <h1>Follow someone to see post</h1>}
          {loading && (
            <Flex justify={'center'}>
              <Spinner size={'xl'} />
            </Flex>
          )}
          {posts?.map((post) => (
            <Posts key={post._id} post={post} postedBy={post.postedBy} />
          ))}
        </Box>
        <Box flex={30} display={{
          base: "none",
          md: "block",
        }}>
          <SuggestedUsers />
        </Box>
      </Flex>
  )
}

export default HomePage
